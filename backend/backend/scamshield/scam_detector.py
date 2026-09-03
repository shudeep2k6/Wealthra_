from pathlib import Path
from typing import Any

import joblib

from .constants import MODEL_PATH, VECTORIZER_PATH


class ScamDetector:
    """
    Wrapper around the trained scam-message classifier.
    """

    def __init__(
        self,
        model_path: Path = MODEL_PATH,
        vectorizer_path: Path = VECTORIZER_PATH,
    ):
        self.model_path = model_path
        self.vectorizer_path = vectorizer_path

        self.model = None
        self.vectorizer = None

        self._load_model()

    def _load_model(self) -> None:
        """
        Load trained model and vectorizer if available.
        """
        if not self.model_path.exists():
            return

        if not self.vectorizer_path.exists():
            return

        self.model = joblib.load(self.model_path)
        self.vectorizer = joblib.load(
            self.vectorizer_path
        )

    @property
    def available(self) -> bool:
        """
        Return True if the trained ML model is available.
        """
        return (
            self.model is not None
            and self.vectorizer is not None
        )

    def predict(self, message: str) -> dict[str, Any]:
        """
        Predict whether a message is suspicious.
        """
        if not message.strip():
            raise ValueError("Message cannot be empty.")

        if not self.available:
            return {
                "available": False,
                "prediction": "Unavailable",
                "confidence": None,
            }

        vector = self.vectorizer.transform([message])

        prediction = int(
            self.model.predict(vector)[0]
        )

        probabilities = self.model.predict_proba(vector)[0]

        scam_probability = float(
            probabilities[1]
        )

        label = (
            "Potential Scam"
            if prediction == 1
            else "Likely Legitimate"
        )

        return {
            "available": True,
            "prediction": label,
            "confidence": round(
                scam_probability,
                4,
            ),
        }


_detector = ScamDetector()


def predict_message(message: str) -> dict[str, Any]:
    """
    Public prediction function.
    """
    return _detector.predict(message)