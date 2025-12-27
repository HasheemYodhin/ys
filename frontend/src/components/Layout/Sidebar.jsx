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
  ReceiptRussianRuble,
  User
} from 'lucide-react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Employer', 'Employee'] },
  { label: 'My Profile', icon: User, path: '/profile', roles: ['Employee'] },
  { label: 'Attendance', icon: CalendarClock, path: '/attendance', roles: ['Employer', 'Employee'] },
  { label: 'Employees', icon: Users, path: '/employees', roles: ['Employer'] },
  { label: 'Payroll', icon: Banknote, path: '/payroll', roles: ['Employer', 'Employee'] },
  { label: 'Organization', icon: Network, path: '/organization', roles: ['Employer'] },
  { label: 'Recruitment', icon: Briefcase, path: '/recruitment', roles: ['Employer'] },
  { label: 'Reports', icon: FileText, path: '/reports', roles: ['Employer'] },
  { label: 'Leave Management', icon: CalendarDays, path: '/leave', roles: ['Employer', 'Employee'] },
  { label: 'Expense Claims', icon: ReceiptRussianRuble, path: '/expenses', roles: ['Employer', 'Employee'] },
  { label: 'Documents', icon: FileBox, path: '/documents', roles: ['Employer', 'Employee'] },
  { label: 'View Analytics', icon: BarChart3, path: '/analytics', roles: ['Employer'] },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter items based on user role
  const filteredItems = NAV_ITEMS.filter(item =>
    !user?.role || item.roles.includes(user.role)
  );

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
      </div>

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
          transition: width 0.3s ease;
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

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid var(--border-subtle);
        }
      `}</style>
    </aside>
  );
}
