# backend/app/utils/format.py

def clean_ai_text(text: str) -> str:
    """
    Clean AI model raw text output.
    Make it nicer before sending to frontend.
    """

    if not text:
        return ""

    # strip whitespace at ends
    text = text.strip()

    # remove excessive blank lines
    lines = [line.strip() for line in text.split("\n")]
    lines = [l for l in lines if l != ""]  # remove empty lines

    formatted = "\n".join(lines)

    return formatted
