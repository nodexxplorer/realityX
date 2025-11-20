// lib/usageLimiter.ts
import pool from "./db";

const FREE_DAILY_LIMIT = 10; // adjust based on your app

// ✅ Check if usage is allowed
export async function isUsageAllowed(userId: string, is_premium: boolean): Promise<boolean> {
  if (is_premium) return true;

  const result = await pool.query(
    `SELECT COUNT(*) AS count 
     FROM usage_logs 
     WHERE user_id = $1 AND DATE(used_at) = CURRENT_DATE`,
    [userId]
  );

  const count = parseInt(result.rows[0].count);
  return count < FREE_DAILY_LIMIT;
}
