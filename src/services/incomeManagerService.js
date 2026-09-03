// src/services/incomeManagerService.js
/**
 * Monthly Income Manager & Smoothing ML Analysis Engine.
 * Analyzes irregular income streams, volatility (CV), essential expense ratios,
 * emergency buffers, and generates personalized cash flow allocation guidelines.
 */

export const DEFAULT_INCOME_PRESETS = [
  {
    id: 'preset-freelancer',
    title: 'Irregular Freelancer / Consultant',
    description: 'High variation with boom months and lean periods.',
    savings: 20000,
    investments: 5000,
    loan_emi: 2000,
    goal: 'Emergency Fund',
    goalAmount: 60000,
    goalMonths: 12,
    monthly_income: [
      { month: 'January', income: 5000, essential_expenses: 6000, other_expenses: 2000 },
      { month: 'February', income: 30000, essential_expenses: 6000, other_expenses: 2000 },
      { month: 'March', income: 5000, essential_expenses: 6000, other_expenses: 2000 },
      { month: 'April', income: 18000, essential_expenses: 6000, other_expenses: 2000 },
      { month: 'May', income: 7500, essential_expenses: 6000, other_expenses: 2000 }
    ]
  },
  {
    id: 'preset-seasonal',
    title: 'Seasonal Business / Retail Trader',
    description: 'Surge income during festival seasons, minimal during monsoon.',
    savings: 35000,
    investments: 12000,
    loan_emi: 4500,
    goal: 'Working Capital Buffer',
    goalAmount: 100000,
    goalMonths: 10,
    monthly_income: [
      { month: 'January', income: 12000, essential_expenses: 9000, other_expenses: 3000 },
      { month: 'February', income: 14000, essential_expenses: 9000, other_expenses: 3000 },
      { month: 'March', income: 42000, essential_expenses: 10000, other_expenses: 4000 },
      { month: 'April', income: 8000, essential_expenses: 8500, other_expenses: 2500 },
      { month: 'May', income: 9500, essential_expenses: 8500, other_expenses: 2500 }
    ]
  },
  {
    id: 'preset-gig',
    title: 'Gig Worker / Delivery Partner',
    description: 'Weekly payouts with seasonal surges and fuel fluctuations.',
    savings: 8000,
    investments: 0,
    loan_emi: 1500,
    goal: 'Rainy Day Reserve',
    goalAmount: 30000,
    goalMonths: 6,
    monthly_income: [
      { month: 'January', income: 16000, essential_expenses: 11000, other_expenses: 2000 },
      { month: 'February', income: 19500, essential_expenses: 11500, other_expenses: 2500 },
      { month: 'March', income: 14000, essential_expenses: 11000, other_expenses: 2000 },
      { month: 'April', income: 22000, essential_expenses: 12000, other_expenses: 3000 },
      { month: 'May', income: 15500, essential_expenses: 11000, other_expenses: 2000 }
    ]
  }
];

export function analyzeIncomeDataLocally(data) {
  const rawMonths = data.monthly_income || [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const records = rawMonths.map((m, idx) => {
    if (typeof m === 'number') {
      return {
        month: monthNames[idx % 12],
        income: Number(m),
        essential_expenses: Number(data.expenses || 8000) * 0.75,
        other_expenses: Number(data.expenses || 8000) * 0.25
      };
    }
    return {
      month: m.month || monthNames[idx % 12],
      income: Number(m.income || 0),
      essential_expenses: Number(m.essential_expenses || 0),
      other_expenses: Number(m.other_expenses || 0)
    };
  });

  const incomes = records.map(r => r.income);
  const n = Math.max(1, incomes.length);
  const avgInc = Math.round(incomes.reduce((a, b) => a + b, 0) / n);
  const highestInc = Math.max(...incomes, 0);
  const lowestInc = Math.min(...incomes, 0);
  
  const variance = incomes.reduce((a, b) => a + Math.pow(b - avgInc, 2), 0) / n;
  const std = Math.sqrt(variance);
  const cv = Math.round((std / (avgInc + 1e-5)) * 1000) / 10;

  const avgEss = Math.round(records.reduce((a, b) => a + b.essential_expenses, 0) / n);
  const avgOth = Math.round(records.reduce((a, b) => a + b.other_expenses, 0) / n);
  const avgExp = avgEss + avgOth;

  const savings = Number(data.savings || 0);
  const emi = Number(data.loan_emi || 0);
  const runway = Math.round((savings / (avgEss + 1e-5)) * 10) / 10;
  const savingsRate = Math.round(Math.max(0, (avgInc - avgExp - emi) / (avgInc + 1e-5)) * 1000) / 10;
  const expRatio = Math.round((avgExp / (avgInc + 1e-5)) * 1000) / 10;
  const dti = Math.round((emi / (avgInc + 1e-5)) * 1000) / 10;

  let profileCat = "Stable Income";
  if ((avgExp + emi) > avgInc || runway < 1 || dti > 40) {
    profileCat = "Financial Risk";
  } else if (cv > 45 || (lowestInc > 0 && highestInc / lowestInc >= 3.5)) {
    profileCat = "Highly Variable Income";
  } else if (cv > 22) {
    profileCat = "Moderately Variable Income";
  }

  let healthScore = 55;
  const reasons = [];
  if (cv < 20) {
    healthScore += 15;
    reasons.push("Low month-to-month income variance promotes stable budgeting.");
  } else if (cv > 45) {
    healthScore -= 15;
    reasons.push(`High income volatility (${cv}% variability). Requires deliberate buffer management during surplus months.`);
  } else {
    reasons.push(`Moderate income variability (${cv}% variability).`);
  }

  if (runway >= 6) {
    healthScore += 15;
    reasons.push(`Solid emergency runway (${runway} months of essential needs covered).`);
  } else if (runway < 2) {
    healthScore -= 15;
    reasons.push(`Fragile savings buffer (${runway} months). Needs immediate emergency fund attention.`);
  } else {
    reasons.push(`Fair safety buffer with ${runway} months of expenses covered.`);
  }

  if (dti > 30) {
    healthScore -= 12;
    reasons.push(`High fixed debt burden (${dti}% Debt-to-Income).`);
  } else {
    reasons.push(`Manageable debt obligations (${dti}% DTI).`);
  }

  healthScore = Math.max(15, Math.min(96, healthScore));
  const riskLevel = healthScore >= 80 ? "Strong" : healthScore >= 68 ? "Healthy" : healthScore >= 45 ? "Needs Improvement" : "High Risk";
  const refIncome = incomes[incomes.length - 1] || avgInc;

  const essentialPct = Math.min(50, Math.round((avgEss / (refIncome + 1e-5)) * 100));
  const emergencyPct = cv > 40 ? 25 : 15;
  const savingsPct = 15;
  const investPct = runway >= 3 ? 10 : 5;
  const flexPct = Math.max(5, 100 - (essentialPct + emergencyPct + savingsPct + investPct));

  // Goal calculation
  const goalAmount = Number(data.goalAmount || 60000);
  const goalMonths = Number(data.goalMonths || 12);
  const monthlyGoalTarget = Math.round(goalAmount / Math.max(1, goalMonths));
  const monthlySurplus = Math.max(0, avgInc - avgExp - emi);
  const goalFeasibility = monthlySurplus >= monthlyGoalTarget ? 'Easily Feasible' : (monthlySurplus >= monthlyGoalTarget * 0.6 ? 'Moderate Effort' : 'Requires Expense Adjustment');

  return {
    averageIncome: avgInc,
    highestIncome,
    lowestIncome,
    stdDeviation: Math.round(std),
    coefficientOfVariation: cv,
    incomeVariabilityPct: cv,
    averageEssentialExpenses: avgEss,
    averageOtherExpenses: avgOth,
    averageTotalExpenses: avgExp,
    currentSavings: savings,
    currentInvestments: Number(data.investments || 0),
    monthlyLoanEmi: emi,
    emergencyRunwayMonths: runway,
    expenseRatio,
    savingsRate,
    debtToIncomeRatio: dti,
    profileCategory: profileCat,
    healthScore,
    riskLevel,
    reasons,
    recommendedBudgetSplit: {
      essential_needs_pct: essentialPct,
      emergency_buffer_pct: emergencyPct,
      savings_pct: savingsPct,
      investment_pct: investPct,
      flexible_discretionary_pct: flexPct
    },
    goalAnalysis: {
      goalName: data.financialGoal || 'Emergency Fund',
      targetAmount: goalAmount,
      targetMonths: goalMonths,
      monthlyTarget: monthlyGoalTarget,
      monthlySurplus,
      feasibility: goalFeasibility
    },
    actionableAdvice: [
      cv > 35
        ? `During peak months like ${records.find(r => r.income === highestInc)?.month || 'peak'}, automatically transfer ₹${Math.round((highestInc - avgInc) * 0.7).toLocaleString('en-IN')} into a separate holding buffer.`
        : 'Keep maintaining consistent monthly savings deposits into high-yield accounts.',
      runway < 3
        ? `Build your emergency buffer to ₹${Math.round(avgEss * 3).toLocaleString('en-IN')} (3 months of essential needs) before increasing discretionary expenses.`
        : `Your ${runway} months of emergency runway provides adequate safety. You can deploy extra cash to long-term goals.`,
      dti > 25
        ? 'Avoid taking on new EMI obligations until your variable income stabilizes or debt falls below 20% DTI.'
        : 'Your debt level is well managed and not creating structural cash flow distress.'
    ],
    records
  };
}

export async function analyzeIncomeData(data) {
  try {
    const res = await fetch('/api/income/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Network/server offline -> use local mathematical ML analyzer
  }
  return analyzeIncomeDataLocally(data);
}
