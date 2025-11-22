"""
Rate limiter middleware for FastAPI
Tracks daily message limits and monthly cost limits per user tier
"""

from fastapi import HTTPException, Depends, status
from datetime import datetime, timedelta
from typing import Dict, Optional
import logging

from middleware.auth import verify_supabase_token
from db.queries import (
    verify_user_is_premium,
    get_user_message_count_today,
    get_user_monthly_cost,
    get_user_subscription_tier
)
from core.config import settings

logger = logging.getLogger(__name__)


class RateLimitInfo:
    """Data class for rate limit information"""
    
    def __init__(
        self,
        tier: str,
        messages_used: int,
        messages_limit: int,
        cost_used: float,
        cost_limit: float,
        reset_at: datetime
    ):
        self.tier = tier
        self.messages = {
            "used": messages_used,
            "limit": messages_limit,
            "remaining": max(0, messages_limit - messages_used)
        }
        self.cost = {
            "used": round(cost_used, 4),
            "limit": cost_limit,
            "remaining": round(max(0, cost_limit - cost_used), 4)
        }
        self.reset_at = reset_at

    def to_dict(self) -> Dict:
        """Convert to dictionary response"""
        return {
            "tier": self.tier,
            "messages": self.messages,
            "cost": self.cost,
            "reset_at": self.reset_at.isoformat()
        }


class RateLimiter:
    """
    Rate limiter for FastAPI chatbot with tiered limits
    
    Tier Limits:
    - free: 5 messages/day, $10/month cost limit
    - pro: 10 messages/day, $50/month cost limit
    - elite: 20 messages/day, $200/month cost limit
    """

    def __init__(self):
        # Tier configurations - sync with settings
        self.tier_config = {
            "free": {
                "daily_message_limit": settings.FREE_TIER_DAILY_LIMIT,
                "monthly_cost_limit": settings.FREE_TIER_MONTHLY_COST_LIMIT,
                "tier_name": "free"
            },
            "pro": {
                "daily_message_limit": settings.PRO_TIER_DAILY_LIMIT,
                "monthly_cost_limit": settings.PRO_TIER_MONTHLY_COST_LIMIT,
                "tier_name": "pro"
            },
            "elite": {
                "daily_message_limit": settings.ELITE_TIER_DAILY_LIMIT,
                "monthly_cost_limit": settings.ELITE_TIER_MONTHLY_COST_LIMIT,
                "tier_name": "elite"
            },
            # "premuim": {  # Handle typo variant
            #     "daily_message_limit": settings.ELITE_TIER_DAILY_LIMIT,
            #     "monthly_cost_limit": settings.ELITE_TIER_MONTHLY_COST_LIMIT,
            #     "tier_name": "elite"
            # },
            "tier1": {  # Legacy plan naming
                "daily_message_limit": settings.PRO_TIER_DAILY_LIMIT,
                "monthly_cost_limit": settings.PRO_TIER_MONTHLY_COST_LIMIT,
                "tier_name": "pro"
            },
            "tier2": {  # Legacy plan naming
                "daily_message_limit": settings.ELITE_TIER_DAILY_LIMIT,
                "monthly_cost_limit": settings.ELITE_TIER_MONTHLY_COST_LIMIT,
                "tier_name": "elite"
            }
        }
        self.tier_aliases = {
            "premium": "elite",  # Map premium to elite tier
            "premuim": "elite",  # Handle typo variant
            "tier1": "pro",
            "tier_1": "pro",
            "tier2": "elite",
            "tier_2": "elite"
        }

    async def get_tier_for_user(self, user_id: str) -> str:
        """Get subscription tier for user"""
        try:
            # Try to get from subscription table first
            tier = await get_user_subscription_tier(user_id)
            logger.info(f"get_tier_for_user: Raw tier from DB for {user_id}: {tier}")
            if tier:
                tier_lower = tier.lower()
                tier_lower = self.tier_aliases.get(tier_lower, tier_lower)
                logger.info(f"get_tier_for_user: Normalized tier for {user_id}: {tier_lower} (from {tier})")
                return tier_lower
            
            # Fallback to premium check
            is_premium = await verify_user_is_premium(user_id)
            logger.info(f"get_tier_for_user: No subscription found for {user_id}, is_premium: {is_premium}")
            return "elite" if is_premium else "free"
        except Exception as e:
            logger.warning(f"Error getting user tier for {user_id}: {e}", exc_info=True)
            return "free"

    async def get_reset_time(self, tier: str, limit_type: str = "daily") -> datetime:
        """Get when limits reset"""
        if limit_type == "daily":
            # Reset at midnight UTC tomorrow
            now = datetime.utcnow()
            reset = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        else:  # monthly
            # Reset on the 1st of next month
            now = datetime.utcnow()
            if now.month == 12:
                reset = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                reset = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        return reset

    async def check_rate_limit(
        self, 
        user_id: str = Depends(verify_supabase_token)
    ) -> Dict:
        """
        Check if user has exceeded rate limits.
        Returns rate limit info without raising exceptions.
        
        Args:
            user_id: User ID from auth token
            
        Returns:
            Dict with tier, messages, cost, and reset times
            
        Raises:
            HTTPException: If rate limit is exceeded
        """
        try:
            # Get user's subscription tier
            tier = await self.get_tier_for_user(user_id)
            
            if tier not in self.tier_config:
                logger.warning(f"Unknown tier '{tier}' for user {user_id}, defaulting to 'free'")
                tier = "free"

            config = self.tier_config[tier]

            # Get daily message count
            message_count = await get_user_message_count_today(user_id)
            message_limit = config["daily_message_limit"]
            daily_reset = await self.get_reset_time(tier, "daily")

            # Get monthly cost
            monthly_cost = await get_user_monthly_cost(user_id)
            cost_limit = config["monthly_cost_limit"]
            monthly_reset = await self.get_reset_time(tier, "monthly")

            # Create rate limit info object
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
            # Return permissive defaults on error
            return {
                "tier": "free",
                "messages": {"used": 0, "limit": 5, "remaining": 5},
                "cost": {"used": 0, "limit": 10, "remaining": 10},
                "reset_at": (datetime.utcnow() + timedelta(days=1)).isoformat(),
                "error": "Could not verify rate limits"
            }

    async def check_and_enforce_rate_limit(
        self, 
        user_id: str = Depends(verify_supabase_token)
    ) -> Dict:
        """
        Check rate limits and raise exceptions if exceeded.
        Use this in endpoints that consume quota.
        
        Args:
            user_id: User ID from auth token
            
        Returns:
            Dict with rate limit info
            
        Raises:
            HTTPException (429): If daily message limit exceeded
            HTTPException (429): If monthly cost limit exceeded
        """
        try:
            # Get user's subscription tier
            tier = await self.get_tier_for_user(user_id)
            
            if tier not in self.tier_config:
                logger.warning(f"Unknown tier '{tier}' for user {user_id}, defaulting to 'free'")
                tier = "free"

            config = self.tier_config[tier]

            # Check daily message limit
            message_count = await get_user_message_count_today(user_id)
            message_limit = config["daily_message_limit"]
            daily_reset = await self.get_reset_time(tier, "daily")

            if message_count >= message_limit:
                logger.warning(f"Daily message limit exceeded for user {user_id}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Daily message limit reached",
                        "limit": message_limit,
                        "used": message_count,
                        "remaining": 0,
                        "tier": tier,
                        "reset_at": daily_reset.isoformat(),
                        "upgrade_message": "Upgrade your plan for higher limits" if tier == "free" else None
                    }
                )

            # Check monthly cost limit
            monthly_cost = await get_user_monthly_cost(user_id)
            cost_limit = config["monthly_cost_limit"]
            monthly_reset = await self.get_reset_time(tier, "monthly")

            if monthly_cost >= cost_limit:
                logger.warning(f"Monthly cost limit exceeded for user {user_id}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Monthly cost limit reached",
                        "cost_limit": cost_limit,
                        "cost_used": round(monthly_cost, 4),
                        "tier": tier,
                        "reset_at": monthly_reset.isoformat(),
                        "upgrade_message": "Upgrade your plan for higher limits" if tier == "free" else None
                    }
                )

            # Return success info
            return {
                "tier": tier,
                "messages": {
                    "used": message_count,
                    "limit": message_limit,
                    "remaining": message_limit - message_count
                },
                "cost": {
                    "used": round(monthly_cost, 4),
                    "limit": cost_limit,
                    "remaining": round(cost_limit - monthly_cost, 4)
                },
                "reset_at": daily_reset.isoformat()
            }

        except HTTPException:
            raise  # Re-raise HTTP exceptions
        except Exception as e:
            logger.error(f"Error enforcing rate limit for user {user_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not verify rate limits"
            )

    async def increment_message_count(self, user_id: str) -> None:
        """
        Increment message count after successful message processing.
        Call this after message is successfully processed.
        """
        try:
            # This assumes you have a method to increment message count
            # You may need to implement this in your db.queries module
            from db.queries import increment_user_message_count_today
            await increment_user_message_count_today(user_id)
        except Exception as e:
            logger.error(f"Error incrementing message count for user {user_id}: {e}")
            # Don't raise - logging message count failure shouldn't break the app


# Singleton instance
rate_limiter = RateLimiter()







