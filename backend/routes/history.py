# # File: backend/app/routes/history.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middleware.auth import verify_supabase_token

from services.chat_history_service import delete_conversation
from db.database import get_db_pool

router = APIRouter()


class DeleteChatRequest(BaseModel):
    user_id: str
    conversation_id: int


@router.get("/list/{user_id}")
async def list_conversations(user_id: str):
    pool = await get_db_pool()

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, title, created_at
            FROM conversations
            WHERE user_id=$1
            ORDER BY created_at DESC
            """,
            user_id
        )
        return [dict(r) for r in rows]





# ✅ GET /chat/history/{conversation_id} - Get messages in conversation
@router.get("/history/{conversation_id}")
async def get_chat_history(
    conversation_id: int,
    user_id: str = Depends(verify_supabase_token)
):
    """Get all messages in a conversation"""
    try:
        pool = await get_db_pool()
        
        # First verify user owns this conversation
        async with pool.acquire() as conn:
            conv = await conn.fetchrow(
                "SELECT user_id FROM conversations WHERE id = $1",
                conversation_id
            )
            
            if not conv:
                print(f"❌ Conversation {conversation_id} not found")
                raise HTTPException(status_code=404, detail="Conversation not found")
            
            if conv["user_id"] != user_id:
                print(f"❌ Unauthorized access to conversation {conversation_id}")
                raise HTTPException(status_code=403, detail="Unauthorized access to conversation")
            
            # Get messages
            messages = await get_messages(conversation_id, user_id)
            print(f"✅ Loaded {len(messages)} messages for conversation {conversation_id}")
            return {"messages": messages}
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ✅ DELETE /chat/delete/{conversation_id} - Delete conversation
@router.delete("/delete/{conversation_id}")
async def delete_chat(
    conversation_id: int,
    user_id: str = Depends(verify_supabase_token)
):
    """Delete a conversation"""
    try:
        pool = await get_db_pool()
        
        # Verify user owns this conversation
        async with pool.acquire() as conn:
            conv = await conn.fetchrow(
                "SELECT user_id FROM conversations WHERE id = $1",
                conversation_id
            )
            
            if not conv:
                print(f"❌ Conversation {conversation_id} not found")
                raise HTTPException(status_code=404, detail="Conversation not found")
            
            if conv["user_id"] != user_id:
                print(f"❌ Unauthorized delete attempt on conversation {conversation_id}")
                raise HTTPException(status_code=403, detail="Unauthorized")
            
            # Delete messages first
            await conn.execute(
                "DELETE FROM messages WHERE conversation_id = $1",
                conversation_id
            )
            
            # Delete conversation
            await conn.execute(
                "DELETE FROM conversations WHERE id = $1 AND user_id = $2",
                conversation_id,
                user_id
            )
            
        print(f"✅ Conversation {conversation_id} deleted for user {user_id}")
        return {"status": "deleted", "conversation_id": conversation_id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 