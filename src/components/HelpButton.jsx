import React, { useState } from 'react';
import { HelpCircle, Phone, MessageSquare, ShieldCheck, X } from 'lucide-react';

export const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => setIsOpen(true)}
        aria-label="Need Help? Open banking assistance dialog"
        style={{ borderColor: '#CBD5E1', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <HelpCircle size={16} color="#2563EB" />
        <span style={{ fontWeight: 600 }}>Need Help?</span>
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-dialog fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={22} color="#2563EB" />
                <h3 className="modal-title">Inclusive Customer Assistance</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '1.25rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                We believe digital banking should never feel intimidating. If you are experiencing difficulties, need assistance understanding your options, or want to speak with an accessibility-trained financial counselor, we are here for you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Phone size={20} color="#16A34A" />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-navy)' }}>
                        Senior Citizen &amp; Accessibility Helpline
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Toll-Free: 1800-425-WELL (Mon–Sat, 8am–8pm)</span>
                    </div>
                  </div>
                  <span className="badge badge-positive">Free Support</span>
                </div>

                <div style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MessageSquare size={20} color="#2563EB" />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-navy)' }}>
                        Simple Language In-Branch Appointment
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Book a calm, in-person walkthrough at any local branch</span>
                    </div>
                  </div>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => alert('Appointment request logged for demo user.')}>
                    Schedule
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setIsOpen(false)}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
