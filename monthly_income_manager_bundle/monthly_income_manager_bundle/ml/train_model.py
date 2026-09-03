"""
Monthly Income Manager - ML Model Trainer
Preprocesses financial features, scales data using StandardScaler,
trains a Multi-Class Classifier (Random Forest / Logistic Regression),
evaluates accuracy, and saves model.pkl and scaler.pkl.
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

FEATURE_COLS = [
    "income",
    "expenses",
    "savings",
    "loan_emi",
    "income_variability",
    "savings_rate",
    "expense_ratio",
    "debt_to_income",
    "runway_months"
]

TARGET_COL = "recommendation_category"

def train():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, "income_manager_dataset.csv")

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Run generate_dataset.py first.")

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    print(f"Total samples: {len(df)}")
    print("Class distribution:")
    print(df[TARGET_COL].value_counts())

    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\nTraining set: {len(X_train)} samples, Test set: {len(X_test)} samples")

    # Fit StandardScaler
    print("Fitting StandardScaler on financial features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Classifier
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=120,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n=== Model Accuracy: {accuracy * 100:.2f}% ===")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Feature Importances
    importances = model.feature_importances_
    feat_imp = sorted(zip(FEATURE_COLS, importances), key=lambda x: x[1], reverse=True)
    print("\nFeature Importances:")
    for feat, imp in feat_imp:
        print(f" - {feat:20s}: {imp * 100:.2f}%")

    # Save artifacts
    model_path = os.path.join(current_dir, "model.pkl")
    scaler_path = os.path.join(current_dir, "scaler.pkl")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"\nSaved model to: {model_path}")
    print(f"Saved scaler to: {scaler_path}")
    print("Training completed successfully!")

if __name__ == "__main__":
    train()
