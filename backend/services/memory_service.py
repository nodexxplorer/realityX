# backend/app/services/memory_service.py

from db.queries import get_conversation_messages


async def get_conversation_context(conversation_id: int, max_messages: int = 20):
    """
    Get recent messages for AI context
    Gemini 2.0 Flash has 1M token context window, so we can be generous
    """
    from db.database import get_db_pool
    
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT role, message_text, created_at
            FROM messages
            WHERE conversation_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            """,
            conversation_id,
            max_messages
        )
    
    # Reverse to get chronological order
    messages = [dict(r) for r in reversed(rows)]
    
    # Format for Gemini API
    context = []
    for msg in messages:
        context.append({
            "role": msg["role"],
            "content": msg["message_text"]
        })
    
    return context


async def build_system_prompt() -> str:
    """
    Build system prompt for consistent AI behavior
    """
    return """You are a helpful, friendly AI assistant. You provide clear, accurate, and concise responses.

Guidelines:
- Be conversational and engaging
- If you're unsure, say so
- Format responses with markdown when helpful
- Keep responses focused and relevant
- Ask clarifying questions when needed"""


async def format_conversation_for_context(conversation_id: int) -> list:
    """
    Format conversation with system prompt for better context
    """
    system_prompt = await build_system_prompt()
    conversation_history = await get_conversation_context(conversation_id)
    
    # Add system prompt at the beginning
    full_context = [
        {"role": "system", "content": system_prompt}
    ] + conversation_history
    
    return full_context