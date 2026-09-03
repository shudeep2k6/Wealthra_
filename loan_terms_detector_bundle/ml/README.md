# Loan EMI Terms Detector - Machine Learning Pipeline (`/ml`)

An end-to-end Machine Learning pipeline designed to automatically detect, classify, and evaluate financial clauses and risk factors in loan agreements.

## 1. Directory Structure

```
/ml
├── loan_terms_dataset.csv  # 1,350 labeled legal loan agreement sentences
├── generate_dataset.py     # Synthetic domain dataset generator
├── train_model.py          # TF-IDF + Logistic Regression training pipeline
├── predict.py              # Clause segmentation, inference, and terms extraction engine
├── model.pkl               # Serialized Multi-Class Logistic Regression model
├── vectorizer.pkl          # Serialized TF-IDF feature vectorizer
├── requirements.txt        # Python dependencies
└── README.md               # Technical documentation
```

## 2. 15 Financial Categories

The classifier maps clauses into the following 15 standard banking categories:

1. **Interest Rate**: Fixed/floating benchmarks, MCLR spreads, resets.
2. **EMI**: Equated monthly installment amounts, debit dates, NACH mandates.
3. **Loan Tenure**: Repayment duration in months/years, amortization horizons.
4. **Processing Fee**: Non-refundable upfront fees, login charges, origination costs.
5. **Late Fee**: Default surcharges, penal interest on overdue installments.
6. **Foreclosure**: Early closure charges, exit notice periods, lock-in rules.
7. **Prepayment**: Partial prepayments, part-payment fees, annual thresholds.
8. **Insurance**: Mandatory credit life, property insurance, premium capitalization.
9. **Hidden Charges**: Annual account maintenance, document retrieval fees, ECS swap fees.
10. **Penalty**: Dishonor/bounce penalties, breach of negative pledge, legal costs.
11. **Credit Score**: CIBIL/Experian bureau pulls, adverse reporting covenants.
12. **Eligibility**: FOIR thresholds, minimum salary requirements, continuous employment.
13. **Documentation**: Mortgages, title deeds, promissory notes, stamp duty.
14. **Tax**: GST exclusions, Section 80C/24(b) tax deductions, TDS.
15. **Other**: Governing law, dispute resolution, address change notification.

## 3. Architecture & Algorithm

- **Feature Extraction**: Scikit-Learn `TfidfVectorizer` (sublinear term frequency, unigrams + bigrams, English stop words, 6,000 max features).
- **Classification Model**: Multi-class `LogisticRegression` with L-BFGS solver, L2 regularization ($C=2.5$), and probability calibration.
- **Inference Pipeline**:
  - Sentence tokenization via NLTK `sent_tokenize` / fallback boundary regex.
  - Multi-class probability scoring (`predict_proba`) returning confidence percentages (0-100%).
  - Financial regex entity extractors for numerical metrics (Interest %, EMI ₹, Months, Penalties).
  - Multi-factor risk engine evaluating clause severity (Low, Medium, High) and computing an overall Risk Score (0-100).
  - Plain-English synthesis converting complex legal terms into plain summaries.

## 4. Usage & Commands

### Install Dependencies
```bash
pip install -r ml/requirements.txt
```

### Generate Dataset
```bash
python ml/generate_dataset.py
```

### Train Model
```bash
python ml/train_model.py
```

### Test Inference
```bash
# Self-test
python ml/predict.py --test

# Predict single clause
python ml/predict.py --single --text "A penal interest rate of 24.0% per annum shall be charged on delayed EMI payments."

# Analyze full agreement via JSON
python ml/predict.py --text "..."
```
