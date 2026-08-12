import React from 'react';
import { FileQuestion } from 'lucide-react';
import Button from './Button';

export function EmptyState({
  title = 'No Data Found',
  description = 'There are no items to display right now.',
  icon: Icon = FileQuestion,
  actionLabel = null,
  onAction = null,
}) {
  return (
    <div
      className="glass-card"
      style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={32} color="var(--primary-hover)" />
      </div>
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px' }}>
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} style={{ marginTop: '0.5rem' }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
