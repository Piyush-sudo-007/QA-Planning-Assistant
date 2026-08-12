import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, Bot, FileText } from 'lucide-react';
import api from '../api/client';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { formatDate } from '../utils/helpers';
import './LogViewer.css';

export function LogViewer({ planId = null }) {
  const [logType, setLogType] = useState('ai'); // 'ai' or 'app'
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getLogs({ type: logType, planId, limit: 50 });
      setLogs(res.logs || []);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [logType, planId]);

  return (
    <div className="glass-card log-viewer-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Terminal size={20} color="var(--primary-hover)" />
          <h3 style={{ fontSize: '1.1rem' }}>Structured Logs & AI Workflow Telemetry</h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant={logType === 'ai' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setLogType('ai')}
            icon={Bot}
          >
            AI Agent Logs
          </Button>
          <Button
            variant={logType === 'app' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setLogType('app')}
            icon={FileText}
          >
            System Logs
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchLogs} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="log-terminal">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Spinner size="md" />
            <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Loading logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No logs recorded yet.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="log-line">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>
                  [{logType === 'ai' ? log.step : log.level.toUpperCase()}]
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {formatDate(log.created_at)}
                </span>
              </div>

              {logType === 'ai' ? (
                <div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    Model: <span style={{ color: 'var(--info)' }}>{log.model}</span> | Tokens:{' '}
                    <span style={{ color: 'var(--warning)' }}>{log.tokens_used}</span> | Duration:{' '}
                    <span style={{ color: 'var(--success)' }}>{log.duration_ms}ms</span>
                  </div>
                  <button
                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-hover)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '0.2rem',
                    }}
                  >
                    {expandedLogId === log.id ? 'Hide JSON Telemetry' : 'View Payload Telemetry'}
                  </button>
                  {expandedLogId === log.id && (
                    <div style={{ marginTop: '0.5rem', background: '#000', padding: '0.5rem', borderRadius: '4px', overflowX: 'auto' }}>
                      <strong style={{ color: 'var(--text-secondary)', display: 'block' }}>Input Payload:</strong>
                      <pre style={{ color: '#a78bfa', fontSize: '0.75rem' }}>{log.input_data}</pre>
                      <strong style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>Output Response:</strong>
                      <pre style={{ color: '#34d399', fontSize: '0.75rem' }}>{log.output_data}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: log.level === 'error' ? 'var(--error)' : 'var(--text-primary)' }}>
                  {log.message}
                  {log.context && <pre style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.context}</pre>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LogViewer;
