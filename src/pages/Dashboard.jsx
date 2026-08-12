import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { PlusCircle, FileText, CheckCircle2, ShieldCheck, Trash2, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { formatDate, truncateText } from '../utils/helpers';
import './Dashboard.css';

export function Dashboard() {
  const { projects, loading, deleteProject } = useProjects();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading QA Projects...</p>
      </div>
    );
  }

  const totalProjects = projects.length;
  const avgCoverage = projects.length
    ? Math.round(projects.reduce((acc, p) => acc + (p.latest_coverage || 0), 0) / projects.length)
    : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Developer QA Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage feature requirements, generated test plans, and acceptance criteria coverage.
          </p>
        </div>
        <Button variant="primary" size="md" icon={PlusCircle} onClick={() => navigate('/new')}>
          Create New QA Plan
        </Button>
      </div>

      <div className="stats-bar">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
            <FileText size={24} color="var(--primary-hover)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total QA Projects</span>
            <h3 style={{ fontSize: '1.5rem' }}>{totalProjects}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-sm)' }}>
            <ShieldCheck size={24} color="var(--success)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average AC Coverage</span>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--success)' }}>{avgCoverage}%</h3>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No QA Plans Generated Yet"
          description="Submit your first feature requirement and implementation summary to trigger the AI Agent."
          actionLabel="Create First QA Plan"
          onAction={() => navigate('/new')}
        />
      ) : (
        <div className="dashboard-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card project-card"
              onClick={() => {
                if (project.latest_plan_id) {
                  navigate(`/plan/${project.latest_plan_id}`);
                }
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{project.name}</h3>
                  {project.latest_status && <Badge variant={project.latest_status}>{project.latest_status}</Badge>}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {truncateText(project.requirement, 110)}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    Version {project.latest_version || 1} • {formatDate(project.updated_at)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                    {project.latest_coverage || 0}% Coverage
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this QA project?')) deleteProject(project.id);
                    }}
                    className="btn btn-ghost"
                    style={{ padding: '0.3rem', color: 'var(--error)' }}
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                  <Button variant="ghost" size="sm" icon={ArrowRight} style={{ padding: '0.3rem' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
