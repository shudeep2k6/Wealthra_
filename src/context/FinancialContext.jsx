import React, { createContext, useContext, useState, useMemo } from 'react';
import { predictFinancialRisk } from '../services/financialMLService';
import { useLanguage } from './LanguageContext';

const FinancialContext = createContext(null);

export const FinancialProvider = ({ children }) => {
  const { currentLanguage } = useLanguage();
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

  // Dynamic Financial Calculations powered by trained ML distress and trajectory model
  const calculations = useMemo(() => {
    return predictFinancialRisk(financialData, currentLanguage);
  }, [financialData, currentLanguage]);



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
