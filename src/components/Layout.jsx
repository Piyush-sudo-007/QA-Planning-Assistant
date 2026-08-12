import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, Terminal, LogOut, Bot } from 'lucide-react';
import Toast from './common/Toast';
import './Layout.css';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-badge">
            <Bot size={22} color="#fff" />
          </div>
          <span className="logo-text">QA Planner</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <PlusCircle size={18} />
            <span>New QA Plan</span>
          </NavLink>

          <NavLink to="/logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Terminal size={18} />
            <span>AI & System Logs</span>
          </NavLink>
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
              <div className="user-name">{user.name || user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-ghost"
              style={{ padding: '0.4rem', minWidth: 'auto' }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <Toast />
    </div>
  );
}

export default Layout;
