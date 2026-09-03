import re
from urllib.parse import urlparse

try:
    from .scam_detector import ScamDetector
except ImportError:
    ScamDetector = None


# ---------------------------------------------------------
# ScamShield Risk Engine
# ---------------------------------------------------------

RULES = [
    {
        "name": "Urgency",
        "severity": "high",
        "score": 20,
        "patterns": [
            r"\burgent\b",
            r"\bimmediately\b",
            r"\bact now\b",
            r"\bwithin \d+ (minutes?|hours?)\b",
            r"\btoday\b",
            r"\blast warning\b",
        ],
        "explanation": "The message creates pressure to act quickly.",
    },
    {
        "name": "Account Threat",
        "severity": "high",
        "score": 20,
        "patterns": [
            r"\baccount (will be|is|has been) blocked\b",
            r"\baccount.*suspend",
            r"\baccount.*closed\b",
            r"\baccount.*deactivat",
            r"\baccess.*blocked\b",
        ],
        "explanation": "The message threatens account access to pressure the recipient.",
    },
    {
        "name": "OTP Request",
        "severity": "critical",
        "score": 30,
        "patterns": [
            r"\botp\b",
            r"\bone[- ]time password\b",
            r"\bverification code\b",
            r"\bshare.*code\b",
            r"\bsend.*otp\b",
        ],
        "explanation": "Legitimate organizations generally should not ask you to share an OTP.",
    },
    {
        "name": "PIN or Password Request",
        "severity": "critical",
        "score": 30,
        "patterns": [
            r"\bpin\b",
            r"\bpassword\b",
            r"\bpasscode\b",
            r"\bshare.*pin\b",
            r"\bsend.*password\b",
        ],
        "explanation": "The message requests sensitive authentication information.",
    },
    {
        "name": "KYC Request",
        "severity": "high",
        "score": 20,
        "patterns": [
            r"\bkyc\b",
            r"\bupdate.*kyc\b",
            r"\bverify.*kyc\b",
            r"\bkyc.*expire",
        ],
        "explanation": "Fake KYC or verification requests are commonly used in financial scams.",
    },
    {
        "name": "Prize or Reward",
        "severity": "high",
        "score": 20,
        "patterns": [
            r"\bwon\b",
            r"\bwinner\b",
            r"\bprize\b",
            r"\breward\b",
            r"\blottery\b",
            r"\bcashback\b",
            r"\bcongratulations\b",
        ],
        "explanation": "Unexpected prizes or rewards can be used to lure victims into scams.",
    },
    {
        "name": "Money Request",
        "severity": "high",
        "score": 25,
        "patterns": [
            r"\bsend money\b",
            r"\btransfer money\b",
            r"\bpay now\b",
            r"\bmake a payment\b",
            r"\bsend.*rs\.?\b",
            r"\bsend.*₹",
        ],
        "explanation": "The message attempts to persuade you to send money.",
    },
    {
        "name": "Remote Access Request",
        "severity": "critical",
        "score": 30,
        "patterns": [
            r"\bremote access\b",
            r"\banydesk\b",
            r"\bteamviewer\b",
            r"\brustdesk\b",
            r"\bremote desktop\b",
            r"\bscreen sharing\b",
        ],
        "explanation": "Remote-access requests can allow attackers to control or observe your device.",
    },
    {
        "name": "Impersonation",
        "severity": "high",
        "score": 20,
        "patterns": [
            r"\b(bank|police|government|rbi|income tax|customs|support)\b",
            r"\bwe are calling from\b",
            r"\bofficial representative\b",
            r"\bsecurity team\b",
        ],
        "explanation": "The message may be pretending to represent a trusted organization.",
    },
    {
        "name": "Verification Pressure",
        "severity": "medium",
        "score": 15,
        "patterns": [
            r"\bverify your account\b",
            r"\bverify immediately\b",
            r"\bconfirm your identity\b",
            r"\bcomplete verification\b",
            r"\bclick.*verify\b",
        ],
        "explanation": "The message pressures you to perform an unexpected verification.",
    },
]


URL_PATTERN = re.compile(
    r"https?://[^\s]+|www\.[^\s]+",
    re.IGNORECASE,
)


def normalize_text(text):
    """Normalize text for analysis."""

    if not text:
        return ""

    text = str(text)
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def extract_urls(text):
    """Extract URLs without visiting them."""

    return URL_PATTERN.findall(text)


def analyze_urls(urls):
    """
    Analyze URLs using basic structural signals.

    ScamShield NEVER visits the URLs.
    """

    results = []

    for url in urls:
        clean_url = url.rstrip(".,!?;:)")

        if clean_url.lower().startswith("www."):
            parsed = urlparse("http://" + clean_url)
        else:
            parsed = urlparse(clean_url)

        hostname = parsed.netloc.lower()

        indicators = []
        score = 0

        if not parsed.scheme:
            indicators.append("Unusual URL format")
            score += 5

        if "@" in clean_url:
            indicators.append("Contains @ symbol")
            score += 8

        if len(clean_url) > 100:
            indicators.append("Unusually long URL")
            score += 5

        if hostname:
            parts = hostname.split(".")

            if len(parts) >= 4:
                indicators.append("Deep subdomain structure")
                score += 5

            suspicious_terms = [
                "verify",
                "verification",
                "secure",
                "login",
                "update",
                "kyc",
                "reward",
                "prize",
                "claim",
                "account",
            ]

            matched_terms = [
                term for term in suspicious_terms
                if term in hostname
            ]

            if matched_terms:
                indicators.append(
                    "Suspicious words in domain: "
                    + ", ".join(matched_terms)
                )
                score += 8

        results.append(
            {
                "url": clean_url,
                "hostname": hostname,
                "suspicious": len(indicators) > 0,
                "score": min(score, 20),
                "indicators": indicators,
            }
        )

    return results


def run_rules(text):
    """Run ScamShield's rule-based detection."""

    indicators = []
    total_score = 0

    for rule in RULES:
        matched = False

        for pattern in rule["patterns"]:
            if re.search(pattern, text, re.IGNORECASE):
                matched = True
                break

        if matched:
            total_score += rule["score"]

            indicators.append(
                {
                    "name": rule["name"],
                    "severity": rule["severity"],
                    "score": rule["score"],
                    "explanation": rule["explanation"],
                }
            )

    return indicators, total_score


def run_ml_prediction(text):
    """
    Run the optional machine-learning detector.

    If the trained model is not available, the rest of
    ScamShield continues working using rules and URL analysis.
    """

    if ScamDetector is None:
        return {
            "available": False,
            "prediction": "unavailable",
            "scam_probability": 0.0,
            "confidence": 0.0,
        }

    try:
        detector = ScamDetector()

        if not detector.available:
            return {
                "available": False,
                "prediction": "unavailable",
                "scam_probability": 0.0,
                "confidence": 0.0,
            }

        result = detector.predict(text)

        prediction = result.get("prediction", "unknown")

        scam_probability = float(
            result.get(
                "scam_probability",
                result.get("probability", 0.0),
            )
            or 0.0
        )

        confidence = float(
            result.get("confidence", scam_probability)
            or 0.0
        )

        return {
            "available": True,
            "prediction": prediction,
            "scam_probability": scam_probability,
            "confidence": confidence,
        }

    except Exception as exc:
        return {
            "available": False,
            "prediction": "unavailable",
            "scam_probability": 0.0,
            "confidence": 0.0,
            "error": str(exc),
        }


def calculate_risk_level(score):
    """Convert numerical score into a risk level."""

    if score >= 80:
        return "CRITICAL"

    if score >= 60:
        return "HIGH"

    if score >= 30:
        return "MEDIUM"

    return "LOW"


def build_recommendations(indicators, risk_level):
    """Generate safety recommendations."""

    recommendations = []

    names = {
        item["name"]
        for item in indicators
    }

    if "OTP Request" in names:
        recommendations.append(
            "Never share your OTP with anyone."
        )

    if "PIN or Password Request" in names:
        recommendations.append(
            "Never share your PIN, password, or passcode."
        )

    if "Remote Access Request" in names:
        recommendations.append(
            "Do not install remote-access software at the request of an unknown person."
        )

    if "Suspicious Link" in names:
        recommendations.append(
            "Do not open suspicious links. Verify the organization using its official website or app."
        )

    if "KYC Request" in names:
        recommendations.append(
            "Complete KYC only through your bank or service provider's official app or website."
        )

    if "Money Request" in names:
        recommendations.append(
            "Do not transfer money until the request has been independently verified."
        )

    if "Prize or Reward" in names:
        recommendations.append(
            "Do not pay a fee or provide financial information to claim an unexpected prize."
        )

    if risk_level in ("HIGH", "CRITICAL"):
        recommendations.append(
            "Stop and independently verify the message before taking any action."
        )

    if not recommendations:
        recommendations.append(
            "Do not share sensitive financial information unless you independently verify the request."
        )

    return recommendations


def analyze_message(message):
    """
    Main public ScamShield analysis function.

    This is the function imported by routes.py.
    """

    text = normalize_text(message)

    if not text:
        raise ValueError("Message cannot be empty.")

    # -------------------------
    # Rule-based detection
    # -------------------------

    indicators, rule_score = run_rules(text)

    # -------------------------
    # URL analysis
    # -------------------------

    urls = extract_urls(text)
    url_results = analyze_urls(urls)

    for url_result in url_results:

        if url_result["suspicious"]:
            indicators.append(
                {
                    "name": "Suspicious Link",
                    "severity": "high",
                    "score": url_result["score"],
                    "explanation": "; ".join(
                        url_result["indicators"]
                    ),
                }
            )

    url_score = sum(
        item["score"]
        for item in url_results
        if item["suspicious"]
    )

    # -------------------------
    # Machine Learning
    # -------------------------

    ml_result = run_ml_prediction(text)

    ml_probability = ml_result.get(
        "scam_probability",
        0.0,
    )

    # Make sure probability is between 0 and 1
    ml_probability = max(
        0.0,
        min(1.0, ml_probability),
    )

    # ML contributes up to 60 points
    ml_score = round(
        ml_probability * 60
    )

    # -------------------------
    # Final risk score
    # -------------------------

    raw_score = (
        rule_score
        + url_score
        + ml_score
    )

    risk_score = min(
        100,
        round(raw_score),
    )

    risk_level = calculate_risk_level(
        risk_score
    )

    prediction = ml_result.get(
        "prediction",
        "unknown",
    )

    recommendations = build_recommendations(
        indicators,
        risk_level,
    )

    methods = [
        "Rule-Based Detection",
        "URL Analysis",
    ]

    if ml_result.get("available"):
        methods.insert(
            0,
            "Machine Learning",
        )

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "prediction": prediction,
        "ml": ml_result,
        "indicators": indicators,
        "urls": url_results,
        "recommendations": recommendations,
        "analysis_method": methods,
    }