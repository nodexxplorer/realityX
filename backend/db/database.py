# backend/app/db/database.py

import asyncpg
from core.config import settings

pool = None

async def get_db_pool():
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL,
            statement_cache_size=0,  # Disable prepared statement caching
            min_size=10,
            max_size=20
        )
    return pool