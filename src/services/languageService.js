// src/services/languageService.js
// Multilingual Translation Model & Inference Service
import enCorpus from '../data/translations/en.json';
import hiCorpus from '../data/translations/hi.json';
import bnCorpus from '../data/translations/bn.json';
import teCorpus from '../data/translations/te.json';
import taCorpus from '../data/translations/ta.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', speechCode: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', speechCode: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', speechCode: 'ta-IN' }
];

const CORPORA = {
  en: enCorpus,
  hi: hiCorpus,
  bn: bnCorpus,
  te: teCorpus,
  ta: taCorpus
};

/**
 * Retrieves a translated string by dot-notation key.
 * If translation is missing in the requested language, falls back to English, then to fallback parameter.
 * 
 * Example: translate('hi', 'dashboard.title') -> "वित्तीय स्वास्थ्य का संक्षिप्त विवरण"
 */
export function translate(langCode, keyPath, fallback = '') {
  const targetLang = CORPORA[langCode] ? langCode : 'en';
  const primaryDict = CORPORA[targetLang];
  const fallbackDict = CORPORA.en;

  const resolveKey = (dict, path) => {
    if (!dict || !path) return undefined;
    const parts = path.split('.');
    let current = dict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  };

  const translated = resolveKey(primaryDict, keyPath);
  if (translated !== undefined && typeof translated === 'string') {
    return translated;
  }

  const enFallback = resolveKey(fallbackDict, keyPath);
  if (enFallback !== undefined && typeof enFallback === 'string') {
    return enFallback;
  }

  return fallback || keyPath;
}

/**
 * Returns speech synthesis BCP 47 language code for the requested language.
 */
export function getSpeechLanguageCode(langCode) {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  return lang?.speechCode || 'en-IN';
}

/**
 * Translates dynamic risk tiers and statuses
 */
export function translateRiskTier(tier, langCode) {
  const normalized = (tier || '').toUpperCase();
  if (normalized === 'LOW') return translate(langCode, 'distress.lowRisk', 'Low Risk');
  if (normalized === 'MODERATE') return translate(langCode, 'distress.moderateRisk', 'Moderate Risk');
  if (normalized === 'HIGH') return translate(langCode, 'distress.highRisk', 'High Risk');
  if (normalized === 'CRITICAL') return translate(langCode, 'distress.criticalRisk', 'Critical Risk');
  return tier;
}
