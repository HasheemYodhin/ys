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
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddEmployeeModal from './Employees/AddEmployeeModal';

import AttendanceCheckIn from '../components/AttendanceCheckIn';
import { API_BASE_URL } from '../config';

const StatCard = ({ title, value, change, trend, icon: Icon, colorClass }) => (
  <div className="card stat-card glass animate-slide-up">
    <div className="flex justify-between items-start mb-4">
      <div className={`icon-wrapper ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div className={`trend-badge ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span>{change}</span>
      </div>
    </div>
    <div className="stat-content">
      <h3 className="stat-value">{value}</h3>
      <p className="stat-title">{title}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, color, onClick }) => (
  <button className="quick-action-btn glass-mini group" onClick={onClick}>
    <div className="action-icon" style={{ background: color }}>
      <Icon size={18} />
    </div>
    <span className="font-bold text-slate-700 group-hover:text-primary-600 transition-colors">{label}</span>
  </button>
);

const GlassTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 border border-white/40 shadow-xl backdrop-blur-xl rounded-2xl">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: payload[0].color || payload[0].fill }}></div>
          <p className="text-xl font-black text-slate-900">{payload[0].value}</p>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: 'all',
    dateRange: 'all',
    status: 'all'
  });
  const [stats, setStats] = useState({
    total_employees: 0,
    active_jobs: 0,
    on_leave: 0,
    performance: 0,
    attendance: { present: 0, absent: 0, on_leave: 0 },
    live_on_duty: [],
    pending_expenses: 0,
    new_candidates: 0,
    pending_leaves: 0,
    headcount_graph: [],
    dept_distribution: [],
    attendance_trend: []
  });

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.department !== 'all') params.append('department', filters.department);
      if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
      if (filters.status !== 'all') params.append('status', filters.status);

      const queryString = params.toString();
      const response = await fetch(`${API_BASE_URL}/dashboard/stats${queryString ? '?' + queryString : ''}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // 60s Real-time polling
    return () => clearInterval(interval);
  }, [filters]);

  const firstName = user?.name?.split(' ')[0] || 'User';

  const handleEmployeeAdded = (newEmployee) => {
    setStats(prev => ({
      ...prev,
      total_employees: prev.total_employees + 1
    }));
    setIsModalOpen(false);
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      department: 'all',
      dateRange: 'all',
      status: 'all'
    });
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
          {user?.role === 'Employer' && (
            <>
              <button className="btn-secondary flex items-center gap-2" onClick={() => setIsFilterOpen(true)}>
                <Filter size={18} />
                <span>Filter</span>
              </button>
              <button className="btn-premium" onClick={() => setIsModalOpen(true)}>
                <UserPlus size={18} />
                <span>Add Employee</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Employee Check-In Section */}
      {user?.role === 'Employee' && (
        <div className="mb-8">
          <AttendanceCheckIn
            employeeId={user?.id || user?._id}
            employeeName={user?.name}
          />
        </div>
      )}

      {/* Filter Modal */}
      {isFilterOpen && user?.role === 'Employer' && (
        <div className="modal-overlay" onClick={() => setIsFilterOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Filter Dashboard</h2>
              <button className="modal-close" onClick={() => setIsFilterOpen(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div className="space-y-4">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  >
                    <option value="all">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Employee Status</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="all">All Employees</option>
                    <option value="active">Active Only</option>
                    <option value="on_leave">On Leave</option>
                    <option value="new">New Joiners</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={resetFilters}>Reset</button>
              <button className="btn-primary" onClick={applyFilters}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid mb-8">
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
          value={stats.on_leave || 0}
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

      <div className="dashboard-main-grid">
        {/* Left Side: Analytics & Operation */}
        <div className="dash-left-column">
          {/* Headcount Graph */}
          <div className="card glass p-6 mb-6">
            <h2 className="card-title mb-6">Headcount Growth</h2>
            <div style={{ width: '100%', height: 300 }}>
              {stats.headcount_graph && stats.headcount_graph.length > 0 ? (
                <ResponsiveContainer>
                  <AreaChart data={stats.headcount_graph}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                    <Tooltip content={<GlassTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }} />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" animationDuration={1500} dot={{ fill: '#6366f1', stroke: '#fff', strokeWidth: 2, r: 4 }} activeDot={{ r: 8, strokeWidth: 0, fill: '#6366f1' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">Loading headcount data...</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Dept Distribution */}
            <div className="card glass p-6 relative">
              <h2 className="card-title mb-6">Department Distribution</h2>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={stats.dept_distribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {(stats.dept_distribution || []).map((entry, index) => {
                        const colors = ['#6366f1', '#2dd4bf', '#f43f5e', '#fbbf24', '#8b5cf6', '#ec4899'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />;
                      })}
                    </Pie>
                    <Tooltip content={<GlassTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Total Overlay */}
                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="block text-2xl font-black text-slate-900 leading-none">
                    {stats.dept_distribution?.reduce((acc, curr) => acc + curr.value, 0) || 0}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</span>
                </div>
              </div>
            </div>

            {/* Attendance Trend */}
            <div className="card glass p-6">
              <h2 className="card-title mb-6">Attendance Trend</h2>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={stats.attendance_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                    <Tooltip content={<GlassTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2dd4bf"
                      strokeWidth={4}
                      dot={{ fill: '#2dd4bf', stroke: '#fff', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#2dd4bf' }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Activity Wall */}
          <div className="card glass p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title">Live Activity Wall</h2>
              <button className="text-secondary">View Stream</button>
            </div>
            <div className="space-y-6">
              {(stats.recent_activities && stats.recent_activities.length > 0) ? (
                stats.recent_activities.map((activity, idx) => (
                  <div key={idx} className="activity-item-v2 flex gap-4 items-start">
                    <div className={`activity-dot ${activity.color?.replace('bg-', '')}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        <span className="font-bold text-slate-900">{activity.user}</span> {activity.action}
                      </p>
                      <span className="text-xs text-slate-400 font-medium">{activity.time}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-slate-400 text-sm">No activity recorded today.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Operations Hub & Live Wall */}
        <div className="dash-right-column space-y-6">
          {/* Approval Hub - High Alert Feature */}
          <div className="card glass border-l-4 border-primary-500 p-6">
            <h2 className="card-title mb-6 flex items-center gap-2">
              <Zap size={20} className="text-primary-500" />
              Approval Hub
            </h2>
            <div className="space-y-4">
              <div className="hub-item glass-mini p-4 flex justify-between items-center cursor-pointer hover:translate-x-1 transition-transform" onClick={() => navigate('/leave')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase letter-spacing-1">Leave Requests</p>
                    <p className="text-lg font-black text-slate-800">{stats.pending_leaves || 0} Pending</p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-slate-300" />
              </div>

              <div className="hub-item glass-mini p-4 flex justify-between items-center cursor-pointer hover:translate-x-1 transition-transform" onClick={() => navigate('/recruitment')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase letter-spacing-1">Candidates</p>
                    <p className="text-lg font-black text-slate-800">{stats.new_candidates || 0} To Review</p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-slate-300" />
              </div>

              <div className="hub-item glass-mini p-4 flex justify-between items-center cursor-pointer hover:translate-x-1 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase letter-spacing-1">Expenses</p>
                    <p className="text-lg font-black text-slate-800">{stats.pending_expenses || 0} Pending</p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-slate-300" />
              </div>
            </div>
          </div>

          {/* Quick Action Dock */}
          <div className="card glass p-6">
            <h2 className="card-title mb-6">Management Dock</h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction icon={UserPlus} label="New Hire" color="#eff6ff" onClick={() => setIsModalOpen(true)} />
              <QuickAction icon={Calendar} label="Time Off" color="#fff7ed" onClick={() => navigate('/leave')} />
              <QuickAction icon={Briefcase} label="Job Post" color="#faf5ff" onClick={() => navigate('/recruitment')} />
              <QuickAction icon={FileText} label="Reports" color="#f0fdf4" onClick={() => navigate('/reports')} />
            </div>
          </div>

          {/* LIVE ON DUTY - Real-time Feature */}
          <div className="card glass p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title flex items-center gap-2">
                <div className="pulse-dot"></div>
                Live On-Duty
              </h2>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                {stats.live_on_duty?.length || 0} Present
              </span>
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {stats.live_on_duty?.length > 0 ? (
                stats.live_on_duty.map((emp, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 glass-mini rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-black text-sm">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase letter-spacing-1">Checked in @ {new Date(emp.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="loc-tag flex items-center gap-1 text-slate-400">
                      <Zap size={10} />
                      <span className="text-[10px] font-black">ACTIVE</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Clock size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Everyone is currently off-duty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {
        isModalOpen && (
          <AddEmployeeModal
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleEmployeeAdded}
          />
        )
      }

      <style>{`
        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 32px;
        }

        .page-title {
            font-size: 2.2rem;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.04em;
            line-height: 1;
        }

        .page-subtitle {
            margin-top: 10px;
            color: #64748b;
            font-size: 1.1rem;
            font-weight: 500;
        }

        /* Dashboard Grid System */
        .dashboard-main-grid {
            display: grid;
            grid-template-columns: 1.6fr 1fr;
            gap: 24px;
        }

        .dash-left-column { display: flex; flex-direction: column; gap: 24px; }
        .dash-right-column { display: flex; flex-direction: column; gap: 24px; }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
        }

        /* Glass Cards */
        .glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 10px 40px rgba(0,0,0,0.04);
            border-radius: 28px;
            overflow: hidden;
        }

        .glass-mini {
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 18px;
        }

        .stat-card {
            padding: 26px;
            height: 100%;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.08);
            border-color: rgba(99, 102, 241, 0.3);
        }

        .icon-wrapper {
            width: 54px;
            height: 54px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .trend-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.75rem;
            font-weight: 800;
            padding: 6px 12px;
            border-radius: 100px;
        }

        .trend-up { background: #dcfce7; color: #16a34a; }
        .trend-down { background: #fee2e2; color: #dc2626; }

        .stat-value {
            font-size: 2.4rem;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.02em;
            margin-bottom: 2px;
        }

        .stat-title {
            font-size: 0.85rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Hub Items */
        .hub-item {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(0,0,0,0.05);
        }

        .hub-item:hover {
            border-color: #6366f1;
            background: rgba(99, 102, 241, 0.08);
        }

        /* Activity Dots */
        .activity-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-top: 5px;
        }
        .activity-dot.blue-500 { background: #3b82f6; box-shadow: 0 0 12px rgba(59, 130, 246, 0.5); }
        .activity-dot.indigo-500 { background: #6366f1; box-shadow: 0 0 12px rgba(99, 102, 241, 0.5); }

        /* Quick Action */
        .quick-action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 20px;
            border-radius: 20px;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .quick-action-btn:hover {
            transform: translateY(-8px);
            background: rgba(255,255,255,0.9);
            border-color: #6366f1;
        }

        /* Live Pulse */
        .pulse-dot {
            width: 10px;
            height: 10px;
            background: #2dd4bf;
            border-radius: 50%;
            position: relative;
        }

        .pulse-dot::after {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: #2dd4bf;
            animation: pulse 2s infinite;
            opacity: 0.5;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(3); opacity: 0; }
        }

        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        .bg-blue-50 { background: #eff6ff; } .text-blue-600 { color: #2563eb; }
        .bg-purple-50 { background: #faf5ff; } .text-purple-600 { color: #9333ea; }
        .bg-orange-50 { background: #fff7ed; } .text-orange-600 { color: #ea580c; }
        .bg-green-50 { background: #f0fdf4; } .text-green-600 { color: #16a34a; }
      `}</style>
    </div >
  );
}
