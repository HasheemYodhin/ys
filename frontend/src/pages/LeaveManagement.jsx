import { useState, useEffect } from 'react';
import {
    Calendar, Plus, Clock, CheckCircle, XCircle,
    ThumbsUp, ThumbsDown, AlertCircle, Send, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LeaveManagement() {
    const { user } = useAuth();
    const isEmployer = user?.role === 'Employer';

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        leave_type: 'Annual Leave',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const fetchLeaves = async () => {
        try {
            const token = localStorage.getItem('ys_token');
            const response = await fetch('http://localhost:8000/leaves/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setLeaves(await response.json());
            }
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('ys_token');
            const response = await fetch('http://localhost:8000/leaves/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowModal(false);
                setFormData({ leave_type: 'Annual Leave', start_date: '', end_date: '', reason: '' });
                await fetchLeaves();
                alert("Leave application sent successfully!");
            }
        } catch (error) {
            alert("Error submitting leave");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAction = async (leaveId, status) => {
        try {
            const token = localStorage.getItem('ys_token');
            const response = await fetch(`http://localhost:8000/leaves/${leaveId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                await fetchLeaves();
            }
        } catch (error) {
            alert("Error updating status");
        }
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Leave Management</h1>
                    <p className="page-subtitle">
                        {isEmployer ? "Review and manage team leave requests" : "Track and manage your time off requests"}
                    </p>
                </div>
                {!isEmployer && (
                    <button className="btn-premium flex items-center gap-2" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Apply for Leave
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6 border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Paid Leaves</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900">24</span>
                        <span className="text-xs text-slate-400 mb-1">Days remaining</span>
                    </div>
                </div>
                <div className="card p-6 border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Sick Leaves</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900">12</span>
                        <span className="text-xs text-slate-400 mb-1">Days remaining</span>
                    </div>
                </div>
                <div className="card p-6 border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Pending Requests</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-amber-500">
                            {leaves.filter(l => l.status === 'Pending').length}
                        </span>
                        <span className="text-xs text-slate-400 mb-1">Awaiting approval</span>
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                    <h2 className="text-lg font-bold text-slate-800">
                        {isEmployer ? "Incoming Leave Requests" : "My Leave History"}
                    </h2>
                </div>
                <div className="table-container">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                {isEmployer && <th className="p-4 font-semibold text-slate-600">Employee</th>}
                                <th className="p-4 font-semibold text-slate-600">Leave Type</th>
                                <th className="p-4 font-semibold text-slate-600">Start Date</th>
                                <th className="p-4 font-semibold text-slate-600">End Date</th>
                                <th className="p-4 font-semibold text-slate-600">Reason</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                {isEmployer && <th className="p-4 font-semibold text-slate-600 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="p-12 text-center text-slate-400 italic">Finding records...</td></tr>
                            ) : leaves.length === 0 ? (
                                <tr><td colSpan="7" className="p-12 text-center text-slate-400 italic">No leave history found</td></tr>
                            ) : (
                                leaves.map((req) => (
                                    <tr key={req._id}>
                                        {isEmployer && <td className="p-4 font-bold text-slate-900">{req.employee_name}</td>}
                                        <td className="p-4 font-semibold text-slate-700">{req.leave_type}</td>
                                        <td className="p-4 text-slate-500">{req.start_date}</td>
                                        <td className="p-4 text-slate-500">{req.end_date}</td>
                                        <td className="p-4 text-slate-500 text-sm max-w-xs truncate" title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td className="p-4">
                                            <span className={`badge-status ${req.status.toLowerCase()}`}>
                                                {req.status === 'Approved' && <CheckCircle size={12} />}
                                                {req.status === 'Pending' && <Clock size={12} />}
                                                {req.status === 'Rejected' && <XCircle size={12} />}
                                                {req.status}
                                            </span>
                                        </td>
                                        {isEmployer && (
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    {req.status === 'Pending' ? (
                                                        <>
                                                            <button
                                                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                                onClick={() => handleAction(req._id, 'Approved')}
                                                                title="Approve"
                                                            >
                                                                <ThumbsUp size={16} />
                                                            </button>
                                                            <button
                                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                onClick={() => handleAction(req._id, 'Rejected')}
                                                                title="Reject"
                                                            >
                                                                <ThumbsDown size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 uppercase font-bold">Processed</span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Application Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content show p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Apply for Leave</h2>
                            <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleApplyLeave} className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Leave Type</label>
                                    <select
                                        className="modern-select"
                                        value={formData.leave_type}
                                        onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                    >
                                        <option value="Annual Leave">Annual Leave</option>
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Casual Leave">Casual Leave</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Dates</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            className="modern-date"
                                            required
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                        <span className="text-slate-400">to</span>
                                        <input
                                            type="date"
                                            className="modern-date"
                                            required
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Reason</label>
                                <textarea
                                    className="modern-textarea"
                                    rows="3"
                                    placeholder="Briefly describe the reason for your leave..."
                                    required
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-premium" disabled={submitting}>
                                    <Send size={18} /> {submitting ? 'Sending...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-content {
                    width: 100%;
                    max-width: 650px;
                    border-radius: 24px;
                    background: white;
                }

                .modal-content.show {
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .modern-select, .modern-date, .modern-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    background: var(--slate-50);
                }
                .modern-select:focus, .modern-date:focus, .modern-textarea:focus {
                    outline: none;
                    background: white;
                    border-color: var(--primary-500);
                    box-shadow: 0 0 0 4px var(--primary-50);
                }

                .btn-outline {
                    padding: 10px 24px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    font-weight: 600;
                    color: var(--slate-600);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .btn-outline:hover {
                    background: var(--slate-50);
                    border-color: var(--slate-300);
                }
            `}</style>
        </div>
    );
}
