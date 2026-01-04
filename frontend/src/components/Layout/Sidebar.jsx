import { Capacitor } from '@capacitor/core';
import {
  LayoutDashboard,
  Users,
  Banknote,
  CalendarClock,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Network,
  FileBox,
  BarChart3,
  CalendarDays,
  Receipt,
  User,
  MessageCircle
} from 'lucide-react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Employer', 'Employee'] },
  { label: 'My Profile', icon: User, path: '/profile', roles: ['Employee'] },
  { label: 'Chat', icon: MessageCircle, path: '/chat', roles: ['Employer', 'Employee'] },
  { label: 'Attendance Log', icon: CalendarClock, path: '/attendance', roles: ['Employer', 'Employee'] },
  { label: 'Employees', icon: Users, path: '/employees', roles: ['Employer'] },
  { label: 'Payroll', icon: Banknote, path: '/payroll', roles: ['Employer', 'Employee'] },
  { label: 'Organization', icon: Network, path: '/organization', roles: ['Employer'] },
  { label: 'Recruitment', icon: Briefcase, path: '/recruitment', roles: ['Employer'] },
  { label: 'Reports', icon: FileText, path: '/reports', roles: ['Employer'] },
  { label: 'Leave Management', icon: CalendarDays, path: '/leave', roles: ['Employer', 'Employee'] },
  { label: 'Expense Claims', icon: Receipt, path: '/expenses', roles: ['Employer', 'Employee'] },
  { label: 'Documents', icon: FileBox, path: '/documents', roles: ['Employer', 'Employee'] },
];

import { API_BASE_URL } from '../../config';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    pending_leaves: 0,
    pending_expenses: 0,
    new_candidates: 0
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Poll for real-time updates ( Badges )
  useEffect(() => {
    if (user?.role !== 'Employer') return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('ys_token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats({
            pending_leaves: data.pending_leaves || 0,
            pending_expenses: data.pending_expenses || 0,
            new_candidates: data.new_candidates || 0 // or new_candidates
          });
        }
      } catch (error) {
        // Silent fail for sidebar stats
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, [user]);



  // Filter items based on user role
  const filteredItems = NAV_ITEMS.filter(item => {
    // Mobile App Check: Only show Chat
    if (Capacitor.isNativePlatform()) {
      return item.path === '/chat';
    }

    return !user?.role || item.roles.includes(user.role);
  });

  const getBadgeCount = (path) => {
    if (user?.role !== 'Employer') return null;
    switch (path) {
      case '/leave': return stats.pending_leaves;
      case '/expenses': return stats.pending_expenses;
      case '/recruitment': return stats.new_candidates;
      default: return null;
    }
  };

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <Link to="/dashboard" className="logo-container">
          <div className="logo-icon">YS</div>
          <span className="logo-text text-gradient">YS HR</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {filteredItems.map((item) => {
          // Show different label for attendance based on role
          let displayLabel = item.label;
          if (item.path === '/attendance') {
            displayLabel = user?.role === 'Employee' ? 'Attendance' : 'Attendance Log';
          }

          const badgeCount = getBadgeCount(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{displayLabel}</span>
              {badgeCount > 0 && (
                <span className="nav-badge animate-pulse-slow">{badgeCount}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {!Capacitor.isNativePlatform() && (
        <div className="sidebar-footer">
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </div>
      )}

      <style>{`
        .sidebar {
          width: 270px;
          height: 100vh;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 50;
          transition: transform 0.3s ease;
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }

        .sidebar-header {
          padding: 24px 32px;
          height: 80px;
          display: flex;
          align-items: center;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--grad-primary);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
        }

        .logo-text {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          color: var(--slate-500);
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.95rem;
          font-weight: 600;
          position: relative;
        }

        .nav-item:hover {
          background-color: var(--slate-50);
          color: var(--slate-900);
          transform: translateX(4px);
        }

        .nav-item.active {
          background-color: var(--primary-50);
          color: var(--primary-600);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 20px;
          background: var(--primary-600);
          border-radius: 0 4px 4px 0;
        }
        
        .nav-badge {
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
          margin-left: auto;
          box-shadow: 0 2px 5px rgba(239, 68, 68, 0.3);
          min-width: 20px;
          text-align: center;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid var(--border-subtle);
        }
      `}</style>
    </aside>
  );
}
