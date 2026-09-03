# Loan EMI Terms Detector & Simplifier (Complete Standalone Bundle)

A complete, self-contained AI/ML and Web solution that extracts hidden fees, penal charges, and critical financial conditions from loan agreements (PDF, DOCX, TXT) and presents them in simple, clear language.

---

## Folder Structure

```
loan_terms_detector_bundle/
├── ml/
│   ├── model.pkl                 # Serialized trained Logistic Regression model
│   ├── vectorizer.pkl            # Serialized TF-IDF feature vectorizer
│   ├── loan_terms_dataset.csv    # 1,350 labeled legal clauses (15 categories)
│   ├── train_model.py            # Model training pipeline
│   ├── predict.py                # Inference, terms extraction & risk engine
│   ├── generate_dataset.py       # Dataset synthesis generator
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # ML documentation
├── server/
│   ├── server.js                 # Express API server (port 5001)
│   └── package.json              # Backend dependencies
├── frontend/
│   ├── LoanTermsDetector.jsx     # Main React component
│   └── loanDetector.css          # Styling (pure CSS)
├── sample_agreements/
│   ├── sample_high_risk_loan.txt
│   ├── sample_standard_home_loan.txt
│   └── sample_transparent_loan.txt
└── README.md
```

---

## 1. Quick Start Guide

### Step 1: Install Python ML Dependencies
```bash
cd ml
pip install -r requirements.txt
python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords')"
```

### Step 2: (Optional) Re-train the Model
The bundle already includes pre-trained `model.pkl` and `vectorizer.pkl`. To re-train:
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
*The API will start at `http://localhost:5001`.*

### Step 4: Frontend Integration
Copy `frontend/LoanTermsDetector.jsx` and `frontend/loanDetector.css` into your React project.
Install frontend peer dependencies:
```bash
npm install axios jspdf react-dropzone lucide-react
```

---

## 2. API Endpoints

- `POST /api/loan/analyze`
  - Accepts: `multipart/form-data` with `file` (PDF, DOCX, TXT) OR JSON `{ text: "..." }`
  - Returns:
    ```json
    {
      "risk": "High",
      "risk_score": 95,
      "summary": "Plain English summary...",
      "clauses": [
        {
          "id": 1,
          "clause": "A penal interest rate of 30.0% p.a...",
          "category": "Late Fee",
          "confidence": 88.5,
          "risk_level": "High",
          "explanation": "Steep late payment penalty rate charged on default."
        }
      ],
      "important_terms": [
        { "term": "Interest Rate", "value": "15.50% (Floating)", "risk": "Medium", "confidence": 95.0 },
        { "term": "EMI Amount", "value": "₹24,500 / month", "risk": "Low", "confidence": 92.0 },
        { "term": "Loan Tenure", "value": "60 Months (5 Years)", "risk": "Low", "confidence": 96.0 },
        { "term": "Processing Fee", "value": "2.5% of loan amount + Min ₹4,500", "risk": "Medium", "confidence": 90.0 },
        { "term": "Late Payment Penalty", "value": "30.0% p.a. penal interest", "risk": "High", "confidence": 94.0 },
        { "term": "Foreclosure Charges", "value": "4.5% on outstanding principal", "risk": "High", "confidence": 92.0 },
        { "term": "Prepayment", "value": "Permitted with 3.0% exit fee", "risk": "Medium", "confidence": 89.0 },
        { "term": "Insurance", "value": "Mandatory credit life policy (₹18,500)", "risk": "Medium", "confidence": 88.0 },
        { "term": "Hidden Charges", "value": "Annual maintenance ₹1,500 + document retrieval ₹750", "risk": "High", "confidence": 91.0 },
        { "term": "Risk Level", "value": "High Risk (95/100)", "risk": "High", "confidence": 95.0 }
      ]
    }
    ```
- `GET /api/loan/samples` — Returns sample agreements for instant testing.
- `GET /api/health` — Health check status.
