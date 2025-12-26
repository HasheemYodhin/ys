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
  ReceiptRussianRuble
} from 'lucide-react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['HR', 'Employee'] },
  { label: 'Employees', icon: Users, path: '/employees', roles: ['HR'] },
  { label: 'Payroll', icon: Banknote, path: '/payroll', roles: ['HR', 'Employee'] },
  { label: 'Leave', icon: CalendarDays, path: '/leave', roles: ['HR', 'Employee'] },
  { label: 'Attendance', icon: CalendarClock, path: '/attendance', roles: ['HR', 'Employee'] },
  { label: 'Expenses', icon: ReceiptRussianRuble, path: '/expenses', roles: ['HR', 'Employee'] },
  { label: 'Recruitment', icon: Briefcase, path: '/recruitment', roles: ['HR', 'Employee'] },
  { label: 'Documents', icon: FileBox, path: '/documents', roles: ['HR', 'Employee'] },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['HR'] },
  { label: 'Reports', icon: FileText, path: '/reports', roles: ['HR', 'Employee'] },
  { label: 'Organization', icon: Network, path: '/organization', roles: ['HR', 'Employee'] },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <Link to="/dashboard" className="logo-container">
          <div className="logo-icon">YS</div>
          <span className="logo-text text-gradient">YS HR</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 50;
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid transparent; /* Cleaner look */
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .logo-container:hover {
          transform: scale(1.02);
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: var(--primary-600);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.5px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--text-muted);
          text-decoration: none;
          border-radius: 8px;
          transition: all var(--transition-fast);
          font-size: 0.95rem;
          font-weight: 500;
        }

        .nav-item:hover {
          background-color: var(--slate-100);
          color: var(--text-main);
        }

        .nav-item.active {
          background-color: var(--primary-50);
          color: var(--primary-700);
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .logout-btn {
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
        }
      `}</style>
    </aside>
  );
}
