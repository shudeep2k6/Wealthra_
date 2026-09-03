import sys
from pathlib import Path

import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split


CURRENT_DIR = Path(__file__).resolve().parent

SCAMSHIELD_DIR = CURRENT_DIR.parent

DATA_PATH = (
    SCAMSHIELD_DIR
    / "data"
    / "scam_messages.csv"
)

MODEL_DIR = (
    SCAMSHIELD_DIR
    / "models"
)

MODEL_PATH = (
    MODEL_DIR
    / "scam_classifier.pkl"
)

VECTORIZER_PATH = (
    MODEL_DIR
    / "vectorizer.pkl"
)


def train():
    print("Loading dataset...")

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)

    required_columns = {
        "message",
        "label",
    }

    if not required_columns.issubset(
        df.columns
    ):
        raise ValueError(
            "Dataset must contain "
            "'message' and 'label' columns."
        )

    df = df.dropna(
        subset=[
            "message",
            "label",
        ]
    )

    df["message"] = (
        df["message"]
        .astype(str)
        .str.strip()
    )

    df = df[
        df["message"] != ""
    ]

    print(
        f"Dataset size: {len(df)} messages"
    )

    X = df["message"]
    y = df["label"].astype(int)

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=y,
        )
    )

    print("Training TF-IDF vectorizer...")

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        min_df=1,
        max_features=10000,
    )

    X_train_vectorized = (
        vectorizer.fit_transform(
            X_train
        )
    )

    X_test_vectorized = (
        vectorizer.transform(
            X_test
        )
    )

    print("Training Logistic Regression...")

    model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        class_weight="balanced",
    )

    model.fit(
        X_train_vectorized,
        y_train,
    )

    predictions = model.predict(
        X_test_vectorized
    )

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    print(
        f"\nAccuracy: {accuracy:.4f}"
    )

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            predictions,
            target_names=[
                "Legitimate",
                "Scam",
            ],
            zero_division=0,
        )
    )

    print("Confusion Matrix:")

    print(
        confusion_matrix(
            y_test,
            predictions,
        )
    )

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        model,
        MODEL_PATH,
    )

    joblib.dump(
        vectorizer,
        VECTORIZER_PATH,
    )

    print(
        f"\nModel saved to:\n{MODEL_PATH}"
    )

    print(
        f"Vectorizer saved to:\n{VECTORIZER_PATH}"
    )


if __name__ == "__main__":
    try:
        train()

    except Exception as exc:
        print(
            f"Training failed: {exc}"
        )
        sys.exit(1)