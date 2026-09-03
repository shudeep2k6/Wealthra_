// src/components/FloatingAiChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Bot,
  User,
  Volume2,
  RefreshCw,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { sendChatMessage } from '../services/scamShieldService';

const SUGGESTED_QUESTIONS = [
  '🛡️ Is this message a scam?',
  '💰 How much emergency buffer do I need?',
  '📊 What is a healthy Debt-to-Income ratio?',
  '📈 How does the Monthly Income Manager work?'
];

export const FloatingAiChat = ({ onNavigate }) => {
  const { t, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your Wealthra & ScamShield AI Assistant. How can I help you today? You can ask about your banking wellness, savings buffers, or paste suspicious messages to check for fraud.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await sendChatMessage(query, history);

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.reply || 'I am here to assist you with your finances and scam safety.',
        isScamAlert: res.isScamAlert,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'I can guide you on budgeting, debt management, and digital fraud prevention. Never disclose your OTP or bank password to anyone.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeech = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (currentLanguage === 'hi') utterance.lang = 'hi-IN';
      else if (currentLanguage === 'bn') utterance.lang = 'bn-IN';
      else if (currentLanguage === 'te') utterance.lang = 'te-IN';
      else if (currentLanguage === 'ta') utterance.lang = 'ta-IN';
      else utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <aside aria-label="AI Chat Assistant" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className="fade-in"
          style={{
            width: '370px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: '12px'
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '1rem 1.2rem',
              background: 'linear-gradient(135deg, #0B1220 0%, #1E293B 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={18} color="#60A5FA" />
              </div>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block', color: '#FFFFFF' }}>
                  Wealthra AI
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                  Digital Guard Online
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#CBD5E1',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Thread */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              backgroundColor: '#F8FAFC'
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '0.75rem 0.95rem',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: m.sender === 'user' ? '#2563EB' : (m.isScamAlert ? '#FEF2F2' : '#FFFFFF'),
                    color: m.sender === 'user' ? '#FFFFFF' : (m.isScamAlert ? '#991B1B' : '#0B1220'),
                    border: m.sender === 'user' ? 'none' : (m.isScamAlert ? '1px solid #FECACA' : '1px solid #E2E8F0'),
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    fontSize: '0.85rem',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {m.text}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', padding: '0 0.25rem' }}>
                  <span style={{ fontSize: '0.675rem', color: '#94A3B8' }}>{m.time}</span>
                  {m.sender === 'bot' && (
                    <button
                      type="button"
                      onClick={() => handleSpeech(m.text)}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                      title="Read aloud"
                    >
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.775rem', padding: '0.25rem' }}>
                <RefreshCw size={12} className="spin" />
                <span>AI is analyzing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Question Chips */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#F1F5F9',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: '0.35rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                style={{
                  fontSize: '0.725rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#1E293B',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '0.75rem',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              className="form-input"
              style={{
                flex: 1,
                fontSize: '0.85rem',
                padding: '0.55rem 0.8rem',
                borderRadius: '20px',
                border: '1px solid #CBD5E1'
              }}
              placeholder="Ask a question or paste text..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || isTyping}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: inputMessage.trim() ? '#2563EB' : '#94A3B8',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputMessage.trim() ? 'pointer' : 'default',
                flexShrink: 0
              }}
              title="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.15rem',
          borderRadius: '50px',
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.45), 0 2px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
          transform: isOpen ? 'scale(0.96)' : 'scale(1)'
        }}
        aria-label="Open AI Assistant"
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Sparkles size={14} />
        </div>
        <span>{isOpen ? 'Close Assistant' : 'AI Help & Scam Shield'}</span>
      </button>
    </aside>
  );
};
