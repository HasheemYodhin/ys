import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    User, Mail, Phone, MapPin, Briefcase, Calendar,
    Camera, Save, Shield, CreditCard, GraduationCap,
    Award, ChevronRight, CheckCircle2, AlertCircle, Clock, Heart, ToggleRight,
    X, Check, UserCircle, Globe, Linkedin, Twitter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
    const { user, updateProfile, requestPasswordReset, toggle2FA } = useAuth();
    const [activeTab, setActiveTab] = useState('work');
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address: '',
        dob: '',
        bio: '',
        emergency_contact: '',
        department: '',
        designation: '',
        profile_photo: '',
        bank_details: {
            account_name: '',
            account_number: '',
            bank_name: '',
            ifsc: ''
        },
        education: [
            { degree: '', institution: '', year: '' }
        ],
        social_links: {
            linkedin: '',
            twitter: '',
            website: ''
        }
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.full_name || user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                dob: user.dob || '',
                bio: user.bio || '',
                emergency_contact: user.emergency_contact || '',
                department: user.department || '',
                designation: user.designation || '',
                profile_photo: user.profile_photo || '',
                bank_details: user.bank_details || {
                    account_name: '', account_number: '', bank_name: '', ifsc: ''
                },
                education: user.education && user.education.length > 0 ? user.education : [{ degree: '', institution: '', year: '' }],
                social_links: user.social_links || {
                    linkedin: '', twitter: '', website: ''
                }
            }));
        }
    }, [user]);

    const handleChange = (e, section = null, index = null) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedData = { ...prev };
            if (section && index !== null) {
                const newArray = [...(prev[section] || [])];
                newArray[index] = { ...(newArray[index] || {}), [name]: value };
                updatedData[section] = newArray;
            } else if (section) {
                updatedData[section] = { ...(prev[section] || {}), [name]: value };
            } else {
                updatedData[name] = value;
            }
            return updatedData;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (updateProfile) await updateProfile(formData);
            setSuccessMessage("Profile synchronized successfully");
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profile_photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerPhotoUpload = () => fileInputRef.current?.click();

    const completeness = useMemo(() => {
        const fields = [formData.full_name, formData.phone, formData.bio, formData.profile_photo];
        return Math.min(100, Math.round((fields.filter(f => f && String(f).length > 0).length / fields.length) * 100));
    }, [formData]);

    const handleResetPassword = async () => {
        try {
            const data = await requestPasswordReset();
            setSuccessMessage(data.message);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error) {
            console.error("Reset request failed", error);
        }
    };

    const handleToggle2FA = async () => {
        try {
            const data = await toggle2FA();
            setSuccessMessage(data.message);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error) {
            console.error("2FA toggle failed", error);
        }
    };

    const openSocialLink = (platform) => {
        let url = formData.social_links[platform];
        if (!url) return;
        if (!url.startsWith('http')) {
            if (platform === 'twitter') url = `https://twitter.com/${url.replace('@', '')}`;
            else if (platform === 'linkedin') url = `https://linkedin.com/in/${url}`;
            else url = `https://${url}`;
        }
        window.open(url, '_blank');
    };

    return (
        <div className="modern-profile-wrapper">
            {/* Elegant Header */}
            <div className="main-header">
                <div className="title-area">
                    <h1>Profile Management</h1>
                    <p>Customize your professional identity and account preferences</p>
                </div>
                <div className="action-area">
                    {successMessage && (
                        <div className="status-toast">
                            <CheckCircle2 size={14} />
                            {successMessage}
                        </div>
                    )}
                    <button className={`premium-save-btn ${saving ? 'loading' : ''}`} onClick={handleSave} disabled={saving}>
                        {saving ? <div className="loader"></div> : <Save size={18} />}
                        <span>{saving ? 'Processing...' : 'Save Configuration'}</span>
                    </button>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Left Column: Fixed Profile Info */}
                <div className="sidebar-column">
                    <div className="identity-card glass-premium">
                        <div className="avatar-section">
                            <div className="avatar-ring" onClick={triggerPhotoUpload}>
                                <div className="avatar-content">
                                    {formData.profile_photo ? (
                                        <img src={formData.profile_photo} alt="Profile" />
                                    ) : (
                                        <User size={48} className="icon-light" />
                                    )}
                                </div>
                                <div className="camera-overlay">
                                    <Camera size={20} />
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
                            </div>
                            <div className="badge-online"></div>
                        </div>

                        <div className="name-section">
                            <h2>{formData.full_name || 'Anonymous User'}</h2>
                            <p className="role-tag">{formData.designation || 'Position Pending'}</p>
                        </div>

                        <div className="completeness-section">
                            <div className="completeness-header">
                                <span>Profile Health</span>
                                <strong>{completeness}%</strong>
                            </div>
                            <div className="progress-bar-v2">
                                <div className="progress-fill" style={{ width: `${completeness}%` }}></div>
                            </div>
                            <p className="completeness-tip">Complete your bio for better visibility</p>
                        </div>

                        <nav className="side-nav">
                            {[
                                { id: 'work', label: 'Work & Identity', icon: Briefcase },
                                { id: 'finance', label: 'Payment Details', icon: CreditCard },
                                { id: 'social', label: 'Social Connections', icon: Globe },
                                { id: 'education', label: 'Academic History', icon: GraduationCap },
                                { id: 'security', label: 'Security & Access', icon: Shield },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon size={18} />
                                    <span>{tab.label}</span>
                                    {activeTab === tab.id && <ChevronRight size={14} className="nav-arrow" />}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="social-quick-card glass-premium">
                        <h3>Active Channels</h3>
                        <div className="social-links-list">
                            <div
                                className={`social-tag linkedin ${formData.social_links.linkedin ? 'active cursor-pointer' : ''}`}
                                onClick={() => openSocialLink('linkedin')}
                            >
                                <Linkedin size={14} /> LinkedIn
                            </div>
                            <div
                                className={`social-tag twitter ${formData.social_links.twitter ? 'active cursor-pointer' : ''}`}
                                onClick={() => openSocialLink('twitter')}
                            >
                                <Twitter size={14} /> Twitter
                            </div>
                            <div
                                className={`social-tag web ${formData.social_links.website ? 'active cursor-pointer' : ''}`}
                                onClick={() => openSocialLink('website')}
                            >
                                <Globe size={14} /> Website
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Dynamic Form Content */}
                <div className="content-column">
                    <div className="form-card-premium">
                        <div className="card-header">
                            <h3>{activeTab === 'social' ? 'Social Network' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Details</h3>
                            <div className="header-meta">
                                <Clock size={14} />
                                Configuration view
                            </div>
                        </div>

                        <div className="card-body">
                            {activeTab === 'work' && (
                                <div className="form-section animate-slide-up">
                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label>FULL LEGAL NAME</label>
                                            <div className="input-wrapper-v3">
                                                <User size={18} className="input-icon" />
                                                <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="e.g. Dustin M" />
                                                <div className="active-dot teal"></div>
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>PRIMARY PHONE</label>
                                            <div className="input-wrapper-v3">
                                                <Phone size={18} className="input-icon" />
                                                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>CURRENT DEPARTMENT</label>
                                            <div className="input-wrapper-v3">
                                                <Briefcase size={18} className="input-icon" />
                                                <input name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Engineering" />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>EMERGENCY CONTACT</label>
                                            <div className="input-wrapper-v3">
                                                <Heart size={18} className="input-icon" />
                                                <input name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} placeholder="Name or number" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="input-group full-width mt-8">
                                        <label>PROFESSIONAL BIOGRAPHY</label>
                                        <div className="textarea-wrapper-v3">
                                            <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Describe your professional journey and expertise..." />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'social' && (
                                <div className="form-section animate-slide-up">
                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label>LINKEDIN PROFILE URL</label>
                                            <div className="input-wrapper-v3">
                                                <Linkedin size={18} className="input-icon" />
                                                <input name="linkedin" value={formData.social_links.linkedin} onChange={(e) => handleChange(e, 'social_links')} placeholder="linkedin.com/in/username" />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>TWITTER HANDLE</label>
                                            <div className="input-wrapper-v3">
                                                <Twitter size={18} className="input-icon" />
                                                <input name="twitter" value={formData.social_links.twitter} onChange={(e) => handleChange(e, 'social_links')} placeholder="@username" />
                                            </div>
                                        </div>
                                        <div className="input-group full-width">
                                            <label>PERSONAL WEBSITE</label>
                                            <div className="input-wrapper-v3">
                                                <Globe size={18} className="input-icon" />
                                                <input name="website" value={formData.social_links.website} onChange={(e) => handleChange(e, 'social_links')} placeholder="https://example.com" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'finance' && (
                                <div className="form-section animate-slide-up">
                                    <div className="finance-layout">
                                        <div className="finance-visual">
                                            <div className="payment-card-preview">
                                                <div className="card-chip"></div>
                                                <div className="card-number">**** **** **** 4242</div>
                                                <div className="card-holder">{formData.bank_details.account_name || 'CARD HOLDER'}</div>
                                            </div>
                                        </div>
                                        <div className="finance-inputs">
                                            <div className="input-group">
                                                <label>ACCOUNT HOLDER NAME</label>
                                                <input className="minimal-input" name="account_name" value={formData.bank_details.account_name} onChange={(e) => handleChange(e, 'bank_details')} />
                                            </div>
                                            <div className="input-group">
                                                <label>BANK PROVIDER NAME</label>
                                                <input className="minimal-input" name="bank_name" value={formData.bank_details.bank_name} onChange={(e) => handleChange(e, 'bank_details')} />
                                            </div>
                                            <div className="input-group">
                                                <label>SWIFT / IFSC CODE</label>
                                                <input className="minimal-input" name="ifsc" value={formData.bank_details.ifsc} onChange={(e) => handleChange(e, 'bank_details')} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'education' && (
                                <div className="form-section animate-slide-up">
                                    {formData.education.map((edu, idx) => (
                                        <div key={idx} className="edu-entry">
                                            <div className="edu-marker"></div>
                                            <div className="form-grid">
                                                <div className="input-group">
                                                    <label>DEGREE / CERTIFICATION</label>
                                                    <input className="entry-input" value={edu.degree} onChange={(e) => handleChange(e, 'education', idx)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>INSTITUTION</label>
                                                    <input className="entry-input" value={edu.institution} onChange={(e) => handleChange(e, 'education', idx)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="form-section animate-slide-up security-clean-v3">
                                    <div className="security-visual-v3">
                                        <Shield size={64} strokeWidth={1} />
                                    </div>
                                    <div className="security-text-v3">
                                        <h3>Security & Privacy</h3>
                                        <p>Enhanced security protocols are currently active for your account.</p>
                                    </div>
                                    <div className="security-actions-v3">
                                        <button
                                            className={`minimal-action-btn ${user?.password_reset_requested ? 'text-teal-500 pointer-events-none' : ''}`}
                                            onClick={handleResetPassword}
                                        >
                                            {user?.password_reset_requested ? 'Reset Requested' : 'Reset Password'}
                                        </button>
                                        <button className="minimal-action-btn" onClick={handleToggle2FA}>
                                            {user?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .cursor-pointer { cursor: pointer; }
                :root {
                    --brand-tea: #2dd4bf;
                    --brand-slate: #0f172a;
                    --bg-matte: #f1f5f9;
                    --glass-white: rgba(255, 255, 255, 0.85);
                    --shadow-elevated: 0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
                }

                .modern-profile-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 40px;
                    background: var(--bg-matte);
                    min-height: 100vh;
                    font-family: 'Inter', system-ui, sans-serif;
                }

                /* Header Styling */
                .main-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 50px;
                }

                .title-area h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: var(--brand-slate);
                    margin: 0;
                    letter-spacing: -1.5px;
                }

                .title-area p {
                    color: #64748b;
                    font-size: 1.1rem;
                    margin: 10px 0 0 0;
                    font-weight: 500;
                }

                .status-toast {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: #10b981;
                    color: white;
                    padding: 10px 24px;
                    border-radius: 99px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-right: 15px;
                    animation: slideIn 0.4s ease-out;
                }

                .premium-save-btn {
                    background: var(--brand-slate);
                    color: white;
                    border: none;
                    padding: 16px 40px;
                    border-radius: 20px;
                    font-weight: 800;
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.3);
                }

                .premium-save-btn:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.4);
                    background: #1e293b;
                }

                /* Grid Layout */
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 40px;
                }

                /* Identity Card */
                .glass-premium {
                    background: white;
                    border-radius: 40px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: var(--shadow-elevated);
                    padding: 40px;
                    margin-bottom: 40px;
                }

                .avatar-section {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    margin: 0 auto 30px;
                }

                .avatar-ring {
                    width: 100%;
                    height: 100%;
                    border-radius: 50px;
                    background: #f8fafc;
                    border: 4px solid white;
                    box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
                    padding: 5px;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s;
                    overflow: hidden;
                }

                .avatar-content {
                    width: 100%;
                    height: 100%;
                    border-radius: 45px;
                    background: #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .avatar-content img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .camera-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    opacity: 0;
                    transition: 0.3s;
                    border-radius: 50px;
                }

                .avatar-ring:hover .camera-overlay { opacity: 1; }

                .badge-online {
                    position: absolute;
                    bottom: 5px;
                    right: 5px;
                    width: 24px;
                    height: 24px;
                    background: #10b981;
                    border: 4px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                }

                .name-section {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .name-section h2 {
                    font-size: 1.8rem;
                    font-weight: 900;
                    color: var(--brand-slate);
                    margin: 0;
                }

                .role-tag {
                    display: inline-block;
                    margin-top: 10px;
                    padding: 6px 16px;
                    background: #f1f5f9;
                    color: #64748b;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    border-radius: 99px;
                }

                /* Completeness */
                .completeness-section {
                    padding: 25px;
                    background: #f8fafc;
                    border-radius: 30px;
                    margin-bottom: 40px;
                }

                .completeness-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-bottom: 12px;
                }

                .progress-bar-v2 {
                    height: 10px;
                    background: #eaeff5;
                    border-radius: 99px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: var(--brand-tea);
                    transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* Nav Items */
                .side-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 18px 25px;
                    border-radius: 20px;
                    background: transparent;
                    border: none;
                    color: #64748b;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }

                .nav-item:hover {
                    background: #f8fafc;
                    color: var(--brand-slate);
                }

                .nav-item.active {
                    background: var(--brand-slate);
                    color: white;
                    box-shadow: 0 10px 20px -10px rgba(15, 23, 42, 0.4);
                }

                .nav-arrow {
                    margin-left: auto;
                    opacity: 0.5;
                }

                /* Social Tags */
                .social-links-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .social-tag {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #94a3b8;
                    transition: 0.2s;
                }

                .social-tag.active {
                    color: var(--brand-slate);
                }

                /* Form Card */
                .form-card-premium {
                    background: white;
                    border-radius: 40px;
                    box-shadow: var(--shadow-elevated);
                    min-height: 800px;
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 40px;
                }

                .card-header {
                    padding: 40px 50px;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .card-header h3 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 800;
                }

                .header-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                }

                .card-body {
                    padding: 50px;
                    flex: 1;
                }

                /* Premium Inputs */
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }

                .full-width { grid-column: span 2; }

                .input-group label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #94a3b8;
                    margin-bottom: 10px;
                    padding-left: 20px;
                    letter-spacing: 0.5px;
                }

                .input-wrapper-v3 {
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: #f8fafc;
                    border: 2px solid transparent;
                    border-radius: 25px;
                    padding: 0 25px;
                    transition: all 0.2s;
                }

                .input-wrapper-v3:focus-within {
                    background: white;
                    border-color: var(--brand-tea);
                    box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.05);
                }

                .input-wrapper-v3 .input-icon {
                    color: #cbd5e1;
                    margin-right: 15px;
                }

                .input-wrapper-v3 input {
                    width: 100%;
                    padding: 22px 0;
                    border: none;
                    background: transparent;
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--brand-slate);
                    outline: none;
                }

                .active-dot.teal {
                    width: 10px;
                    height: 10px;
                    background: var(--brand-tea);
                    border-radius: 50%;
                    box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.1);
                }

                .textarea-wrapper-v3 textarea {
                    width: 100%;
                    min-height: 180px;
                    background: #f8fafc;
                    border: 2px solid transparent;
                    border-radius: 30px;
                    padding: 30px;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--brand-slate);
                    resize: none;
                    outline: none;
                    transition: 0.2s;
                }

                .textarea-wrapper-v3 textarea:focus {
                    background: white;
                    border-color: var(--brand-tea);
                }

                /* Security Clean UI */
                .security-clean-v3 {
                    text-align: left;
                    padding: 40px;
                }

                .security-visual-v3 {
                    color: var(--brand-slate);
                    margin-bottom: 30px;
                }

                .security-text-v3 h3 {
                    font-size: 1.8rem;
                    font-weight: 900;
                    color: var(--brand-slate);
                    margin-bottom: 10px;
                }

                .security-text-v3 p {
                    font-size: 1.1rem;
                    color: #64748b;
                    margin-bottom: 40px;
                }

                .security-actions-v3 {
                    display: flex;
                    gap: 30px;
                }

                .minimal-action-btn {
                    background: transparent;
                    border: none;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--brand-slate);
                    cursor: pointer;
                    padding: 0;
                    transition: 0.2s;
                }

                .minimal-action-btn:hover {
                    color: var(--brand-tea);
                }

                .mt-8 { margin-top: 2rem; }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-slide-up {
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
