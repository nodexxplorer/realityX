# backend/db/helpers

from typing import Any, Dict, List, Optional
from db.database import get_db_pool


async def fetch_one(query: str, *params) -> Optional[Dict[str, Any]]:
    """Fetch a single record as dict"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *params)
        return dict(row) if row else None


async def fetch_all(query: str, *params) -> List[Dict[str, Any]]:
    """Fetch multiple records as list of dicts"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


async def execute_query(query: str, *params) -> str:
    """Execute a query that doesn’t return rows"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        return await conn.execute(query, *params)


async def fetch_value(query: str, *params, key: str = None, default=None):
    """Fetch a single column value from a single row"""
    row = await fetch_one(query, *params)
    if not row:
        return default
    return row.get(key) if key else list(row.values())[0]
