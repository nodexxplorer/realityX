-- Migration: Rate Limit Tables and Functions
-- This migration creates tables and functions for rate limiting
-- Run this SQL file against your PostgreSQL database

-- ============================================================================
-- 1. ENSURE auth_users HAS id COLUMN
-- ============================================================================
-- Add id column if it doesn't exist (some migrations use email as PK)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'auth_users' AND column_name = 'id'
    ) THEN
        ALTER TABLE auth_users ADD COLUMN id UUID DEFAULT gen_random_uuid();
        -- Make it the primary key if email is currently the PK
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'auth_users' 
            AND constraint_type = 'PRIMARY KEY' 
            AND constraint_name LIKE '%email%'
        ) THEN
            ALTER TABLE auth_users DROP CONSTRAINT auth_users_pkey;
            ALTER TABLE auth_users ADD PRIMARY KEY (id);
            CREATE UNIQUE INDEX IF NOT EXISTS auth_users_email_unique ON auth_users(email);
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 2. UPDATE subscriptions TABLE TO HAVE user_id
-- ============================================================================
-- Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN user_id UUID;
        
        -- Migrate existing data: try to match email to auth_users.id
        UPDATE subscriptions s
        SET user_id = au.id
        FROM auth_users au
        WHERE s.email = au.email AND s.user_id IS NULL;
        
        -- Make user_id NOT NULL after migration
        ALTER TABLE subscriptions ALTER COLUMN user_id SET NOT NULL;
        
        -- Add foreign key constraint
        ALTER TABLE subscriptions 
        ADD CONSTRAINT subscriptions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE;
        
        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    END IF;
END $$;

-- ============================================================================
-- 3. CREATE rate_limit_settings TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rate_limit_settings (
    tier VARCHAR(50) PRIMARY KEY,
    daily_message_limit INT NOT NULL,
    monthly_cost_limit DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default rate limit settings
INSERT INTO rate_limit_settings (tier, daily_message_limit, monthly_cost_limit)
VALUES 
    ('free', 5, 10.00),
    ('pro', 10, 50.00),
    ('elite', 20, 200.00),
    ('elite', 20, 200.00)  -- Handle typo variant
ON CONFLICT (tier) DO UPDATE SET
    daily_message_limit = EXCLUDED.daily_message_limit,
    monthly_cost_limit = EXCLUDED.monthly_cost_limit,
    updated_at = NOW();

-- ============================================================================
-- 4. CREATE user_messages_daily TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_messages_daily (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    message_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_user_messages_daily_user_date 
ON user_messages_daily(user_id, date DESC);

-- ============================================================================
-- 5. CREATE user_monthly_costs TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_monthly_costs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    year INT NOT NULL,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cost_limit DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_user_monthly_costs_user_year_month 
ON user_monthly_costs(user_id, year DESC, month DESC);

-- ============================================================================
-- 6. CREATE user_cost_logs TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_cost_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    cost_amount DECIMAL(10, 2) NOT NULL,
    cost_reason VARCHAR(255) DEFAULT 'api_call',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_cost_logs_user_id 
ON user_cost_logs(user_id, created_at DESC);

-- ============================================================================
-- 7. FUNCTIONS
-- ============================================================================

-- Function to get or create daily message count
CREATE OR REPLACE FUNCTION get_or_create_daily_message_count(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  -- Try to get existing record
  SELECT message_count INTO v_count
  FROM user_messages_daily
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  IF v_count IS NULL THEN
    -- Create new record
    INSERT INTO user_messages_daily (user_id, date, message_count)
    VALUES (p_user_id, CURRENT_DATE, 0)
    ON CONFLICT (user_id, date) DO NOTHING;
    
    -- Get the count (might have been created by another transaction)
    SELECT message_count INTO v_count
    FROM user_messages_daily
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
    
    IF v_count IS NULL THEN
      v_count := 0;
    END IF;
  END IF;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to increment daily message count
CREATE OR REPLACE FUNCTION increment_daily_message_count(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_new_count INT;
BEGIN
  -- Ensure record exists
  PERFORM get_or_create_daily_message_count(p_user_id);
  
  -- Increment counter
  UPDATE user_messages_daily
  SET message_count = message_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id AND date = CURRENT_DATE
  RETURNING message_count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql;

-- Function to add cost to monthly total
CREATE OR REPLACE FUNCTION add_monthly_cost(
  p_user_id UUID, 
  p_cost DECIMAL, 
  p_reason VARCHAR DEFAULT 'api_call'
)
RETURNS VOID AS $$
DECLARE
  v_year INT;
  v_month INT;
  v_cost_limit DECIMAL(10, 2);
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  v_month := EXTRACT(MONTH FROM CURRENT_DATE)::INT;
  
  -- Get cost limit from user's subscription tier
  SELECT rls.monthly_cost_limit INTO v_cost_limit
  FROM subscriptions s
  JOIN rate_limit_settings rls ON s.plan = rls.tier
  WHERE s.user_id = p_user_id AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Default to free tier if no subscription found
  IF v_cost_limit IS NULL THEN
    SELECT monthly_cost_limit INTO v_cost_limit
    FROM rate_limit_settings
    WHERE tier = 'free';
  END IF;
  
  -- Insert or update monthly cost
  INSERT INTO user_monthly_costs (user_id, year, month, total_cost, cost_limit)
  VALUES (p_user_id, v_year, v_month, p_cost, v_cost_limit)
  ON CONFLICT (user_id, year, month) DO UPDATE SET
    total_cost = user_monthly_costs.total_cost + EXCLUDED.total_cost,
    updated_at = CURRENT_TIMESTAMP;
  
  -- Log the cost
  INSERT INTO user_cost_logs (user_id, cost_amount, cost_reason)
  VALUES (p_user_id, p_cost, p_reason);
END;
$$ LANGUAGE plpgsql;

-- Function to get current usage stats
CREATE OR REPLACE FUNCTION get_user_usage_stats(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  tier VARCHAR,
  daily_used INT,
  daily_limit INT,
  daily_remaining INT,
  monthly_used DECIMAL,
  monthly_limit DECIMAL,
  monthly_remaining DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_user_id,
    COALESCE(s.plan, 'free')::VARCHAR,
    COALESCE(umd.message_count, 0)::INT,
    COALESCE(rls.daily_message_limit, 5)::INT,
    (COALESCE(rls.daily_message_limit, 5) - COALESCE(umd.message_count, 0))::INT,
    COALESCE(umc.total_cost, 0)::DECIMAL,
    COALESCE(rls.monthly_cost_limit, 10.00)::DECIMAL,
    (COALESCE(rls.monthly_cost_limit, 10.00) - COALESCE(umc.total_cost, 0))::DECIMAL
  FROM subscriptions s
  LEFT JOIN rate_limit_settings rls ON s.plan = rls.tier
  LEFT JOIN user_messages_daily umd ON s.user_id = umd.user_id AND umd.date = CURRENT_DATE
  LEFT JOIN user_monthly_costs umc ON s.user_id = umc.user_id 
    AND umc.year = EXTRACT(YEAR FROM CURRENT_DATE)::INT
    AND umc.month = EXTRACT(MONTH FROM CURRENT_DATE)::INT
  WHERE s.user_id = p_user_id AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no subscription found, return free tier stats
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      p_user_id,
      'free'::VARCHAR,
      COALESCE(umd.message_count, 0)::INT,
      5::INT,
      (5 - COALESCE(umd.message_count, 0))::INT,
      COALESCE(umc.total_cost, 0)::DECIMAL,
      10.00::DECIMAL,
      (10.00 - COALESCE(umc.total_cost, 0))::DECIMAL
    FROM user_messages_daily umd
    FULL OUTER JOIN user_monthly_costs umc ON umc.user_id = p_user_id
      AND umc.year = EXTRACT(YEAR FROM CURRENT_DATE)::INT
      AND umc.month = EXTRACT(MONTH FROM CURRENT_DATE)::INT
    WHERE (umd.user_id = p_user_id AND umd.date = CURRENT_DATE) OR umc.user_id = p_user_id
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

