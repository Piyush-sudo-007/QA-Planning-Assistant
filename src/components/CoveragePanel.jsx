import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import './CoveragePanel.css';

export function CoveragePanel({ coverage }) {
  if (!coverage) return null;

  const { score, approvedScore = 0, covered = [], uncovered = [], details = [] } = coverage;

  return (
    <div className="glass-card coverage-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldCheck size={20} color="var(--primary-hover)" />
        <h3 style={{ fontSize: '1.1rem' }}>Acceptance Criteria Coverage</h3>
      </div>

      <div className="coverage-score-ring">
        <div style={{ textAlign: 'center' }}>
          <div className="coverage-score-value">{score}%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mapped</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
        <div style={{ padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Covered ACs</span>
          <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>{covered.length}</strong>
        </div>
        <div style={{ padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Uncovered ACs</span>
          <strong style={{ color: uncovered.length > 0 ? 'var(--error)' : 'var(--text-muted)', fontSize: '1.1rem' }}>
            {uncovered.length}
          </strong>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.65rem', color: 'var(--text-secondary)' }}>
          Criteria Coverage Matrix
        </h4>
        <div className="ac-coverage-list">
          {details.map((item) => (
            <div key={item.index} className={`ac-coverage-item ${item.isCovered ? 'covered' : 'uncovered'}`}>
              {item.isCovered ? (
                <CheckCircle2 size={16} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
              ) : (
                <XCircle size={16} color="var(--error)" style={{ marginTop: '2px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                  AC{item.index + 1}: {item.text}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {item.isCovered
                    ? `${item.testCount} test case(s) mapped (${item.approvedTestCount} approved)`
                    : '⚠️ Uncovered — No test case maps to this criterion'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoveragePanel;
