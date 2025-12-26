import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  UserPlus,
  Clock,
  Filter,
  Calendar,
  Briefcase,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, change, trend, icon: Icon, colorClass }) => (
  <div className="card stat-card">
    <div className="stat-header">
      <div className={`icon-wrapper ${colorClass}`}>
        <Icon size={22} />
      </div>
      <span className={`trend-badge ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </span>
    </div>
    <div className="stat-content">
      <h3 className="stat-value">{value}</h3>
      <p className="stat-title">{title}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, color }) => (
  <button className="quick-action-btn">
    <div className="action-icon" style={{ backgroundColor: color }}>
      <Icon size={18} />
    </div>
    <span>{label}</span>
  </button>
);

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="dashboard">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {firstName}. Here's what's happening today.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={18} /> Filter
          </button>
          <button className="btn-premium">
            <UserPlus size={18} /> Add Employee
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Employees"
          value="1,248"
          change="+12%"
          trend="up"
          icon={Users}
          colorClass="icon-blue"
        />
        <StatCard
          title="Active Jobs"
          value="12"
          change="+2"
          trend="up"
          icon={Briefcase}
          colorClass="icon-purple"
        />
        <StatCard
          title="On Leave"
          value="18"
          change="-2%"
          trend="down"
          icon={Clock}
          colorClass="icon-orange"
        />
        <StatCard
          title="Performance"
          value="94%"
          change="+5%"
          trend="up"
          icon={Zap}
          colorClass="icon-green"
        />
      </div>

      <div className="content-grid">
        <div className="main-section">
          <div className="card mb-6">
            <div className="card-header justify-between">
              <h2>Attendance Trend</h2>
              <div className="card-actions">
                <select className="mini-select">
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                </select>
              </div>
            </div>
            <div className="placeholder-chart">
              <div className="fake-waves">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="wave-bar" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                ))}
              </div>
              <p>Activity peaking at 10 AM daily</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header justify-between">
              <h2>Upcoming Events</h2>
              <button className="text-btn">View All</button>
            </div>
            <div className="events-list">
              <div className="event-item">
                <div className="event-date">
                  <span className="day">24</span>
                  <span className="month">DEC</span>
                </div>
                <div className="event-info">
                  <h4>Annual Team Brunch</h4>
                  <p>Main Conference Hall • 11:30 AM</p>
                </div>
              </div>
              <div className="event-item">
                <div className="event-date">
                  <span className="day">28</span>
                  <span className="month">DEC</span>
                </div>
                <div className="event-info">
                  <h4>Client Strategy Meeting</h4>
                  <p>Virtual • 02:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="side-section">
          <div className="card mb-6">
            <h2 className="mb-4">Leave Balance</h2>
            <div className="leave-balance-grid">
              <div className="leave-stat">
                <span className="label">Paid Leave</span>
                <span className="value">12/20</span>
                <div className="progress-bar"><div className="progress" style={{ width: '60%' }}></div></div>
              </div>
              <div className="leave-stat">
                <span className="label">Sick Leave</span>
                <span className="value">08/12</span>
                <div className="progress-bar"><div className="progress" style={{ width: '75%', backgroundColor: '#22c55e' }}></div></div>
              </div>
            </div>
          </div>
          <div className="card mb-6">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <QuickAction icon={UserPlus} label="New Hire" color="var(--primary-100)" />
              <QuickAction icon={Calendar} label="Request Leave" color="#ffedd5" />
              <QuickAction icon={Briefcase} label="Post Job" color="#f3e8ff" />
              <QuickAction icon={Users} label="Team View" color="#dcfce7" />
            </div>
          </div>

          <div className="card mb-6">
            <div className="card-header justify-between">
              <h2>Recent Activity</h2>
              <button className="text-btn">Clear</button>
            </div>
            <ul className="activity-list">
              <li>
                <div className="activity-dot blue"></div>
                <div>
                  <p className="activity-text"><strong>Sarah Smith</strong> applied for leave</p>
                  <span className="activity-time">2 mins ago</span>
                </div>
              </li>
              <li>
                <div className="activity-dot green"></div>
                <div>
                  <p className="activity-text"><strong>John Doe</strong> completed onboarding</p>
                  <span className="activity-time">1 hour ago</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="card">
            <div className="card-header justify-between">
              <h2>Expenses</h2>
              <button className="text-btn">Claim</button>
            </div>
            <div className="expense-summary">
              <div className="flex justify-between mb-2">
                <span className="text-muted text-sm">Target</span>
                <span className="font-bold text-sm">$2,500</span>
              </div>
              <div className="progress-bar mb-4"><div className="progress" style={{ width: '45%', backgroundColor: '#a855f7' }}></div></div>
              <p className="text-xs text-muted">You have 2 pending claims totaling <strong>$145.00</strong></p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
                .dashboard { animation: fadeIn 0.5s ease-out; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .page-header { margin-bottom: 32px; }
                .page-title { font-size: 2rem; font-weight: 800; color: var(--slate-900); letter-spacing: -0.02em; }
                .page-subtitle { color: var(--slate-500); margin-top: 4px; font-size: 1.05rem; }
                
                .header-actions { display: flex; gap: 12px; }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .stat-card {
                    padding: 24px;
                    background: white;
                    border: 1px solid var(--slate-200);
                    border-radius: 20px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .stat-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); border-color: var(--primary-200); }

                .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .icon-wrapper { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
                
                .icon-blue { background: #eff6ff; color: #2563eb; }
                .icon-green { background: #f0fdf4; color: #16a34a; }
                .icon-orange { background: #fff7ed; color: #ea580c; }
                .icon-purple { background: #faf5ff; color: #9333ea; }

                .trend-badge { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 100px; }
                .trend-up { background: #dcfce7; color: #15803d; }
                .trend-down { background: #fee2e2; color: #b91c1c; }

                .stat-value { font-size: 2.25rem; font-weight: 800; color: var(--slate-900); letter-spacing: -0.03em; }
                .stat-title { color: var(--slate-500); font-weight: 600; font-size: 0.95rem; margin-top: 4px; }

                .content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
                .mb-6 { margin-bottom: 24px; }

                .card-header { display: flex; align-items: center; margin-bottom: 20px; }
                .card-header h2 { font-size: 1.25rem; font-weight: 700; color: var(--slate-900); }

                .placeholder-chart {
                    height: 240px;
                    background: #fcfcfd;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 24px;
                    position: relative;
                }

                .fake-waves { display: flex; align-items: flex-end; gap: 8px; width: 100%; height: 100px; margin-bottom: 24px; }
                .wave-bar { flex: 1; background: var(--primary-100); border-radius: 4px 4px 0 0; transition: all 0.3s; }
                .wave-bar:hover { background: var(--primary-400); transform: scaleY(1.1); }

                .quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
                .quick-action-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 20px;
                    background: var(--slate-50);
                    border-radius: 16px;
                    border: 1px solid var(--slate-200);
                    transition: all 0.2s;
                }
                .quick-action-btn:hover { background: white; border-color: var(--primary-500); transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .action-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--slate-700); }
                .quick-action-btn span { font-size: 0.9rem; font-weight: 600; color: var(--slate-700); }

                .events-list { display: flex; flex-direction: column; gap: 16px; }
                .event-item { display: flex; align-items: center; gap: 20px; padding: 16px; border-radius: 12px; background: var(--slate-50); }
                .event-date { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 56px; height: 56px; background: white; border: 1px solid var(--slate-200); border-radius: 12px; }
                .event-date .day { font-size: 1.25rem; font-weight: 800; color: var(--primary-600); line-height: 1; }
                .event-date .month { font-size: 0.7rem; font-weight: 700; color: var(--slate-400); margin-top: 2px; }
                .event-info h4 { font-size: 1rem; font-weight: 700; color: var(--slate-900); }
                .event-info p { font-size: 0.85rem; color: var(--slate-500); margin-top: 2px; }

                .activity-list { display: flex; flex-direction: column; gap: 20px; list-style: none; }
                .activity-list li { display: flex; gap: 16px; }
                .activity-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; box-shadow: 0 0 0 4px white; }
                .activity-dot.blue { background: #3b82f6; }
                .activity-dot.green { background: #22c55e; }
                .activity-dot.purple { background: #a855f7; }
                .activity-text { font-size: 0.95rem; color: var(--slate-700); line-height: 1.5; }
                .activity-time { font-size: 0.8rem; color: var(--slate-400); font-weight: 500; }

                .mini-select { padding: 6px 12px; border-radius: 8px; border: 1px solid var(--slate-200); font-size: 0.85rem; font-weight: 600; color: var(--slate-600); cursor: pointer; }
                .text-btn { font-size: 0.9rem; font-weight: 700; color: var(--primary-600); }
                .text-btn:hover { color: var(--primary-700); }

                .leave-balance-grid { display: flex; flex-direction: column; gap: 16px; margin-top: 12px; }
                .leave-stat { display: flex; flex-direction: column; gap: 4px; }
                .leave-stat .label { font-size: 0.85rem; color: var(--slate-500); font-weight: 600; }
                .leave-stat .value { font-size: 1rem; font-weight: 800; color: var(--slate-900); }
                .progress-bar { height: 8px; background: var(--slate-100); border-radius: 4px; overflow: hidden; }
                .progress { hieght: 100%; height: 100%; background: var(--primary-500); transition: width 0.3s; }

                .expense-summary { padding: 8px 0; }

                @media (max-width: 1200px) {
                    .content-grid { grid-template-columns: 1fr; }
                    .side-section { order: -1; }
                }
            `}</style>
    </div>
  );
}
