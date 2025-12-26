import { useState } from 'react';
import { User, Bell, Shield, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSaveProfile = async () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        }, 800);
    };

    const handleUpdatePassword = () => {
        setMessage({ type: 'success', text: 'Password update requested.' });
    };

    return (
        <div className="settings-page">
            <div className="page-header mb-8">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your account preferences and settings</p>
            </div>

            <div className="settings-grid">
                {message.text && (
                    <div className={`alert alert-${message.type}`} style={{ gridColumn: '1 / -1' }}>
                        {message.text}
                    </div>
                )}
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center gap-3">
                            <div className="icon-wrapper-sm" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                                <User size={20} />
                            </div>
                            <h2>Profile Information</h2>
                        </div>
                    </div>
                    <div className="settings-section">
                        <div className="setting-item">
                            <label>Full Name</label>
                            <input type="text" defaultValue={user?.full_name || user?.name} className="input-field" />
                        </div>
                        <div className="setting-item">
                            <label>Email</label>
                            <input type="email" defaultValue={user?.email} className="input-field" disabled />
                        </div>
                        <div className="setting-item">
                            <label>Company</label>
                            <input type="text" defaultValue={user?.company || 'Not set'} className="input-field" />
                        </div>
                        <button className="btn-premium mt-4" onClick={handleSaveProfile} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center gap-3">
                            <div className="icon-wrapper-sm" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                                <Bell size={20} />
                            </div>
                            <h2>Notifications</h2>
                        </div>
                    </div>
                    <div className="settings-section">
                        <div className="setting-toggle">
                            <div>
                                <h4>Email Notifications</h4>
                                <p>Receive email updates about your account activity</p>
                            </div>
                            <input type="checkbox" defaultChecked />
                        </div>
                        <div className="setting-toggle">
                            <div>
                                <h4>Leave Requests</h4>
                                <p>Get notified when team members request leave</p>
                            </div>
                            <input type="checkbox" defaultChecked />
                        </div>
                        <div className="setting-toggle">
                            <div>
                                <h4>Payroll Updates</h4>
                                <p>Notifications about payroll processing</p>
                            </div>
                            <input type="checkbox" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center gap-3">
                            <div className="icon-wrapper-sm" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                <Shield size={20} />
                            </div>
                            <h2>Security</h2>
                        </div>
                    </div>
                    <div className="settings-section">
                        <div className="setting-item">
                            <label>Current Password</label>
                            <input type="password" placeholder="••••••••" className="input-field" />
                        </div>
                        <div className="setting-item">
                            <label>New Password</label>
                            <input type="password" placeholder="••••••••" className="input-field" />
                        </div>
                        <div className="setting-item">
                            <label>Confirm Password</label>
                            <input type="password" placeholder="••••••••" className="input-field" />
                        </div>
                        <button className="btn-secondary mt-4" onClick={handleUpdatePassword}>Update Password</button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center gap-3">
                            <div className="icon-wrapper-sm" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                                <Palette size={20} />
                            </div>
                            <h2>Appearance</h2>
                        </div>
                    </div>
                    <div className="settings-section">
                        <div className="setting-item">
                            <label>Theme</label>
                            <select className="input-field">
                                <option>Light</option>
                                <option>Dark</option>
                                <option>Auto</option>
                            </select>
                        </div>
                        <div className="setting-item">
                            <label>Language</label>
                            <select className="input-field">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .settings-page { animation: fadeIn 0.4s ease-out; }
        
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .alert {
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }
        .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }

        .settings-section {
          padding: 20px;
        }

        .setting-item {
          margin-bottom: 20px;
        }

        .setting-item label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--slate-700);
          margin-bottom: 8px;
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--slate-200);
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px var(--primary-100);
        }

        .input-field:disabled {
          background: var(--slate-50);
          cursor: not-allowed;
        }

        .setting-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--slate-50);
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .setting-toggle h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--slate-900);
          margin-bottom: 4px;
        }

        .setting-toggle p {
          font-size: 0.85rem;
          color: var(--slate-500);
        }

        .setting-toggle input[type="checkbox"] {
          width: 44px;
          height: 24px;
          cursor: pointer;
        }

        .icon-wrapper-sm {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
