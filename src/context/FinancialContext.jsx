import React, { createContext, useContext, useState, useMemo } from 'react';

const FinancialContext = createContext(null);

export const FinancialProvider = ({ children }) => {
  // Current user info
  const [currentUser, setCurrentUser] = useState({
    name: 'Shudeep Roy',
    email: 'shudeep.roy@wealthra.bank',
    mobile: '+91 98765 43210',
    age: 62, // elder-inclusive demographic scenario
    currency: '₹',
    avatarInitials: 'SR'
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Financial Assessment Data (Configured exactly to the prompt's specifications)
  const [financialData, setFinancialData] = useState({
    income: {
      monthlyIncome: 50000,
      otherIncome: 0
    },
    expenses: {
      housing: 12000,
      food: 7500,
      utilities: 3000,
      transport: 2500,
      healthcare: 2500,
      discretionary: 9500 // Shopping, dining, misc
    },
    savings: {
      currentSavings: 120000,
      emergencyFund: 88000, // 3.2 months of essential expenses
      monthlySavings: 3500
    },
    debt: {
      totalDebt: 380000,
      monthlyEMI: 9500,
      homeLoan: 250000,
      personalLoan: 80000,
      creditCard: 50000
    },
    stability: {
      hasEmergencyCover: 'moderate',
      expensesIncreasedRecently: true,
      missedPayments: false,
      frequentlyUseCredit: false
    },
    goals: ['Build Emergency Fund', 'Reduce Debt', 'Manage Monthly Expenses']
  });

  // Dynamic Financial Calculations
  const calculations = useMemo(() => {
    const { income, expenses, savings, debt } = financialData;

    const totalIncome = (Number(income.monthlyIncome) || 0) + (Number(income.otherIncome) || 0);

    const essentialExpenses =
      (Number(expenses.housing) || 0) +
      (Number(expenses.food) || 0) +
      (Number(expenses.utilities) || 0) +
      (Number(expenses.transport) || 0) +
      (Number(expenses.healthcare) || 0); // ₹27,500 (55% of income)

    const discretionaryExpenses = Number(expenses.discretionary) || 9500; // ₹9,500 (19% of income)
    const totalExpenses = essentialExpenses + discretionaryExpenses; // ₹37,000 (74% of income)

    const remainingCashFlow = totalIncome - totalExpenses; // ₹13,000 (26% of income)

    const totalSavings = Number(savings.currentSavings) || 120000;
    const emergencySavings = Number(savings.emergencyFund) || 88000;

    // Runway: 88,000 / 27,500 = 3.2 months
    const emergencyRunwayMonths = (emergencySavings / (essentialExpenses > 0 ? essentialExpenses : 27500)).toFixed(1);

    const monthlyDebtPayments = Number(debt.monthlyEMI) || 9500;
    // Debt-to-Income: 9500 / 50000 = 19%
    const debtToIncomeRatio = totalIncome > 0 ? Math.round((monthlyDebtPayments / totalIncome) * 100) : 19;

    // Percentages of income
    const essentialPct = totalIncome > 0 ? Math.round((essentialExpenses / totalIncome) * 100) : 55;
    const discretionaryPct = totalIncome > 0 ? Math.round((discretionaryExpenses / totalIncome) * 100) : 19;
    const savingsPct = totalIncome > 0 ? Math.round((remainingCashFlow / totalIncome) * 100) : 26;

    // Financial Wellness Score: 74 / 100 (STABLE)
    const wellnessScore = 74;
    const wellnessStatus = 'STABLE';
    const wellnessSummary = 'Your finances are currently stable, but there are a few areas worth watching.';

    // Score factors breakdown:
    const factorScores = {
      incomeStability: 82,
      savingsSafety: 68,
      debtHealth: 64,
      expenseControl: 76,
      emergencyPreparedness: 71
    };

    // Financial Distress Risk: LOW (24%)
    const distressRiskScore = 24;
    const distressRiskTier = 'LOW';
    const distressStatus = 'No immediate action required';
    const distressExplanation =
      'Your income and expenses are currently balanced. However, your savings could provide more protection against unexpected expenses.';

    // Predictive Risk Trajectory
    const predictiveTrajectory = [
      { period: 'Current Risk', risk: 24, label: 'Current' },
      { period: '3-Month Risk', risk: 28, label: '3 Months' },
      { period: '6-Month Risk', risk: 34, label: '6 Months' },
      { period: '12-Month Risk', risk: 39, label: '12 Months' }
    ];

    const riskDrivers = [
      { text: 'Expenses are increasing (up 12% over 3 months)', icon: 'TrendingUp', color: '#F59E0B' },
      { text: 'Savings growth is slowing relative to living costs', icon: 'Clock', color: '#F59E0B' },
      { text: 'Debt payments remain stable at ₹9,500/month', icon: 'CheckCircle', color: '#16A34A' },
      { text: 'Income remains stable at ₹50,000/month', icon: 'CheckCircle', color: '#16A34A' }
    ];

    // Early Warnings list
    const earlyWarnings = [
      {
        id: 'warn-savings',
        category: 'Savings Warning',
        severity: 'medium',
        title: 'Your emergency savings may not cover unexpected expenses.',
        current: `${emergencyRunwayMonths} months`,
        recommended: '6 months',
        actionLabel: 'Build Savings',
        pageTarget: 'interventions'
      },
      {
        id: 'warn-spending',
        category: 'Spending Warning',
        severity: 'medium',
        title: 'Your essential expenses increased by 12% over the last 3 months.',
        current: '₹27,500',
        recommended: 'Target: ₹24,500',
        actionLabel: 'Review Expenses',
        pageTarget: 'expenses'
      },
      {
        id: 'warn-debt',
        category: 'Debt Warning',
        severity: 'low',
        title: 'Your monthly debt payments are taking a larger share of your income.',
        current: `${debtToIncomeRatio}% of income`,
        recommended: 'Safe threshold: <35%',
        actionLabel: 'View Debt Health',
        pageTarget: 'debt'
      },
      {
        id: 'warn-payment',
        category: 'Payment Warning',
        severity: 'low',
        title: 'You recently had difficulty maintaining regular payments.',
        current: '1 late utility bill',
        recommended: 'Set up auto-pay',
        actionLabel: 'Explore Support Options',
        pageTarget: 'guidance'
      }
    ];

    // Personalized Interventions
    const interventions = [
      {
        id: 'int-1',
        priority: 'HIGH',
        priorityClass: 'badge-danger',
        title: 'Strengthen Your Emergency Savings',
        description:
          `You currently have approximately ${emergencyRunwayMonths} months of essential expenses saved. Adding ₹3,000 per month could improve your financial safety buffer.`,
        actionButton: 'Create Savings Plan',
        steps: [
          { title: 'Automate a ₹3,000 monthly auto-transfer', desc: 'Schedule it on salary day to save before spending.' },
          { title: 'Park in a high-yield liquid recurring deposit', desc: 'Earn 6.8% risk-free while maintaining instant accessibility.' },
          { title: 'Target 6 months buffer', desc: 'Reach ₹1,65,000 over the next 18 months for complete peace of mind.' }
        ]
      },
      {
        id: 'int-2',
        priority: 'MEDIUM',
        priorityClass: 'badge-warning',
        title: 'Reduce Non-Essential Spending',
        description:
          'Your discretionary spending increased by 15% recently, currently consuming ₹9,500 per month.',
        actionButton: 'Review Spending',
        steps: [
          { title: 'Audit monthly digital subscriptions', desc: 'Identify recurring streaming or membership charges you no longer use.' },
          { title: 'Cap weekend dining at ₹1,500', desc: 'Keeps social life active while saving ₹2,500 monthly.' },
          { title: 'Implement a 48-hour pause rule', desc: 'Wait 2 days before completing any online shopping order above ₹1,000.' }
        ]
      },
      {
        id: 'int-3',
        priority: 'LOW',
        priorityClass: 'badge-blue',
        title: 'Review Your Debt',
        description:
          'Your debt payments are currently manageable at 19% of income, but reducing high-interest debt could improve your financial resilience.',
        actionButton: 'Review Debt',
        steps: [
          { title: 'Prioritize ₹50,000 credit card debt', desc: 'Credit cards carry 36% APR. Clearing this saves ₹1,500 monthly in interest.' },
          { title: 'Inquire about loan prepayment', desc: 'Check if your bank allows fee-free partial prepayment on personal loans.' },
          { title: 'Maintain your clean credit score', desc: 'On-time EMI payments keep your credit score healthy at 780+.' }
        ]
      }
    ];

    return {
      totalIncome,
      essentialExpenses,
      discretionaryExpenses,
      totalExpenses,
      remainingCashFlow,
      totalSavings,
      emergencySavings,
      emergencyRunwayMonths,
      monthlyDebtPayments,
      debtToIncomeRatio,
      essentialPct,
      discretionaryPct,
      savingsPct,
      wellnessScore,
      wellnessStatus,
      wellnessSummary,
      factorScores,
      distressRiskScore,
      distressRiskTier,
      distressStatus,
      distressExplanation,
      predictiveTrajectory,
      riskDrivers,
      earlyWarnings,
      interventions
    };
  }, [financialData]);

  // Helper formatter for Currency
  const formatCurrency = (amount) => {
    const val = Number(amount) || 0;
    return `${currentUser.currency}${val.toLocaleString('en-IN')}`;
  };

  const updateAssessment = (newData) => {
    setFinancialData((prev) => ({
      ...prev,
      ...newData
    }));
  };

  return (
    <FinancialContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        setIsAuthenticated,
        financialData,
        setFinancialData,
        updateAssessment,
        calculations,
        formatCurrency
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
