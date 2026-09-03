"""
Train Loan Terms ML Model
Uses Scikit-Learn, TF-IDF Vectorizer, and Logistic Regression
to classify loan agreement clauses into 15 financial categories.
Saves model.pkl and vectorizer.pkl.
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

def train():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, "loan_terms_dataset.csv")

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Please run generate_dataset.py first.")

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    # Validate dataset
    if "text" not in df.columns or "category" not in df.columns:
        raise ValueError("Dataset must contain 'text' and 'category' columns.")

    print(f"Total samples: {len(df)}")
    print(f"Unique categories: {df['category'].nunique()}")
    print("Class distribution:")
    print(df['category'].value_counts())

    # Text cleaning / normalization
    df["clean_text"] = df["text"].astype(str).str.strip()

    X = df["clean_text"]
    y = df["category"]

    # Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\nTraining set size: {len(X_train)}, Test set size: {len(X_test)}")

    # TF-IDF Vectorizer
    print("Fitting TF-IDF Vectorizer...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=6000,
        sublinear_tf=True,
        stop_words="english",
        min_df=1
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Train Multi-Class Logistic Regression Model
    print("Training Logistic Regression classifier...")
    model = LogisticRegression(
        C=2.5,
        max_iter=1000,
        solver="lbfgs",
        random_state=42
    )
    model.fit(X_train_vec, y_train)

    # Evaluate
    y_pred = model.predict(X_test_vec)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy: {accuracy * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    # Save artifacts
    model_path = os.path.join(current_dir, "model.pkl")
    vectorizer_path = os.path.join(current_dir, "vectorizer.pkl")

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    print(f"Saved model to: {model_path}")
    print(f"Saved vectorizer to: {vectorizer_path}")
    print("Model training completed successfully!")

if __name__ == "__main__":
    train()
