# backend/app/routes/chat.py

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

from middleware.auth import verify_supabase_token
from middleware.rate_limit import rate_limiter
from services.chat_history_service import (
    create_conversation,
    send_message_and_get_reply,
    get_messages,
    delete_conversation,
    add_message
)
from services.gemini_service import generate_ai_response_stream
from services.memory_service import format_conversation_for_context
from db.queries import get_user_conversations, update_conversation_title
from utils.validators import validate_message_length, sanitize_input

router = APIRouter()


class NewChatRequest(BaseModel):
    first_message: str
    images: list[str] | None = None


class SendMessageRequest(BaseModel):
    conversation_id: int
    message: str
    images: list[str] | None = None


class UpdateTitleRequest(BaseModel):
    conversation_id: int
    title: str


@router.post("/new")
async def start_new_chat(
    req: NewChatRequest,
    user_id: str = Depends(verify_supabase_token),
    rate_limit_status: dict = Depends(rate_limiter.check_rate_limit)
):
    """Start a new conversation"""
    validate_message_length(req.first_message)
    clean_message = sanitize_input(req.first_message)
    
    conv_id = await create_conversation(user_id, clean_message)
    
    # Get AI response for first message
    response = await send_message_and_get_reply(
        user_id,
        conv_id,
        clean_message
    )
    
    return {
        "conversation_id": conv_id,
        "reply": response["reply"],
        "metadata": response.get("metadata", {}),
        "rate_limit": rate_limit_status
    }


@router.post("/new/stream")
async def start_new_chat_stream(
    req: NewChatRequest,
    user_id: str = Depends(verify_supabase_token),
    rate_limit_status: dict = Depends(rate_limiter.check_rate_limit)
):
    """Start a new conversation with streaming response"""
    validate_message_length(req.first_message)
    clean_message = sanitize_input(req.first_message)
    
    async def generate():
        try:
            # Create conversation
            conv_id = await create_conversation(user_id, clean_message)
            
            # Save user message
            await add_message(conv_id, "user", clean_message)
            
            # Get context (will be empty for first message)
            context = await format_conversation_for_context(conv_id)
            
            # If images provided and user is premium, include image context
            message_for_model = clean_message
            if req.images and len(req.images) > 0:
                img_count = len(req.images)
                message_for_model = f"{clean_message}\n\n[User attached {img_count} image(s). Describe and analyze images if requested.]"

            # Stream AI response
            full_response = ""
            async for chunk in generate_ai_response_stream(
                message_for_model,
                context,
                user_id,
                conv_id
            ):
                full_response += chunk
                yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
            
            # Save complete response
            await add_message(conv_id, "assistant", full_response)
            
            # Send completion event with conversation_id
            yield f"data: {json.dumps({'done': True, 'conversation_id': conv_id, 'rate_limit': rate_limit_status})}\n\n"
        
        except Exception as e:
            error_data = json.dumps({'error': str(e), 'done': True})
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/send/stream")
async def send_message_stream(
    req: SendMessageRequest,
    user_id: str = Depends(verify_supabase_token),
    rate_limit_status: dict = Depends(rate_limiter.check_rate_limit)
):
    """Stream AI response in real-time"""
    validate_message_length(req.message)
    clean_message = sanitize_input(req.message)
    
    async def generate():
        try:
            # Save user message
            await add_message(req.conversation_id, "user", clean_message)
            
            # Get context
            context = await format_conversation_for_context(req.conversation_id)
            
            # If images provided and user is premium, append image context
            message_for_model = clean_message
            if req.images and len(req.images) > 0:
                img_count = len(req.images)
                message_for_model = f"{clean_message}\n\n[User attached {img_count} image(s). Describe and analyze images if requested.]"

            # Stream AI response
            full_response = ""
            async for chunk in generate_ai_response_stream(
                message_for_model,
                context,
                user_id,
                req.conversation_id
            ):
                full_response += chunk
                yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
            
            # Save complete response
            await add_message(req.conversation_id, "assistant", full_response)
            
            # Send completion event
            yield f"data: {json.dumps({'done': True, 'conversation_id': req.conversation_id, 'rate_limit': rate_limit_status})}\n\n"
        
        except Exception as e:
            error_data = json.dumps({'error': str(e), 'done': True})
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/list")
async def list_user_chats(
    user_id: str = Depends(verify_supabase_token),
    limit: int = 50
):
    """List all conversations for current user"""
    conversations = await get_user_conversations(user_id, limit)
    return {"conversations": conversations}


@router.patch("/title")
async def update_title(
    req: UpdateTitleRequest,
    user_id: str = Depends(verify_supabase_token)
):
    """Update conversation title"""
    await update_conversation_title(req.conversation_id, user_id, req.title)
    return {"status": "updated"}


@router.delete("/delete/{conversation_id}")
async def delete_chat(
    conversation_id: int,
    user_id: str = Depends(verify_supabase_token)
):
    """Delete a conversation"""
    deleted = await delete_conversation(conversation_id, user_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"status": "deleted", "conversation_id": conversation_id}

# backend/app/routes/chat.py - FIXED GET HISTORY ENDPOINT

# Make sure you have this import at the top
from db.database import get_db_pool

# ✅ GET /chat/history/{conversation_id} - Get messages in conversation
@router.get("/history/{conversation_id}")
async def get_chat_history(
    conversation_id: int,
    user_id: str = Depends(verify_supabase_token)
):
    """Get all messages in a conversation"""
    try:
        print(f"🔍 Fetching history for conversation {conversation_id}, user {user_id}")
        
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
            
            print(f"📦 Conversation owner: {conv['user_id']}, requesting user: {user_id}")
            
            if conv["user_id"] != user_id:
                print(f"❌ Unauthorized access to conversation {conversation_id}")
                raise HTTPException(status_code=403, detail="Unauthorized access to conversation")
            
            # Get all messages for this conversation
            messages = await conn.fetch(
                """
                SELECT id, role, message_text, created_at
                FROM messages
                WHERE conversation_id = $1
                ORDER BY created_at ASC
                """,
                conversation_id
            )
            
            messages_list = [dict(msg) for msg in messages]
            print(f"✅ Loaded {len(messages_list)} messages for conversation {conversation_id}")
            
            return {"messages": messages_list}
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting chat history: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))