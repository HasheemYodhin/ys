import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  UserPlus,
  Clock,
  Filter,
  Calendar,
  Briefcase,
  Zap,
  MoreHorizontal,
  DollarSign,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AddEmployeeModal from './Employees/AddEmployeeModal';

const StatCard = ({ title, value, change, trend, icon: Icon, colorClass }) => (
  <div className="card stat-card ">
    <div className="flex justify-between items-start mb-4">
      <div className={`icon-wrapper ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className={`trend-badge ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {change}
      </div>
    </div>
    <div>
      <h3 className="stat-value">{value}</h3>
      <p className="stat-title">{title}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, color, onClick }) => (
  <button className="quick-action-btn" onClick={onClick}>
    <div className="action-icon" style={{ backgroundColor: color }}>
      <Icon size={20} />
    </div>
    <span>{label}</span>
  </button>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total_employees: 0,
    active_jobs: 0,
    on_leave: 0,
    performance: 0,
    attendance: { present: 0, absent: 0, on_leave: 0 }
  });

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Failed to fetch dashboard stats", err));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'User';

  const handleEmployeeAdded = (newEmployee) => {
    // Refresh stats
    setStats(prev => ({
      ...prev,
      total_employees: prev.total_employees + 1
    }));
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {firstName}. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2" onClick={() => alert("Filter feature coming soon")}>
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="btn-premium" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Employees"
          value={stats.total_employees}
          change="+12%"
          trend="up"
          icon={Users}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Active Jobs"
          value={stats.active_jobs}
          change="+0"
          trend="up"
          icon={Briefcase}
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="On Leave"
          value={stats.on_leave}
          change="Today"
          trend="down"
          icon={Clock}
          colorClass="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Performance"
          value={`${stats.performance}%`}
          change="+5%"
          trend="up"
          icon={Zap}
          colorClass="bg-green-50 text-green-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Left Column */}
        <div className="main-section flex flex-col gap-6">

          {/* Attendance Overview */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title">Attendance Overview</h2>
              <select className="mini-select">
                <option>Today</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-2">
              <div className="attendance-metric">
                <span className="metric-value text-slate-900">{stats.attendance.present}</span>
                <span className="metric-label text-green-600">Present</span>
                <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${stats.total_employees ? (stats.attendance.present / stats.total_employees) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div className="attendance-metric">
                <span className="metric-value text-slate-900">{stats.attendance.absent}</span>
                <span className="metric-label text-red-500">Absent</span>
                <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${stats.total_employees ? (stats.attendance.absent / stats.total_employees) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div className="attendance-metric">
                <span className="metric-value text-slate-900">{stats.attendance.on_leave}</span>
                <span className="metric-label text-orange-500">On Leave</span>
                <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${stats.total_employees ? (stats.attendance.on_leave / stats.total_employees) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title">Recent Activity</h2>
              <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</button>
            </div>
            <div className="flex flex-col gap-6">
              {[
                { user: 'Sarah Smith', action: 'applied for leave', time: '2 mins ago', color: 'bg-blue-500' },
                { user: 'John Doe', action: 'completed onboarding', time: '1 hour ago', color: 'bg-green-500' },
                { user: 'Mike Johnson', action: 'updated project status', time: '3 hours ago', color: 'bg-purple-500' }
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${activity.color}`}></div>
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-bold text-slate-900">{activity.user}</span> {activity.action}
                    </p>
                    <span className="text-xs text-slate-400 font-medium">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="side-section flex flex-col gap-6">

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="card-title mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction icon={UserPlus} label="New Hire" color="#eff6ff" onClick={() => setIsModalOpen(true)} />
              <QuickAction icon={Calendar} label="Time Off" color="#fff7ed" onClick={() => alert("Leave Management Coming Soon")} />
              <QuickAction icon={Briefcase} label="Post Job" color="#faf5ff" onClick={() => alert("Recruitment Coming Soon")} />
              <QuickAction icon={FileText} label="Reports" color="#f0fdf4" onClick={() => alert("Reports Coming Soon")} />
            </div>
          </div>

          {/* Leave Balance */}
          <div className="card p-6">
            <h2 className="card-title mb-4">Leave Balance</h2>
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-600">Paid Leave</span>
                  <span className="text-sm font-bold text-slate-900">12/20</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500" style={{ width: '60%', boxShadow: '0 0 10px rgba(59,130,246,0.4)' }}></div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-600">Sick Leave</span>
                  <span className="text-sm font-bold text-slate-900">8/12</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '75%', boxShadow: '0 0 10px rgba(34,197,94,0.4)' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Events</h2>
              <button className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex flex-col items-center justify-center border border-primary-100 group-hover:border-primary-200">
                  <span className="text-xs font-bold text-primary-600 uppercase">Dec</span>
                  <span className="text-lg font-black text-slate-900 leading-none">24</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Annual Brunch</h4>
                  <p className="text-xs text-slate-500 mt-1">11:30 AM • Hall A</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex flex-col items-center justify-center border border-purple-100 group-hover:border-purple-200">
                  <span className="text-xs font-bold text-purple-600 uppercase">Dec</span>
                  <span className="text-lg font-black text-slate-900 leading-none">28</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Strategy Meet</h4>
                  <p className="text-xs text-slate-500 mt-1">2:00 PM • Virtual</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {isModalOpen && (
        <AddEmployeeModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleEmployeeAdded}
        />
      )}

      <style>{`
        .dashboard-container {
            max-width: 100%;
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 32px;
        }

        .page-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--slate-900);
            letter-spacing: -0.03em;
            line-height: 1.1;
        }

        .page-subtitle {
            margin-top: 8px;
            color: var(--slate-500);
            font-size: 1.05rem;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            margin-bottom: 32px;
        }

        .stat-card {
            padding: 24px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }

        .icon-wrapper {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .bg-blue-50 { background: #eff6ff; }
        .text-blue-600 { color: #2563eb; }
        
        .bg-purple-50 { background: #faf5ff; }
        .text-purple-600 { color: #9333ea; }
        
        .bg-orange-50 { background: #fff7ed; }
        .text-orange-600 { color: #ea580c; }
        
        .bg-green-50 { background: #f0fdf4; }
        .text-green-600 { color: #16a34a; }

        .trend-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 6px 10px;
            border-radius: 100px;
        }

        .trend-up { background: #dcfce7; color: #16a34a; }
        .trend-down { background: #fee2e2; color: #dc2626; }

        .stat-value {
            font-size: 2rem;
            font-weight: 800;
            color: var(--slate-900);
            letter-spacing: -0.02em;
            line-height: 1;
            margin-bottom: 4px;
        }

        .stat-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--slate-500);
        }

        /* Content Grid */
        .content-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
        }

        .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--slate-900);
        }

        .mini-select {
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid var(--slate-200);
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--slate-600);
            background: white;
            cursor: pointer;
            outline: none;
        }

        .attendance-metric {
            text-align: center;
            padding: 16px;
            background: var(--slate-50);
            border-radius: 16px;
            border: 1px solid var(--slate-100);
        }

        .metric-value {
            display: block;
            font-size: 1.5rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 4px;
        }

        .metric-label {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Quick Actions */
        .quick-action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 16px;
            background: var(--slate-50);
            border: 1px solid var(--slate-200);
            border-radius: 16px;
            transition: all 0.2s;
            height: 110px;
        }

        .quick-action-btn:hover {
            background: white;
            border-color: var(--primary-400);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .action-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--slate-700);
        }

        .quick-action-btn span {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--slate-700);
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .content-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
    </div>
  );
}
