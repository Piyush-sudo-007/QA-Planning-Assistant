import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';
import { useToast } from './useToast';

export function usePlan(planId) {
  const [plan, setPlan] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [qualityAnalysis, setQualityAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { addToast } = useToast();
  const pollingRef = useRef(null);

  const fetchPlan = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPlan(planId);
      setPlan(res.plan);
      setCoverage(res.coverage);
      setQualityAnalysis(res.qualityAnalysis);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [planId, addToast]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Real-time collaboration polling
  useEffect(() => {
    if (!planId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const update = await api.getPlanUpdates(planId);
        if (plan && update.lastModified && new Date(update.lastModified) > new Date(plan.updated_at)) {
          addToast('QA Plan was updated by another team member. Synchronizing...', 'info');
          fetchPlan();
        }
      } catch (e) {
        // Silent poll error
      }
    }, 8000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [planId, plan, fetchPlan, addToast]);

  const updateTestCase = async (testId, updates) => {
    try {
      const res = await api.updateTestCase(planId, testId, updates);
      setPlan((prev) => {
        if (!prev) return prev;
        const updatedTests = prev.testCases.map((tc) => (tc.id === testId ? res.testCase : tc));
        return { ...prev, testCases: updatedTests };
      });
      setCoverage(res.coverage);
      setHasUnsavedChanges(true);
      addToast(`Test case status set to ${updates.status || 'updated'}`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const savePlan = async () => {
    try {
      const res = await api.savePlan(planId);
      setPlan((prev) => (prev ? { ...prev, status: 'reviewed' } : prev));
      setHasUnsavedChanges(false);
      addToast('QA plan saved & versioned successfully!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return {
    plan,
    coverage,
    qualityAnalysis,
    loading,
    error,
    hasUnsavedChanges,
    fetchPlan,
    updateTestCase,
    savePlan,
  };
}

export default usePlan;
