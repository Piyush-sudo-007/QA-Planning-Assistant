import React from 'react';

export function Spinner({ size = 'md', color = 'var(--primary)' }) {
  const sizePx = size === 'sm' ? '16px' : size === 'lg' ? '32px' : '24px';

  return (
    <div
      style={{
        width: sizePx,
        height: sizePx,
        border: `2px solid rgba(255, 255, 255, 0.1)`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
      }}
    />
  );
}

export default Spinner;
