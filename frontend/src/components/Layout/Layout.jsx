import Sidebar from './Sidebar';
import { Bell, Search, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search employees, tasks..." className="search-input" />
      </div>

      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        <Link to="/settings" className="user-profile">
          <div className="user-info">
            <span className="user-name">
              {user?.full_name || user?.name || (user?.email ? user.email.split('@')[0] : 'User')}
            </span>
            <span className="user-role">{user?.role === 'HR' ? 'HR Admin' : 'Employee Account'}</span>
          </div>
          <UserCircle size={32} strokeWidth={1.5} className="user-avatar" />
        </Link>
      </div>

      <style>{`
        .header {
          height: 72px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .header-search {
          position: relative;
          width: 320px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          height: 40px;
          padding-left: 38px;
          padding-right: 16px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--slate-50);
          font-size: 0.9rem;
          transition: all var(--transition-fast);
          outline: none;
        }

        .search-input:focus {
          background: white;
          border-color: var(--primary-300);
          box-shadow: 0 0 0 3px var(--primary-50);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          transition:  all var(--transition-fast);
        }
        
        .icon-btn:hover {
          background: var(--slate-50);
          color: var(--primary-600);
        }

        .badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 700;
          height: 16px;
          min-width: 16px;
          padding: 0 4px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 24px;
          border-left: 1px solid var(--border-color);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .user-profile:hover {
          opacity: 0.8;
        }

        .user-info {
          text-align: right;
        }

        .user-name {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .user-role {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .user-avatar {
          color: var(--slate-400);
        }
      `}</style>
    </header>
  );
};

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">
          {children}
        </main>
      </div>

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          margin-left: 260px; /* Aligned with Sidebar width */
          display: flex;
          flex-direction: column;
        }

        .page-content {
          padding: 32px;
          flex: 1;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
