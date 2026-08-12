import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { Bot, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import Button from './common/Button';
import './AuthForms.css';

export function AuthForms({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      addToast('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        addToast('Welcome back!', 'success');
      } else {
        await register(email, name, password);
        addToast('Account registered successfully!', 'success');
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="logo-badge" style={{ width: '48px', height: '48px', margin: '0 auto 1rem auto' }}>
            <Bot size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
            {isLogin ? 'Sign In to QA Planner' : 'Create Developer Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Agentic AI Quality Assurance & Test Case Planning
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Developer Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="developer@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            type="submit"
            loading={loading}
            icon={isLogin ? LogIn : UserPlus}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {isLogin ? 'Sign In' : 'Register Account'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem' }}
          >
            {isLogin ? "Don't have an account? Register" : 'Already registered? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthForms;
