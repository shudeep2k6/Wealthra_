import os
from typing import Any

from dotenv import load_dotenv

load_dotenv()


SYSTEM_PROMPT = """
You are ScamShield AI, a digital financial safety assistant
inside the WELTHRA application.

Your purpose is to help users understand suspicious financial
messages, phishing, social engineering, impersonation, OTP scams,
KYC scams, fake customer support, malicious links, QR scams,
investment scams, and related digital financial threats.

Use simple, calm language suitable for people with limited digital
experience.

IMPORTANT SAFETY RULES:

1. Never ask the user for an OTP.
2. Never ask for a PIN.
3. Never ask for a password.
4. Never ask for a CVV.
5. Never ask for card numbers.
6. Never ask for banking credentials.
7. Never guarantee that a message or URL is safe.
8. Never tell the user to open a suspicious URL.
9. Encourage independent verification through official channels.
10. If the situation is uncertain, explain the uncertainty clearly.
11. Do not create unnecessary fear.
12. Give practical, safe actions.

When analyzing a message, explain:
- what the message appears to be trying to do
- which warning signs are present
- what the user should avoid
- what the user should do instead

Do not claim to be a bank employee or financial institution.
"""


def _get_client():
    """
    Create an Anthropic client when an API key is available.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        return None

    try:
        from anthropic import Anthropic

        return Anthropic(api_key=api_key)

    except Exception:
        return None


def _extract_text(response: Any) -> str:
    """
    Extract text blocks from an Anthropic response.
    """
    parts = []

    for block in response.content:
        if getattr(block, "type", None) == "text":
            parts.append(block.text)

    return "\n".join(parts).strip()


def fallback_explanation(
    risk_result: dict[str, Any],
) -> str:
    """
    Provide a safe local explanation when Claude is unavailable.
    """
    risk_level = risk_result["risk_level"]
    indicators = risk_result["indicators"]

    if not indicators:
        return (
            "No strong rule-based warning signs were detected. "
            "However, this does not guarantee that the message is safe. "
            "Verify unexpected requests through an official channel."
        )

    names = [
        indicator["name"]
        for indicator in indicators
    ]

    signs = ", ".join(names)

    return (
        f"ScamShield detected these warning signs: {signs}. "
        f"The current risk level is {risk_level}. "
        "Do not click suspicious links or share OTPs, PINs, "
        "passwords, or other sensitive information. "
        "If the message claims to be from a bank or service, "
        "verify it independently through the organization's "
        "official app or website."
    )


def explain_scam(
    message: str,
    risk_result: dict[str, Any],
) -> dict[str, Any]:
    """
    Generate a simple AI explanation of a scam analysis.
    """
    client = _get_client()

    if client is None:
        return {
            "available": False,
            "explanation": fallback_explanation(
                risk_result
            ),
        }

    model = os.getenv(
        "ANTHROPIC_MODEL",
        "claude-sonnet-5",
    )

    prompt = f"""
Analyze the following message using the ScamShield risk-analysis
results.

<message>
{message}
</message>

<risk_analysis>
Risk score: {risk_result["risk_score"]}
Risk level: {risk_result["risk_level"]}
Prediction: {risk_result["prediction"]}
ML result: {risk_result["ml"]}
Warning signs: {risk_result["indicators"]}
URL analysis: {risk_result["urls"]}
</risk_analysis>

Return a concise response with exactly these sections:

WHAT THIS MESSAGE IS DOING
WHY IT LOOKS SUSPICIOUS
WHAT YOU SHOULD NOT DO
WHAT YOU SHOULD DO

Use simple language.
Do not request sensitive information.
Do not claim certainty unless the evidence supports it.
"""

    try:
        response = client.messages.create(
            model=model,
            max_tokens=700,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        explanation = _extract_text(response)

        if not explanation:
            raise RuntimeError(
                "Claude returned an empty response."
            )

        return {
            "available": True,
            "explanation": explanation,
        }

    except Exception:
        return {
            "available": False,
            "explanation": fallback_explanation(
                risk_result
            ),
        }


def chat(
    user_message: str,
    conversation: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    """
    Handle a chatbot request.
    """
    if not user_message.strip():
        raise ValueError(
            "Message cannot be empty."
        )

    client = _get_client()

    if client is None:
        return {
            "available": False,
            "reply": (
                "I can help you understand common digital scams. "
                "Do not share OTPs, PINs, passwords, CVVs, or banking "
                "credentials. If someone claims to be from your bank, "
                "verify them through the bank's official app or website."
            ),
        }

    model = os.getenv(
        "ANTHROPIC_MODEL",
        "claude-sonnet-5",
    )

    messages = []

    if conversation:
        for item in conversation[-10:]:
            role = item.get("role")

            if role not in {"user", "assistant"}:
                continue

            content = item.get("content", "").strip()

            if content:
                messages.append(
                    {
                        "role": role,
                        "content": content,
                    }
                )

    messages.append(
        {
            "role": "user",
            "content": user_message.strip(),
        }
    )

    try:
        response = client.messages.create(
            model=model,
            max_tokens=600,
            system=SYSTEM_PROMPT,
            messages=messages,
        )

        reply = _extract_text(response)

        if not reply:
            raise RuntimeError(
                "Claude returned an empty response."
            )

        return {
            "available": True,
            "reply": reply,
        }

    except Exception:
        return {
            "available": False,
            "reply": (
                "The AI assistant is temporarily unavailable. "
                "As a safety rule, do not share OTPs, PINs, passwords, "
                "CVVs, or banking credentials. Verify suspicious requests "
                "through the organization's official channel."
            ),
        }