# # backend/app/routes/ai.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

from services.gemini_service import generate_ai_response
from services.chat_history_service import (
    create_conversation,
    add_message,
    get_messages
)


router = APIRouter()


class ChatRequest(BaseModel):
    user_id: str
    prompt: str
    conversation_id: int | None = None


@router.post("/chat")
async def chat(req: ChatRequest):

    # 1) if no conversation id => create new chat
    if req.conversation_id is None:
        conversation_id = await create_conversation(req.user_id, req.prompt)
    else:
        conversation_id = req.conversation_id

    # 2) add user message
    await add_message(conversation_id, "user", req.prompt)
    # 3) get AI response
    ai_reply = await generate_ai_response(req.prompt)

    # ensure we pass a string to add_message; extract common keys or serialize dicts
    if isinstance(ai_reply, str):
        ai_text = ai_reply
    elif isinstance(ai_reply, dict):
        ai_text = ai_reply.get("text") or ai_reply.get("response") or ai_reply.get("content") or json.dumps(ai_reply)
    else:
        ai_text = str(ai_reply)

    # 4) store AI message
    await add_message(conversation_id, "assistant", ai_text)

    # 5) return
    return {
        "conversation_id": conversation_id,
        "response": ai_reply
    }
    


@router.get("/messages/{conversation_id}")
async def conversation_messages(conversation_id: int):
    msgs = await get_messages(conversation_id)
    return msgs
