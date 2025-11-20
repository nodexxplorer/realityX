# backend/services/gemini_service.py

import os
from typing import AsyncGenerator, List, Optional, Any
import google.generativeai as genai
from core.config import settings
from db.queries import log_api_usage

# Gemini 2.0 Flash pricing (Nov 2024)
GEMINI_FLASH_INPUT_COST = 0.000075 / 1000   # $ per token
GEMINI_FLASH_OUTPUT_COST = 0.0003 / 1000    # $ per token

# Configure the API key explicitly
if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY
else:
    raise ValueError("GOOGLE_API_KEY not found in settings!")

# --- Compatibility shim ----------------------------------------------------
# Some versions of google.generativeai expose GenerativeModel and chat APIs,
# others only expose top-level generate_content. Provide a minimal shim that
# gives the same interface used in this module.
class _ChatShim:
    def __init__(self, model_name: str, history: List[dict]):
        self.model_name = model_name
        self.history = history or []

    def _build_prompt(self, prompt: str) -> str:
        parts: List[str] = []
        for msg in self.history:
            role = msg.get("role", "user")
            for p in msg.get("parts", []):
                parts.append(f"{role.capitalize()}: {p}")
        parts.append(f"User: {prompt}")
        return "\n".join(parts)

    def send_message(self, prompt: str, generation_config: Optional[dict] = None, stream: bool = False):
        full_prompt = self._build_prompt(prompt)
        try:
            # Try the modern call signature
            return genai.generate_content(prompt=full_prompt, model=self.model_name,
                                         generation_config=generation_config, stream=stream)
        except TypeError:
            # Fallback older positional API
            return genai.generate_content(self.model_name, full_prompt, generation_config=generation_config, stream=stream)


class _ModelShim:
    def __init__(self, model_name: str):
        self.model_name = model_name

    def start_chat(self, history: Optional[List[dict]] = None):
        return _ChatShim(self.model_name, history or [])

    def generate_content(self, prompt: str, generation_config: Optional[dict] = None, stream: bool = False):
        try:
            return genai.generate_content(prompt=prompt, model=self.model_name,
                                          generation_config=generation_config, stream=stream)
        except TypeError:
            return genai.generate_content(self.model_name, prompt, generation_config=generation_config, stream=stream)


def _get_model(name: str):
    """
    Return either the SDK's GenerativeModel (if present) or the shim.
    """
    Model = getattr(genai, "GenerativeModel", None)
    if Model:
        try:
            return Model(name)
        except Exception:
            # fallback to shim if constructing SDK model fails
            return _ModelShim(name)
    return _ModelShim(name)


# --- Core functions --------------------------------------------------------

async def generate_ai_response(
    prompt: str,
    context: Optional[List[dict]] = None,
    user_id: Optional[str] = None,
    conversation_id: Optional[int] = None
) -> dict:
    """
    Non-streaming generation helper.
    Returns dict: { text, input_tokens, output_tokens, total_tokens, cost, model }
    """
    # Choose model based on user's plan: 'pro' -> gemini-2.5-flash (text-only)
    # 'premuim' -> gemini-2.5-flash-lite (text + tts / multimodal)
    model_name = "gemini-2.0-flash"
    plan = None
    # Prefer subscription stored in DB; avoids circular imports
    if user_id:
        try:
            from db.database import get_db_pool
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT plan, status FROM subscriptions WHERE user_id = $1 LIMIT 1",
                    user_id
                )
                if row and row.get("status") == "active":
                    plan = row.get("plan")
        except Exception:
            plan = None

    # If user has plan info, pick corresponding model
    normalized_plan = plan.lower() if isinstance(plan, str) else None
    premium_plan_names = {"premuim", "premium", "tier2", "tier_2"}
    pro_plan_names = {"pro", "tier1", "tier_1"}
    if normalized_plan in premium_plan_names:
        model_name = "gemini-2.5-flash-lite"
    elif normalized_plan in pro_plan_names:
        model_name = "gemini-2.5-flash"
    else:
        # Fallback: if DB indicates premium via is_premium flag, prefer tts
        try:
            from db.queries import get_user_by_id
            if user_id:
                u = None
                try:
                    u = await get_user_by_id(user_id)
                except Exception:
                    u = None
                if u and u.get("is_premium"):
                    model_name = "gemini-2.5-flash-lite"
                else:
                    model_name = "gemini-2.5-flash"
        except Exception:
            # Keep default if anything goes wrong
            model_name = model_name

    model = _get_model(model_name)
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
    }

    try:
        if context:
            history = [
                {"role": "user" if msg.get("role") == "user" else "model",
                 "parts": [msg.get("content", "")]}
                for msg in context[:-1]
            ]
            chat = model.start_chat(history=history)
            response = chat.send_message(prompt, generation_config=generation_config, stream=False)
        else:
            # Some model shims use generate_content; shim handles it.
            response = model.generate_content(prompt, generation_config=generation_config)  # type: ignore

        # Safe extraction of text and usage metadata
        text = getattr(response, "text", None)
        if text is None:
            # If SDK returns string-like or different structure
            try:
                text = str(response)
            except Exception:
                text = ""

        usage = getattr(response, "usage_metadata", None)
        input_tokens = int(getattr(usage, "prompt_token_count", 0) or 0)
        output_tokens = int(getattr(usage, "candidates_token_count", 0) or 0)
        total_tokens = int(getattr(usage, "total_token_count", input_tokens + output_tokens) or (input_tokens + output_tokens))
        total_cost = input_tokens * GEMINI_FLASH_INPUT_COST + output_tokens * GEMINI_FLASH_OUTPUT_COST

        # Log usage if available
        if user_id and conversation_id:
            try:
                await log_api_usage(user_id, conversation_id, input_tokens, output_tokens, total_cost)
            except Exception as e:
                # don't fail the request just because logging broke
                print(f"[log_api_usage error] {e}")

        return {
            "text": text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "cost": total_cost,
            "model": model_name
        }

    except Exception as e:
        print(f"[Gemini API Error] {e}")
        raise Exception(f"AI generation failed: {e}")


async def generate_conversation_title(first_message: str) -> str:
    """
    Generate a concise title for a conversation (fallbacks to truncation on error).
    """
    # Use text-only flash model for title generation
    model = _get_model("gemini-2.5-flash")
    prompt = (
        f'Generate a short, concise title (max 6 words) for a conversation that starts with:\n'
        f'"{first_message[:100]}"\n\nReturn ONLY the title, nothing else.'
    )

    try:
        response = model.generate_content(prompt, generation_config={"temperature": 0.3, "max_output_tokens": 20})  # type: ignore
        title = getattr(response, "text", None)
        if title is None:
            title = str(response)
        title = title.strip().strip('"').strip("'")
        return title[:50]
    except Exception as e:
        print(f"[Title generation error] {e}")
        return (first_message[:40] + "...") if len(first_message) > 40 else first_message


async def generate_ai_response_stream(
    prompt: str,
    context: Optional[List[dict]] = None,
    user_id: Optional[str] = None,
    conversation_id: Optional[int] = None
) -> AsyncGenerator[str, None]:
    """
    Stream AI response chunks as they arrive.
    Yields text chunks (strings). On error yields an error string chunk.
    """
    # Choose model similarly to non-streaming path
    model_name = "gemini-2.0-flash"
    plan = None
    if user_id:
        try:
            from db.database import get_db_pool
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT plan, status FROM subscriptions WHERE user_id = $1 LIMIT 1",
                    user_id
                )
                if row and row.get("status") == "active":
                    plan = row.get("plan")
        except Exception:
            plan = None

    normalized_plan = plan.lower() if isinstance(plan, str) else None
    if normalized_plan in {"premuim", "elite", "tier2", "tier_2"}:
        model_name = "gemini-2.5-flash-lite"
    elif normalized_plan in {"pro", "tier1", "tier_1"}:
        model_name = "gemini-2.5-flash"
    else:
        try:
            from db.queries import get_user_by_id
            if user_id:
                u = None
                try:
                    u = await get_user_by_id(user_id)
                except Exception:
                    u = None
                if u and u.get("is_premium"):
                    model_name = "gemini-2.5-flash-lite"
                else:
                    model_name = "gemini-2.5-flash"
        except Exception:
            model_name = model_name

    model = _get_model(model_name)
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
    }

    full_response = ""
    input_tokens = 0
    output_tokens = 0

    try:
        if context:
            history = [
                {"role": "user" if msg.get("role") == "user" else "model", "parts": [msg.get("content", "")]}
                for msg in context[:-1]
            ]
            chat = model.start_chat(history=history)
            response_stream = chat.send_message(prompt, generation_config=generation_config, stream=True)
        else:
            response_stream = model.generate_content(prompt, generation_config=generation_config, stream=True)

        # response_stream may be an iterator/generator or an async iterator depending on SDK.
        # Try to iterate synchronously first; if that fails, attempt async iteration.
        try:
            iterator = iter(response_stream)
        except TypeError:
            # Maybe an async iterator
            iterator = None

        if iterator is not None:
            for chunk in iterator:
                text = getattr(chunk, "text", None)
                if text is None:
                    text = str(chunk)
                full_response += text
                yield text
        else:
            # async iteration
            async for chunk in response_stream:  # type: ignore
                text = getattr(chunk, "text", None)
                if text is None:
                    text = str(chunk)
                full_response += text
                yield text

        # After streaming, try to extract usage metadata and log it
        usage_metadata = getattr(response_stream, "usage_metadata", None)
        if user_id and conversation_id:
            if usage_metadata:
                input_tokens = int(getattr(usage_metadata, "prompt_token_count", 0) or 0)
                output_tokens = int(getattr(usage_metadata, "candidates_token_count", 0) or 0)
                total_cost = input_tokens * GEMINI_FLASH_INPUT_COST + output_tokens * GEMINI_FLASH_OUTPUT_COST
            else:
                # Best-effort estimate when metadata isn't provided
                input_tokens = int(len(prompt.split()) * 1.3)
                output_tokens = int(len(full_response.split()) * 1.3)
                total_cost = input_tokens * GEMINI_FLASH_INPUT_COST + output_tokens * GEMINI_FLASH_OUTPUT_COST

            try:
                await log_api_usage(user_id, conversation_id, input_tokens, output_tokens, total_cost)
            except Exception as e:
                print(f"[log_api_usage error] {e}")

    except Exception as e:
        err = f"\n\n[Error: {e}]"
        print(f"[Streaming error] {e}")
        yield err