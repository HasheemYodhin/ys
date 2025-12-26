import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Briefcase, Calendar,
    Camera, Save, Shield, CreditCard, GraduationCap,
    Award, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address: '',
        dob: '',
        bio: '',
        emergency_contact: '',
        department: '',
        designation: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                dob: user.dob || '',
                bio: user.bio || '',
                emergency_contact: user.emergency_contact || '',
                department: user.department || '',
                designation: user.designation || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(formData);
            alert("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            alert(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const calculateCompleteness = () => {
        const fields = ['full_name', 'phone', 'address', 'dob', 'bio', 'emergency_contact', 'department', 'designation'];
        const filledFields = fields.filter(f => formData[f] && formData[f].length > 0);
        return Math.round((filledFields.length / fields.length) * 100);
    };

    const completeness = calculateCompleteness();

    return (
        <div className="page-container max-w-6xl mx-auto">
            <div className="page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Personal and professional workplace information</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:block text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Profile Completeness</p>
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-600 transition-all duration-1000"
                                    style={{ width: `${completeness}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-bold text-slate-700">{completeness}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navbar Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card p-6 overflow-hidden">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-slate-100 shadow-sm overflow-hidden transition-all group-hover:border-primary-200">
                                    {user?.profile_photo ? (
                                        <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-slate-300" />
                                    )}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 shadow-md border border-slate-100 transition-all">
                                    <Camera size={14} />
                                </button>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 mt-4">{user?.name}</h2>
                            <p className="text-slate-500 text-xs font-medium">{user?.designation || 'Update your role'}</p>
                        </div>

                        <div className="space-y-1">
                            {[
                                { id: 'personal', label: 'Personal Info', icon: User },
                                { id: 'work', label: 'Work & Experience', icon: Briefcase },
                                { id: 'finance', label: 'Bank & Finance', icon: CreditCard },
                                { id: 'education', label: 'Education', icon: GraduationCap },
                                { id: 'security', label: 'Security', icon: Shield },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === tab.id
                                        ? 'bg-primary-50 text-primary-700 font-semibold'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <tab.icon size={18} />
                                        <span className="text-sm">{tab.label}</span>
                                    </div>
                                    {activeTab === tab.id && <ChevronRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card p-5 bg-gradient-to-br from-indigo-600 to-primary-700 text-white border-0 shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold flex items-center gap-2 mb-2">
                                <Award size={18} />
                                YS Badges
                            </h4>
                            <p className="text-xs text-indigo-100 mb-4 opacity-80">Complete your profile to earn the 'Early Adopter' badge!</p>
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Award size={20} className="text-indigo-200" />
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <div className="card overflow-hidden">
                        <div className="card-header flex justify-between items-center p-6 border-b bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-slate-800 capitalize">{activeTab} Details</h3>
                                {completeness < 100 && activeTab === 'personal' && (
                                    <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold border border-amber-100 uppercase tracking-tighter">
                                        <AlertCircle size={10} /> Incomplete
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isEditing
                                    ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                                    }`}
                            >
                                {isEditing ? 'Cancel Editing' : <><User size={14} /> Edit Information</>}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Full Name</label>
                                        <div className="input-group">
                                            <User size={16} />
                                            <input
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="modern-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Mobile Number</label>
                                        <div className="input-group">
                                            <Phone size={16} />
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="modern-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Birthday</label>
                                        <div className="input-group">
                                            <Calendar size={16} />
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="modern-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Emergency Contact</label>
                                        <div className="input-group">
                                            <Phone size={16} className="text-red-400" />
                                            <input
                                                name="emergency_contact"
                                                value={formData.emergency_contact}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="modern-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Address</label>
                                        <div className="input-group items-start">
                                            <MapPin size={16} className="mt-3" />
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="modern-input min-h-[80px] py-3"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Career Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="modern-input min-h-[100px]"
                                            placeholder="Write a brief professional summary..."
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'work' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Department</label>
                                        <input
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="modern-input"
                                            placeholder="e.g. Finance, UX Design"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Designation</label>
                                        <input
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="modern-input"
                                            placeholder="e.g. Product Manager"
                                        />
                                    </div>
                                    <div className="md:col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Clock size={16} className="text-primary-600" />
                                            Employment History
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="flex gap-4">
                                                <div className="w-1.5 h-auto bg-slate-200 rounded-full"></div>
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm">Joined YS HR Systems</p>
                                                    <p className="text-slate-500 text-xs">January 2024 - Present</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'finance' && (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                        <CreditCard size={32} />
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-2">Payroll Details</h4>
                                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Register your bank account details securely for monthly salary disbursement.</p>
                                    <button type="button" className="btn btn-outline text-xs">Add Bank Account</button>
                                </div>
                            )}

                            {isEditing && (
                                <div className="flex justify-end gap-3 mt-10 pt-6 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        Discard Changes
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-8 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-md transition-all disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                        {saving ? 'Processing...' : 'Save All Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {!isEditing && activeTab === 'personal' && (
                        <div className="mt-6 flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700">
                            <CheckCircle2 size={20} />
                            <p className="text-sm font-medium">Your profile information is securely encrypted and only visible to HR administrators.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .modern-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    background: white;
                    color: var(--slate-900);
                    font-size: 0.95rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .modern-input:focus {
                    border-color: var(--primary-500);
                    box-shadow: 0 0 0 4px var(--primary-50);
                    outline: none;
                }

                .modern-input:disabled {
                    background: var(--slate-50);
                    color: var(--slate-500);
                    border-color: #f1f5f9;
                    cursor: not-allowed;
                }

                .input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-group svg {
                    position: absolute;
                    left: 14px;
                    color: var(--slate-400);
                    pointer-events: none;
                }

                .input-group .modern-input {
                    padding-left: 44px;
                }

                .card {
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                }

                .btn-outline {
                    border: 1px solid var(--border-color);
                    color: var(--slate-600);
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-weight: 600;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-outline:hover {
                    background: var(--slate-50);
                    border-color: var(--slate-300);
                }
            `}</style>
        </div>
    );
}
