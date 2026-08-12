import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import api from '../api/client';
import InputForm from '../components/InputForm';
import Spinner from '../components/common/Spinner';
import { CheckCircle2, Bot, Database, Sparkles, ShieldCheck } from 'lucide-react';
import './NewPlan.css';

export function NewPlan() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { createProject } = useProjects();
  const navigate = useNavigate();

  const steps = [
    { label: 'Retrieving QA standards from Knowledge Base', icon: Database },
    { label: 'Analyzing requirement & acceptance criteria', icon: Bot },
    { label: 'Generating multi-tier test cases & edge cases', icon: Sparkles },
    { label: 'Calculating acceptance criteria coverage', icon: ShieldCheck },
  ];

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setCurrentStep(0);

    // Simulate multi-step UI animation while backend executes
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      // 1. Create project
      const project = await createProject(formData);

      // 2. Trigger AI Generation
      const planResult = await api.generatePlan(project.id);

      clearInterval(interval);
      setCurrentStep(3);

      setTimeout(() => {
        navigate(`/plan/${planResult.plan.id}`);
      }, 600);
    } catch (err) {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="new-plan-container">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create QA Plan</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Input feature specifications. The AI Agent will cross-reference QA guidelines to generate unit, API, Playwright E2E, and manual test cases.
        </p>
      </div>

      {loading ? (
        <div className="glass-card ai-loading-modal">
          <div className="logo-badge" style={{ width: '64px', height: '64px', borderRadius: '50%', animation: 'pulseGlow 2s infinite' }}>
            <Bot size={36} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>AI QA Agent Orchestrating Plan</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Executing 5-stage retrieval-augmented workflow...
            </p>
          </div>

          <div className="step-indicator-list">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              const isDone = idx < currentStep;
              const isActive = idx === currentStep;

              return (
                <div key={idx} className={`step-item ${isDone ? 'completed' : isActive ? 'active' : ''}`}>
                  {isDone ? (
                    <CheckCircle2 size={18} color="var(--success)" />
                  ) : isActive ? (
                    <Spinner size="sm" />
                  ) : (
                    <Icon size={18} color="var(--text-muted)" />
                  )}
                  <span style={{ fontWeight: isActive ? 600 : 400 }}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <InputForm onSubmit={handleFormSubmit} loading={loading} />
      )}
    </div>
  );
}

export default NewPlan;
