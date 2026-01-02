import Sidebar from './Sidebar';
import { Bell, Search, UserCircle, LogOut, User, ChevronDown, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
  const { user, logout, notifications } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
        <div className="notification-container">
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown glass">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <span className="count">{notifications.length} New</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      to="/notifications"
                      className="notification-item"
                      onClick={() => setShowNotifications(false)}
                    >
                      <div className="notif-icon reset">
                        <LogOut size={16} />
                      </div>
                      <div className="notif-content">
                        <p className="notif-text">
                          <strong>{notif.user_name}</strong> {notif.message}
                        </p>
                        <span className="notif-time">{notif.created_at}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="notif-empty">
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/notifications" className="dropdown-view-all" onClick={() => setShowNotifications(false)}>
                View All Notifications
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>

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
          height: 80px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .header-search {
          position: relative;
          width: 400px;
          transition: width 0.3s ease;
        }
        
        .header-search:focus-within {
          width: 450px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--slate-400);
        }

        .search-input {
          width: 100%;
          height: 48px;
          padding-left: 48px;
          padding-right: 20px;
          border-radius: var(--radius-full);
          border: 1px solid transparent;
          background: var(--slate-100);
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          background: white;
          border-color: var(--primary-300);
          box-shadow: 0 0 0 4px var(--primary-50);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .icon-btn {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: var(--slate-500);
          transition: all 0.2s;
        }
        
        .icon-btn:hover {
          background: var(--slate-100);
          color: var(--primary-600);
          transform: translateY(-2px);
        }

        .badge {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--accent-rose);
          color: white;
          font-size: 11px;
          font-weight: 800;
          height: 18px;
          min-width: 18px;
          padding: 0 5px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(244, 63, 94, 0.3);
        }

        .user-profile-trigger {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 6px 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-profile-trigger:hover {
          background: var(--slate-50);
        }

        .user-info {
          text-align: right;
        }

        .user-name {
          display: block;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.2;
        }

        .user-role {
          display: block;
          font-size: 0.8rem;
          color: var(--slate-500);
          font-weight: 500;
        }

        .avatar-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-avatar-img {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: var(--shadow-md);
        }
        
        .user-avatar {
          color: var(--slate-400);
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 14px);
          right: 0;
          width: 260px;
          background: white;
          border-radius: 20px;
          box-shadow: var(--shadow-float);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
          padding: 12px;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 16px;
          background: var(--slate-50);
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .dropdown-user-name {
          font-weight: 700;
          color: var(--slate-900);
          font-size: 1rem;
        }

        .dropdown-user-email {
          font-size: 0.85rem;
          color: var(--slate-500);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 8px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--slate-600);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .dropdown-item:hover {
          background: var(--slate-50);
          color: var(--primary-600);
          transform: translateX(4px);
        }

        .logout-item {
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--accent-rose);
        }

        .logout-item:hover {
          background: #fff1f2;
          color: #be123c;
        }

        .notification-container {
          position: relative;
        }

        .notifications-dropdown {
          position: absolute;
          top: calc(100% + 14px);
          right: 0;
          width: 320px;
          background: white;
          border-radius: 20px;
          box-shadow: var(--shadow-float);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
          padding: 12px;
          animation: slideDown 0.2s ease-out;
          z-index: 1000;
        }

        .notifications-dropdown .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
        }

        .notifications-dropdown .dropdown-header h3 {
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
        }

        .notifications-dropdown .count {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary-600);
          background: var(--primary-50);
          padding: 4px 10px;
          border-radius: 99px;
        }

        .notifications-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }

        .notification-item:hover {
          background: var(--slate-50);
        }

        .notif-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notif-icon.reset {
          background: #fff1f2;
          color: #e11d48;
        }

        .notif-content {
          flex: 1;
        }

        .notif-text {
          font-size: 0.85rem;
          margin: 0;
          line-height: 1.4;
          color: var(--slate-700);
        }

        .notif-time {
          font-size: 0.75rem;
          color: var(--slate-400);
          margin-top: 4px;
          display: block;
        }

        .notif-empty {
          padding: 40px 20px;
          text-align: center;
          color: var(--slate-400);
          font-size: 0.9rem;
        }
      `}</style>
    </header>
  );
};

export default function Layout({ children }) {
  const { user } = useAuth();
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
          background-color: var(--bg-body);
        }

        .main-content {
          flex: 1;
          margin-left: 270px; /* Aligned with Sidebar width */
          display: flex;
          flex-direction: column;
          min-width: 0; /* Prevent flex overflow */
        }

        .page-content {
          padding: 40px;
          flex: 1;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
