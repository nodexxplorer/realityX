# backend/test_gemini.py

import asyncio
from app.services.gemini_service import (
    generate_ai_response,
    generate_conversation_title,
    generate_ai_response_stream
)
from app.core.config import settings


async def test_basic_response():
    """Test basic AI response"""
    print("Testing basic response...")
    response = await generate_ai_response("What is Python?")
    print(f"Response: {response['text'][:100]}...")
    print(f"Tokens: {response['total_tokens']}, Cost: ${response['cost']:.6f}")


async def test_with_context():
    """Test response with conversation context"""
    print("\nTesting with context...")
    context = [
        {"role": "user", "content": "My name is John"},
        {"role": "assistant", "content": "Hello John! How can I help you?"},
    ]
    response = await generate_ai_response(
        "What's my name?",
        context=context
    )
    print(f"Response: {response['text']}")


async def test_title_generation():
    """Test title generation"""
    print("\nTesting title generation...")
    title = await generate_conversation_title(
        "I need help building a web application with FastAPI and React"
    )
    print(f"Generated title: {title}")


async def test_streaming():
    """Test streaming response"""
    print("\nTesting streaming...")
    print("Response: ", end="", flush=True)
    
    async for chunk in generate_ai_response_stream(
        "Tell me a short joke about programming"
    ):
        print(chunk, end="", flush=True)
    print()


async def main():
    await test_basic_response()
    await test_with_context()
    await test_title_generation()
    await test_streaming()


if __name__ == "__main__":
    asyncio.run(main())