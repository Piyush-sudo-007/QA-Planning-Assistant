import React, { useState, useEffect } from 'react';
import { History, GitCommit } from 'lucide-react';
import api from '../api/client';
import Badge from './common/Badge';
import { formatDate } from '../utils/helpers';
import './PlanHistory.css';

export function PlanHistory({ projectId, currentPlanId, onSelectPlan }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!projectId) return;
      try {
        const res = await api.getPlanVersions(projectId);
        setPlans(res.plans || []);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [projectId]);

  if (loading || plans.length <= 1) return null;

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <History size={18} color="var(--primary-hover)" />
        <h3 style={{ fontSize: '1rem' }}>Plan Version History</h3>
      </div>

      <div className="history-list">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`history-item ${p.id === currentPlanId ? 'active' : ''}`}
            onClick={() => onSelectPlan(p.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitCommit size={16} color="var(--primary)" />
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Version {p.version}</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(p.created_at)}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Badge variant={p.status}>{p.status}</Badge>
              <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--success)', marginTop: '0.2rem' }}>
                {p.coverage_score}% coverage
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlanHistory;
