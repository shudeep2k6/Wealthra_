# Monthly Income Manager - Machine Learning Pipeline (`/ml/income_manager`)

An end-to-end Machine Learning and financial analysis system designed for irregular, variable, and seasonal income earners (freelancers, small business owners, daily earners, gig workers, entrepreneurs).

## 1. Directory Structure

```
/ml/income_manager/
├── income_manager_dataset.csv   # 2,000 synthetic records covering diverse earner archetypes
├── generate_dataset.py          # Synthetic dataset generator
├── train_model.py               # Preprocessing, StandardScaler & RandomForest pipeline
├── predict.py                   # Financial calculations, ML inference & wealth plan generator
├── model.pkl                    # Serialized Random Forest classifier
├── scaler.pkl                   # Serialized feature StandardScaler
├── requirements.txt             # Python dependencies
└── README.md                    # Technical documentation
```

## 2. Earner Profiles & Target Categories

The classifier maps users into 4 distinct financial profiles:
1. **Stable Income**: Low variance, predictable monthly earnings, standard balanced allocation.
2. **Moderately Variable Income**: Seasonal or periodic fluctuations requiring modest smoothing buffers.
3. **Highly Variable Income**: Extreme income peaks and valleys (e.g. ₹5k → ₹30k → ₹5k). Requires aggressive buffer retention to prevent lifestyle inflation during windfall months.
4. **Financial Risk**: High debt burden (DTI > 40%), expenses exceeding average income, or acute runway vulnerability (< 1 month buffer).

## 3. Training & Performance

- **Model**: Scikit-Learn `RandomForestClassifier` with balanced class weights.
- **Preprocessing**: `StandardScaler` fitted on 9 quantitative metrics (`income`, `expenses`, `savings`, `loan_emi`, `income_variability`, `savings_rate`, `expense_ratio`, `debt_to_income`, `runway_months`).
- **Test Accuracy**: **94.75%** on 400 test records.
- **Top Feature**: `income_variability` (51.0% importance), followed by `savings_rate` (18.4%) and `runway_months` (10.5%).

## 4. Execution Commands

```bash
# Generate dataset
python ml/income_manager/generate_dataset.py

# Train classifier
python ml/income_manager/train_model.py

# Test inference
python ml/income_manager/predict.py --test
```
