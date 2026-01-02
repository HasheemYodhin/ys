import React from 'react';
import { Bell, LogOut, Shield, ChevronRight, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotificationsPage() {
    const { user, notifications, resolveNotification } = useAuth();
    const [activeFilter, setActiveFilter] = React.useState('all');

    // Mocking some system notifications for employees if they don't have active requests
    const employeeNotifications = user?.role === 'Employee' ? [
        {
            id: 'system-1',
            type: 'system',
            user_name: 'System',
            message: 'Welcome to your new HR Dashboard!',
            created_at: '2 days ago'
        },
        user?.password_reset_requested ? {
            id: 'reset-1',
            type: 'password_reset',
            user_name: 'Self',
            message: 'Your password reset request is pending employer approval.',
            created_at: 'Just now'
        } : null
    ].filter(n => n !== null) : [];

    const displayNotifications = (user?.role === 'Employer' ? notifications : employeeNotifications) || [];

    const filteredNotifications = React.useMemo(() => {
        if (activeFilter === 'all') return displayNotifications;
        if (activeFilter === 'security') return displayNotifications.filter(n => n.type === 'password_reset');
        if (activeFilter === 'system') return displayNotifications.filter(n => n.type === 'system');
        return displayNotifications;
    }, [displayNotifications, activeFilter]);

    return (
        <div className="notifications-container-v2 animate-fade-in">
            <header className="page-header-v2">
                <div className="header-icon">
                    <Bell size={32} />
                </div>
                <div className="header-text">
                    <h1>Notifications</h1>
                    <p>Stay updated with the latest account activities and requests.</p>
                </div>
            </header>

            <div className="notifications-grid-v2">
                <div className="filters-card-v2 glass">
                    <h3>Filter by</h3>
                    <div
                        className={`filter-item ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        <div className="filter-dot teal"></div>
                        <span>All Activities</span>
                    </div>
                    <div
                        className={`filter-item ${activeFilter === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('security')}
                    >
                        <div className="filter-dot slate"></div>
                        <span>Security Requests</span>
                    </div>
                    <div
                        className={`filter-item ${activeFilter === 'system' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('system')}
                    >
                        <div className="filter-dot slate"></div>
                        <span>System Updates</span>
                    </div>
                </div>

                <div className="list-section-v2">
                    {filteredNotifications.length > 0 ? (
                        <div className="notif-list-v2">
                            {filteredNotifications.map((notif) => (
                                <div key={notif.id} className="notif-card-v2 glass animate-slide-up">
                                    <div className={`notif-type-icon ${notif.type}`}>
                                        {notif.type === 'password_reset' ? <LogOut size={20} /> : <CheckCircle2 size={20} />}
                                    </div>
                                    <div className="notif-body-v2">
                                        <div className="notif-header-v2">
                                            <h4>{notif.user_name}</h4>
                                            <span className="notif-time-v2">
                                                <Clock size={12} />
                                                {notif.created_at}
                                            </span>
                                        </div>
                                        <p className="notif-msg-v2">{notif.message}</p>
                                        {user?.role === 'Employer' && notif.type === 'password_reset' && (
                                            <div className="notif-actions-v2">
                                                <button
                                                    className="action-btn-v2 primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        resolveNotification(notif.id);
                                                    }}
                                                >
                                                    Handle Request
                                                </button>
                                                <button
                                                    className="action-btn-v2 secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        resolveNotification(notif.id);
                                                    }}
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <ChevronRight size={18} className="notif-arrow-v2" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-v2 glass">
                            <div className="empty-icon-v2">
                                <Bell size={48} />
                            </div>
                            <h3>All caught up!</h3>
                            <p>No new notifications at the moment.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .notifications-container-v2 {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 0;
                }

                .page-header-v2 {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    margin-bottom: 50px;
                }

                .header-icon {
                    width: 64px;
                    height: 64px;
                    background: var(--brand-slate, #0f172a);
                    color: white;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.2);
                }

                .header-text h1 {
                    font-size: 2.2rem;
                    font-weight: 900;
                    margin: 0;
                    color: #0f172a;
                    letter-spacing: -1px;
                }

                .header-text p {
                    color: #64748b;
                    margin: 5px 0 0 0;
                    font-size: 1.1rem;
                }

                .notifications-grid-v2 {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 40px;
                }

                .glass {
                    background: white;
                    border-radius: 30px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

                .filters-card-v2 {
                    padding: 30px;
                    height: fit-content;
                    position: sticky;
                    top: 120px;
                }

                .filters-card-v2 h3 {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #94a3b8;
                    margin-bottom: 25px;
                    padding-left: 10px;
                }

                .filter-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 18px;
                    border-radius: 15px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #64748b;
                    font-weight: 600;
                    margin-bottom: 5px;
                }

                .filter-item:hover {
                    background: #f8fafc;
                    color: #0f172a;
                }

                .filter-item.active {
                    background: #f1f5f9;
                    color: #0f172a;
                }

                .filter-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .filter-dot.teal { background: #2dd4bf; box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.1); }
                .filter-dot.slate { background: #cbd5e1; }

                .notif-card-v2 {
                    padding: 24px;
                    margin-bottom: 20px;
                    display: flex;
                    gap: 20px;
                    align-items: flex-start;
                    transition: all 0.2s;
                    cursor: pointer;
                    position: relative;
                }

                .notif-card-v2:hover {
                    transform: translateX(8px);
                    border-color: #e2e8f0;
                    box-shadow: 0 15px 30px -10px rgba(0,0,0,0.05);
                }

                .notif-type-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .notif-type-icon.password_reset { background: #fff1f2; color: #e11d48; }
                .notif-type-icon.system { background: #f0fdf4; color: #16a34a; }

                .notif-body-v2 { flex: 1; }

                .notif-header-v2 {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .notif-header-v2 h4 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #0f172a;
                }

                .notif-time-v2 {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-weight: 600;
                }

                .notif-msg-v2 {
                    color: #64748b;
                    margin: 0;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .notif-arrow-v2 {
                    color: #cbd5e1;
                    margin-top: 13px;
                }

                .notif-actions-v2 {
                    display: flex;
                    gap: 12px;
                    margin-top: 15px;
                }

                .action-btn-v2 {
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    border: none;
                    transition: 0.2s;
                }

                .action-btn-v2.primary {
                    background: #0f172a;
                    color: white;
                }

                .action-btn-v2.primary:hover {
                    background: #1e293b;
                }

                .action-btn-v2.secondary {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .empty-state-v2 {
                    padding: 80px 40px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .empty-icon-v2 {
                    width: 100px;
                    height: 100px;
                    background: #f8fafc;
                    border-radius: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #cbd5e1;
                    margin-bottom: 24px;
                }

                .empty-state-v2 h3 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .empty-state-v2 p {
                    color: #64748b;
                    margin-top: 10px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in { animation: fadeIn 0.6s ease-out; }
                .notif-card-v2 { animation: slideUp 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
}
