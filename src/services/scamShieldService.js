// src/services/scamShieldService.js
/**
 * ScamShield AI & Digital Fraud Prevention Service
 * Evaluates messages, SMS, emails, and payment claims for phishing, OTP traps,
 * fake bank impersonation, malicious APKs, lottery claims, and KYC extortion.
 */

const SCAM_PATTERNS = [
  {
    id: 'otp_pin_cvv',
    name: 'Sensitive Credential Extortion',
    weight: 45,
    regex: /\b(otp|one time password|pin|cvv|password|passcode|secret code|atm pin)\b/i,
    explanation: 'Requests your private OTP, PIN, or banking passwords. Legitimate banks will never ask for this.'
  },
  {
    id: 'account_blocked_urgency',
    name: 'False Urgency / Account Block Threat',
    weight: 35,
    regex: /\b(blocked|suspended|deactivated|closed immediately|within 24 hours|action required today|last warning|urgent)\b/i,
    explanation: 'Uses fear and urgency to coerce immediate rash action without verification.'
  },
  {
    id: 'kyc_pan_update',
    name: 'Fake KYC / PAN Updation Scam',
    weight: 40,
    regex: /\b(kyc expired|update pan|pan card link|aadhaar link|verify documents|re-kyc|biometric update)\b/i,
    explanation: 'Falsely claims your account or SIM card requires urgent document updation via an unofficial link.'
  },
  {
    id: 'electricity_bill',
    name: 'Electricity / Utility Disconnection Trap',
    weight: 40,
    regex: /\b(electricity will be disconnected|power cut|unpaid electric bill|tonight at 9:30|contact officer)\b/i,
    explanation: 'Classic utility bill scam threatening immediate electricity termination to force money transfer.'
  },
  {
    id: 'lottery_reward_cashback',
    name: 'Lottery / Unexpected Reward / Cashback Bait',
    weight: 35,
    regex: /\b(won a prize|lucky draw|won lottery|cashback credited|claim reward|receive rs|free money|gift voucher)\b/i,
    explanation: 'Baiting with fake cash rewards or prizes to deceive you into approving debit transactions.'
  },
  {
    id: 'apk_remote_access',
    name: 'Malicious App / APK / Remote Access',
    weight: 45,
    regex: /\b(\.apk|download app|anydesk|teamviewer|rustdesk|quicksupport|screen share|install this file)\b/i,
    explanation: 'Urges downloading an unknown APK file or screen-sharing app to hijack your mobile device and bank accounts.'
  },
  {
    id: 'suspicious_link',
    name: 'Unofficial / Shortened Link',
    weight: 30,
    regex: /(bit\.ly|tinyurl|t\.co|wa\.me|goo\.gl|ngrok|is\.gd|cutt\.ly|surveymonkey|appspot|000webhost|\b[a-z0-9-]+\.(xyz|top|online|vip|pw|ru|cc|club|live|info)\b)/i,
    explanation: 'Contains a shortened or suspicious domain masking an untrusted phishing server.'
  }
];

export function analyzeScamMessage(text) {
  if (!text || !text.trim()) {
    return null;
  }

  const cleanText = text.trim();
  const matchedIndicators = [];
  let riskScore = 10;

  for (const pat of SCAM_PATTERNS) {
    if (pat.regex.test(cleanText)) {
      matchedIndicators.push({
        id: pat.id,
        name: pat.name,
        explanation: pat.explanation,
        weight: pat.weight
      });
      riskScore += pat.weight;
    }
  }

  riskScore = Math.min(99, Math.max(8, riskScore));

  let riskTier = 'LOW';
  let severityClass = 'badge-positive';
  let riskSummary = 'This message does not exhibit blatant scam patterns, but always verify unfamiliar senders independently.';

  if (riskScore >= 75) {
    riskTier = 'CRITICAL';
    severityClass = 'badge-danger';
    riskSummary = 'High probability fraud / phishing scam detected! Do not click links, do not reply, and never disclose OTPs or passwords.';
  } else if (riskScore >= 50) {
    riskTier = 'HIGH';
    severityClass = 'badge-warning';
    riskSummary = 'Multiple suspicious red flags detected. Highly likely to be an impersonation or coercion attempt.';
  } else if (riskScore >= 25) {
    riskTier = 'MODERATE';
    severityClass = 'badge-blue';
    riskSummary = 'Moderate caution advised. Exercise vigilance and cross-check directly with your official banking institution.';
  }

  return {
    originalText: cleanText,
    riskScore,
    riskTier,
    severityClass,
    riskSummary,
    matchedIndicators,
    whatToAvoid: [
      'Never share OTPs, PINs, Passwords, or card CVVs under any circumstance.',
      'Do not click shortened or unfamiliar links enclosed in SMS messages.',
      'Never download unknown .apk files or remote screen-sharing applications.',
      'Do not call unverified mobile numbers listed within alarming notifications.'
    ],
    whatToDoInstead: [
      'Open your bank official mobile app or visit their authorized website independently.',
      'Call the official bank toll-free customer care number printed directly on the reverse of your debit card.',
      'Forward cyber fraud SMS alerts to official 1930 / cybercrime.gov.in portal.',
      'Block the sender number on your mobile handset immediately.'
    ]
  };
}

/**
 * Intelligent AI Chat Assistant Engine for Wealthra & ScamShield.
 * Attempts backend Flask connection first, and falls back seamlessly to smart local NLP.
 */
export async function sendChatMessage(userMessage, conversationHistory = []) {
  if (!userMessage || !userMessage.trim()) {
    return { reply: "Please type a message and I'll be happy to help!" };
  }

  // 1. Try backend server if active
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('http://127.0.0.1:5000/api/scamshield/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        conversation: conversationHistory
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.response && data.response.reply) {
        return { reply: data.response.reply, isOnline: true };
      }
    }
  } catch {
    // Backend offline or timeout -> proceed with intelligent local AI
  }

  // 2. Intelligent local AI response engine
  const q = userMessage.toLowerCase();

  // Scam / Phishing queries
  if (q.includes('scam') || q.includes('fraud') || q.includes('fake') || q.includes('phish') || q.includes('suspicious') || q.includes('otp') || q.includes('link') || q.includes('block') || q.includes('kyc')) {
    const scamCheck = analyzeScamMessage(userMessage);
    if (scamCheck && scamCheck.matchedIndicators.length > 0) {
      return {
        reply: `⚠️ Scam Alert: I detected warning signs in this message (${scamCheck.matchedIndicators.map(m => m.name).join(', ')}). Risk is ${scamCheck.riskTier} (${scamCheck.riskScore}%). Rule #1: Legitimate banks NEVER ask for OTPs or PINs. Do not click links or call numbers in the text. Call your official bank number on the back of your debit card.`,
        isScamAlert: true
      };
    }
    return {
      reply: `I can help protect you against digital fraud. Golden safety rules:\n1. Never share OTPs, PINs, or CVVs.\n2. Beware of messages threatening that your account or electricity will be blocked within 24 hours.\n3. Never install .apk files or apps like AnyDesk/QuickSupport.\nYou can paste any suspicious SMS right here or open ScamShield AI in the sidebar to scan it!`
    };
  }

  // Financial health / wellness queries
  if (q.includes('score') || q.includes('health') || q.includes('wellness') || q.includes('how am i doing')) {
    return {
      reply: `Your Financial Wellness Score combines 5 pillars: Income Stability, Savings Safety, Debt-to-Income, Expense Control, and Emergency Preparedness. You can view your real-time score and 12-month predictive forecast right on your Dashboard!`
    };
  }

  // Emergency fund queries
  if (q.includes('emergency') || q.includes('save') || q.includes('savings') || q.includes('buffer') || q.includes('runway')) {
    return {
      reply: `An Emergency Savings Buffer protects your household when unexpected events happen (like medical bills or job transitions). Wealthra recommends holding 6 months of essential living expenses in an accessible zero-risk bank account or liquid deposit.`
    };
  }

  // Debt / EMI / Loans
  if (q.includes('debt') || q.includes('loan') || q.includes('emi') || q.includes('credit card') || q.includes('interest')) {
    return {
      reply: `For healthy finances, keep your total monthly EMI payments below 35% of your income. If you have credit card debt (which often charges 36%+ interest), prioritize paying that first, as recommended in our Interventions guide!`
    };
  }

  // Monthly income manager
  if (q.includes('irregular') || q.includes('freelance') || q.includes('gig') || q.includes('fluctuat') || q.includes('income manager')) {
    return {
      reply: `We just added our new 'Monthly Income Manager' feature in the sidebar! It's tailored for freelancers, contractors, and irregular earners to calculate your safe baseline spending and smooth cash flow across boom and lean months.`
    };
  }

  // Language / regional support
  if (q.includes('language') || q.includes('hindi') || q.includes('bengali') || q.includes('telugu') || q.includes('tamil')) {
    return {
      reply: `Wealthra supports 5 major languages: English, हिन्दी (Hindi), বাংলা (Bengali), తెలుగు (Telugu), and தமிழ் (Tamil). Click the Language selector at the top-right of your navigation bar to change it anytime!`
    };
  }

  // Greetings / general help
  return {
    reply: `Hello! I am your Wealthra & ScamShield AI Assistant. I can help you verify suspicious messages for scams, explain your financial wellness scores, plan emergency buffers, or guide you through any feature on our platform. How can I assist you today?`
  };
}
