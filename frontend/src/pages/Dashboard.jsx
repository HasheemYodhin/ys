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
    attendance: { present: 0, absent: 0, on_leave: 0 }
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.department !== 'all') params.append('department', filters.department);
    if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
    if (filters.status !== 'all') params.append('status', filters.status);

    const queryString = params.toString();
    const url = `/api/dashboard/stats${queryString ? '?' + queryString : ''}`;

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Dashboard stats received:', data);
        setStats(data);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard stats", err);
        setStats(prev => ({
          ...prev,
          headcount_graph: [],
          dept_distribution: [],
          attendance_trend: [],
          recent_hires: [],
          recent_activities: []
        }));
      });
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
        <StatCard
          title="New Joiners (1 Mo)"
          value={stats.new_joiners || 0}
          change="Latest"
          trend="up"
          icon={UserPlus}
          colorClass="bg-cyan-50 text-cyan-600"
        />
        <StatCard
          title="Upcoming Birthdays"
          value={stats.upcoming_birthdays || 0}
          change="This Week"
          trend="up"
          icon={Calendar}
          colorClass="bg-pink-50 text-pink-600"
        />
        <StatCard
          title="Mobile App Users"
          value={stats.mobile_users || 0}
          change="Active"
          trend="up"
          icon={Smartphone}
          colorClass="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pending_expenses || 0}
          change="To Review"
          trend="down"
          icon={FileText}
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Headcount Graph Section */}
      <div className="card p-6 mb-8">
        <h2 className="card-title mb-4">Headcount Growth</h2>
        <div style={{ width: '100%', height: 300 }}>
          {stats.headcount_graph && stats.headcount_graph.length > 0 ? (
            <ResponsiveContainer>
              <AreaChart data={stats.headcount_graph}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <p className="text-sm">Loading headcount data...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Department Distribution */}
        <div className="card p-6">
          <h2 className="card-title mb-4">Department Distribution</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.dept_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats.dept_distribution || []).map((entry, index) => {
                    const colors = ['#4f46e5', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Trend */}
        <div className="card p-6">
          <h2 className="card-title mb-4">Attendance Trend (7 Days)</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={stats.attendance_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Left Column */}
        <div className="main-section flex flex-col gap-6">

          {/* Activity Feed */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title">Recent Activity</h2>
              <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</button>
            </div>
            <div className="flex flex-col gap-6">
              {(stats.recent_activities && stats.recent_activities.length > 0) ? (
                stats.recent_activities.map((activity, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${activity.color}`}></div>
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-bold text-slate-900">{activity.user}</span> {activity.action}
                      </p>
                      <span className="text-xs text-slate-400 font-medium">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Overview */}
          <div className="card p-6">
            <h2 className="card-title mb-6">Team Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Active</p>
                    <p className="text-xl font-bold text-slate-900">{stats.attendance.present}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">On Leave</p>
                    <p className="text-xl font-bold text-slate-900">{stats.on_leave}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Briefcase size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Open Jobs</p>
                    <p className="text-xl font-bold text-slate-900">{stats.active_jobs}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                    <UserPlus size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">New Hires</p>
                    <p className="text-xl font-bold text-slate-900">{stats.new_joiners || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Summary */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Department Summary</h2>
            </div>
            <div className="space-y-4">
              {(stats.dept_distribution || []).slice(0, 5).map((dept, idx) => {
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-green-500'];
                const percentage = stats.total_employees ? ((dept.value / stats.total_employees) * 100).toFixed(0) : 0;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-slate-700">{dept.name}</span>
                        <span className="text-xs font-bold text-slate-900">{dept.value}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[idx % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Hires */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Recent Hires</h2>
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                Last 30 Days
              </span>
            </div>
            <div className="space-y-3">
              {(stats.recent_hires && stats.recent_hires.length > 0) ? (
                stats.recent_hires.map((hire, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                      {hire.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{hire.name}</p>
                      <p className="text-xs text-slate-500">{hire.role} • {hire.dept}</p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{hire.days_ago}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No new hires in the last 30 days</p>
                </div>
              )}
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
              <QuickAction icon={Calendar} label="Time Off" color="#fff7ed" onClick={() => navigate('/leave')} />
              <QuickAction icon={Briefcase} label="Post Job" color="#faf5ff" onClick={() => navigate('/recruitment')} />
              <QuickAction icon={FileText} label="Reports" color="#f0fdf4" onClick={() => navigate('/reports')} />
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

          {/* Calendar Widget */}
          <div className="card p-6">
            <h2 className="card-title mb-4">Calendar</h2>
            <div className="calendar-widget">
              {(() => {
                const today = new Date();
                const currentMonth = today.toLocaleString('default', { month: 'long' });
                const currentYear = today.getFullYear();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
                const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

                return (
                  <>
                    <div className="calendar-header">
                      <span className="text-sm font-bold text-slate-900">{currentMonth} {currentYear}</span>
                    </div>
                    <div className="calendar-days-header">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-day-name">{day}</div>
                      ))}
                    </div>
                    <div className="calendar-grid">
                      {[...Array(firstDay)].map((_, i) => (
                        <div key={`empty-${i}`} className="calendar-day empty"></div>
                      ))}
                      {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const isToday = day === today.getDate();
                        return (
                          <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
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

          {/* Announcements */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Announcements</h2>
              <button className="text-xs font-semibold text-primary-600 hover:text-primary-700">View All</button>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">New Policy Update</h4>
                    <p className="text-xs text-slate-600 mb-2">Updated remote work policy is now available. Please review the changes.</p>
                    <span className="text-xs text-slate-400">2 days ago</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                    <Calendar size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Holiday Schedule</h4>
                    <p className="text-xs text-slate-600 mb-2">Year-end holiday schedule has been published. Check your calendar.</p>
                    <span className="text-xs text-slate-400">5 days ago</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shrink-0">
                    <Users size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Team Building Event</h4>
                    <p className="text-xs text-slate-600 mb-2">Join us for the annual team building event next month!</p>
                    <span className="text-xs text-slate-400">1 week ago</span>
                  </div>
                </div>
              </div>
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

        /* Calendar Widget */
        .calendar-widget {
            width: 100%;
        }

        .calendar-header {
            text-align: center;
            padding: 12px 0;
            margin-bottom: 12px;
            border-bottom: 1px solid var(--slate-100);
        }

        .calendar-days-header {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
            margin-bottom: 8px;
        }

        .calendar-day-name {
            text-align: center;
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--slate-500);
            text-transform: uppercase;
            padding: 4px 0;
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
        }

        .calendar-day {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--slate-700);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .calendar-day:not(.empty):hover {
            background-color: var(--slate-100);
            transform: scale(1.05);
        }

        .calendar-day.today {
            background: var(--primary-500);
            color: white;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .calendar-day.empty {
            cursor: default;
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
    </div >
  );
}
