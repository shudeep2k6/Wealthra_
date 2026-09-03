// src/pages/ScamShield.jsx
import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  PhoneCall,
  ExternalLink,
  Info,
  Trash2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { analyzeScamMessage } from '../services/scamShieldService';

const SAMPLE_SCAMS = [
  {
    title: 'Fake SBI KYC Expiry SMS',
    risk: 'High',
    text: 'Dear SBI Customer, your YONO account has been suspended due to unverified KYC. Click http://bit.ly/sbi-kyc-update immediately to update PAN and prevent permanent debit block.'
  },
  {
    title: 'Electricity Power Cut Threat',
    risk: 'High',
    text: 'URGENT NOTICE: Your electricity power will be disconnected tonight at 9:30 PM because previous bill was not updated. Immediately contact our electricity officer at 9876543210.'
  },
  {
    title: 'Lottery / Lucky Draw Prize Bait',
    risk: 'High',
    text: 'Congratulations! Your mobile number has won Rs 25,00,000 in KBC All India Lucky Draw. Please share the 6-digit OTP code sent to your phone to claim your cash transfer.'
  },
  {
    title: 'Legitimate Bank Alert (Safe)',
    risk: 'Low',
    text: 'Dear Customer, INR 1,500 has been debited from Account ending in XX3421 on 03-Sep-2026 at Grocery Mart. Available balance is INR 38,400. If this transaction was not done by you, call official bank toll-free.'
  }
];

export const ScamShield = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState(SAMPLE_SCAMS[0].text);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(() => analyzeScamMessage(SAMPLE_SCAMS[0].text));
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const handleScan = () => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    setTimeout(() => {
      const res = analyzeScamMessage(inputText);
      setScanResult(res);
      if (res) {
        setHistory(prev => [
          {
            id: Date.now(),
            text: res.originalText.slice(0, 55) + '...',
            tier: res.riskTier,
            score: res.riskScore,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          ...prev.slice(0, 5)
        ]);
      }
      setIsScanning(false);
    }, 450);
  };

  const handleLoadSample = (sampleText) => {
    setInputText(sampleText);
    const res = analyzeScamMessage(sampleText);
    setScanResult(res);
  };

  const handleCopyAnalysis = () => {
    if (!scanResult) return;
    const text = `ScamShield AI Analysis Report:
Risk Level: ${scanResult.riskTier} (Score: ${scanResult.riskScore}/100)
Message: "${scanResult.originalText}"
Summary: ${scanResult.riskSummary}
Red Flags:
${scanResult.matchedIndicators.map((m, i) => `${i + 1}. ${m.name} - ${m.explanation}`).join('\n')}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="page-container fade-in" style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0B1220 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '1.75rem 2rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldAlert size={14} />
            <span>AI Fraud &amp; Scam Detection Engine</span>
          </span>
          <span className="badge badge-blue">Real-Time Threat Intelligence</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.35rem 0' }}>
          ScamShield AI - Digital Financial Defense
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#94A3B8', maxWidth: '780px', lineHeight: 1.5 }}>
          Paste any SMS, WhatsApp alert, email, or payment link to immediately detect phishing traps,
          unauthorized OTP requests, fake bank impersonations, and power-cut extortion schemes.
        </p>
      </div>

      {/* Quick Sample Test Buttons */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.6rem' }}>
          Quick Test Scenarios (Click to Load):
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {SAMPLE_SCAMS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(s.text)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
            >
              <span>{s.title}</span>
              <span className={`badge ${s.risk === 'High' ? 'badge-danger' : 'badge-positive'}`} style={{ fontSize: '0.7rem' }}>
                {s.risk}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scanner Input & Results Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Input Column */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FileSearch size={18} color="var(--color-blue)" />
            <strong style={{ fontSize: '1rem', color: 'var(--color-navy)' }}>
              Scan Message or Suspicious Text
            </strong>
          </div>

          <textarea
            className="form-input"
            rows={7}
            style={{ width: '100%', resize: 'vertical', fontSize: '0.925rem', lineHeight: 1.5, padding: '0.85rem', marginBottom: '1rem' }}
            placeholder="Paste suspicious SMS text, WhatsApp message, email content, or payment link here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning || !inputText.trim()}
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {isScanning ? <RefreshCw className="spin" size={16} /> : <ShieldAlert size={16} />}
              <span>{isScanning ? 'Scanning Threat Signals...' : 'Analyze Message for Scams'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setInputText(''); setScanResult(null); }}
              className="btn btn-secondary"
              title="Clear input"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Recent Scans Micro Log */}
          {history.length > 0 && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Recent Scans in this session:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {history.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.35rem 0.5rem', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                      {item.text}
                    </span>
                    <span className={`badge ${item.tier === 'CRITICAL' || item.tier === 'HIGH' ? 'badge-danger' : 'badge-positive'}`} style={{ fontSize: '0.7rem' }}>
                      {item.tier} ({item.score}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="card" style={{ padding: '1.5rem' }}>
          {scanResult ? (
            <div>
              {/* Risk Gauge Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Calculated Threat Risk
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.2rem' }}>
                    <strong style={{ fontSize: '2.5rem', color: scanResult.riskScore >= 50 ? '#DC2626' : '#16A34A', lineHeight: 1 }}>
                      {scanResult.riskScore}%
                    </strong>
                    <span className={`badge ${scanResult.severityClass}`} style={{ fontSize: '0.85rem' }}>
                      {scanResult.riskTier === 'CRITICAL' || scanResult.riskTier === 'HIGH' ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />}
                      {scanResult.riskTier} RISK
                    </span>
                  </div>
                </div>

                <button type="button" onClick={handleCopyAnalysis} className="btn btn-secondary btn-sm">
                  {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: scanResult.riskScore >= 50 ? '#FEF2F2' : '#F0FDF4', borderRadius: '8px', border: scanResult.riskScore >= 50 ? '1px solid #FECACA' : '1px solid #BBF7D0', marginBottom: '1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: scanResult.riskScore >= 50 ? '#991B1B' : '#166534', marginBottom: '0.25rem' }}>
                  {scanResult.riskScore >= 50 ? '⚠️ High Suspicion Warning' : '✓ Safe Observation'}
                </strong>
                <p style={{ fontSize: '0.85rem', color: scanResult.riskScore >= 50 ? '#B91C1C' : '#15803D', margin: 0, lineHeight: 1.45 }}>
                  {scanResult.riskSummary}
                </p>
              </div>

              {/* Red Flags Breakdown */}
              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
                  Detected Red Flags ({scanResult.matchedIndicators.length}):
                </strong>

                {scanResult.matchedIndicators.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} />
                    <span>No known phishing or credential extortion keywords detected.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {scanResult.matchedIndicators.map(ind => (
                      <div key={ind.id} style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                        <strong style={{ display: 'block', fontSize: '0.825rem', color: '#B45309' }}>
                          • {ind.name}
                        </strong>
                        <span style={{ fontSize: '0.775rem', color: '#92400E' }}>
                          {ind.explanation}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* What to avoid and do instead */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#DC2626', marginBottom: '0.35rem' }}>
                    <XCircle size={15} />
                    <strong style={{ fontSize: '0.8rem' }}>What to Avoid</strong>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {scanResult.whatToAvoid.map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A', marginBottom: '0.35rem' }}>
                    <CheckCircle2 size={15} />
                    <strong style={{ fontSize: '0.8rem' }}>Safe Alternative</strong>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {scanResult.whatToDoInstead.map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
              <ShieldCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>Paste a message or click one of the quick test scenarios above to scan for fraud.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
