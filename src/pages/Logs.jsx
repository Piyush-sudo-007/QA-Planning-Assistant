import React from 'react';
import LogViewer from '../components/LogViewer';
import './Logs.css';

export function Logs() {
  return (
    <div className="logs-page-container">
      <div style={{ marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>AI Agent & System Telemetry Logs</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Inspect structured LLM prompt execution, token consumption, execution latency, and backend log streams.
        </p>
      </div>

      <LogViewer />
    </div>
  );
}

export default Logs;
