# backend/app/routes/dashboard.py

from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import verify_supabase_token
from db.queries import (
    get_user_dashboard_stats,
    get_user_weekly_activity,
    get_user_monthly_breakdown,
    start_user_session,
    end_user_session,
    get_user_achievements,
    get_usage_statistics,
    get_user_message_count_today,
)

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(user_id: str = Depends(verify_supabase_token)):
    """Get comprehensive dashboard statistics"""
    try:
        print(f"📊 Fetching dashboard stats for user: {user_id}")
        stats = await get_user_dashboard_stats(user_id)
        return stats
    except Exception as e:
        print(f"❌ Error fetching dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/usage-stats")
async def get_usage_stats(user_id: str = Depends(verify_supabase_token)):
    """Get usage statistics and limits"""
    try:
        print(f"📈 Fetching usage stats for user: {user_id}")
        stats = await get_usage_statistics(user_id)
        return stats
    except Exception as e:
        print(f"❌ Error fetching usage stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/daily-usage")
async def get_daily_usage(user_id: str = Depends(verify_supabase_token)):
    """Get today's chat usage count for the user (for daily chat limit widget)"""
    try:
        print(f"📆 Fetching daily usage for user: {user_id}")
        chats_used = await get_user_message_count_today(user_id)
        return {"chatsUsed": chats_used}
    except Exception as e:
        print(f"❌ Error fetching daily usage: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/achievements")
async def get_achievements_endpoint(user_id: str = Depends(verify_supabase_token)):
    """API endpoint to get user achievements"""
    try:
        print(f"🏆 Fetching achievements for user: {user_id}")
        achievements = await get_user_achievements(user_id)
        print(f"✅ Found {len(achievements)} achievements")
        return {"success": True, "achievements": achievements}
    except Exception as e:
        print(f"❌ Error fetching achievements: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/activity/weekly")
async def get_weekly_activity(user_id: str = Depends(verify_supabase_token)):
    """Get weekly activity breakdown"""
    try:
        print(f"📅 Fetching weekly activity for user: {user_id}")
        activity = await get_user_weekly_activity(user_id)
        return {"activity": activity}
    except Exception as e:
        print(f"❌ Error fetching weekly activity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/activity/monthly")
async def get_monthly_breakdown(user_id: str = Depends(verify_supabase_token)):
    """Get monthly breakdown comparison"""
    try:
        print(f"📊 Fetching monthly breakdown for user: {user_id}")
        breakdown = await get_user_monthly_breakdown(user_id)
        return breakdown
    except Exception as e:
        print(f"❌ Error fetching monthly breakdown: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session/start")
async def start_session(user_id: str = Depends(verify_supabase_token)):
    """Start tracking user session"""
    try:
        print(f"▶️ Starting session for user: {user_id}")
        session_id = await start_user_session(user_id)
        print(f"✅ Session started: {session_id}")
        return {"session_id": session_id}
    except Exception as e:
        print(f"❌ Error starting session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session/end/{session_id}")
async def end_session(
    session_id: int,
    user_id: str = Depends(verify_supabase_token)
):
    """End user session"""
    try:
        print(f"⏹️ Ending session: {session_id}")
        await end_user_session(session_id)
        print(f"✅ Session ended: {session_id}")
        return {"status": "session_ended"}
    except Exception as e:
        print(f"❌ Error ending session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



# # backend/app/routes/dashboard.py

# from fastapi import APIRouter, Depends, HTTPException
# from middleware.auth import verify_supabase_token
# # from datetime import datetime, timedelta
# # from typing import Dict, Any
# from db.queries import (
#     get_user_dashboard_stats,
#     get_user_weekly_activity,
#     get_user_monthly_breakdown,
#     start_user_session,
#     end_user_session,
#     get_user_achievements,
#     get_usage_statistics,
#     # get_db_pool
# )

# router = APIRouter()


# @router.get("/stats")
# async def get_dashboard_stats(user_id: str = Depends(verify_supabase_token)):
#     """Get comprehensive dashboard statistics"""
#     stats = await get_user_dashboard_stats(user_id)
#     return stats

# @router.get("/usage-stats")
# async def get_usage_stats(user_id: str = Depends(verify_supabase_token)):
#     """Get usage statistics and limits"""
#     stats = await get_usage_statistics(user_id)
#     return stats


# @router.get("/achievements")
# async def get_achievements_endpoint(
#     user_id: str = Depends(verify_supabase_token)  # ← ADD THIS!
# ):
#     """API endpoint to get user achievements"""
#     try:
#         print(f"🏆 Fetching achievements for user: {user_id}")
#         achievements = await get_user_achievements(user_id)
#         print(f"✅ Found {len(achievements)} achievements")
#         return {"success": True, "achievements": achievements}
#     except Exception as e:
#         print(f"❌ Error fetching achievements: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))
    

# @router.get("/activity/weekly")
# async def get_weekly_activity(user_id: str = Depends(verify_supabase_token)):
#     """Get weekly activity breakdown"""
#     activity = await get_user_weekly_activity(user_id)
#     return {"activity": activity}


# @router.get("/activity/monthly")
# async def get_monthly_breakdown(user_id: str = Depends(verify_supabase_token)):
#     """Get monthly breakdown comparison"""
#     breakdown = await get_user_monthly_breakdown(user_id)
#     return breakdown


# @router.post("/session/start")
# async def start_session(user_id: str = Depends(verify_supabase_token)):
#     """Start tracking user session"""
#     session_id = await start_user_session(user_id)
#     return {"session_id": session_id}


# @router.post("/session/end/{session_id}")
# async def end_session(
#     session_id: int,
#     user_id: str = Depends(verify_supabase_token)
# ):
#     """End user session"""
#     await end_user_session(session_id)
#     return {"status": "session_ended"}

