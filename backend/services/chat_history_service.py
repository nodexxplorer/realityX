# backend/app/services/chat_history_service.py - FIXED

from db.queries import (
    create_conversation as db_create_conversation,
    add_message as db_add_message,
    get_conversation_messages,
    delete_conversation as db_delete_conversation
)
from services.gemini_service import (
    generate_ai_response,
    generate_conversation_title
)
from services.memory_service import format_conversation_for_context


async def create_conversation(user_id: str, first_message: str) -> int:
    """Create new conversation with AI-generated title"""
    # Generate smart title using AI
    title = await generate_conversation_title(first_message)
    
    # Create conversation in database
    conv_id = await db_create_conversation(user_id, title)
    
    return conv_id


async def add_message(conversation_id: int, role: str, text: str):
    """Add message to conversation"""
    await db_add_message(conversation_id, role, text)


async def get_messages(conversation_id: int, user_id: str):
    """Get all messages in a conversation"""
    return await get_conversation_messages(conversation_id, user_id)


async def delete_conversation(conversation_id: int, user_id: str) -> bool:
    """Delete conversation - returns True if successful"""
    try:
        result = await db_delete_conversation(conversation_id, user_id)
        print(f"✅ Delete service: conversation {conversation_id} deleted successfully")
        return True  # ← FIX: Return True on success
    except Exception as e:
        print(f"❌ Delete service error: {str(e)}")
        return False


async def send_message_and_get_reply(
    user_id: str, 
    conversation_id: int, 
    user_message: str
) -> dict:
    """
    Send user message, get AI reply, and save both
    Returns full response with metadata
    """
    # Save user message
    await add_message(conversation_id, "user", user_message)
    
    # Get full conversation context with system prompt
    context = await format_conversation_for_context(conversation_id)
    
    # Generate AI response with cost tracking
    ai_response = await generate_ai_response(
        user_message, 
        context,
        user_id,
        conversation_id
    )
    
    # Save AI reply
    await add_message(conversation_id, "assistant", ai_response["text"])
    
    return {
        "reply": ai_response["text"],
        "metadata": {
            "model": ai_response["model"],
            "tokens": {
                "input": ai_response["input_tokens"],
                "output": ai_response["output_tokens"],
                "total": ai_response["total_tokens"]
            },
            "cost": ai_response["cost"]
        }
    }









# # backend/app/services/chat_history_service.py

# from db.queries import (
#     create_conversation as db_create_conversation,
#     add_message as db_add_message,
#     get_conversation_messages,
#     delete_conversation as db_delete_conversation
# )
# from services.gemini_service import (
#     generate_ai_response,
#     generate_conversation_title
# )
# from services.memory_service import format_conversation_for_context


# async def create_conversation(user_id: str, first_message: str) -> int:
#     """Create new conversation with AI-generated title"""
#     # Generate smart title using AI
#     title = await generate_conversation_title(first_message)
    
#     # Create conversation in database
#     conv_id = await db_create_conversation(user_id, title)
    
#     return conv_id


# async def add_message(conversation_id: int, role: str, text: str):
#     """Add message to conversation"""
#     await db_add_message(conversation_id, role, text)


# async def get_messages(conversation_id: int, user_id: str):
#     """Get all messages in a conversation"""
#     return await get_conversation_messages(conversation_id, user_id)


# async def delete_conversation(conversation_id: int, user_id: str):
#     """Delete conversation"""
#     await db_delete_conversation(conversation_id, user_id)


# async def send_message_and_get_reply(
#     user_id: str, 
#     conversation_id: int, 
#     user_message: str
# ) -> dict:
#     """
#     Send user message, get AI reply, and save both
#     Returns full response with metadata
#     """
#     # Save user message
#     await add_message(conversation_id, "user", user_message)
    
#     # Get full conversation context with system prompt
#     context = await format_conversation_for_context(conversation_id)
    
#     # Generate AI response with cost tracking
#     ai_response = await generate_ai_response(
#         user_message, 
#         context,
#         user_id,
#         conversation_id
#     )
    
#     # Save AI reply
#     await add_message(conversation_id, "assistant", ai_response["text"])
    
#     return {
#         "reply": ai_response["text"],
#         "metadata": {
#             "model": ai_response["model"],
#             "tokens": {
#                 "input": ai_response["input_tokens"],
#                 "output": ai_response["output_tokens"],
#                 "total": ai_response["total_tokens"]
#             },
#             "cost": ai_response["cost"]
#         }
#     }