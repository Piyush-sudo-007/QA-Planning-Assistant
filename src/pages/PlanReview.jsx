import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';
import TestCaseCard from '../components/TestCaseCard';
import CoveragePanel from '../components/CoveragePanel';
import ReviewPanel from '../components/ReviewPanel';
import PlanHistory from '../components/PlanHistory';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { Save, AlertTriangle, Lightbulb, GitBranch, ArrowLeft, Bot } from 'lucide-react';
import { TEST_TYPES } from '../utils/constants';
import './PlanReview.css';

export function PlanReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plan, coverage, loading, hasUnsavedChanges, updateTestCase, savePlan } = usePlan(id);

  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  if (loading || !plan) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading QA Plan telemetry & test suite...</p>
      </div>
    );
  }

  const testCases = plan.testCases || [];

  // Filter test cases
  const filteredTestCases = testCases.filter((tc) => {
    if (filterType !== 'all' && tc.type !== filterType) return false;
    if (filterStatus !== 'all' && tc.status !== filterStatus) return false;
    return true;
  });

  // Group by test type
  const grouped = {};
  for (const tc of filteredTestCases) {
    if (!grouped[tc.type]) grouped[tc.type] = [];
    grouped[tc.type].push(tc);
  }

  const handleApproveAll = () => {
    testCases.forEach((tc) => {
      if (tc.status === 'proposed') {
        updateTestCase(tc.id, { status: 'approved' });
      }
    });
  };

  const handleRejectAll = () => {
    testCases.forEach((tc) => {
      if (tc.status === 'proposed') {
        updateTestCase(tc.id, { status: 'rejected' });
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/')}>
            Back
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.5rem' }}>{plan.project_name || 'QA Test Plan'}</h1>
              <Badge variant={plan.status}>v{plan.version} • {plan.status}</Badge>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Created by {plan.created_by || 'Developer'}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Save}
          onClick={savePlan}
          disabled={plan.status === 'reviewed' && !hasUnsavedChanges}
        >
          {hasUnsavedChanges ? 'Save Version & Update Coverage' : 'Plan Saved ✓'}
        </Button>
      </div>

      <div className="glass-card plan-header">
        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Requirement Summary</h3>
        <p style={{ fontSize: '0.92rem', marginBottom: '1rem' }}>{plan.requirement}</p>

        <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
          Acceptance Criteria ({plan.project_acceptance_criteria?.length || 0})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {plan.project_acceptance_criteria?.map((ac, idx) => (
            <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>AC{idx + 1}:</span>
              <span>{ac}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="plan-review-layout">
        {/* Left Column: Test Cases List */}
        <div>
          {Object.keys(grouped).length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No test cases match the selected filters.
            </div>
          ) : (
            Object.entries(grouped).map(([type, list]) => {
              const info = TEST_TYPES[type] || TEST_TYPES.manual;
              return (
                <div key={type} className="collapsible-group">
                  <div className="group-title">
                    <span style={{ color: info.color, fontWeight: 700 }}>{info.label}s</span>
                    <Badge style={{ background: `${info.color}22`, color: info.color }}>{list.length}</Badge>
                  </div>
                  {list.map((tc) => (
                    <TestCaseCard
                      key={tc.id}
                      testCase={tc}
                      onStatusChange={(testId, updates) => updateTestCase(testId, updates)}
                    />
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Analytics, Coverage & History Sidebar */}
        <div className="sidebar-panel-stack">
          <CoveragePanel coverage={coverage} />

          <ReviewPanel
            filterType={filterType}
            setFilterType={setFilterType}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onApproveAll={handleApproveAll}
            onRejectAll={handleRejectAll}
          />

          {plan.assumptions && plan.assumptions.length > 0 && (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <Lightbulb size={18} color="var(--warning)" />
                <h3 style={{ fontSize: '0.95rem' }}>AI Context Assumptions</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {plan.assumptions.map((asm, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ color: 'var(--warning)', display: 'block' }}>{asm.assumption}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>{asm.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.regression_areas && plan.regression_areas.length > 0 && (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <AlertTriangle size={18} color="var(--error)" />
                <h3 style={{ fontSize: '0.95rem' }}>Likely Regression Areas</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {plan.regression_areas.map((reg, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{reg.area}</strong>
                      <Badge variant="critical">{reg.risk} Risk</Badge>
                    </div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                      Mitigation: {reg.mitigation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PlanHistory
            projectId={plan.project_id}
            currentPlanId={plan.id}
            onSelectPlan={(selectedId) => navigate(`/plan/${selectedId}`)}
          />
        </div>
      </div>
    </div>
  );
}

export default PlanReview;
