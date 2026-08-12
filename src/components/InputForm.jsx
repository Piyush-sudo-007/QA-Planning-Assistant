import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, FileText, CheckSquare, Code2 } from 'lucide-react';
import Button from './common/Button';
import './InputForm.css';

export function InputForm({ onSubmit, loading = false }) {
  const [name, setName] = useState('');
  const [requirement, setRequirement] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(['']);
  const [implementationSummary, setImplementationSummary] = useState('');
  const [errors, setErrors] = useState({});

  const handleAcChange = (index, value) => {
    const updated = [...acceptanceCriteria];
    updated[index] = value;
    setAcceptanceCriteria(updated);
  };

  const addAcField = () => {
    setAcceptanceCriteria([...acceptanceCriteria, '']);
  };

  const removeAcField = (index) => {
    if (acceptanceCriteria.length <= 1) return;
    setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Project title is required';
    if (!requirement.trim() || requirement.trim().length < 15) {
      errs.requirement = 'Requirement must be at least 15 characters long';
    }
    if (!implementationSummary.trim() || implementationSummary.trim().length < 15) {
      errs.implementationSummary = 'Implementation summary must be at least 15 characters long';
    }

    const validAcs = acceptanceCriteria.filter((ac) => ac.trim().length > 0);
    if (validAcs.length === 0) {
      errs.acceptanceCriteria = 'At least one acceptance criterion is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const validAcs = acceptanceCriteria.filter((ac) => ac.trim().length > 0);
    onSubmit({
      name: name.trim(),
      requirement: requirement.trim(),
      acceptanceCriteria: validAcs,
      implementationSummary: implementationSummary.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="input-form-container">
      <div className="glass-card">
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} color="var(--primary-hover)" /> Feature / Project Title
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. User Authentication & OAuth2 Integration"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} color="var(--primary-hover)" /> User Story / Requirement Description
          </label>
          <textarea
            className="form-control"
            rows={4}
            placeholder="Describe the user requirement, feature goals, and target behavior..."
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
          />
          {errors.requirement && <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{errors.requirement}</span>}
        </div>
      </div>

      <div className="glass-card">
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
              <CheckSquare size={16} color="var(--primary-hover)" /> Acceptance Criteria
            </label>
            <Button variant="ghost" size="sm" onClick={addAcField} type="button" icon={Plus}>
              Add Criterion
            </Button>
          </div>

          {acceptanceCriteria.map((ac, idx) => (
            <div key={idx} className="ac-item">
              <span className="ac-index">AC{idx + 1}</span>
              <input
                type="text"
                className="form-control"
                placeholder={`Acceptance criterion ${idx + 1}...`}
                value={ac}
                onChange={(e) => handleAcChange(idx, e.target.value)}
              />
              {acceptanceCriteria.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAcField(idx)}
                  className="btn btn-ghost"
                  style={{ color: 'var(--error)', padding: '0.4rem' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {errors.acceptanceCriteria && (
            <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{errors.acceptanceCriteria}</span>
          )}
        </div>
      </div>

      <div className="glass-card">
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={16} color="var(--primary-hover)" /> Implementation or Change Summary
          </label>
          <textarea
            className="form-control"
            rows={4}
            placeholder="Technical implementation details, changed APIs, modified database tables, or architecture updates..."
            value={implementationSummary}
            onChange={(e) => setImplementationSummary(e.target.value)}
          />
          {errors.implementationSummary && (
            <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{errors.implementationSummary}</span>
          )}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" size="lg" type="submit" loading={loading} icon={Sparkles}>
            Generate QA Plan with AI Agent
          </Button>
        </div>
      </div>
    </form>
  );
}

export default InputForm;
