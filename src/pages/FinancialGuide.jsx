import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle, ShieldCheck, HeartHandshake, PhoneCall, Volume2, VolumeX, Square } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { HelpButton } from '../components/HelpButton';

const MULTILINGUAL_GUIDES = {
  en: [
    {
      id: 'emergency-fund',
      question: 'What is an Emergency Fund?',
      answer: 'Money kept aside specifically for unexpected expenses such as medical emergencies, house repairs, or temporary loss of income. It should not be used for daily shopping or vacations.',
      tip: 'Keep this money in a separate, easily accessible savings account.'
    },
    {
      id: 'how-much-save',
      question: 'How much should I save?',
      answer: 'A common and reassuring goal is to gradually build enough savings to cover several months of essential living expenses. For most households, 3 to 6 months provides solid peace of mind.',
      tip: 'Start small. Even setting aside ₹500 or ₹1,000 every month adds up over time.'
    },
    {
      id: 'loan-repayment-trouble',
      question: 'What should I do if I cannot repay a loan?',
      answer: 'Contact your bank or lender early to discuss available support options rather than waiting until payments are missed. Banks often have hardship programs, EMI restructuring, or tenure extensions designed to help you through rough patches.',
      tip: 'Never borrow from unregulated, predatory apps to pay off an existing bank loan.'
    },
    {
      id: 'understanding-dti',
      question: 'What does "Debt-to-Income" mean?',
      answer: 'Debt-to-Income (DTI) simply measures how much of your monthly income goes toward paying back loans. If your income is ₹50,000 and your loan EMI is ₹9,500, your ratio is 19% — which is very safe and manageable.',
      tip: 'Keeping debt repayments under 35% of your income leaves plenty of buffer for food and health.'
    },
    {
      id: 'scam-protection',
      question: 'How do I protect my digital banking from scams?',
      answer: 'Never share your bank OTP, PIN, or passwords with anyone over the phone — even if they claim to be calling from your bank branch. Wealthra or your bank will never ask for your secret password.',
      tip: 'When in doubt, hang up and call the official bank toll-free number.'
    }
  ],
  hi: [
    {
      id: 'emergency-fund',
      question: 'आपातकालीन फंड (Emergency Fund) क्या है?',
      answer: 'चिकित्सा आपात स्थिति, घर की मरम्मत या आय के नुकसान जैसे अप्रत्याशित खर्चों के लिए अलग रखा गया धन। इसका उपयोग सामान्य खरीदारी या यात्राओं के लिए नहीं किया जाना चाहिए।',
      tip: 'इस पैसे को एक अलग, आसानी से सुलभ बचत खाते में रखें।'
    },
    {
      id: 'how-much-save',
      question: 'मुझे कितनी बचत करनी चाहिए?',
      answer: 'एक सामान्य और आश्वस्त करने वाला लक्ष्य आवश्यक जीवन-यापन खर्चों के 3 से 6 महीने के बराबर बचत बनाना है, जिससे मन को पूरी शांति मिलती है।',
      tip: 'छोटी शुरुआत करें। हर महीने ₹500 या ₹1,000 अलग रखने से समय के साथ बड़ी पूंजी बनती है।'
    },
    {
      id: 'loan-repayment-trouble',
      question: 'अगर मैं ऋण नहीं चुका पाऊं तो क्या करूँ?',
      answer: 'भुगतान चूकने की प्रतीक्षा करने के बजाय सहायता विकल्पों पर चर्चा करने के लिए अपने बैंक से जल्दी संपर्क करें। बैंक अक्सर ईएमआई पुनर्गठन या समय विस्तार प्रदान करते हैं।',
      tip: 'पुराने ऋण को चुकाने के लिए कभी भी अनियमित या धोखाधड़ी वाले ऐप्स से नया ऋण न लें।'
    },
    {
      id: 'understanding-dti',
      question: 'ऋण-से-आय (Debt-to-Income) का क्या अर्थ है?',
      answer: 'यह मापता है कि आपकी मासिक आय का कितना प्रतिशत ऋण चुकाने में जाता है। यदि आय ₹50,000 है और ईएमआई ₹9,500 है, तो अनुपात 19% है — जो बहुत सुरक्षित है।',
      tip: 'ऋण भुगतान को अपनी आय के 35% से कम रखने से भोजन और स्वास्थ्य के लिए पर्याप्त धन बचता है।'
    },
    {
      id: 'scam-protection',
      question: 'डिजिटल बैंकिंग को धोखाधड़ी से कैसे सुरक्षित रखें?',
      answer: 'फोन पर किसी के साथ अपना बैंक ओटीपी, पिन या पासवर्ड कभी साझा न करें — भले ही वे बैंक से फोन करने का दावा करें। बैंक कभी गुप्त पासवर्ड नहीं मांगता।',
      tip: 'संदेह होने पर तुरंत फोन काटें और आधिकारिक बैंक टोल-फ्री नंबर पर कॉल करें।'
    }
  ],
  bn: [
    {
      id: 'emergency-fund',
      question: 'জরুরী তহবিল (Emergency Fund) কী?',
      answer: 'জরুরী চিকিৎসা, গৃহস্থালি মেরামত বা হঠাৎ আয়ের অভাব মোকাবিলার জন্য আলাদা করে রাখা অর্থ। এটি সাধারণ কেনাকাটায় ব্যবহার করা উচিত নয়।',
      tip: 'এই অর্থ একটি পৃথক ও সহজে উত্তোলনযোগ্য ব্যাংক অ্যাকাউন্টে রাখুন।'
    },
    {
      id: 'how-much-save',
      question: 'আমার কতটা সঞ্চয় করা উচিত?',
      answer: '৩ থেকে ৬ মাসের প্রয়োজনীয় জীবনযাত্রার ব্যয়ের সমান সঞ্চয় গড়ে তোলা একটি আদর্শ লক্ষ্য যা মানসিক শান্তি নিশ্চিত করে।',
      tip: 'অল্প দিয়ে শুরু করুন। প্রতি মাসে ₹৫০০ বা ₹১,০০০ জমানোও সময়ের সাথে অনেক বড় হয়।'
    },
    {
      id: 'loan-repayment-trouble',
      question: 'ঋণ পরিশোধে সমস্যা হলে কী করব?',
      answer: 'কিস্তি বাদ পড়ার আগেই ব্যাংকের সাথে কথা বলুন। ব্যাংকগুলি প্রায়শই ইএমआई পুনর্গঠন বা মেয়াদ বাড়ানোর সুবিধা প্রদান করে।',
      tip: 'পুরোনো ঋণ শোধ করার জন্য অননুমোদিত ক্ষতিকর অ্যাপ থেকে কখনও ঋণ নেবেন না।'
    },
    {
      id: 'understanding-dti',
      question: 'ঋণ ও আয়ের অনুপাত (DTI) কী?',
      answer: 'এটি নির্দেশ করে আপনার আয়ের কত শতাংশ ঋণ পরিশোধে যায়। ৩৫% এর নিচে থাকা নিরাপদ ও সহনশীল।',
      tip: 'ঋণ পরিশোধের পরিমাণ আয়ের ৩৫% এর নিচে রাখলে খাদ্য ও চিকিৎসার জন্য যথেষ্ট তহবিল থাকে।'
    },
    {
      id: 'scam-protection',
      question: 'অনলাইন প্রতারণা থেকে কীভাবে বাঁচবেন?',
      answer: 'কখনই আপনার ব্যাংকের ওটিপি, পিন বা পাসওয়ার্ড ফোনে কারও সাথে শেয়ার করবেন না — তারা ব্যাংক কর্মকর্তা দাবি করলেও না।',
      tip: 'সন্দেহ হলে ফোন কেটে ব্যাংকের অফিসিয়াল টোল-ফ্রি নম্বরে কল করুন।'
    }
  ],
  te: [
    {
      id: 'emergency-fund',
      question: 'అత్యవసర నిధి (Emergency Fund) అంటే ఏమిటి?',
      answer: 'వైద్య ఖర్చులు లేదా అనుకోని నష్టాలు వంటి అత్యవసర సమయాల కోసం పక్కన ఉంచిన డబ్బు. దీనిని సాధారణ షాపింగ్ కోసం ఉపయోగించకూడదు.',
      tip: 'ఈ డబ్బును వేరుగా, సులభంగా విత్‌డ్రా చేసుకోగల బ్యాంకు ఖాతాలో ఉంచండి.'
    },
    {
      id: 'how-much-save',
      question: 'నేను ఎంత పొదుపు చేయాలి?',
      answer: '3 నుండి 6 నెలల ప్రాథమిక ఖర్చులకు సరిపడా నిధిని క్రమంగా నిర్మించుకోవడం సురక్షితమైన లక్ష్యం.',
      tip: 'చిన్న మొత్తంతో ప్రారంభించండి. నెలకు ₹500 లేదా ₹1,000 ఆదా చేసినా కాలక్రమేణా పెద్ద మొత్తం అవుతుంది.'
    },
    {
      id: 'loan-repayment-trouble',
      question: 'నేను రుణం తిరిగి చెల్లించలేకపోతే ఏమి చేయాలి?',
      answer: 'చెల్లింపులు తప్పిపోయే వరకు వేచి ఉండకుండా ముందే మీ బ్యాంకుతో మాట్లాడండి. బ్యాంకులు ఈఎంఐ రీస్ట్రక్చరింగ్ లేదా గడువు పొడిగింపును అందిస్తాయి.',
      tip: 'పాత అప్పు తీర్చడానికి అనుమతి లేని లోన్ యాప్‌ల నుండి ఎప్పుడూ రుణాలు తీసుకోవద్దు.'
    },
    {
      id: 'understanding-dti',
      question: 'అప్పు-ఆదాయ నిష్పత్తి (DTI) అంటే ఏమిటి?',
      answer: 'మీ నెలవారీ ఆదాయంలో ఎంత భాగం అప్పులకు వెళుతుందో ఇది కొలుస్తుంది. 35% కంటే తక్కువ ఉండటం సురక్షితం.',
      tip: 'రుణ చెల్లింపులను 35% లోపు ఉంచడం వల్ల ఆహారం మరియు ఆరోగ్యానికి తగినంత బఫర్ మిగులుతుంది.'
    },
    {
      id: 'scam-protection',
      question: 'డిజిటల్ బ్యాంకింగ్ మోసాల నుండి ఎలా రక్షించుకోవాలి?',
      answer: 'మీ బ్యాంక్ ఓటీపీ, పిన్ లేదా పాస్‌వర్డ్‌లను ఎవరితోనూ ఫోన్‌లో పంచుకోవద్దు — వారు బ్యాంక్ నుండి మాట్లాడుతున్నామని చెప్పినా నమ్మవద్దు.',
      tip: 'అనుమానం వస్తే కాల్ కట్ చేసి అధికారిక బ్యాంక్ టోల్-ఫ్రీ నంబర్‌కు కాల్ చేయండి.'
    }
  ],
  ta: [
    {
      id: 'emergency-fund',
      question: 'அவசரக்கால நிதி (Emergency Fund) என்றால் என்ன?',
      answer: 'மருத்துவ அவசரநிலைகள் அல்லது தற்காலிக வருமான இழப்பு போன்ற எதிர்பாராத செலவுகளுக்காக ஒதுக்கி வைக்கப்பட்ட பணம். இதனை பொதுவான தேவைகளுக்குப் பயன்படுத்தக் கூடாது.',
      tip: 'இப்பணத்தை எளிதில் எடுக்கக்கூடிய தனி சேமிப்புக் கணக்கில் வைக்கவும்.'
    },
    {
      id: 'how-much-save',
      question: 'நான் எவ்வளவு சேமிக்க வேண்டும்?',
      answer: '3 முதல் 6 மாத அத்தியாவசிய வாழ்க்கைச் செலவுகளுக்கான சேமிப்பை படிப்படியாக உருவாக்குவது சிறந்த நிதி அமைதியைத் தரும்.',
      tip: 'சிறிய அளவில் தொடங்குங்கள். மாதந்தோறும் ₹500 அல்லது ₹1,000 சேமிப்பது காலப்போக்கில் பெரும் தொகையாகும்.'
    },
    {
      id: 'loan-repayment-trouble',
      question: 'கடனைத் திருப்பிச் செலுத்த முடியாவிட்டால் என்ன செய்ய வேண்டும்?',
      answer: 'தவணை தவறும் வரை காத்திருக்காமல் உங்கள் வங்கியை முன்கூட்டியே தொடர்பு கொள்ளவும். வங்கிகள் சலுகை திட்டங்கள் அல்லது தவணை நீட்டிப்பை வழங்குகின்றன.',
      tip: 'பழைய கடனை அடைக்க அங்கீகரிக்கப்படாத கடன் செயலிகளில் கடன் வாங்காதீர்கள்.'
    },
    {
      id: 'understanding-dti',
      question: 'கடன்-வருமான விகிதம் (DTI) என்றால் என்ன?',
      answer: 'உங்கள் மாதாந்திர வருமானத்தில் எவ்வளவு தொகை கடன்களை அடைக்கச் செல்கிறது என்பதை இது குறிக்கிறது. 35%க்கு கீழ் இருப்பது பாதுகாப்பானது.',
      tip: 'கடன் தவணைகளை வருமானத்தில் 35%க்கு குறைவாக வைத்திருப்பது உணவு மற்றும் மருத்துவத்திற்கு போதுமான நிதியை உறுதி செய்யும்.'
    },
    {
      id: 'scam-protection',
      question: 'டிஜிட்டல் வங்கி மோசடிகளிலிருந்து எவ்வாறு தற்காத்துக் கொள்வது?',
      answer: 'உங்கள் வங்கி ஓடிபி, பின் அல்லது கடவுச்சொல்லை தொலைபேசியில் யாருடனும் பகிர வேண்டாம் — அவர்கள் வங்கியில் இருந்து பேசுவதாகக் கூறினாலும் கூட.',
      tip: 'சந்தேகம் ஏற்பட்டால் இணைப்பைத் துண்டித்து அதிகாரப்பூர்வ கட்டணமில்லா தொலைபேசி எண்ணை அழைக்கவும்.'
    }
  ]
};

export const FinancialGuide = ({ onNavigate }) => {
  const { currentLanguage, t, speechCode } = useLanguage();
  const [readingAloud, setReadingAloud] = useState(null);

  // Get localized guides
  const guides = MULTILINGUAL_GUIDES[currentLanguage] || MULTILINGUAL_GUIDES.en;

  // Clean up any playing speech when user navigates away
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleReadAloud = (guideId, question, answer, tip) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Audio voice assistance is not supported in this browser environment.');
      return;
    }

    // Toggle stop if already playing this card
    if (readingAloud === guideId) {
      window.speechSynthesis.cancel();
      setReadingAloud(null);
      return;
    }

    // Stop any previous speech
    window.speechSynthesis.cancel();

    const fullSpeechText = `${question}. ${answer}. ${tip}`;
    const utterance = new SpeechSynthesisUtterance(fullSpeechText);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.lang = speechCode;

    const voices = window.speechSynthesis.getVoices();
    const targetLangPrefix = speechCode.split('-')[0];
    const matchedVoice = voices.find(
      (v) => v.lang.startsWith(targetLangPrefix) || v.lang.includes(targetLangPrefix)
    ) || voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      setReadingAloud(null);
    };

    utterance.onerror = () => {
      setReadingAloud(null);
    };

    setReadingAloud(guideId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>{t('guidance.title', 'Your Financial Guide')}</h1>
          <p>
            {t('guidance.subtitle', 'Simple, calming explanations of key banking concepts designed for beginners, elderly users, and anyone wanting clarity.')}
          </p>
        </div>
        <div className="page-actions">
          <HelpButton />
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {guides.map((g) => {
          const isPlaying = readingAloud === g.id;

          return (
            <div
              key={g.id}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                border: isPlaying ? '2px solid #2563EB' : '1px solid var(--color-border)',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', fontWeight: 600 }}>
                    {g.question}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleReadAloud(g.id, g.question, g.answer, g.tip)}
                    className={`btn btn-sm ${isPlaying ? 'btn-primary' : 'btn-secondary'}`}
                    aria-label={isPlaying ? 'Stop reading' : 'Read this card aloud'}
                    style={{ padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                  >
                    {isPlaying ? <Square size={13} fill="white" /> : <Volume2 size={15} color="#2563EB" />}
                    <span>{isPlaying ? t('guidance.stopAudio', 'Stop Audio') : t('guidance.listen', 'Listen')}</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                  {g.answer}
                </p>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '6px', borderLeft: '3px solid #2563EB', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                  <strong>Helpful Tip:</strong> {g.tip}
                </div>
              </div>

              {isPlaying && (
                <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#EFF6FF', padding: '0.4rem 0.65rem', borderRadius: '6px' }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>🔊</span> Speaking aloud now... Click "Stop Audio" anytime to pause.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Senior Citizens & In-Person Support Card */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <HeartHandshake size={28} color="#16A34A" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '1rem', color: '#166534' }}>
              Prefer to talk to a human financial counselor?
            </strong>
            <span style={{ fontSize: '0.85rem', color: '#15803D' }}>
              We provide free, patient telephone guidance and local branch appointments for anyone needing friendly support.
            </span>
          </div>
        </div>

        <HelpButton />
      </div>
    </div>
  );
};
