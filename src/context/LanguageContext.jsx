// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, translate, getSpeechLanguageCode, translateRiskTier } from '../services/languageService';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('wealthra_language');
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'en';
  });

  const setLanguage = useCallback((langCode) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) {
      setCurrentLanguage(langCode);
      try {
        localStorage.setItem('wealthra_language', langCode);
      } catch (e) {
        // ignore
      }
      document.documentElement.setAttribute('lang', langCode);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('lang', currentLanguage);
  }, [currentLanguage]);

  const t = useCallback(
    (keyPath, fallback = '') => {
      return translate(currentLanguage, keyPath, fallback);
    },
    [currentLanguage]
  );

  const tTier = useCallback(
    (tier) => {
      return translateRiskTier(tier, currentLanguage);
    },
    [currentLanguage]
  );

  const activeSpeechCode = getSpeechLanguageCode(currentLanguage);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        tTier,
        speechCode: activeSpeechCode,
        languages: SUPPORTED_LANGUAGES,
        activeLangObj: SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
