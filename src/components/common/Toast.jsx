import React from 'react';
import { useToast } from '../../hooks/useToast';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '400px',
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarn = toast.type === 'warning';

        const borderColor = isSuccess ? 'var(--success)' : isError ? 'var(--error)' : isWarn ? 'var(--warning)' : 'var(--info)';
        const Icon = isSuccess ? CheckCircle : isError ? XCircle : isWarn ? AlertTriangle : Info;

        return (
          <div
            key={toast.id}
            className="glass-card"
            style={{
              padding: '0.85rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              borderLeft: `4px solid ${borderColor}`,
              animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Icon size={20} color={borderColor} />
            <div style={{ flex: 1, fontSize: '0.9rem' }}>{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="btn btn-ghost"
              style={{ padding: '0.2rem', minWidth: 'auto' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toast;
