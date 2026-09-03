from flask import Blueprint, jsonify, request

from .history import add_scan, get_history, clear_history
from .ocr import extract_text_from_image
from .risk_engine import analyze_message
from .ai_assistant import explain_scam, chat


scamshield_bp = Blueprint(
    "scamshield",
    __name__,
    url_prefix="/api/scamshield",
)


@scamshield_bp.get("/health")
def health():
    return jsonify(
        {
            "module": "ScamShield AI",
            "status": "online",
        }
    )


@scamshield_bp.post("/analyze")
def analyze():
    try:
        message = ""

        # JSON request
        if request.is_json:
            data = request.get_json(silent=True) or {}
            message = str(data.get("message", "")).strip()

        # Image upload request
        elif "image" in request.files:
            image = request.files["image"]

            if image.filename == "":
                return jsonify(
                    {
                        "success": False,
                        "error": "No image selected.",
                    }
                ), 400

            message = extract_text_from_image(image)

        else:
            return jsonify(
                {
                    "success": False,
                    "error": "Send a message or upload an image.",
                }
            ), 400

        if not message:
            return jsonify(
                {
                    "success": False,
                    "error": "No text could be extracted from the input.",
                }
            ), 400

        # Scam detection + risk analysis
        risk_result = analyze_message(message)

        # AI explanation
        ai_result = explain_scam(
            message=message,
            risk_result=risk_result,
        )

        result = {
            "success": True,
            "message": message,
            "risk": risk_result,
            "ai_explanation": ai_result,
        }

        # Save scan history
        add_scan(result)

        return jsonify(result), 200

    except Exception as exc:
        return jsonify(
            {
                "success": False,
                "error": str(exc),
            }
        ), 500


@scamshield_bp.post("/chat")
def scamshield_chat():
    try:
        data = request.get_json(silent=True) or {}

        message = str(data.get("message", "")).strip()
        conversation = data.get("conversation", [])

        if not message:
            return jsonify(
                {
                    "success": False,
                    "error": "Message is required.",
                }
            ), 400

        if not isinstance(conversation, list):
            conversation = []

        response = chat(
            message=message,
            conversation=conversation,
        )

        return jsonify(
            {
                "success": True,
                "response": response,
            }
        ), 200

    except Exception as exc:
        return jsonify(
            {
                "success": False,
                "error": str(exc),
            }
        ), 500


@scamshield_bp.get("/history")
def history():
    return jsonify(
        {
            "success": True,
            "history": get_history(),
        }
    )


@scamshield_bp.delete("/history")
def delete_history():
    clear_history()

    return jsonify(
        {
            "success": True,
            "message": "Scan history cleared.",
        }
    )