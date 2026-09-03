# Monthly Income Manager - Complete Standalone Bundle

A complete, self-contained AI/ML and Web package for irregular, seasonal, and variable income earners (freelancers, small business owners, daily earners, gig workers).

---

## Folder Structure

```
monthly_income_manager_bundle/
├── ml/
│   ├── model.pkl                     # Serialized Random Forest classifier
│   ├── scaler.pkl                    # Serialized feature StandardScaler
│   ├── income_manager_dataset.csv    # 2,000 labeled records across 10 earner archetypes
│   ├── train_model.py                # Preprocessing & model training pipeline (94.75% accuracy)
│   ├── predict.py                    # Inference, volatility math & wealth planning engine
│   ├── generate_dataset.py           # Synthetic dataset generator
│   ├── requirements.txt              # Python dependencies
│   └── README.md                     # ML technical documentation
├── server/
│   ├── server.js                     # Express API server (POST /api/income/analyze)
│   └── package.json                  # Backend dependencies
├── frontend/
│   ├── MonthlyIncomeManager.jsx      # Main React dashboard component
│   └── incomeManager.css             # Pure custom CSS stylesheet
├── sample_data/
│   ├── sample_freelancer_income.json # Prompt test case (5k -> 30k -> 5k -> 18k -> 7.5k)
│   ├── sample_seasonal_shop_income.json
│   └── sample_stable_consultant_income.json
└── README.md                         # This master documentation
```

---

## 1. Quick Start Guide

### Step 1: Install Python ML Dependencies
```bash
cd ml
pip install -r requirements.txt
```

### Step 2: (Optional) Re-train the Model
The bundle already includes pre-trained `model.pkl` and `scaler.pkl`. To re-train:
```bash
python generate_dataset.py
python train_model.py
```

### Step 3: Run the Backend Server
```bash
cd ../server
npm install
npm start
```
*API will run on `http://localhost:5001`.*

### Step 4: Frontend Integration
1. Copy `frontend/MonthlyIncomeManager.jsx` and `frontend/incomeManager.css` into your React project.
2. Install peer dependencies if not present:
```bash
npm install recharts axios jspdf lucide-react
```

---

## 2. API Endpoints

- `POST /api/income/analyze`
  - Accepts JSON:
    ```json
    {
      "monthly_income": [
        { "month": "January", "income": 5000, "essential_expenses": 6000, "other_expenses": 2000 },
        { "month": "February", "income": 30000, "essential_expenses": 6000, "other_expenses": 2000 },
        { "month": "March", "income": 5000, "essential_expenses": 6000, "other_expenses": 2000 },
        { "month": "April", "income": 18000, "essential_expenses": 6000, "other_expenses": 2000 },
        { "month": "May", "income": 7500, "essential_expenses": 6000, "other_expenses": 2000 }
      ],
      "expenses": 8000,
      "savings": 20000,
      "investments": 5000,
      "loan_emi": 2000,
      "financial_goal": "Emergency Fund",
      "goal_amount": 60000,
      "goal_months": 12
    }
    ```
  - Returns:
    ```json
    {
      "averageIncome": 13100,
      "highestIncome": 30000,
      "lowestIncome": 5000,
      "incomeVariability": 74.2,
      "predictedIncome": 12960,
      "financialHealthScore": 50,
      "riskLevel": "Needs Improvement",
      "incomeBuffer": 3.3,
      "savingsRate": 23.7,
      "expenseRatio": 61.1,
      "mlProfile": {
        "category": "Highly Variable Income",
        "confidence": 83.4
      },
      "allocation": {
        "essential_expenses": { "percentage": 45.0, "amount": 3380 },
        "emergency_reserve": { "percentage": 25.0, "amount": 1880 },
        "savings": { "percentage": 15.0, "amount": 1120 },
        "investment": { "percentage": 10.0, "amount": 750 },
        "flexible_spending": { "percentage": 5.0, "amount": 380 }
      },
      "insights": [...],
      "wealthPlan": {...},
      "chartData": [...]
    }
    ```
- `GET /api/income/presets`: Pre-configured real-world test scenarios.
- `GET /api/health`: Health status check.
