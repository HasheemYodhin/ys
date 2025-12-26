import {
    User,
    Calendar,
    Clock,
    FileText,
    Briefcase,
    ChevronRight,
    Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InfoCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="card info-card">
        <div className="flex items-center gap-4">
            <div className="icon-wrapper-sm" style={{ backgroundColor: `${color}15`, color: color }}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-muted text-xs uppercase font-bold tracking-wider">{title}</p>
                <h3 className="text-xl font-bold mt-1">{value}</h3>
                {subtext && <p className="text-muted text-xs mt-1">{subtext}</p>}
            </div>
        </div>
    </div>
);

export default function EmployeeDashboard() {
    const { user } = useAuth();

    return (
        <div className="employee-dashboard">
            <div className="page-header mb-8">
                <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
                <p className="page-subtitle">Your workspace overview for today.</p>
            </div>

            <div className="stats-grid mb-8">
                <InfoCard
                    title="Attendance"
                    value="98%"
                    subtext="Status: Present"
                    icon={Calendar}
                    color="var(--primary-600)"
                />
                <InfoCard
                    title="Leave Balance"
                    value="12 Days"
                    subtext="Used: 4 / 16"
                    icon={Clock}
                    color="#f59e0b"
                />
                <InfoCard
                    title="Next Payroll"
                    value="Jan 01"
                    subtext="Status: Processed"
                    icon={FileText}
                    color="#10b981"
                />
            </div>

            <div className="content-grid-split">
                <div className="main-section">
                    <div className="card mb-6">
                        <div className="card-header justify-between">
                            <h2>Personal Profile</h2>
                            <button className="text-btn text-xs">Edit Info</button>
                        </div>
                        <div className="profile-summary">
                            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl mb-6">
                                <div className="avatar-placeholder">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{user?.name}</h3>
                                    <p className="text-sm text-muted">Senior Software Engineer • Product Team</p>
                                </div>
                            </div>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="label">Employee ID</span>
                                    <span className="value">YS-1024</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Work Email</span>
                                    <span className="value">{user?.email}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Joining Date</span>
                                    <span className="value">Jan 12, 2023</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Phone</span>
                                    <span className="value">+1 (555) 0012</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card mb-6">
                        <div className="card-header justify-between">
                            <h2>Recent Pay Slips</h2>
                            <button className="text-btn">View All</button>
                        </div>
                        <div className="table-wrapper mt-4">
                            <table className="mini-table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>December 2025</td>
                                        <td>Dec 31, 2025</td>
                                        <td className="font-bold">$4,500.00</td>
                                        <td><button className="text-primary-600 font-bold text-xs">Download</button></td>
                                    </tr>
                                    <tr>
                                        <td>November 2025</td>
                                        <td>Nov 30, 2025</td>
                                        <td className="font-bold">$4,500.00</td>
                                        <td><button className="text-primary-600 font-bold text-xs">Download</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header justify-between">
                            <h2>Internal Job Openings</h2>
                            <button className="text-btn">View All</button>
                        </div>
                        <div className="jobs-list">
                            <div className="job-item p-4 border rounded-xl mb-3 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold">Lead UI Designer</h4>
                                    <p className="text-xs text-muted">Creative Team • Remote</p>
                                </div>
                                <button className="btn-secondary py-1 px-4 text-xs font-bold">Apply</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="side-section">
                    <div className="card mb-6">
                        <h2>Quick Requests</h2>
                        <div className="quick-links">
                            <button className="q-link">
                                <Calendar size={18} />
                                <span>Request Leave</span>
                                <ChevronRight size={14} className="ms-auto" />
                            </button>
                            <button className="q-link">
                                <FileText size={18} />
                                <span>Download Payslip</span>
                                <ChevronRight size={14} className="ms-auto" />
                            </button>
                            <button className="q-link">
                                <Clock size={18} />
                                <span>Log Overtime</span>
                                <ChevronRight size={14} className="ms-auto" />
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h2>Your Manager</h2>
                        <div className="manager-card mt-4 p-4 border rounded-2xl flex items-center gap-4">
                            <div className="manager-avatar">SM</div>
                            <div>
                                <h4 className="font-bold text-sm">Sarah Miller</h4>
                                <p className="text-xs text-muted">HR Operations Head</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .employee-dashboard { animation: fadeIn 0.4s ease-out; }
                .info-card { padding: 20px; transition: transform 0.2s; }
                .info-card:hover { transform: translateY(-3px); }
                .icon-wrapper-sm { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .profile-summary { padding: 8px; }
                .avatar-placeholder { width: 64px; height: 64px; border-radius: 20px; background: var(--primary-100); color: var(--primary-600); display: flex; align-items: center; justify-content: center; }
                .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .detail-item { display: flex; flex-direction: column; gap: 4px; }
                .detail-item .label { font-size: 0.75rem; color: var(--slate-400); font-weight: 700; text-transform: uppercase; }
                .detail-item .value { font-size: 0.95rem; font-weight: 600; color: var(--slate-700); }
                
                .quick-links { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
                .q-link { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--slate-50); border-radius: 14px; border: 1px solid transparent; transition: all 0.2s; cursor: pointer; }
                .q-link:hover { background: white; border-color: var(--primary-200); transform: translateX(5px); color: var(--primary-600); }
                .q-link span { font-size: 0.9rem; font-weight: 600; }
                
                .mini-table { width: 100%; border-collapse: collapse; }
                .mini-table th { text-align: left; padding: 12px; font-size: 0.75rem; color: var(--slate-400); border-bottom: 1px solid var(--slate-100); }
                .mini-table td { padding: 12px; font-size: 0.85rem; color: var(--slate-600); border-bottom: 1px solid var(--slate-100); }
                
                .manager-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--slate-900); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; }
                .content-grid-split { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
            `}</style>
        </div>
    );
}
