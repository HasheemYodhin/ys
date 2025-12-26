import Sidebar from './Sidebar';
import { Bell, Search, UserCircle, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

        <div className="profile-container">
          <div
            className="user-profile-trigger"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-info">
              <span className="user-name">
                {user?.name || "User"}
              </span>
              <span className="user-role">
                {user?.role === 'Employer' ? 'Employer Account' : 'Employee Account'}
              </span>
            </div>
            <div className="avatar-wrapper">
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt="Profile" className="user-avatar-img" />
              ) : (
                <UserCircle size={36} strokeWidth={1.5} className="user-avatar" />
              )}
              <ChevronDown size={14} className={`dropdown-arrow ${showDropdown ? 'open' : ''}`} />
            </div>
          </div>

          {showDropdown && (
            <div className="profile-dropdown glass">
              <div className="dropdown-header">
                <p className="dropdown-user-name">{user?.name}</p>
                <p className="dropdown-user-email">{user?.email}</p>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <User size={16} />
                <span>My Profile</span>
              </Link>
              <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <Settings size={16} />
                <span>Settings</span>
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
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

        .profile-container {
          position: relative;
        }

        .user-profile-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .user-profile-trigger:hover {
          background: var(--slate-50);
        }

        .user-info {
          text-align: right;
        }

        .user-name {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-main);
          line-height: 1.2;
        }

        .user-role {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .avatar-wrapper {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .user-avatar {
          color: var(--slate-400);
        }

        .user-avatar-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .dropdown-arrow {
          color: var(--slate-400);
          transition: transform 0.2s;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 220px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
          border: 1px solid var(--border-color);
          overflow: hidden;
          padding: 8px;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 12px 16px;
        }

        .dropdown-user-name {
          font-weight: 700;
          color: var(--slate-900);
          font-size: 0.95rem;
        }

        .dropdown-user-email {
          font-size: 0.8rem;
          color: var(--slate-500);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-color);
          margin: 8px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          color: var(--slate-600);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .dropdown-item:hover {
          background: var(--slate-50);
          color: var(--primary-600);
        }

        .logout-item {
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
          color: #ef4444;
        }

        .logout-item:hover {
          background: #fff1f2;
          color: #be123c;
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
