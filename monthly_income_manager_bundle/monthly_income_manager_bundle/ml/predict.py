"""
Monthly Income Manager - ML Prediction & Financial Allocation Engine
Integrates Scikit-Learn classification with dynamic financial calculations
for irregular earner income stabilization, buffer runway, and wealth planning.
"""

import sys
import os
import json
import joblib
import numpy as np
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "model.pkl")
SCALER_PATH = os.path.join(CURRENT_DIR, "scaler.pkl")

_MODEL = None
_SCALER = None

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

def load_artifacts():
    global _MODEL, _SCALER
    if _MODEL is None or _SCALER is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            raise FileNotFoundError("Model or Scaler artifacts missing. Run train_model.py first.")
        _MODEL = joblib.load(MODEL_PATH)
        _SCALER = joblib.load(SCALER_PATH)
    return _MODEL, _SCALER

def analyze_income_data(input_data):
    """
    Main analysis pipeline combining ML profile classification and financial calculations.
    """
    # 1. Parse Monthly Records
    raw_months = input_data.get("monthly_income", [])
    if not raw_months:
        raise ValueError("At least one month of income data is required.")

    # Normalize monthly records
    # Format can be: [5000, 30000, ...] or [{"month": "Jan", "income": 5000, "expenses": 8000}, ...]
    monthly_records = []
    month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    for idx, item in enumerate(raw_months):
        if isinstance(item, (int, float)):
            name = month_names[idx % 12]
            monthly_records.append({
                "month": name,
                "income": float(item),
                "essential_expenses": float(input_data.get("expenses", 8000)) * 0.75,
                "other_expenses": float(input_data.get("expenses", 8000)) * 0.25
            })
        elif isinstance(item, dict):
            name = item.get("month", month_names[idx % 12])
            inc = float(item.get("income", 0))
            ess = float(item.get("essential_expenses", item.get("expenses", 8000) * 0.75))
            oth = float(item.get("other_expenses", 0))
            monthly_records.append({
                "month": name,
                "income": inc,
                "essential_expenses": ess,
                "other_expenses": oth
            })

    incomes = [r["income"] for r in monthly_records]
    total_months = len(incomes)

    # General Financial Parameters
    existing_savings = float(input_data.get("savings", 0))
    current_investments = float(input_data.get("investments", 0))
    loan_emi = float(input_data.get("loan_emi", 0))
    goal_name = str(input_data.get("financial_goal", "Emergency Fund"))
    goal_amount = float(input_data.get("goal_amount", 60000))
    goal_months = int(input_data.get("goal_months", 12)) or 12

    # 2. Statistical Analysis
    avg_income = float(np.mean(incomes))
    highest_income = float(np.max(incomes))
    lowest_income = float(np.min(incomes))
    std_income = float(np.std(incomes)) if total_months > 1 else 0.0

    # Income variability (Coefficient of Variation in %)
    income_variability = round((std_income / (avg_income + 1e-5)) * 100.0, 1)

    # Expenses summary
    avg_essential = float(np.mean([r["essential_expenses"] for r in monthly_records]))
    avg_other = float(np.mean([r["other_expenses"] for r in monthly_records]))
    avg_total_expenses = avg_essential + avg_other

    # High / Low month categorization
    high_threshold = avg_income + (0.35 * std_income if std_income > 0 else 0.2 * avg_income)
    low_threshold = avg_income - (0.35 * std_income if std_income > 0 else 0.2 * avg_income)

    high_income_months = [r["month"] for r in monthly_records if r["income"] >= high_threshold]
    low_income_months = [r["month"] for r in monthly_records if r["income"] <= low_threshold]

    # Conservative baseline: Stable Income Level (what user can reliably count on)
    stable_income_level = float(np.percentile(incomes, 25)) if total_months >= 3 else lowest_income

    # Ratios
    savings_rate = round(max(0.0, (avg_income - avg_total_expenses - loan_emi) / (avg_income + 1e-5)) * 100.0, 1)
    expense_ratio = round((avg_total_expenses / (avg_income + 1e-5)) * 100.0, 1)
    debt_to_income = round((loan_emi / (avg_income + 1e-5)) * 100.0, 1)

    # Income Buffer (months of essential living costs covered)
    income_buffer_months = round(existing_savings / (avg_essential + 1e-5), 1)

    # 3. ML Profile Classification
    model, scaler = load_artifacts()

    input_df = pd.DataFrame([{
        "income": avg_income,
        "expenses": avg_total_expenses,
        "savings": existing_savings,
        "loan_emi": loan_emi,
        "income_variability": income_variability,
        "savings_rate": savings_rate,
        "expense_ratio": expense_ratio,
        "debt_to_income": debt_to_income,
        "runway_months": income_buffer_months
    }], columns=FEATURE_COLS)

    scaled_features = scaler.transform(input_df)
    predicted_category = model.predict(scaled_features)[0]
    category_probabilities = model.predict_proba(scaled_features)[0]
    classes = list(model.classes_)
    confidence = round(float(np.max(category_probabilities)) * 100.0, 1)

    # 4. Income Forecast for Upcoming Month
    is_data_limited = total_months < 4

    if total_months >= 3:
        # Weighted trend favoring recent trajectory with volatility damping
        weights = np.linspace(0.8, 1.2, total_months)
        weights /= weights.sum()
        raw_pred = float(np.dot(incomes, weights))
    else:
        raw_pred = avg_income

    # Predicted status (Low / Normal / High)
    if raw_pred > high_threshold:
        pred_status = "High"
    elif raw_pred < low_threshold:
        pred_status = "Low"
    else:
        pred_status = "Normal"

    forecast_explanation = (
        f"Forecast of ₹{int(round(raw_pred, -2)):,} is based on {total_months} historical months. "
        + ("Please log 6+ months for increased statistical stability." if is_data_limited else "Sufficient history detected.")
    )

    # 5. Financial Health Score (0–100)
    score_reasons = []
    base_score = 50

    # Factor: Income Stability
    if income_variability < 20:
        base_score += 15
        score_reasons.append("High income stability with low month-to-month variance.")
    elif income_variability < 45:
        base_score += 5
        score_reasons.append("Moderate income variability; seasonal shifts detected.")
    else:
        base_score -= 15
        score_reasons.append(f"Significant income volatility ({income_variability}% variability). Income swings require aggressive buffer management.")

    # Factor: Income Buffer (Runway)
    recommended_buffer_target = 6.0 if income_variability > 35 else 3.0
    if income_buffer_months >= recommended_buffer_target:
        base_score += 15
        score_reasons.append(f"Excellent emergency buffer ({income_buffer_months} months of essential expenses covered).")
    elif income_buffer_months >= 2.0:
        base_score += 5
        score_reasons.append(f"Fair buffer ({income_buffer_months} months). Aim for {recommended_buffer_target} months due to income fluctuations.")
    else:
        base_score -= 18
        score_reasons.append(f"Fragile buffer ({income_buffer_months} months). A single low-income month could cause distress.")

    # Factor: Savings Rate
    if savings_rate >= 25:
        base_score += 15
        score_reasons.append(f"Healthy average savings rate ({savings_rate}%).")
    elif savings_rate >= 10:
        base_score += 5
        score_reasons.append(f"Moderate savings rate ({savings_rate}%).")
    else:
        base_score -= 12
        score_reasons.append(f"Tight savings margin ({savings_rate}%). Expenses consume nearly all earnings.")

    # Factor: Debt Burden
    if debt_to_income == 0:
        base_score += 10
        score_reasons.append("Zero monthly debt obligations.")
    elif debt_to_income < 20:
        base_score += 5
        score_reasons.append(f"Manageable debt obligations ({debt_to_income}% DTI).")
    elif debt_to_income > 40:
        base_score -= 15
        score_reasons.append(f"High debt-to-income load ({debt_to_income}% DTI). Fixed loan EMIs on volatile income increase default risk.")

    health_score = int(np.clip(base_score, 10, 98))

    if health_score >= 85:
        risk_level = "Strong"
    elif health_score >= 70:
        risk_level = "Healthy"
    elif health_score >= 40:
        risk_level = "Needs Improvement"
    else:
        risk_level = "High Risk"

    # 6. Smart Money Allocation
    # Most recent month income or expected income
    current_reference_income = incomes[-1]
    is_windfall_month = current_reference_income >= (avg_income * 1.4)

    # Dynamic percentage allocation adapting to volatility and buffer state
    if income_variability > 45 or is_windfall_month:
        # High volatility / Spike month rule: Cap spending to baseline, channel surge to buffer
        essential_pct = min(45.0, round((avg_essential / (current_reference_income + 1e-5)) * 100, 1))
        emergency_pct = 25.0 if income_buffer_months < 6.0 else 15.0
        savings_pct = 15.0
        investment_pct = 10.0 if income_buffer_months >= 3.0 else 5.0
        flexible_pct = max(5.0, round(100.0 - (essential_pct + emergency_pct + savings_pct + investment_pct), 1))
    elif income_variability > 25:
        # Moderate volatility
        essential_pct = min(50.0, round((avg_essential / (current_reference_income + 1e-5)) * 100, 1))
        emergency_pct = 18.0 if income_buffer_months < 4.0 else 10.0
        savings_pct = 16.0
        investment_pct = 12.0
        flexible_pct = max(6.0, round(100.0 - (essential_pct + emergency_pct + savings_pct + investment_pct), 1))
    else:
        # Stable income
        essential_pct = min(50.0, round((avg_essential / (current_reference_income + 1e-5)) * 100, 1))
        emergency_pct = 10.0 if income_buffer_months < 3.0 else 5.0
        savings_pct = 15.0
        investment_pct = 15.0
        flexible_pct = max(10.0, round(100.0 - (essential_pct + emergency_pct + savings_pct + investment_pct), 1))

    # Calculate ₹ allocations
    allocation_dict = {
        "essential_expenses": {
            "percentage": essential_pct,
            "amount": int(round(current_reference_income * (essential_pct / 100.0), -1)),
            "label": "Essential Expenses",
            "description": "Housing, food, utilities, health, and minimum living commitments."
        },
        "emergency_reserve": {
            "percentage": emergency_pct,
            "amount": int(round(current_reference_income * (emergency_pct / 100.0), -1)),
            "label": "Emergency Buffer Reserve",
            "description": "Critical liquidity pool to cover living expenses during upcoming low-income months."
        },
        "savings": {
            "percentage": savings_pct,
            "amount": int(round(current_reference_income * (savings_pct / 100.0), -1)),
            "label": "Income Smoothing Fund",
            "description": "Reserved to subsidize months when earnings fall below your essential expenses."
        },
        "investment": {
            "percentage": investment_pct,
            "amount": int(round(current_reference_income * (investment_pct / 100.0), -1)),
            "label": "Future Wealth Investments",
            "description": "Long-term compounding instruments (mutual funds, gold, fixed deposits)."
        },
        "flexible_spending": {
            "percentage": flexible_pct,
            "amount": int(round(current_reference_income * (flexible_pct / 100.0), -1)),
            "label": "Flexible Spending",
            "description": "Discretionary leisure, personal shopping, and guilt-free allowances."
        }
    }

    # 7. AI Insights
    insights = []

    if income_variability > 40:
        insights.append({
            "type": "warning",
            "title": "High-Income Month Trap Warning",
            "message": f"Your income fluctuates significantly ({income_variability}% variability). During high-income months like {high_income_months[0] if high_income_months else 'peak months'} (₹{int(highest_income):,}), resist increasing lifestyle spending. Lock the excess earnings into your Income Buffer to survive lean months."
        })

    if highest_income >= (lowest_income * 3.0):
        insights.append({
            "type": "info",
            "title": "Establish Your Baseline Income",
            "message": f"Your highest month (₹{int(highest_income):,}) is {round(highest_income / (lowest_income + 1e-5), 1)}x your lowest month (₹{int(lowest_income):,}). Base your recurring fixed commitments on your stable floor of ₹{int(stable_income_level):,}, not your windfall peaks."
        })

    if income_buffer_months < recommended_buffer_target:
        needed_buffer = int((recommended_buffer_target - income_buffer_months) * avg_essential)
        insights.append({
            "type": "action",
            "title": "Build Your Recommended Safety Runway",
            "message": f"Because your income is variable, you should maintain a {int(recommended_buffer_target)}-month buffer. You currently have {income_buffer_months} months. We recommend adding ₹{needed_buffer:,} to your liquid reserves before increasing aggressive investments."
        })
    else:
        insights.append({
            "type": "positive",
            "title": "Resilient Buffer Milestone Reached",
            "message": f"Congratulations! Your {income_buffer_months}-month buffer provides solid insulation against dry months. You can safely route more cashflow into long-term compounding wealth."
        })

    if debt_to_income > 25:
        insights.append({
            "type": "warning",
            "title": "Fixed Debt Caution",
            "message": f"Your monthly loan EMIs take ₹{int(loan_emi):,} ({debt_to_income}% of average earnings). On low months (e.g. ₹{int(lowest_income):,}), debt alone consumes a dangerous share of income. Prioritize debt reduction."
        })

    # 8. Future Wealth Plan & Projections (6, 12, 24 months)
    monthly_smooth_save = allocation_dict["emergency_reserve"]["amount"] + allocation_dict["savings"]["amount"]
    monthly_invest = allocation_dict["investment"]["amount"]

    wealth_projections = []
    current_net = existing_savings + current_investments

    for m in [3, 6, 12, 18, 24]:
        projected_buffer = existing_savings + (monthly_smooth_save * m)
        projected_investments = current_investments + (monthly_invest * m * 1.05) # modest compounding
        total_projected_wealth = projected_buffer + projected_investments

        wealth_projections.append({
            "month": f"Month {m}",
            "projected_buffer": int(projected_buffer),
            "projected_investments": int(projected_investments),
            "total_wealth": int(total_projected_wealth),
            "goal_progress_pct": min(100.0, round((total_projected_wealth / (goal_amount + 1e-5)) * 100, 1))
        })

    # Historical trend for charts
    chart_data = []
    for r in monthly_records:
        chart_data.append({
            "month": r["month"],
            "income": int(r["income"]),
            "essential_expenses": int(r["essential_expenses"]),
            "other_expenses": int(r["other_expenses"]),
            "total_expenses": int(r["essential_expenses"] + r["other_expenses"]),
            "net_surplus": int(r["income"] - (r["essential_expenses"] + r["other_expenses"]))
        })

    return {
        "averageIncome": int(round(avg_income)),
        "highestIncome": int(round(highest_income)),
        "lowestIncome": int(round(lowest_income)),
        "incomeVariability": income_variability,
        "stableIncomeLevel": int(round(stable_income_level)),
        "highIncomeMonths": high_income_months,
        "lowIncomeMonths": low_income_months,
        "averageExpenses": int(round(avg_total_expenses)),
        "savingsCapacity": int(round(max(0, avg_income - avg_total_expenses - loan_emi))),
        "emergencyReserveRequirement": int(round(avg_essential * recommended_buffer_target)),
        "investmentCapacity": allocation_dict["investment"]["amount"],
        "financialRiskLevel": risk_level,
        "predictedIncome": int(round(raw_pred)),
        "predictedIncomeStatus": pred_status,
        "isDataLimited": is_data_limited,
        "forecastExplanation": forecast_explanation,
        "financialHealthScore": health_score,
        "riskLevel": risk_level,
        "scoreReasons": score_reasons,
        "incomeBuffer": income_buffer_months,
        "recommendedBufferTarget": recommended_buffer_target,
        "savingsRate": savings_rate,
        "expenseRatio": expense_ratio,
        "debtToIncome": debt_to_income,
        "mlProfile": {
            "category": predicted_category,
            "confidence": confidence
        },
        "allocation": allocation_dict,
        "insights": insights,
        "wealthPlan": {
            "goal": goal_name,
            "goal_amount": int(goal_amount),
            "goal_months": goal_months,
            "projections": wealth_projections
        },
        "chartData": chart_data
    }

def run_cli():
    import argparse
    parser = argparse.ArgumentParser(description="Monthly Income Manager ML Inference")
    parser.add_argument("--test", action="store_true", help="Run test with user example")
    parser.add_argument("--stdin", action="store_true", help="Read JSON from stdin")
    parser.add_argument("--json", type=str, help="Input JSON string")

    args = parser.parse_args()

    if args.test:
        test_payload = {
            "monthly_income": [
                {"month": "January", "income": 5000, "essential_expenses": 6000, "other_expenses": 2000},
                {"month": "February", "income": 30000, "essential_expenses": 6000, "other_expenses": 2000},
                {"month": "March", "income": 5000, "essential_expenses": 6000, "other_expenses": 2000},
                {"month": "April", "income": 18000, "essential_expenses": 6000, "other_expenses": 2000},
                {"month": "May", "income": 7500, "essential_expenses": 6000, "other_expenses": 2000}
            ],
            "expenses": 8000,
            "savings": 20000,
            "investments": 5000,
            "loan_emi": 2000,
            "financial_goal": "Emergency Fund",
            "goal_amount": 60000,
            "goal_months": 12
        }
        res = analyze_income_data(test_payload)
        print("Test Successful!")
        print(f"ML Profile: {res['mlProfile']['category']} ({res['mlProfile']['confidence']}%)")
        print(f"Average Income: Rs. {res['averageIncome']:,}")
        print(f"Income Variability: {res['incomeVariability']}%")
        print(f"Income Buffer: {res['incomeBuffer']} months")
        print(f"Financial Health Score: {res['financialHealthScore']}/100 ({res['riskLevel']})")
        print(f"Next Month Estimate: Rs. {res['predictedIncome']:,} ({res['predictedIncomeStatus']})")
        print(f"Essential Allocation: {res['allocation']['essential_expenses']['percentage']}% (Rs. {res['allocation']['essential_expenses']['amount']:,})")
        print(f"Emergency Reserve: {res['allocation']['emergency_reserve']['percentage']}% (Rs. {res['allocation']['emergency_reserve']['amount']:,})")
        sys.exit(0)

    raw_input = ""
    if args.stdin:
        raw_input = sys.stdin.read()
    elif args.json:
        raw_input = args.json

    if not raw_input.strip():
        print(json.dumps({"error": "No input JSON provided."}))
        sys.exit(1)

    try:
        data = json.loads(raw_input)
        results = analyze_income_data(data)
        print(json.dumps(results, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    run_cli()
