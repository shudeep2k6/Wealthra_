"""
Monthly Income Manager - Synthetic Dataset Generator
Generates over 1,500 realistic financial records across diverse worker profiles,
capturing stable, moderate, volatile, and distressed income patterns.
"""

import os
import csv
import random
import numpy as np

PROFILES = [
    {"name": "Small business owner", "base_income": 35000, "volatility": 0.45, "fixed_cost": 18000},
    {"name": "Freelancer", "base_income": 40000, "volatility": 0.55, "fixed_cost": 16000},
    {"name": "Shop owner", "base_income": 28000, "volatility": 0.35, "fixed_cost": 15000},
    {"name": "Daily wage worker", "base_income": 12000, "volatility": 0.50, "fixed_cost": 9000},
    {"name": "Online seller", "base_income": 45000, "volatility": 0.48, "fixed_cost": 22000},
    {"name": "Gig worker", "base_income": 18000, "volatility": 0.40, "fixed_cost": 12000},
    {"name": "Consultant", "base_income": 65000, "volatility": 0.30, "fixed_cost": 25000},
    {"name": "Commission-based worker", "base_income": 30000, "volatility": 0.60, "fixed_cost": 14000},
    {"name": "Seasonal business owner", "base_income": 50000, "volatility": 0.70, "fixed_cost": 20000},
    {"name": "Self-employed person", "base_income": 32000, "volatility": 0.38, "fixed_cost": 16000}
]

FINANCIAL_GOALS = [
    "Emergency Fund",
    "Debt Repayment",
    "Working Capital Buffer",
    "Business Expansion",
    "Retirement Reserve",
    "Home Downpayment",
    "Child Education"
]

def generate_record(profile):
    # Simulating 6 months of historical income
    base = profile["base_income"] * random.uniform(0.6, 1.8)
    volatility = profile["volatility"] * random.uniform(0.6, 1.4)

    # Some profiles have extreme spikes or troughs
    incomes = []
    for m in range(6):
        shock = np.random.normal(1.0, volatility)
        monthly_inc = max(2000, int(base * max(0.15, shock)))
        incomes.append(monthly_inc)

    mean_income = float(np.mean(incomes))
    std_income = float(np.std(incomes))
    cv_variability = round((std_income / (mean_income + 1e-5)) * 100.0, 2)

    # Expenses based on profile baseline + living essentials
    essential_expenses = int(profile["fixed_cost"] * random.uniform(0.8, 1.3))
    discretionary_expenses = int(essential_expenses * random.uniform(0.15, 0.55))
    total_expenses = essential_expenses + discretionary_expenses

    # Existing savings & debt
    runway_factor = random.choice([0.5, 1.0, 2.0, 3.5, 6.0, 9.0])
    existing_savings = int(total_expenses * runway_factor * random.uniform(0.8, 1.2))

    has_emi = random.choice([True, True, False])
    loan_emi = int(mean_income * random.uniform(0.08, 0.40)) if has_emi else 0

    savings_rate = round(max(0.0, (mean_income - total_expenses - loan_emi) / (mean_income + 1e-5)) * 100.0, 1)
    expense_ratio = round((total_expenses / (mean_income + 1e-5)) * 100.0, 1)
    debt_to_income = round((loan_emi / (mean_income + 1e-5)) * 100.0, 1)
    runway_months = round(existing_savings / (essential_expenses + 1e-5), 1)

    # Financial Goal
    goal = random.choice(FINANCIAL_GOALS)
    goal_amount = random.choice([30000, 50000, 75000, 100000, 150000, 250000, 500000])
    goal_months = random.choice([6, 12, 18, 24, 36])

    # Rule logic to assign realistic ground truth label
    # Categories: 'Stable Income', 'Moderately Variable Income', 'Highly Variable Income', 'Financial Risk'
    if (total_expenses + loan_emi) > mean_income or runway_months < 1.0 or debt_to_income > 45:
        category = "Financial Risk"
        risk_level = "High"
    elif cv_variability > 50.0 or (max(incomes) / (min(incomes) + 1.0) >= 3.5):
        category = "Highly Variable Income"
        risk_level = "Medium" if runway_months >= 3.0 else "High"
    elif cv_variability > 22.0:
        category = "Moderately Variable Income"
        risk_level = "Low" if runway_months >= 3.0 else "Medium"
    else:
        category = "Stable Income"
        risk_level = "Low" if runway_months >= 2.0 else "Medium"

    return {
        "profile_type": profile["name"],
        "income": round(mean_income, 0),
        "expenses": total_expenses,
        "savings": existing_savings,
        "loan_emi": loan_emi,
        "income_variability": cv_variability,
        "savings_rate": savings_rate,
        "expense_ratio": expense_ratio,
        "debt_to_income": debt_to_income,
        "runway_months": runway_months,
        "financial_goal": goal,
        "goal_amount": goal_amount,
        "goal_months": goal_months,
        "risk_level": risk_level,
        "recommendation_category": category
    }

def generate_dataset(output_path="ml/income_manager/income_manager_dataset.csv", target_records=1800):
    rows = []
    per_profile = target_records // len(PROFILES) + 20

    for profile in PROFILES:
        for _ in range(per_profile):
            record = generate_record(profile)
            rows.append(record)

    random.seed(42)
    np.random.seed(42)
    random.shuffle(rows)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fields = list(rows[0].keys())

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} income management records into '{output_path}'.")
    return len(rows)

if __name__ == "__main__":
    count = generate_dataset()
    print(f"Dataset generation complete. Total records: {count}")
