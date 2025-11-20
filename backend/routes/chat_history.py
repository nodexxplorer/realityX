# backend/routes/chat_history.py

async def send_message_and_get_reply(user_id: str, conversation_id: int, user_message: str) -> str:
    # Save user message
    await add_message(conversation_id, "user", user_message)
    
    # Get context
    context = await get_conversation_context(conversation_id)
    
    # Generate AI response with context
    ai_reply = await generate_ai_response(user_message, context)
    
    # Save AI reply
    await add_message(conversation_id, "assistant", ai_reply)
    
    return ai_reply