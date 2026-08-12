import React, { useState } from 'react';
import { Check, X, Edit3, ChevronDown, ChevronUp, AlertCircle, HelpCircle } from 'lucide-react';
import Badge from './common/Badge';
import Button from './common/Button';
import { TEST_TYPES, PRIORITIES, CATEGORIES } from '../utils/constants';
import './TestCaseCard.css';

export function TestCaseCard({ testCase, onStatusChange, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(testCase.title);
  const [editDescription, setEditDescription] = useState(testCase.description);
  const [editPriority, setEditPriority] = useState(testCase.priority);
  const [editNotes, setEditNotes] = useState(testCase.developer_notes || '');

  const typeInfo = TEST_TYPES[testCase.type] || TEST_TYPES.manual;
  const priorityInfo = PRIORITIES[testCase.priority] || PRIORITIES.medium;
  const categoryInfo = CATEGORIES[testCase.category] || CATEGORIES.happy_path;

  const mappedCriteria = Array.isArray(testCase.mapped_criteria)
    ? testCase.mapped_criteria
    : JSON.parse(testCase.mapped_criteria || '[]');

  const steps = Array.isArray(testCase.steps)
    ? testCase.steps
    : JSON.parse(testCase.steps || '[]');

  const handleSaveEdit = () => {
    onStatusChange(testCase.id, {
      status: 'edited',
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      developerNotes: editNotes,
    });
    setIsEditing(false);
  };

  return (
    <div className={`glass-card test-case-card status-${testCase.status}`}>
      <div className="test-header">
        <div className="test-title-area">
          <Badge style={{ background: `${typeInfo.color}22`, color: typeInfo.color, border: `1px solid ${typeInfo.color}44` }}>
            {typeInfo.label}
          </Badge>
          <Badge variant={priorityInfo.badgeClass}>{priorityInfo.label}</Badge>
          <Badge variant={testCase.status}>{testCase.status}</Badge>

          {testCase.is_duplicate === 1 && (
            <Badge variant="rejected">
              <AlertCircle size={12} /> Duplicate
            </Badge>
          )}
          {testCase.is_incomplete === 1 && (
            <Badge variant="proposed">
              <AlertCircle size={12} /> Incomplete
            </Badge>
          )}
        </div>

        <div className="test-actions">
          {testCase.status !== 'approved' && (
            <Button
              variant="secondary"
              size="sm"
              style={{ color: 'var(--success)' }}
              onClick={() => onStatusChange(testCase.id, { status: 'approved' })}
              title="Approve test case"
            >
              <Check size={16} /> Approve
            </Button>
          )}
          {testCase.status !== 'rejected' && (
            <Button
              variant="secondary"
              size="sm"
              style={{ color: 'var(--error)' }}
              onClick={() => onStatusChange(testCase.id, { status: 'rejected' })}
              title="Reject test case"
            >
              <X size={16} /> Reject
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            title="Edit test details"
          >
            <Edit3 size={16} />
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <textarea
            className="form-control"
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Priority:</label>
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Add developer notes or justifications..."
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>{testCase.title}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{testCase.description}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mapped ACs:</span>
            {mappedCriteria.map((acIdx) => (
              <span key={acIdx} className="ac-mapped-chip">
                AC{acIdx + 1}
              </span>
            ))}
          </div>

          {testCase.relevance && (
            <div className="test-relevance">
              <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                Why this test is relevant:
              </strong>
              {testCase.relevance}
            </div>
          )}

          {steps.length > 0 && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="btn btn-ghost"
                style={{ padding: '0.2rem 0', fontSize: '0.82rem', color: 'var(--primary-hover)' }}
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expanded ? 'Hide Steps & Expected Results' : `View ${steps.length} Test Steps`}
              </button>

              {expanded && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Steps:</strong>
                  <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {steps.map((step, idx) => (
                      <li key={idx} style={{ marginBottom: '0.2rem' }}>{step}</li>
                    ))}
                  </ol>
                  {testCase.expected_result && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Expected Result:</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>{testCase.expected_result}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TestCaseCard;
