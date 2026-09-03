// src/components/LanguageSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSelector = ({ variant = 'topbar' }) => {
  const { currentLanguage, setLanguage, languages, activeLangObj } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.4rem 0.75rem',
          backgroundColor: variant === 'sidebar' ? 'var(--color-surface-subtle)' : '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-navy)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-xs)',
          transition: 'all var(--transition-fast)'
        }}
        className="language-selector-btn"
      >
        <Globe size={15} color="#2563EB" />
        <span>{activeLangObj.nativeName}</span>
        <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 1000,
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            minWidth: '200px',
            padding: '0.35rem',
            animation: 'fadeIn 0.15s ease-out'
          }}
          role="menu"
        >
          <div style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Choose Language / भाषा चुनें
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                role="menuitem"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: isSelected ? 'var(--color-blue-subtle)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: isSelected ? 'var(--color-blue)' : 'var(--color-navy)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.875rem',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ fontSize: '1rem' }}>{lang.flag}</span>
                  <div>
                    <span style={{ display: 'block', lineHeight: 1.2 }}>{lang.nativeName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{lang.name}</span>
                  </div>
                </div>
                {isSelected && <Check size={16} color="#2563EB" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
