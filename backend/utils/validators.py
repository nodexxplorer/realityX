# backend/app/utils/validators.py

from fastapi import HTTPException

def validate_message_length(text: str, max_length: int = 4000):
    """Validate message isn't too long"""
    if len(text) > max_length:
        raise HTTPException(
            status_code=400,
            detail=f"Message too long. Max {max_length} characters"
        )
    if len(text.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

def sanitize_input(text: str) -> str:
    """Basic input sanitization"""
    # Remove null bytes
    text = text.replace('\x00', '')
    # Strip excessive whitespace
    text = ' '.join(text.split())
    return text.strip()