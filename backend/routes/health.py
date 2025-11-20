# backend/app/routes/health.py

from fastapi import APIRouter
from db.database import get_db_pool
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check():
    """Check if services are running"""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }