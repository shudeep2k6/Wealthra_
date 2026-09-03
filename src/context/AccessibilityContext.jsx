import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  // Text Size: 'normal' | 'large' | 'xlarge'
  const [textSize, setTextSize] = useState('normal');

  // Contrast: 'standard' | 'high-contrast'
  const [contrastMode, setContrastMode] = useState('standard');

  // Motion: boolean (true = reduce motion)
  const [reduceMotion, setReduceMotion] = useState(false);

  // Reading Mode: boolean (true = simple language enabled)
  const [simpleLanguage, setSimpleLanguage] = useState(false);

  // Voice Assistance: boolean (true = voice assistance enabled/modal visible)
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Accessibility Panel Open/Close state
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Apply attributes to <html> whenever state changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-text-size', textSize);
    root.setAttribute('data-contrast', contrastMode);
    root.setAttribute('data-reduce-motion', reduceMotion ? 'true' : 'false');
    root.setAttribute('data-simple-language', simpleLanguage ? 'true' : 'false');
  }, [textSize, contrastMode, reduceMotion, simpleLanguage]);

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize,
        contrastMode,
        setContrastMode,
        reduceMotion,
        setReduceMotion,
        simpleLanguage,
        setSimpleLanguage,
        voiceEnabled,
        setVoiceEnabled,
        isPanelOpen,
        setIsPanelOpen
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
