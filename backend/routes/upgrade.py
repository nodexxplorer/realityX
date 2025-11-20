# backend/routes/upgrade.py

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from pydantic import BaseModel
from enum import Enum

from middleware.auth import verify_supabase_token
from services.solana_service import verify_transaction_complete
from db.helpers import fetch_one, execute_query
from core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================================================================
# CONSTANTS
# ============================================================================

PLAN_PRICES = {
    "pro": 0.05,
    "premuim": 0.25,  # legacy typo
    "elite": 0.25,
}

PREMIUM_PLAN_ALIASES = {
    "premuim": "premium",
    "elite": "elite",
    "tier2": "elite",
    "tier_2": "elite",
}

PREMIUM_PLAN_KEYS = {"pro", "elite"}  # tier1 considered premium access

def normalize_plan_name(plan: Optional[str]) -> str:
    if not plan:
        return "free"
    plan_lower = plan.lower()
    return PREMIUM_PLAN_ALIASES.get(plan_lower, plan_lower)

# Get treasury wallet from settings, with fallback for development
TREASURY_WALLET = getattr(settings, "NEXT_PUBLIC_TREASURY_WALLET", None) or ""

if not TREASURY_WALLET or TREASURY_WALLET.strip() == "":
    logger.warning(
        "NEXT_PUBLIC_TREASURY_WALLET not set in environment variables. "
        "Upgrade functionality will not work. Set it in your .env file."
    )
    # Use a placeholder for development (won't work for actual transactions)
    TREASURY_WALLET = "11111111111111111111111111111111"  # Placeholder address

# ============================================================================
# MODELS
# ============================================================================

class PlanEnum(str, Enum):
    PRO = "pro"
    PREMUIM = "premuim"  # keep for backward compatibility
    ELITE = "elite"

class UpgradeRequest(BaseModel):
    plan: PlanEnum
    txSignature: str

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/plan")
async def get_user_plan(user_id: str = Depends(verify_supabase_token)):
    """Get user's current plan"""
    try:
        logger.info(f"Fetching plan for user: {user_id}")
        
        # Query database
        subscription = await fetch_one(
            """
            SELECT plan, status, expired_at
            FROM subscriptions
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            """,
            user_id
        )
        
        if not subscription:
            return {
                "plan": "free",
                "expiry": None,
                "is_premium": False,
            }
        
        raw_plan = subscription.get("plan")
        status = subscription.get("status")
        expiry = subscription.get("expired_at")
        plan = normalize_plan_name(raw_plan)
        
        is_premium = status == "active" and plan in PREMIUM_PLAN_KEYS
        
        return {
            "plan": plan if is_premium else "free",
            "expired_at": expiry.isoformat() if expiry else None,
            "is_premium": is_premium,
        }
        
    except Exception as e:
        logger.error(f"Error getting plan: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch plan")


@router.post("/upgrade")
async def upgrade_plan(
    request: UpgradeRequest,
    user_id: str = Depends(verify_supabase_token)
):
    """Process upgrade with Solana verification"""
    try:
        logger.info(f"Processing upgrade: user={user_id}, plan={request.plan}")
        
        # 1. VALIDATE USER EXISTS
        user = await fetch_one(
            "SELECT id FROM auth_users WHERE id = $1",
            user_id
        )
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # 2. VALIDATE PLAN
        plan_key = normalize_plan_name(request.plan.value)
        if plan_key not in PREMIUM_PLAN_KEYS and plan_key != "pro":
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        price_lookup_key = request.plan.value if request.plan.value in PLAN_PRICES else plan_key
        
        # 3. CHECK FOR DUPLICATE TRANSACTION
        existing = await fetch_one(
            "SELECT id FROM subscriptions WHERE tx_signature = $1",
            request.txSignature
        )
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail="This transaction has already been used"
            )
        
        # 4. VERIFY SOLANA TRANSACTION
        logger.info(f"Verifying Solana transaction: {request.txSignature[:20]}...")
        
        verification = await verify_transaction_complete(
            tx_signature=request.txSignature,
            expected_amount_sol=PLAN_PRICES[price_lookup_key],
            recipient_wallet=TREASURY_WALLET
        )
        
        if not verification["valid"]:
            logger.warning(f"Transaction verification failed: {verification['error']}")
            raise HTTPException(
                status_code=400,
                detail=verification["error"]
            )
        
        logger.info(f"✅ Transaction verified: {request.txSignature}")
        
        # 5. CALCULATE EXPIRY
        expired_at = datetime.utcnow() + timedelta(days=30)
        
        # 6. INSERT OR UPDATE SUBSCRIPTIONS TABLE
        # Check if subscription exists
        existing_sub = await fetch_one(
            "SELECT id FROM subscriptions WHERE user_id = $1",
            user_id
        )
        
        if existing_sub:
            # Update existing subscription
            await execute_query(
                """
                UPDATE subscriptions
                SET 
                    plan = $1,
                    status = 'active',
                    tx_signature = $2,
                    expired_at = $3,
                    updated_at = NOW()
                WHERE user_id = $4
                """,
                plan_key, request.txSignature, expired_at , user_id
            )
        else:
            # Insert new subscription
            await execute_query(
                """
                INSERT INTO subscriptions (user_id, plan, status, tx_signature, expired_at, created_at, updated_at)
                VALUES ($1, $2, 'active', $3, $4, NOW(), NOW())
                """,
                user_id, plan_key, request.txSignature, expired_at
            )
        
        # 7. UPDATE AUTH_USERS TABLE
        await execute_query(
            """
            UPDATE auth_users
            SET is_premium = true, updated_at = NOW()
            WHERE id = $1
            """,
            user_id
        )
        
        logger.info(f"✅ User {user_id} upgraded to {request.plan.value}")
        
        return {
            "success": True,
            "plan": request.plan.value,
            "expiry": expired_at  .isoformat(),
            "message": f"Successfully upgraded to {request.plan.value}",
            "is_premium": True,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upgrade error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process upgrade")


@router.post("/cancel")
async def cancel_subscription(user_id: str = Depends(verify_supabase_token)):
    """Cancel subscription"""
    try:
        logger.info(f"Cancelling subscription for user: {user_id}")
        
        # UPDATE SUBSCRIPTIONS TABLE
        await execute_query(
            """
            UPDATE subscriptions
            SET status = 'cancelled', updated_at = NOW()
            WHERE user_id = $1
            """,
            user_id
        )
        
        # UPDATE AUTH_USERS TABLE
        await execute_query(
            """
            UPDATE auth_users
            SET is_premium = false, updated_at = NOW()
            WHERE id = $1
            """,
            user_id
        )
        
        logger.info(f"✅ User {user_id} cancelled subscription")
        
        return {
            "success": True,
            "plan": "free",
            "message": "Subscription cancelled",
            "is_premium": False,
        }
        
    except Exception as e:
        logger.error(f"Cancel error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")
