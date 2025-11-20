# backend/routes/rate_limit.py

from fastapi import APIRouter, Depends
from middleware.auth import verify_supabase_token
from middleware.rate_limit import rate_limiter
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/check")
async def check_rate_limit_endpoint(user_id: str = Depends(verify_supabase_token)):
    """
    Check user's current rate limit status
    Returns rate limit info without enforcing limits
    """
    try:
        # Get user's subscription tier
        tier = await rate_limiter.get_tier_for_user(user_id)
        
        if tier not in rate_limiter.tier_config:
            logger.warning(f"Unknown tier '{tier}' for user {user_id}, defaulting to 'free'")
            tier = "free"

        config = rate_limiter.tier_config[tier]

        # Get daily message count
        from db.queries import get_user_message_count_today, get_user_monthly_cost
        message_count = await get_user_message_count_today(user_id)
        message_limit = config["daily_message_limit"]
        daily_reset = await rate_limiter.get_reset_time(tier, "daily")

        # Get monthly cost
        monthly_cost = await get_user_monthly_cost(user_id)
        cost_limit = config["monthly_cost_limit"]

        # Create rate limit info
        from middleware.rate_limit import RateLimitInfo
        rate_info = RateLimitInfo(
            tier=tier,
            messages_used=message_count,
            messages_limit=message_limit,
            cost_used=monthly_cost,
            cost_limit=cost_limit,
            reset_at=daily_reset
        )

        return rate_info.to_dict()
    except Exception as e:
        logger.error(f"Error checking rate limit for user {user_id}: {e}", exc_info=True)
        # Return default permissive values on error
        from datetime import datetime, timedelta
        reset_time = (datetime.utcnow() + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        return {
            "tier": "free",
            "messages": {"used": 0, "limit": 5, "remaining": 5},
            "cost": {"used": 0, "limit": 10, "remaining": 10},
            "reset_at": reset_time.isoformat(),
        }

