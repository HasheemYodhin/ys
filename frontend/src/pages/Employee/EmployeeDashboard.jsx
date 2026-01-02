import {
    User, Calendar, Clock, FileText, Briefcase, ChevronRight, Zap, Users, CheckCircle2
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import AttendanceCheckIn from '../../components/AttendanceCheckIn';

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

const StatCard = ({ title, value, change, trend, icon: Icon, colorClass }) => (
    <div className="card stat-card glass animate-slide-up">
        <div className="flex justify-between items-start mb-4">
            <div className={`icon-wrapper ${colorClass}`}>
                <Icon size={24} />
            </div>
            <div className="live-indicator">
                <div className="pulse-dot"></div>
                <span>Live</span>
            </div>
        </div>
        <div>
            <h3 className="stat-value">{value}</h3>
            <div className="flex justify-between items-end">
                <p className="stat-title">{title}</p>
                <span className="stat-change">{change}</span>
            </div>
        </div>
    </div>
);

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        greeting: '',
        attendance_today: 'Loading...',
        check_in_time: null,
        leave_balance: { paid: { used: 0, total: 20 }, sick: { used: 0, total: 12 } },
        recent_activities: [],
        announcements: [],
        performance: 0,
        attendance_streak: 0,
        attendance_history: [],
        leave_distribution: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/dashboard/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch employee stats", err);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 60000); // Sync every minute
        return () => clearInterval(interval);
    }, []);

    const firstName = user?.name?.split(' ')[0] || 'Employee';

    return (
        <div className="employee-dashboard-v2 animate-fade-in">
            {/* Hero Section */}
            <div className="hero-banner mb-8">
                <div className="hero-content">
                    <div className="hero-main-text">
                        <div className="date-badge">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                        <h1 className="hero-greeting animate-slide-up">
                            {stats.greeting || `Good Day, ${firstName}`}!
                        </h1>
                        <p className="hero-subtitle animate-slide-up delay-100">
                            Your performance is in the top 5% this month. Keep up the great momentum!
                        </p>
                    </div>
                    <div className="hero-action-card glass shadow-2xl animate-fade-in">
                        <AttendanceCheckIn
                            employeeId={user?.id || user?._id}
                            employeeName={user?.name}
                            variant="hero"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row mb-8">
                <StatCard
                    title="Attendance Today"
                    value={stats.attendance_today}
                    change={stats.check_in_time ? `In at ${stats.check_in_time}` : 'Action Required'}
                    icon={Clock}
                    colorClass="teal"
                />
                <StatCard
                    title="Leave Balance"
                    value={`${stats.leave_balance.paid.total - stats.leave_balance.paid.used} Days`}
                    change="Available Paid"
                    icon={Calendar}
                    colorClass="blue"
                />
                <StatCard
                    title="Work Streak"
                    value={`${stats.attendance_streak} Days`}
                    change="Record Consistency"
                    icon={Zap}
                    colorClass="orange"
                />
                <StatCard
                    title="Performance"
                    value={`${stats.performance}%`}
                    change="Very Good"
                    icon={Users}
                    colorClass="purple"
                />
            </div>

            <div className="dashboard-grid-v2">
                <div className="main-content-v2">
                    {/* Charts Section */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Weekly Attendance History */}
                        <div className="card-v2 glass p-6">
                            <h2 className="section-title mb-6">Weekly Hours</h2>
                            <div style={{ width: '100%', height: 220 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={stats.attendance_history || []}>
                                        <defs>
                                            <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                        <Tooltip content={<GlassTooltip />} />
                                        <Area type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorTeal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Leave Allocation */}
                        <div className="card-v2 glass p-6 relative">
                            <h2 className="section-title mb-6">Leave Allocation</h2>
                            <div style={{ width: '100%', height: 220 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={stats.leave_distribution || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {(stats.leave_distribution || []).map((entry, index) => {
                                                const colors = ['#6366f1', '#f43f5e', '#2dd4bf'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />;
                                            })}
                                        </Pie>
                                        <Tooltip content={<GlassTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <span className="block text-xl font-black text-slate-900 leading-none">
                                        {stats.leave_balance?.paid?.total + stats.leave_balance?.sick?.total || 32}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="card-v2 glass p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="section-title">Your Recent Activity</h2>
                            <button className="text-link">Full History</button>
                        </div>
                        <div className="activity-stack">
                            {stats.recent_activities.length > 0 ? (
                                stats.recent_activities.map((activity, idx) => (
                                    <div key={idx} className="activity-item-v2">
                                        <div className={`activity-dot ${activity.color?.replace('bg-', '')}`}></div>
                                        <div className="activity-details">
                                            <p><strong>{activity.user}</strong> {activity.action}</p>
                                            <span>{activity.time}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted text-center py-4">No recent activities found.</p>
                            )}
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="card-v2 glass p-6">
                        <h2 className="section-title mb-6">Company Announcements</h2>
                        <div className="announcement-grid">
                            {stats.announcements.map((ann, idx) => (
                                <div key={idx} className={`ann-card ${ann.color}`}>
                                    <div className="ann-icon">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div className="ann-info">
                                        <h4>{ann.title}</h4>
                                        <p>{ann.desc}</p>
                                        <span className="ann-time">{ann.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="sidebar-v2">
                    {/* Quick Profile */}
                    <div className="card-v2 glass p-6 mb-6 text-center">
                        <div className="profile-hero-avatar">
                            {firstName[0]}
                        </div>
                        <h3 className="mt-4 font-bold text-xl">{firstName}</h3>
                        <p className="text-muted text-sm">Employee • YS Global</p>
                        <div className="divider my-6"></div>
                        <div className="profile-stats-mini">
                            <div className="mini-stat">
                                <span>Employee ID</span>
                                <strong>YS-{user?.id?.slice(-4) || '1024'}</strong>
                            </div>
                            <div className="mini-stat">
                                <span>Joining Date</span>
                                <strong>Jan 2023</strong>
                            </div>
                        </div>
                        <button className="btn-v2-outline w-full mt-6">View My Profile</button>
                    </div>

                    {/* Internal Jobs */}
                    <div className="card-v2 glass p-6">
                        <h2 className="section-title-sm mb-4">Internal Openings</h2>
                        <div className="mini-job-list">
                            <div className="mini-job">
                                <div>
                                    <h5>Senior Developer</h5>
                                    <p>Tech Team • Remote</p>
                                </div>
                                <ChevronRight size={18} />
                            </div>
                            <div className="mini-job">
                                <div>
                                    <h5>UI/UX Specialist</h5>
                                    <p>Design • NY Office</p>
                                </div>
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .employee-dashboard-v2 {
                    padding-bottom: 50px;
                }

                .hero-banner {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    border-radius: 40px;
                    padding: 40px 60px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                }

                .hero-banner:after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -10%;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%);
                    pointer-events: none;
                }

                .hero-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 40px;
                    position: relative;
                    z-index: 2;
                }

                .date-badge {
                    background: rgba(255,255,255,0.1);
                    color: #2dd4bf;
                    padding: 8px 16px;
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    display: inline-block;
                    margin-bottom: 16px;
                }

                .hero-greeting {
                    color: white;
                    font-size: 3rem;
                    font-weight: 900;
                    letter-spacing: -1.5px;
                    margin-bottom: 10px;
                }

                .hero-subtitle {
                    color: #94a3b8;
                    font-size: 1.1rem;
                    max-width: 500px;
                    line-height: 1.6;
                }

                .hero-action-card.glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 10px;
                    border-radius: 28px;
                    width: 380px;
                }

                /* Override Internal AttendanceCard for Hero */
                .hero-action-card .attendance-card {
                    background: transparent !important;
                    box-shadow: none !important;
                    border: none !important;
                    padding: 10px !important;
                }
                .hero-action-card .card-title, .hero-action-card .status-display { color: white !important; }
                .hero-action-card .time-display { color: #94a3b8 !important; }

                /* Stats Row */
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                }

                .stat-card {
                    padding: 28px;
                    border-radius: 28px;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .stat-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                }

                .icon-wrapper {
                    width: 56px;
                    height: 56px;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-wrapper.teal { background: #f0fdfa; color: #0d9488; }
                .icon-wrapper.blue { background: #eff6ff; color: #2563eb; }
                .icon-wrapper.orange { background: #fff7ed; color: #ea580c; }
                .icon-wrapper.purple { background: #faf5ff; color: #9333ea; }

                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #f1f5f9;
                    padding: 4px 10px;
                    border-radius: 100px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #64748b;
                }

                .pulse-dot {
                    width: 6px;
                    height: 6px;
                    background: #2dd4bf;
                    border-radius: 50%;
                    box-shadow: 0 0 0 rgba(45, 212, 191, 0.4);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(45, 212, 191, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(45, 212, 191, 0); }
                }

                .stat-value { font-size: 2.2rem; font-weight: 900; color: #0f172a; line-height: 1; margin: 16px 0 8px; }
                .stat-title { font-size: 0.9rem; font-weight: 700; color: #64748b; }
                .stat-change { font-size: 0.75rem; font-weight: 800; color: #0d9488; }

                /* Grid Layout */
                .dashboard-grid-v2 {
                    display: grid;
                    grid-template-columns: 1.5fr 360px;
                    gap: 24px;
                }

                .card-v2 {
                    background: white;
                    border-radius: 32px;
                    border: 1px solid #f1f5f9;
                }

                .section-title { font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0; }
                .section-title-sm { font-size: 1.1rem; font-weight: 800; color: #0f172a; }

                .activity-item-v2 {
                    display: flex;
                    gap: 16px;
                    padding: 16px 0;
                    border-bottom: 1px solid #f8fafc;
                }

                .activity-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; shrink: 0; }
                .indigo-500 { background: #6366f1; }
                .activity-details p { margin: 0; font-size: 0.95rem; color: #334155; }
                .activity-details span { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }

                /* Announcements */
                .announcement-grid { display: flex; flex-direction: column; gap: 16px; }
                .ann-card { display: flex; gap: 20px; padding: 20px; border-radius: 20px; border-left: 6px solid; }
                .ann-card.blue { background: #eff6ff; border-color: #3b82f6; }
                .ann-card.green { background: #f0fdf4; border-color: #22c55e; }
                
                .ann-icon { width: 44px; height: 44px; border-radius: 12px; background: white; display: flex; align-items: center; justify-content: center; shrink: 0; }
                .ann-info h4 { margin: 0 0 4px; font-weight: 800; font-size: 1.05rem; }
                .ann-info p { margin: 0 0 8px; font-size: 0.9rem; color: #64748b; line-height: 1.4; }
                .ann-time { font-size: 0.75rem; font-weight: 700; color: #94a3b8; }

                /* Sidebar */
                .profile-hero-avatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 36px;
                    background: linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%);
                    color: white;
                    font-size: 2.5rem;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                    box-shadow: 0 10px 25px rgba(45, 212, 191, 0.3);
                }

                .mini-stat { display: flex; justify-content: space-between; margin-bottom: 12px; }
                .mini-stat span { font-size: 0.85rem; color: #64748b; font-weight: 600; }
                .mini-stat strong { font-size: 0.85rem; color: #0f172a; font-weight: 800; }

                .btn-v2-outline {
                    padding: 14px;
                    border-radius: 16px;
                    border: 2px solid #f1f5f9;
                    background: white;
                    font-weight: 800;
                    font-size: 0.9rem;
                    color: #0d9488;
                    transition: all 0.2s;
                }
                .btn-v2-outline:hover { background: #f0fdfa; border-color: #2dd4bf; transform: translateY(-3px); }

                .mini-job {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 18px;
                    margin-bottom: 12px;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .mini-job:hover { background: white; box-shadow: 0 8px 16px rgba(0,0,0,0.03); transform: scale(1.02); }
                .mini-job h5 { margin: 0; font-weight: 800; font-size: 0.95rem; }
                .mini-job p { margin: 4px 0 0; font-size: 0.8rem; color: #94a3b8; font-weight: 600; }

                /* Glassmorphism */
                .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.4); }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                .delay-100 { animation-delay: 0.1s; }
            `}</style>
        </div>
    );
}
