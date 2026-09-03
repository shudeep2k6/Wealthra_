import React from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

export const StrategyModal = ({ isOpen, onClose, title, priority, description, steps = [], onApply }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className={`badge ${priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}`} style={{ marginBottom: '0.35rem' }}>
              Priority: {priority}
            </span>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
            {description}
          </p>

          <h4 style={{ fontSize: '0.9rem', color: '#0B1220', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Action Roadmap:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <CheckCircle2 size={16} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#111827' }}>
                    Step {idx + 1}: {step.title}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Dismiss
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (onApply) onApply();
              onClose();
            }}
          >
            <span>Activate Action Plan</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
