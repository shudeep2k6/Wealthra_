from pathlib import Path


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

MODEL_PATH = MODEL_DIR / "scam_classifier.pkl"
VECTORIZER_PATH = MODEL_DIR / "vectorizer.pkl"


# ---------------------------------------------------------
# RISK LEVELS
# ---------------------------------------------------------

RISK_LOW_MAX = 30
RISK_MEDIUM_MAX = 60
RISK_HIGH_MAX = 80


# ---------------------------------------------------------
# UPLOAD SETTINGS
# ---------------------------------------------------------

ALLOWED_IMAGE_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "webp",
}

MAX_IMAGE_SIZE_MB = 5


# ---------------------------------------------------------
# SCAM DETECTION RULES
# ---------------------------------------------------------

SCAM_RULES = [
    {
        "name": "Urgency",
        "severity": "HIGH",
        "score": 10,
        "patterns": [
            "urgent",
            "immediately",
            "act now",
            "act immediately",
            "right now",
            "within 24 hours",
            "limited time",
            "do it now",
        ],
        "explanation": (
            "The message pressures you to act quickly "
            "without giving you enough time to verify it."
        ),
    },

    {
        "name": "Account Threat",
        "severity": "HIGH",
        "score": 12,
        "patterns": [
            "account will be blocked",
            "account blocked",
            "account suspended",
            "account will be suspended",
            "account will be closed",
            "bank account blocked",
        ],
        "explanation": (
            "The message uses a threat about your account "
            "to pressure you into taking action."
        ),
    },

    {
        "name": "OTP Request",
        "severity": "CRITICAL",
        "score": 20,
        "patterns": [
            "share otp",
            "send otp",
            "provide otp",
            "enter otp",
            "tell me the otp",
            "otp code",
        ],
        "explanation": (
            "Legitimate organizations generally should not ask "
            "you to disclose an OTP to another person."
        ),
    },

    {
        "name": "PIN or Password Request",
        "severity": "CRITICAL",
        "score": 20,
        "patterns": [
            "share your pin",
            "send your pin",
            "provide your pin",
            "share password",
            "send password",
            "provide password",
            "tell me your password",
        ],
        "explanation": (
            "Requests for passwords or PINs are strong warning signs "
            "of credential theft."
        ),
    },

    {
        "name": "KYC Request",
        "severity": "HIGH",
        "score": 10,
        "patterns": [
            "kyc expired",
            "update kyc",
            "complete kyc",
            "verify kyc",
            "kyc verification",
            "kyc update",
        ],
        "explanation": (
            "Scammers commonly impersonate banks or financial services "
            "using urgent KYC-update messages."
        ),
    },

    {
        "name": "Suspicious Link",
        "severity": "HIGH",
        "score": 12,
        "patterns": [
            "click here",
            "click the link",
            "open this link",
            "verify using this link",
            "tap this link",
        ],
        "explanation": (
            "The message attempts to move you to a link instead of "
            "encouraging independent verification."
        ),
    },

    {
        "name": "Prize or Reward",
        "severity": "HIGH",
        "score": 12,
        "patterns": [
            "you won",
            "winner",
            "cash prize",
            "lottery",
            "claim your prize",
            "reward waiting",
            "free reward",
        ],
        "explanation": (
            "Unexpected prizes or rewards are commonly used "
            "as bait in scams."
        ),
    },

    {
        "name": "Money Request",
        "severity": "HIGH",
        "score": 15,
        "patterns": [
            "send money",
            "transfer money",
            "pay immediately",
            "make a payment",
            "send payment",
            "transfer now",
        ],
        "explanation": (
            "The message attempts to persuade you to transfer money "
            "without normal verification."
        ),
    },

    {
        "name": "Remote Access Request",
        "severity": "CRITICAL",
        "score": 18,
        "patterns": [
            "install anydesk",
            "install teamviewer",
            "remote access",
            "screen sharing app",
            "install this app",
            "download this application",
        ],
        "explanation": (
            "Remote-access requests can allow scammers to control "
            "or observe your device."
        ),
    },

    {
        "name": "Impersonation",
        "severity": "HIGH",
        "score": 10,
        "patterns": [
            "bank representative",
            "bank officer",
            "customer care executive",
            "income tax officer",
            "government officer",
            "support executive",
        ],
        "explanation": (
            "Scammers often impersonate trusted organizations "
            "or officials."
        ),
    },

    {
        "name": "Verification Pressure",
        "severity": "MEDIUM",
        "score": 8,
        "patterns": [
            "verify immediately",
            "verification required",
            "verify your account",
            "confirm your identity",
            "identity verification",
        ],
        "explanation": (
            "The message creates pressure around identity or account "
            "verification."
        ),
    },
]