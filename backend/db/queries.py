# backend/app/db/queries.py

from db.database import get_db_pool
from typing import Optional, Dict, Any
from datetime import datetime, timedelta



### AUTH USERS

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by UUID"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM auth_users WHERE id=$1 AND active=true",
            user_id
        )
        return dict(row) if row else None


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM auth_users WHERE email=$1 AND active=true",
            email
        )
        return dict(row) if row else None


async def get_user_by_wallet(wallet_address: str) -> Optional[Dict[str, Any]]:
    """Get user by wallet address"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM auth_users WHERE wallet_address=$1 AND active=true",
            wallet_address
        )
        return dict(row) if row else None


async def verify_user_is_premium(user_id: str) -> bool:
    """Check if user has premium access"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT is_premium FROM auth_users WHERE id=$1",
            user_id
        )
        return row["is_premium"] if row else False


### CONVERSATIONS

async def create_conversation(user_id: str, title: Optional[str] = None) -> int:
    """Create new conversation and return its ID"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO conversations (user_id, title, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            RETURNING id
            """,
            user_id,
            title or "New Chat"
        )
        return row["id"]


async def add_message(conversation_id: int, role: str, text: str):
    """Add message to conversation"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO messages (conversation_id, role, message_text, created_at)
            VALUES ($1, $2, $3, NOW())
            """,
            conversation_id, role, text
        )
        
        # Update conversation's updated_at
        await conn.execute(
            """
            UPDATE conversations 
            SET updated_at = NOW() 
            WHERE id = $1
            """,
            conversation_id
        )


async def get_conversation_messages(conversation_id: int, user_id: str):
    """Get all messages for a conversation (with user verification)"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        # Verify user owns this conversation
        owner = await conn.fetchrow(
            "SELECT user_id FROM conversations WHERE id=$1",
            conversation_id
        )
        
        if not owner or str(owner["user_id"]) != user_id:
            return None  # Unauthorized
        
        rows = await conn.fetch(
            """
            SELECT id, role, message_text, created_at
            FROM messages
            WHERE conversation_id = $1
            ORDER BY created_at ASC
            """,
            conversation_id
        )
        return [dict(r) for r in rows]


async def get_user_conversations(user_id: str, limit: int = 50):
    """List all conversations for a user"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT 
                c.id, 
                c.title, 
                c.created_at,
                c.updated_at,
                COUNT(m.id) as message_count,
                MAX(m.created_at) as last_message_at
            FROM conversations c
            LEFT JOIN messages m ON m.conversation_id = c.id
            WHERE c.user_id = $1
            GROUP BY c.id
            ORDER BY c.updated_at DESC
            LIMIT $2
            """,
            user_id,
            limit
        )
        return [dict(r) for r in rows]


async def delete_conversation(conversation_id: int, user_id: str) -> bool:
    """Delete conversation and all its messages (with user verification)"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        result = await conn.execute(
            """
            DELETE FROM conversations
            WHERE id = $1 AND user_id = $2
            """,
            conversation_id, user_id
        )
        return "1" in result


async def update_conversation_title(conversation_id: int, user_id: str, new_title: str):
    """Update conversation title (with user verification)"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE conversations
            SET title = $1, updated_at = NOW()
            WHERE id = $2 AND user_id = $3
            """,
            new_title, conversation_id, user_id
        )


### USAGE TRACKING (for rate limiting premium vs free users)

async def get_user_message_count_today(user_id: str) -> int:
    """Count messages sent by user today"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT COUNT(*) as count
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE c.user_id = $1 
            AND m.role = 'user'
            AND m.created_at >= CURRENT_DATE
            """,
            user_id
        )
        return row["count"] if row else 0


async def log_api_usage(user_id: str, conversation_id: int, 
                        input_tokens: int, output_tokens: int, cost: float):
    """Track API usage and costs"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO api_usage_logs 
            (user_id, conversation_id, input_tokens, output_tokens, 
             estimated_cost, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            """,
            user_id, conversation_id, input_tokens, output_tokens, cost
        )


async def get_user_subscription_tier(user_id: str) -> Optional[str]:
    """Get user's subscription tier from subscriptions table"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        result = await conn.fetchval(
            "SELECT plan FROM subscriptions WHERE user_id = $1",
            user_id
        )
        return result


async def increment_user_message_count_today(user_id: str):
    """Increment today's message count in user_messages_daily"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE user_messages_daily 
            SET count = count + 1 
            WHERE user_id = $1 AND date = CURRENT_DATE
            """,
            user_id
        )


async def get_user_monthly_cost(user_id: str) -> float:
    """Get user's total API cost this month"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT COALESCE(SUM(estimated_cost), 0) as total_cost
            FROM api_usage_logs
            WHERE user_id = $1 
            AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
            """,
            user_id
        )
        return float(row["total_cost"]) if row else 0.0


### USER SESSION TRACKING

async def start_user_session(user_id: str) -> int:
    """Start a new user session"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO user_sessions (user_id, session_start)
            VALUES ($1, NOW())
            RETURNING id
            """,
            user_id
        )
        return row["id"]


async def end_user_session(session_id: int):
    """End a user session"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE user_sessions
            SET session_end = NOW()
            WHERE id = $1
            """,
            session_id
        )


async def get_user_active_hours_today(user_id: str) -> float:
    """Get total active hours for user today"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT COALESCE(SUM(duration_seconds), 0) / 3600.0 as hours
            FROM user_sessions
            WHERE user_id = $1
            AND session_start >= CURRENT_DATE
            AND session_end IS NOT NULL
            """,
            user_id
        )
        return round(row["hours"], 2) if row else 0.0


async def get_user_active_hours_total(user_id: str) -> float:
    """Get total active hours for user all time"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT COALESCE(SUM(duration_seconds), 0) / 3600.0 as hours
            FROM user_sessions
            WHERE user_id = $1
            AND session_end IS NOT NULL
            """,
            user_id
        )
        return round(row["hours"], 2) if row else 0.0


### DASHBOARD STATISTICS


async def get_user_dashboard_stats(user_id: str) -> Dict[str, Any]:
    """Get comprehensive dashboard statistics for user"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        # Get current period stats (this month)
        current_stats = await conn.fetchrow(
            """
            SELECT 
                COUNT(DISTINCT c.id) as total_conversations,
                COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE THEN c.id END) as conversations_today,
                COUNT(CASE WHEN m.role = 'user' THEN 1 END) as total_messages,
                COUNT(CASE WHEN m.role = 'user' AND m.created_at >= CURRENT_DATE THEN 1 END) as messages_today,
                COALESCE(SUM(aul.estimated_cost), 0) as total_cost
            FROM auth_users au
            LEFT JOIN conversations c ON c.user_id = au.id
            LEFT JOIN messages m ON m.conversation_id = c.id
            LEFT JOIN api_usage_logs aul ON aul.user_id = au.id
            WHERE au.id = $1
            AND c.created_at >= DATE_TRUNC('month', CURRENT_DATE)
            """,
            user_id
        )
        
        # Get previous period stats (last month) for growth calculation
        previous_stats = await conn.fetchrow(
            """
            SELECT 
                COUNT(DISTINCT c.id) as total_conversations,
                COUNT(CASE WHEN m.role = 'user' THEN 1 END) as total_messages
            FROM conversations c
            LEFT JOIN messages m ON m.conversation_id = c.id
            WHERE c.user_id = $1
            AND c.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            AND c.created_at < DATE_TRUNC('month', CURRENT_DATE)
            """,
            user_id
        )
        
        # Calculate active hours from conversation timestamps
        # Use a subquery to calculate hours per conversation, then sum them
        active_hours_result = await conn.fetchrow(
            """
            SELECT 
                COALESCE(SUM(
                    EXTRACT(EPOCH FROM (max_time - min_time)) / 3600
                ), 0) as total_hours
            FROM (
                SELECT 
                    MIN(m.created_at) as min_time,
                    MAX(m.created_at) as max_time
                FROM conversations c
                LEFT JOIN messages m ON m.conversation_id = c.id
                WHERE c.user_id = $1
                AND c.created_at >= DATE_TRUNC('month', CURRENT_DATE)
                GROUP BY c.id
            ) as conversation_times
            """,
            user_id
        )
        
        # Active hours today
        active_hours_today_result = await conn.fetchrow(
            """
            SELECT 
                COALESCE(SUM(
                    EXTRACT(EPOCH FROM (max_time - min_time)) / 3600
                ), 0) as total_hours
            FROM (
                SELECT 
                    MIN(m.created_at) as min_time,
                    MAX(m.created_at) as max_time
                FROM conversations c
                LEFT JOIN messages m ON m.conversation_id = c.id
                WHERE c.user_id = $1
                AND DATE(c.created_at) = CURRENT_DATE
                GROUP BY c.id
            ) as conversation_times
            """,
            user_id
        )
        
        active_hours = int(active_hours_result["total_hours"] or 0)
        active_hours_today = int(active_hours_today_result["total_hours"] or 0)
        
        # Calculate growth percentage
        current_conversations = current_stats["total_conversations"] or 0
        previous_conversations = previous_stats["total_conversations"] or 0
        
        if previous_conversations > 0:
            growth = ((current_conversations - previous_conversations) / previous_conversations) * 100
        else:
            growth = 100 if current_conversations > 0 else 0
        
        print(f"✅ Dashboard stats for user {user_id}:")
        print(f"   - Conversations: {current_conversations} (today: {current_stats['conversations_today']})")
        print(f"   - Messages: {current_stats['total_messages']} (today: {current_stats['messages_today']})")
        print(f"   - Active hours: {active_hours} (today: {active_hours_today})")
        print(f"   - Growth: {growth}%")
        
        return {
            "conversations": {
                "total": current_conversations,
                "today": current_stats["conversations_today"] or 0,
            },
            "messages": {
                "total": current_stats["total_messages"] or 0,
                "today": current_stats["messages_today"] or 0,
            },
            "hours": {
                "total": active_hours,
                "today": active_hours_today,
            },
            "growth": round(growth, 1),
            "cost": {
                "total": float(current_stats["total_cost"] or 0),
            }
        }

# backend/app/db/queries.py - Add this function

from datetime import datetime, timedelta
from typing import List, Dict, Any
from db.database import get_db_pool

async def get_user_weekly_activity(user_id: str) -> List[Dict[str, Any]]:
    """Get weekly activity breakdown (conversations and messages per day)"""
    try:
        pool = await get_db_pool()
        
        activity = []
        today = datetime.now().date()
        
        async with pool.acquire() as conn:
            # Get last 7 days of data
            for i in range(6, -1, -1):  # 6 days ago to today
                date = today - timedelta(days=i)
                
                # Count conversations for this date
                convs = await conn.fetchval(
                    """
                    SELECT COUNT(DISTINCT id) 
                    FROM conversations 
                    WHERE user_id = $1 
                    AND DATE(created_at) = $2
                    """,
                    user_id,
                    date
                )
                
                # Count messages for this date
                msgs = await conn.fetchval(
                    """
                    SELECT COUNT(id)
                    FROM messages 
                    WHERE conversation_id IN (
                        SELECT id FROM conversations WHERE user_id = $1
                    )
                    AND DATE(created_at) = $2
                    """,
                    user_id,
                    date
                )
                
                activity.append({
                    "date": date.isoformat(),
                    "conversations": convs or 0,
                    "messages": msgs or 0
                })
        
        print(f"✅ Weekly activity for user {user_id}: {len(activity)} days")
        return activity
        
    except Exception as e:
        print(f"❌ Error getting weekly activity: {str(e)}")
        raise



    

async def get_user_monthly_breakdown(user_id: str) -> Dict[str, Any]:
    """Get detailed monthly breakdown"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        # This month
        this_month = await conn.fetchrow(
            """
            SELECT 
                COUNT(DISTINCT c.id) as conversations,
                COUNT(CASE WHEN m.role = 'user' THEN 1 END) as messages,
                COALESCE(SUM(aul.input_tokens + aul.output_tokens), 0) as tokens,
                COALESCE(SUM(aul.estimated_cost), 0) as cost
            FROM conversations c
            LEFT JOIN messages m ON m.conversation_id = c.id
            LEFT JOIN api_usage_logs aul ON aul.conversation_id = c.id
            WHERE c.user_id = $1
            AND c.created_at >= DATE_TRUNC('month', CURRENT_DATE)
            """,
            user_id
        )
        
        # Last month
        last_month = await conn.fetchrow(
            """
            SELECT 
                COUNT(DISTINCT c.id) as conversations,
                COUNT(CASE WHEN m.role = 'user' THEN 1 END) as messages,
                COALESCE(SUM(aul.input_tokens + aul.output_tokens), 0) as tokens,
                COALESCE(SUM(aul.estimated_cost), 0) as cost
            FROM conversations c
            LEFT JOIN messages m ON m.conversation_id = c.id
            LEFT JOIN api_usage_logs aul ON aul.conversation_id = c.id
            WHERE c.user_id = $1
            AND c.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            AND c.created_at < DATE_TRUNC('month', CURRENT_DATE)
            """,
            user_id
        )
        
        return {
            "this_month": {
                "conversations": this_month["conversations"] or 0,
                "messages": this_month["messages"] or 0,
                "tokens": int(this_month["tokens"] or 0),
                "cost": float(this_month["cost"] or 0)
            },
            "last_month": {
                "conversations": last_month["conversations"] or 0,
                "messages": last_month["messages"] or 0,
                "tokens": int(last_month["tokens"] or 0),
                "cost": float(last_month["cost"] or 0)
            }
        }

async def get_usage_statistics(user_id: str) -> Dict[str, Any]:
    """Get comprehensive usage statistics for user"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        # Get user info for subscription type
        user_info = await conn.fetchrow(
            """
            SELECT is_premium, created_at 
            FROM auth_users 
            WHERE id = $1
            """,
            user_id
        )
        
        # Count messages used today
        messages_today = await conn.fetchval(
            """
            SELECT COUNT(*)
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE c.user_id = $1 
            AND m.role = 'user'
            AND DATE(m.created_at) = CURRENT_DATE
            """,
            user_id
        )
        
        # Count messages used this month
        messages_month = await conn.fetchval(
            """
            SELECT COUNT(*)
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE c.user_id = $1 
            AND m.role = 'user'
            AND m.created_at >= DATE_TRUNC('month', CURRENT_DATE)
            """,
            user_id
        )
        
        # Get token usage this month
        token_usage = await conn.fetchrow(
            """
            SELECT 
                COALESCE(SUM(input_tokens), 0) as input_tokens,
                COALESCE(SUM(output_tokens), 0) as output_tokens
            FROM api_usage_logs
            WHERE user_id = $1
            AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
            """,
            user_id
        )
        
        # Calculate streak (consecutive days with activity) - FIX: Specify m.created_at
        streak_data = await conn.fetch(
            """
            WITH daily_activity AS (
                SELECT DISTINCT DATE(m.created_at) as activity_date
                FROM messages m
                JOIN conversations c ON c.id = m.conversation_id
                WHERE c.user_id = $1
                AND m.created_at >= CURRENT_DATE - INTERVAL '30 days'
                ORDER BY activity_date DESC
            )
            SELECT activity_date FROM daily_activity
            """,
            user_id
        )
        
        # Calculate streak days
        streak_days = 0
        if streak_data:
            current_date = datetime.now().date()
            for row in streak_data:
                activity_date = row['activity_date']
                if activity_date == current_date - timedelta(days=streak_days):
                    streak_days += 1
                else:
                    break
        
        # Count active days this month - FIX: Specify m.created_at
        active_days = await conn.fetchval(
            """
            SELECT COUNT(DISTINCT DATE(m.created_at))
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE c.user_id = $1
            AND m.created_at >= DATE_TRUNC('month', CURRENT_DATE)
            """,
            user_id
        )
        
        # Determine limits based on subscription
        is_premium = user_info['is_premium'] if user_info else False
        
        if is_premium:
            message_limit = 1000  # Premium gets 1000 messages/month
            token_limit = 1000000  # 1M tokens
        else:
            message_limit = 100   # Free gets 100 messages/month
            token_limit = 100000  # 100K tokens
        
        total_tokens = (token_usage['input_tokens'] or 0) + (token_usage['output_tokens'] or 0)
        
        print(f"✅ Usage stats for user {user_id}:")
        print(f"   - Messages: {messages_month}/{message_limit}")
        print(f"   - Tokens: {int(total_tokens)}/{token_limit}")
        print(f"   - Streak: {streak_days} days")
        
        return {
            "messagesUsed": messages_month or 0,
            "messagesLimit": message_limit,
            "tokensUsed": int(total_tokens),
            "tokensLimit": token_limit,
            "subscriptionType": "premium" if is_premium else "free",
            "subscriptionEndsAt": None,
            "streakDays": streak_days,
            "activeDaysThisMonth": active_days or 0
        }


async def get_user_achievements(user_id: str) -> List[Dict[str, Any]]:
    """Get all achievements for a user with unlock status"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        # Get user info
        user_info = await conn.fetchrow(
            """
            SELECT 
                created_at,
                is_premium
            FROM auth_users 
            WHERE id = $1
            """,
            user_id
        )
        
        if not user_info:
            return []
        
        # Total conversations created
        total_conversations = await conn.fetchval(
            """
            SELECT COUNT(*) 
            FROM conversations 
            WHERE user_id = $1
            """,
            user_id
        )
        
        # Total messages sent
        total_messages = await conn.fetchval(
            """
            SELECT COUNT(*)
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE c.user_id = $1 AND m.role = 'user'
            """,
            user_id
        )
        
        # Check for 7-day streak - FIX: Specify which table's created_at
        streak_data = await conn.fetch(
            """
            WITH daily_activity AS (
                SELECT DISTINCT DATE(m.created_at) as activity_date
                FROM messages m
                JOIN conversations c ON c.id = m.conversation_id
                WHERE c.user_id = $1
                AND m.created_at >= CURRENT_DATE - INTERVAL '30 days'
                ORDER BY activity_date DESC
            )
            SELECT activity_date FROM daily_activity
            """,
            user_id
        )
        
        # Calculate streak
        streak_days = 0
        if streak_data:
            current_date = datetime.now().date()
            for row in streak_data:
                activity_date = row['activity_date']
                if activity_date == current_date - timedelta(days=streak_days):
                    streak_days += 1
                else:
                    break
        
        # Check account age
        account_age_days = (datetime.now() - user_info['created_at']).days
        
        # Total active days - FIX: Specify which table's created_at
        active_days = await conn.fetchval(
            """
            SELECT COUNT(DISTINCT DATE(m.created_at))
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE c.user_id = $1
            """,
            user_id
        )
        
        # Calculate total tokens used
        total_tokens = await conn.fetchrow(
            """
            SELECT 
                COALESCE(SUM(input_tokens), 0) as input_tokens,
                COALESCE(SUM(output_tokens), 0) as output_tokens
            FROM api_usage_logs
            WHERE user_id = $1
            """,
            user_id
        )
        
        total_token_count = (total_tokens['input_tokens'] or 0) + (total_tokens['output_tokens'] or 0)
        
        # Check night owl activity
        night_owl = await check_night_owl_activity(conn, user_id)
        
        # Define achievements
        achievements = [
            {
                "id": "early_adopter",
                "title": "Early Adopter",
                "description": "Joined in the first 100 members",
                "icon": "🏆",
                "unlocked": account_age_days >= 30,
                "color": "from-yellow-500 to-orange-500",
                "progress": None
            },
            {
                "id": "conversation_starter",
                "title": "Conversation Starter",
                "description": "Created 10+ conversations",
                "icon": "💬",
                "unlocked": total_conversations >= 10,
                "color": "from-blue-500 to-cyan-500",
                "progress": f"{min(total_conversations, 10)}/10"
            },
            {
                "id": "on_fire",
                "title": "On Fire",
                "description": "7-day streak active",
                "icon": "🔥",
                "unlocked": streak_days >= 7,
                "color": "from-red-500 to-orange-500",
                "progress": f"{min(streak_days, 7)}/7 days"
            },
            {
                "id": "premium_member",
                "title": "Premium Member",
                "description": "Upgraded to premium",
                "icon": "⭐",
                "unlocked": user_info['is_premium'],
                "color": "from-purple-500 to-pink-500",
                "progress": None
            },
            {
                "id": "chat_master",
                "title": "Chat Master",
                "description": "Sent 100+ messages",
                "icon": "🎯",
                "unlocked": total_messages >= 100,
                "color": "from-green-500 to-emerald-500",
                "progress": f"{min(total_messages, 100)}/100"
            },
            {
                "id": "dedicated_user",
                "title": "Dedicated User",
                "description": "Active for 30+ days",
                "icon": "💎",
                "unlocked": active_days >= 30,
                "color": "from-indigo-500 to-blue-500",
                "progress": f"{min(active_days, 30)}/30 days"
            },
            {
                "id": "power_user",
                "title": "Power User",
                "description": "Used 1M+ tokens",
                "icon": "⚡",
                "unlocked": total_token_count >= 1000000,
                "color": "from-yellow-500 to-red-500",
                "progress": f"{int(total_token_count / 1000)}K/1M"
            },
            {
                "id": "night_owl",
                "title": "Night Owl",
                "description": "Sent messages after midnight",
                "icon": "🦉",
                "unlocked": night_owl,
                "color": "from-purple-500 to-blue-500",
                "progress": None
            },
        ]
        
        print(f"✅ Achievements unlocked: {sum(1 for a in achievements if a['unlocked'])}/{len(achievements)}")
        return achievements


async def check_night_owl_activity(conn, user_id: str) -> bool:
    """Check if user has sent messages between midnight and 4 AM"""
    try:
        result = await conn.fetchval(
            """
            SELECT COUNT(*) > 0
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE c.user_id = $1 
            AND m.role = 'user'
            AND EXTRACT(HOUR FROM m.created_at) >= 0 
            AND EXTRACT(HOUR FROM m.created_at) < 4
            """,
            user_id
        )
        return bool(result)
    except Exception as e:
        print(f"⚠️ Error checking night owl: {e}")
        return False