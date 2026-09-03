// src/services/financialMLService.js
import modelWeights from './trainedModelWeights.json';

/**
 * Predicts financial distress risk score, risk tier, 12-month trajectory,
 * and wellness factors using calibrated multivariate risk weights.
 */
export function predictFinancialRisk(financialData, langCode = 'en') {
  const { income, expenses, savings, debt, stability, goals = [] } = financialData;

  // Basic Financial Aggregations
  const monthlyIncome = Number(income.monthlyIncome) || 0;
  const otherIncome = Number(income.otherIncome) || 0;
  const totalIncome = monthlyIncome + otherIncome;

  const housing = Number(expenses.housing) || 0;
  const food = Number(expenses.food) || 0;
  const utilities = Number(expenses.utilities) || 0;
  const transport = Number(expenses.transport) || 0;
  const healthcare = Number(expenses.healthcare) || 0;
  const essentialExpenses = housing + food + utilities + transport + healthcare;

  const discretionaryExpenses = Number(expenses.discretionary) || 0;
  const totalExpenses = essentialExpenses + discretionaryExpenses;

  const remainingCashFlow = totalIncome - totalExpenses;

  const totalSavings = Number(savings.currentSavings) || 0;
  const emergencySavings = Number(savings.emergencyFund) || 0;
  const monthlySavingsRate = Number(savings.monthlySavings) || 0;

  const monthlyDebtPayments = Number(debt.monthlyEMI) || 0;
  const totalDebt = Number(debt.totalDebt) || 0;

  // Key Ratios
  const essentialDivisor = essentialExpenses > 0 ? essentialExpenses : 1;
  const emergencyRunwayMonths = Number((emergencySavings / essentialDivisor).toFixed(1));

  const incomeDivisor = totalIncome > 0 ? totalIncome : 1;
  const debtToIncomeRatio = Math.round((monthlyDebtPayments / incomeDivisor) * 100);
  const expenseRatio = totalIncome > 0 ? totalExpenses / totalIncome : 1;
  const essentialPct = Math.round((essentialExpenses / incomeDivisor) * 100);
  const discretionaryPct = Math.round((discretionaryExpenses / incomeDivisor) * 100);
  const savingsPct = Math.round((remainingCashFlow / incomeDivisor) * 100);

  // Stability Booleans
  const missedPayments = Boolean(stability?.missedPayments);
  const frequentlyUseCredit = Boolean(stability?.frequentlyUseCredit);
  const expensesIncreased = Boolean(stability?.expensesIncreasedRecently);
  const emergencyCoverTier = stability?.hasEmergencyCover || 'moderate';

  const { weights } = modelWeights;

  // ==========================================
  // 1. ML Distress Risk Score Calculation (0-100%)
  // ==========================================
  let distressScore = weights.baseDistressRisk; // baseline ~6.0

  // (A) Debt-to-Income Component (0 to 38 pts)
  const dtiFraction = debtToIncomeRatio / 100;
  if (dtiFraction > weights.dtiDangerThreshold) {
    distressScore += weights.dtiWeight * Math.min(1.0, 0.7 + (dtiFraction - 0.45) * 1.5);
  } else if (dtiFraction > weights.dtiSafeThreshold) {
    const scale = (dtiFraction - weights.dtiSafeThreshold) / (weights.dtiDangerThreshold - weights.dtiSafeThreshold);
    distressScore += weights.dtiWeight * (0.2 + scale * 0.5);
  } else {
    distressScore += weights.dtiWeight * (dtiFraction / weights.dtiSafeThreshold) * 0.2;
  }

  // (B) Emergency Runway Component (0 to 32 pts)
  if (emergencyRunwayMonths < weights.runwayCriticalMonths) {
    distressScore += weights.runwayWeight;
  } else if (emergencyRunwayMonths < 3.0) {
    const scale = (3.0 - emergencyRunwayMonths) / 2.0;
    distressScore += weights.runwayWeight * (0.55 + scale * 0.45);
  } else if (emergencyRunwayMonths < weights.runwaySafeMonths) {
    const scale = (weights.runwaySafeMonths - emergencyRunwayMonths) / 3.0;
    distressScore += weights.runwayWeight * (0.15 + scale * 0.4);
  } else {
    // 6+ months runway buffer provides high resilience
    distressScore += Math.max(0, weights.runwayWeight * 0.05);
  }

  // (C) Expense Burden & Cash Flow Deficit (0 to 25 pts)
  if (expenseRatio > 1.0) {
    distressScore += weights.expenseBurdenWeight + Math.min(10, (expenseRatio - 1.0) * 20);
  } else if (expenseRatio > weights.expenseBurdenThreshold) {
    const scale = (expenseRatio - weights.expenseBurdenThreshold) / (1.0 - weights.expenseBurdenThreshold);
    distressScore += weights.expenseBurdenWeight * scale;
  } else {
    distressScore += weights.expenseBurdenWeight * (expenseRatio / weights.expenseBurdenThreshold) * 0.25;
  }

  // (D) Stability & Behavioral Penalties
  if (missedPayments) distressScore += weights.missedPaymentPenalty;
  if (frequentlyUseCredit) distressScore += weights.creditReliancePenalty;
  if (expensesIncreased) distressScore += weights.inflationCostDriftPenalty;

  if (emergencyCoverTier === 'none') distressScore += 6;
  if (emergencyCoverTier === 'strong') distressScore = Math.max(5, distressScore - 6);

  // Clamp distress score to 5% - 98%
  const distressRiskScore = Math.round(Math.min(98, Math.max(5, distressScore)));

  // Risk Tier Classification
  let distressRiskTier = 'LOW';
  if (distressRiskScore > 70) {
    distressRiskTier = 'CRITICAL';
  } else if (distressRiskScore > 50) {
    distressRiskTier = 'HIGH';
  } else if (distressRiskScore > 30) {
    distressRiskTier = 'MODERATE';
  }

  const statusDict = {
    LOW: {
      en: 'No immediate action required',
      hi: 'तत्काल कार्रवाई की आवश्यकता नहीं है',
      bn: 'তাত্ক্ষণিক পদক্ষেপের প্রয়োজন নেই',
      te: 'తక్షణ చర్య అవసరం లేదు',
      ta: 'உடனடி நடவடிக்கை தேவையில்லை'
    },
    MODERATE: {
      en: 'Precautionary monitoring recommended',
      hi: 'एहतियाती निगरानी की सिफारिश की जाती है',
      bn: 'সতর্কতামূলক পর্যবেক্ষণ বাঞ্ছনীয়',
      te: 'ముందుజాగ్రత్త పర్యవేక్షణ సిఫార్సు చేయబడింది',
      ta: 'முன்னெச்சரிக்கை கண்காணிப்பு பரிந்துரைக்கப்படுகிறது'
    },
    HIGH: {
      en: 'Action recommended to alleviate pressure',
      hi: 'दबाव कम करने के लिए कार्रवाई की सलाह दी जाती है',
      bn: 'চাপ কমাতে পদক্ষেপ নেওয়ার পরামর্শ দেওয়া হচ্ছে',
      te: 'ఒత్తిడిని తగ్గించడానికి చర్యలు తీసుకోవాలి',
      ta: 'அழுத்தத்தைக் குறைக்க நடவடிக்கை பரிந்துரைக்கப்படுகிறது'
    },
    CRITICAL: {
      en: 'Immediate intervention advised',
      hi: 'तत्काल सुरक्षात्मक हस्तक्षेप की सलाह दी जाती है',
      bn: 'জরুরী হস্তক্ষেপের পরামর্শ দেওয়া হচ্ছে',
      te: 'తక్షణ జోక్యం అవసరం',
      ta: 'உடனடி பாதுகாப்பு நடவடிக்கை தேவைப்படுகிறது'
    }
  };
  const distressStatus = statusDict[distressRiskTier]?.[langCode] || statusDict[distressRiskTier]?.['en'] || 'No immediate action required';

  // Explanation generator
  const explanationDict = {
    LOW: {
      en: `Your financial baseline is stable. Debt payments take ${debtToIncomeRatio}% of income and you hold ${emergencyRunwayMonths} months of basic living needs in reserve.`,
      hi: `आपकी वित्तीय स्थिति स्थिर है। ऋण किस्तें आय का ${debtToIncomeRatio}% लेती हैं और आपके पास ${emergencyRunwayMonths} महीने का आपातकालीन रिजर्व है।`,
      bn: `আপনার আর্থিক অবস্থা স্থিতিশীল। ঋণের কিস্তি আয়ের ${debtToIncomeRatio}% এবং আপনার কাছে ${emergencyRunwayMonths} মাসের জরুরী সঞ্চয় রয়েছে।`,
      te: `మీ ఆర్థిక పరిస్థితి స్థిరంగా ఉంది. రుణ వాయిదాలు ఆదాయంలో ${debtToIncomeRatio}% తీసుకుంటాయి మరియు ${emergencyRunwayMonths} నెలల నిధి ఉంది.`,
      ta: `உங்கள் நிதி நிலை சீராக உள்ளது. கடன் தவணைகள் வருமானத்தில் ${debtToIncomeRatio}% மற்றும் ${emergencyRunwayMonths} மாத அவசரகால இருப்பு உள்ளது.`
    },
    MODERATE: {
      en: `Your finances are manageable, but an emergency runway of ${emergencyRunwayMonths} months leaves less safety margin if unexpected expenses occur.`,
      hi: `आपकी वित्तीय स्थिति प्रबंधनीय है, लेकिन ${emergencyRunwayMonths} महीने का आपातकालीन रिजर्व अचानक खर्चों के लिए कम सुरक्षा मार्जिन छोड़ता है।`,
      bn: `আপনার অর্থব্যবস্থা পরিচালনাযোগ্য, তবে ${emergencyRunwayMonths} মাসের জরুরী রিজার্ভ অপ্রত্যাশিত ব্যয়ের ক্ষেত্রে সীমিত নিরাপত্তা প্রদান করে।`,
      te: `మీ ఆర్థిక నిర్వహణ బాగుంది, కానీ ${emergencyRunwayMonths} నెలల రక్షణ నిల్వ అనుకోని ఖర్చులకు తక్కువ భద్రతను ఇస్తుంది.`,
      ta: `உங்கள் நிதி மேலாண்மை சீரானது, ஆனால் ${emergencyRunwayMonths} மாத பாதுகாப்பு இருப்பு எதிர்பாராத செலவுகளுக்கு குறைந்த இடைவெளியை அளிக்கிறது.`
    },
    HIGH: {
      en: `Financial pressure is elevated. Debt and essential expenses consume ${essentialPct + debtToIncomeRatio}% of your income.`,
      hi: `वित्तीय दबाव बढ़ रहा है। आवश्यक खर्च और ऋण अदायगी आपकी अधिकांश आय (${essentialPct + debtToIncomeRatio}%) का उपभोग कर रहे हैं।`,
      bn: `আর্থিক চাপ বৃদ্ধি পাচ্ছে। দৈনন্দিন ব্যয় এবং ঋণের কিস্তি আয়ের সিংহভাগ (${essentialPct + debtToIncomeRatio}%) নিয়ে নিচ্ছে।`,
      te: `ఆర్థిక ఒత్తిడి పెరుగుతోంది. అప్పులు మరియు నిత్యావసరాలు మీ ఆదాయంలో అధిక భాగాన్ని (${essentialPct + debtToIncomeRatio}%) వినియోగిస్తున్నాయి.`,
      ta: `நிதி அழுத்தம் அதிகரித்துள்ளது. அத்தியாவசிய செலவுகள் மற்றும் கடன் தவணைகள் வருமானத்தின் பெரும்பகுதியை (${essentialPct + debtToIncomeRatio}%) எடுத்துக் கொள்கின்றன.`
    },
    CRITICAL: {
      en: `Critical financial distress risk detected. With ${emergencyRunwayMonths} months of emergency cover and heavy debt obligations, urgent budget restructuring is required.`,
      hi: `गंभीर वित्तीय संकट का जोखिम देखा गया है। ${emergencyRunwayMonths} महीने की आपातकालीन सुरक्षा और भारी ऋण देनदारियों के साथ, बजट पुनर्गठन आवश्यक है।`,
      bn: `মারাত্মক আর্থিক সঙ্কটের ঝুঁকি সনাক্ত হয়েছে। ${emergencyRunwayMonths} মাসের জরুরী সুরক্ষা এবং উচ্চ ঋণের কারণে দ্রুত বাজেট পুনর্গঠন প্রয়োজন।`,
      te: `తీవ్రమైన ఆర్థిక సంక్షోభ ప్రమాదం ఉంది. ${emergencyRunwayMonths} నెలల అత్యవసర రక్షణ మరియు అధిక రుణాల కారణంగా బడ్జెట్‌ను వెంటనే సర్దుబాటు చేయాలి.`,
      ta: `கடுமையான நிதி நெருக்கடி ஆபத்து கண்டறியப்பட்டுள்ளது. ${emergencyRunwayMonths} மாத அவசரகால இருப்புடன் அவசர பட்ஜெட் மறுசீரமைப்பு தேவைப்படுகிறது.`
    }
  };
  const distressExplanation = explanationDict[distressRiskTier]?.[langCode] || explanationDict[distressRiskTier]?.['en'];

  // ==========================================
  // 2. Predictive Risk Trajectory (Current, 3m, 6m, 12m)
  // ==========================================
  const driftRate = expensesIncreased ? 0.08 : 0.02;
  const cashFlowDrift = remainingCashFlow < 0 ? 0.12 : (remainingCashFlow < 3000 ? 0.04 : -0.03);
  const missedDrift = missedPayments ? 0.07 : 0;

  const m3Growth = 1 + (driftRate * 0.6) + (cashFlowDrift * 0.5) + missedDrift;
  const m6Growth = 1 + (driftRate * 1.2) + (cashFlowDrift * 1.1) + (missedDrift * 1.4);
  const m12Growth = 1 + (driftRate * 2.0) + (cashFlowDrift * 1.8) + (missedDrift * 2.0);

  const risk3m = Math.min(99, Math.max(5, Math.round(distressRiskScore * m3Growth)));
  const risk6m = Math.min(99, Math.max(5, Math.round(distressRiskScore * m6Growth)));
  const risk12m = Math.min(99, Math.max(5, Math.round(distressRiskScore * m12Growth)));

  const predictiveTrajectory = [
    { period: 'Current', risk: distressRiskScore, label: `Current: ${distressRiskScore}%` },
    { period: '3 Months', risk: risk3m, label: `3-Month: ${risk3m}%` },
    { period: '6 Months', risk: risk6m, label: `6-Month: ${risk6m}%` },
    { period: '12 Months', risk: risk12m, label: `12-Month: ${risk12m}%` }
  ];

  // Dynamic Risk Drivers
  const riskDrivers = [];
  if (expensesIncreased) {
    riskDrivers.push({
      text: `Essential expenses increased recently, absorbing more of your income`,
      icon: 'TrendingUp',
      color: '#F59E0B'
    });
  } else {
    riskDrivers.push({
      text: `Essential expenses are consistent, helping keep baseline spending stable`,
      icon: 'CheckCircle2',
      color: '#16A34A'
    });
  }

  if (emergencyRunwayMonths < 3.0) {
    riskDrivers.push({
      text: `Emergency reserves cover ${emergencyRunwayMonths} months (recommended: 6 months)`,
      icon: 'Clock',
      color: '#F59E0B'
    });
  } else {
    riskDrivers.push({
      text: `Emergency reserves are strong with ${emergencyRunwayMonths} months of coverage`,
      icon: 'CheckCircle2',
      color: '#16A34A'
    });
  }

  if (debtToIncomeRatio > 35 || missedPayments) {
    riskDrivers.push({
      text: missedPayments ? `Reported payment difficulties require debt restructuring` : `Debt obligations consume ${debtToIncomeRatio}% of income (safe zone: <35%)`,
      icon: 'AlertTriangle',
      color: '#EF4444'
    });
  } else {
    riskDrivers.push({
      text: `Debt payments remain stable at ₹${monthlyDebtPayments.toLocaleString('en-IN')}/month (${debtToIncomeRatio}%)`,
      icon: 'CheckCircle2',
      color: '#16A34A'
    });
  }

  if (totalIncome >= totalExpenses) {
    riskDrivers.push({
      text: `Positive monthly cash flow of ₹${remainingCashFlow.toLocaleString('en-IN')} supports savings`,
      icon: 'CheckCircle2',
      color: '#16A34A'
    });
  } else {
    riskDrivers.push({
      text: `Monthly deficit of ₹${Math.abs(remainingCashFlow).toLocaleString('en-IN')} requires immediate budget trimming`,
      icon: 'TrendingUp',
      color: '#EF4444'
    });
  }

  // ==========================================
  // 3. Financial Wellness Score & Factor Breakdown
  // ==========================================
  const incomeStability = Math.round(Math.min(100, Math.max(20, totalIncome > 40000 ? 85 : 55 + (totalIncome / 2000))));
  const savingsSafety = Math.round(Math.min(100, Math.max(10, emergencyRunwayMonths >= 6 ? 90 : emergencyRunwayMonths * 15)));
  const debtHealth = Math.round(Math.min(100, Math.max(15, missedPayments ? 35 : (debtToIncomeRatio < 20 ? 88 : Math.max(20, 100 - debtToIncomeRatio * 1.5)))));
  const expenseControl = Math.round(Math.min(100, Math.max(20, (1 - Math.min(1, expenseRatio)) * 60 + (expensesIncreased ? 20 : 38))));
  const emergencyPreparedness = Math.round(Math.min(100, Math.max(15, (emergencyRunwayMonths / 6) * 70 + (frequentlyUseCredit ? 5 : 25))));

  const factorScores = {
    incomeStability,
    savingsSafety,
    debtHealth,
    expenseControl,
    emergencyPreparedness
  };

  const wellnessScore = Math.round(
    factorScores.incomeStability * 0.20 +
    factorScores.savingsSafety * 0.25 +
    factorScores.debtHealth * 0.25 +
    factorScores.expenseControl * 0.15 +
    factorScores.emergencyPreparedness * 0.15
  );

  let rawWellnessStatus = 'STABLE';
  if (wellnessScore >= 80) rawWellnessStatus = 'EXCELLENT';
  else if (wellnessScore >= 65) rawWellnessStatus = 'STABLE';
  else if (wellnessScore >= 50) rawWellnessStatus = 'WORTH WATCHING';
  else rawWellnessStatus = 'VULNERABLE';

  const wellnessStatusMap = {
    EXCELLENT: { en: 'EXCELLENT', hi: 'उत्कृष्ट', bn: 'চমৎকার', te: 'అద్భుతం', ta: 'மிகச் சிறந்தது' },
    STABLE: { en: 'STABLE', hi: 'स्थिर', bn: 'স্থিতিশীল', te: 'స్థిరమైనది', ta: 'நிலையானது' },
    'WORTH WATCHING': { en: 'WORTH WATCHING', hi: 'निगरानी योग्य', bn: 'পর্যবেক্ষণযোগ্য', te: 'గమనించదగినది', ta: 'கவனிக்கத்தக்கது' },
    VULNERABLE: { en: 'VULNERABLE', hi: 'संवेदनशील', bn: 'সংবেদনশীল', te: 'ఆందోళనకరం', ta: 'பாதிக்கப்படக்கூடியது' }
  };
  const wellnessStatus = wellnessStatusMap[rawWellnessStatus]?.[langCode] || rawWellnessStatus;

  const wellnessSummaryMap = {
    vulnerable: {
      en: 'Your finances are facing pressure across savings and debt service. Action is recommended.',
      hi: 'आपकी बचत और ऋण अदायगी पर दबाव बढ़ रहा है। सुरक्षात्मक कदम उठाना आवश्यक है।',
      bn: 'সঞ্চয় ও ঋণ পরিশোধে চাপ তৈরি হচ্ছে। অবিলম্বে পদক্ষেপ নেওয়া প্রয়োজন।',
      te: 'మీ పొదుపు మరియు రుణ చెల్లింపులపై ఒత్తిడి పెరుగుతోంది. తగిన చర్యలు తీసుకోవాలి.',
      ta: 'சேமிப்பு மற்றும் கடன் திருப்பிச் செலுத்துவதில் அழுத்தம் ஏற்படுகிறது. நடவடிக்கை தேவை.'
    },
    watching: {
      en: 'Your finances are functional, but building a thicker emergency reserve will prevent stress.',
      hi: 'आपकी वित्तीय स्थिति कार्यशील है, परंतु आपातकालीन बचत बढ़ाने से तनाव से बचाव होगा।',
      bn: 'আপনার আর্থিক অবস্থা সক্রিয়, তবে অতিরিক্ত জরুরী সঞ্চয় গড়ে তুললে চাপ এড়ানো যাবে।',
      te: 'మీ ఆర్థిక పరిస్థితి సాధారణంగా ఉంది, కానీ అత్యవసర నిధిని పెంచడం భద్రతనిస్తుంది.',
      ta: 'உங்கள் நிதி நிலை சாதாரணமாக உள்ளது, ஆனால் அவசரகால சேமிப்பை உயர்த்துவது பாதுகாப்பானது.'
    },
    stable: {
      en: 'Your finances are currently stable, with healthy baseline fundamentals.',
      hi: 'आपकी वित्तीय स्थिति वर्तमान में स्थिर है और बुनियादी आधार मजबूत हैं।',
      bn: 'আপনার আর্থিক অবস্থা বর্তমানে স্থিতিশীল এবং মৌলিক ভিত্তি স্বাস্থ্যকর।',
      te: 'మీ ఆర్థిక పరిస్థితి ప్రస్తుతం స్థిరంగా ఉంది మరియు ప్రాథమిక అంశాలు బలంగా ఉన్నాయి.',
      ta: 'உங்கள் நிதி நிலை தற்போது நிலையாக உள்ளது, அடிப்படை நிதி ஆரோக்கியமாக உள்ளது.'
    },
    excellent: {
      en: 'Exceptional financial resilience across debt, spending discipline, and emergency coverage.',
      hi: 'ऋण, खर्च अनुशासन और आपातकालीन सुरक्षा में असाधारण वित्तीय लचीलापन।',
      bn: 'ঋণ নিয়ন্ত্রণ, সুশৃঙ্খল ব্যয় এবং জরুরী সুরক্ষায় দুর্দান্ত সক্ষমতা।',
      te: 'రుణ నియంత్రణ, ఖర్చు క్రమశిక్షణ మరియు అత్యవసర రక్షణలో అద్భుతమైన సామర్థ్యం.',
      ta: 'கடன் கட்டுப்பாடு, செலவு ஒழுக்கம் மற்றும் அவசரகால பாதுகாப்பில் சிறப்பான நிலை.'
    }
  };
  let summaryTier = 'stable';
  if (wellnessScore < 50) summaryTier = 'vulnerable';
  else if (wellnessScore < 65) summaryTier = 'watching';
  else if (wellnessScore >= 80) summaryTier = 'excellent';
  const wellnessSummary = wellnessSummaryMap[summaryTier]?.[langCode] || wellnessSummaryMap[summaryTier]?.['en'];

  // ==========================================
  // 4. Dynamic Early Warnings
  // ==========================================
  const earlyWarnings = [];
  if (emergencyRunwayMonths < 6.0) {
    earlyWarnings.push({
      id: 'warn-savings',
      category: 'Savings Warning',
      severity: emergencyRunwayMonths < 2.0 ? 'high' : 'medium',
      title: 'Your emergency savings buffer is below the recommended safety horizon.',
      current: `${emergencyRunwayMonths} months`,
      recommended: '6 months',
      actionLabel: 'Build Savings',
      pageTarget: 'interventions'
    });
  }

  if (expensesIncreased || expenseRatio > 0.75) {
    earlyWarnings.push({
      id: 'warn-spending',
      category: 'Spending Warning',
      severity: expenseRatio > 0.9 ? 'high' : 'medium',
      title: expensesIncreased ? 'Your essential expenses increased recently.' : 'Living expenses take a high share of incoming cash.',
      current: `₹${essentialExpenses.toLocaleString('en-IN')}`,
      recommended: `Target: ₹${Math.round(totalIncome * 0.5).toLocaleString('en-IN')}`,
      actionLabel: 'Review Expenses',
      pageTarget: 'expenses'
    });
  }

  if (debtToIncomeRatio > 25 || missedPayments) {
    earlyWarnings.push({
      id: 'warn-debt',
      category: 'Debt Warning',
      severity: debtToIncomeRatio > 40 || missedPayments ? 'high' : 'low',
      title: 'Your monthly debt obligations require careful monitoring.',
      current: `${debtToIncomeRatio}% of income`,
      recommended: 'Safe threshold: <35%',
      actionLabel: 'View Debt Health',
      pageTarget: 'debt'
    });
  }

  if (frequentlyUseCredit || missedPayments) {
    earlyWarnings.push({
      id: 'warn-payment',
      category: 'Payment Warning',
      severity: missedPayments ? 'high' : 'medium',
      title: missedPayments ? 'You recently had difficulty maintaining regular payments.' : 'Frequent credit card reliance detected for routine spending.',
      current: missedPayments ? 'Payment delay recorded' : 'Routine credit usage',
      recommended: 'Automate essential bills',
      actionLabel: 'Explore Support Options',
      pageTarget: 'guidance'
    });
  }

  // Ensure at least one positive notice if no warnings
  if (earlyWarnings.length === 0) {
    earlyWarnings.push({
      id: 'warn-good',
      category: 'Health Notice',
      severity: 'low',
      title: 'All core indicators are in healthy corridors.',
      current: 'No warning flags',
      recommended: 'Maintain routine',
      actionLabel: 'View Interventions',
      pageTarget: 'interventions'
    });
  }

  // ==========================================
  // 5. Dynamic Interventions
  // ==========================================
  const interventions = [];
  if (emergencyRunwayMonths < 6.0) {
    const monthlyTarget = Math.max(1000, Math.round(remainingCashFlow > 0 ? remainingCashFlow * 0.4 : 2000));
    interventions.push({
      id: 'int-1',
      priority: emergencyRunwayMonths < 2.0 ? 'HIGH' : 'MEDIUM',
      priorityClass: emergencyRunwayMonths < 2.0 ? 'badge-danger' : 'badge-warning',
      title: 'Strengthen Your Emergency Savings',
      description: `You currently have approximately ${emergencyRunwayMonths} months of essential expenses saved. Setting aside ₹${monthlyTarget.toLocaleString('en-IN')} per month builds resilience.`,
      actionButton: 'Create Savings Plan',
      steps: [
        { title: `Automate a ₹${monthlyTarget.toLocaleString('en-IN')} monthly transfer`, desc: 'Schedule it directly after payday to save before spending.' },
        { title: 'Park in a high-yield liquid recurring deposit', desc: 'Earn 6.8%+ risk-free return while keeping instant accessibility.' },
        { title: 'Target 6 months buffer', desc: `Reach ₹${Math.round(essentialExpenses * 6).toLocaleString('en-IN')} for complete peace of mind.` }
      ]
    });
  }

  if (discretionaryExpenses > 0) {
    const trimmingAmount = Math.round(discretionaryExpenses * 0.25);
    interventions.push({
      id: 'int-2',
      priority: expenseRatio > 0.85 ? 'HIGH' : 'MEDIUM',
      priorityClass: expenseRatio > 0.85 ? 'badge-danger' : 'badge-warning',
      title: 'Trim Discretionary Spending',
      description: `Discretionary expenses currently consume ₹${discretionaryExpenses.toLocaleString('en-IN')}/month. Trimming ₹${trimmingAmount.toLocaleString('en-IN')} immediately frees up cash.`,
      actionButton: 'Review Spending',
      steps: [
        { title: 'Audit recurring digital subscriptions', desc: 'Identify monthly streaming or gym services you rarely use.' },
        { title: 'Implement a 48-hour pause rule', desc: 'Wait 2 days before completing non-essential purchases above ₹1,000.' },
        { title: 'Cap weekend dining and delivery', desc: 'Saves ₹2,000 - ₹3,000 monthly without disrupting lifestyle.' }
      ]
    });
  }

  if (totalDebt > 0) {
    interventions.push({
      id: 'int-3',
      priority: debtToIncomeRatio > 35 ? 'HIGH' : 'LOW',
      priorityClass: debtToIncomeRatio > 35 ? 'badge-danger' : 'badge-blue',
      title: 'Accelerate High-Interest Debt Paydown',
      description: `Your debt payments are ${debtToIncomeRatio}% of income. Prioritizing highest-interest balances reduces long-term interest cost.`,
      actionButton: 'Review Debt',
      steps: [
        { title: 'Target highest-interest credit card balance first', desc: 'Credit cards carry 36%+ APR; clearing revolving balances yields immediate savings.' },
        { title: 'Inquire about loan prepayment options', desc: 'Check if your bank allows fee-free partial prepayment on personal loans.' },
        { title: 'Protect your credit score', desc: 'Consistently on-time EMI payments preserve a healthy 750+ credit rating.' }
      ]
    });
  }

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
}
