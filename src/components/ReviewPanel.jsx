import React from 'react';
import { Filter, CheckCheck, XCircle } from 'lucide-react';
import Button from './common/Button';
import './ReviewPanel.css';

export function ReviewPanel({
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  onApproveAll,
  onRejectAll,
}) {
  return (
    <div className="glass-card review-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--primary-hover)" />
          <h3 style={{ fontSize: '1rem' }}>Test Case Filters & Actions</h3>
        </div>
      </div>

      <div>
        <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Status</label>
        <div className="filter-group">
          {['all', 'proposed', 'approved', 'rejected', 'edited'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Type</label>
        <div className="filter-group">
          {['all', 'unit', 'api', 'integration', 'e2e', 'playwright', 'manual'].map((tp) => (
            <button
              key={tp}
              onClick={() => setFilterType(tp)}
              className={`btn btn-sm ${filterType === tp ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', textTransform: 'capitalize' }}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex',flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
        <Button variant="secondary" size="sm" onClick={onApproveAll} icon={CheckCheck} style={{ flex: 1, fontSize: '0.8rem' }}>
          Approve All Proposed
        </Button>
        <Button variant="danger" size="sm" onClick={onRejectAll} icon={XCircle} style={{ flex: 1, fontSize: '0.8rem' }}>
          Reject All Proposed
        </Button>
      </div>
    </div>
  );
}

export default ReviewPanel;
