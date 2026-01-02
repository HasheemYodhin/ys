import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

    // Mock balances - ideally these would come from the backend
    const LEAVE_BALANCES = {
        'Annual Leave': 24,
        'Sick Leave': 12,
        'Casual Leave': 8,
        'Maternity Leave': 90,
        'Paternity Leave': 15
    };

    const [formData, setFormData] = useState({
        leave_type: 'Annual Leave',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const [totalDays, setTotalDays] = useState(0);
    const [dateError, setDateError] = useState('');

    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);

            if (end < start) {
                setDateError('End date cannot be earlier than start date');
                setTotalDays(0);
            } else {
                setDateError('');
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setTotalDays(diffDays);
            }
        } else {
            setTotalDays(0);
            setDateError('');
        }
    }, [formData.start_date, formData.end_date]);

    const fetchLeaves = async () => {
        try {
            const token = sessionStorage.getItem('ys_token');
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
        if (dateError) return;

        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('ys_token');
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
                // Simple feedback for now - could be a toast component
                alert("✓ Success! Your leave application has been submitted.");
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.detail || 'Failed to submit leave'}`);
            }
        } catch (error) {
            alert(`Network Error: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAction = async (leaveId, status) => {
        try {
            const token = sessionStorage.getItem('ys_token');
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
                        <span className="text-3xl font-bold text-slate-900">{LEAVE_BALANCES['Annual Leave']}</span>
                        <span className="text-xs text-slate-400 mb-1">Days remaining</span>
                    </div>
                </div>
                <div className="card p-6 border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Sick Leaves</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900">{LEAVE_BALANCES['Sick Leave']}</span>
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
            {showModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content shadow-premium shadow-2xl">
                        {/* Header */}
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Apply for Leave</h2>
                                <p className="modal-subtitle">Fill in the details below to submit your request.</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="modal-body">
                            <form onSubmit={handleApplyLeave} className="modal-form">
                                {/* Leave Type & Balance Row */}
                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label className="form-label">Leave Type</label>
                                        <select
                                            className="modern-select"
                                            value={formData.leave_type}
                                            onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                        >
                                            {Object.keys(LEAVE_BALANCES).map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group min-w-[140px]">
                                        <label className="form-label">Balance</label>
                                        <div className="balance-badge">
                                            {LEAVE_BALANCES[formData.leave_type]} Days
                                        </div>
                                    </div>
                                </div>

                                {/* Date Range Row */}
                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label className="form-label">From Date</label>
                                        <input
                                            type="date"
                                            className={`modern-date ${dateError ? 'error' : ''}`}
                                            required
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label className="form-label">To Date</label>
                                        <input
                                            type="date"
                                            className={`modern-date ${dateError ? 'error' : ''}`}
                                            required
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Validation Message or Total Days */}
                                {dateError ? (
                                    <div className="error-message">
                                        <AlertCircle size={14} />
                                        <span>{dateError}</span>
                                    </div>
                                ) : totalDays > 0 ? (
                                    <div className="success-info">
                                        <CheckCircle size={14} />
                                        <span>Total Duration: <strong>{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</strong></span>
                                    </div>
                                ) : null}

                                {/* Reason Section */}
                                <div className="form-group">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="form-label mb-0">Reason for Request</label>
                                        <span className={`char-limit ${formData.reason.length > 230 ? 'warning' : ''}`}>
                                            {formData.reason.length}/250
                                        </span>
                                    </div>
                                    <textarea
                                        className="modern-textarea"
                                        placeholder="Please provide details about your leave..."
                                        required
                                        maxLength={250}
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    ></textarea>
                                </div>

                                {/* Footer Actions */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-modal-cancel"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-modal-submit"
                                        disabled={submitting || !!dateError || !formData.start_date || !formData.end_date}
                                    >
                                        {submitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="spinner-small"></div>
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Send size={16} />
                                                <span>Submit Request</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                .modal-overlay {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    background: rgba(15, 23, 42, 0.7) !important;
                    backdrop-filter: blur(8px);
                    z-index: 99999 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 24px;
                }

                .modal-content {
                    width: 100%;
                    max-width: 600px;
                    background: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    animation: modalEntry 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes modalEntry {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .modal-header {
                    padding: 24px 32px;
                    border-bottom: 1px solid #f1f5f9;
                    background: #f8fafc;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 4px;
                }

                .modal-subtitle {
                    font-size: 0.85rem;
                    color: #64748b;
                }

                .modal-close-btn {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    border-radius: 10px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s;
                }

                .modal-close-btn:hover {
                    color: #ef4444;
                    border-color: #fecaca;
                    background: #fef2f2;
                }

                .modal-body {
                    padding: 32px;
                }

                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .form-row {
                    display: flex;
                    gap: 16px;
                }

                @media (max-width: 640px) {
                    .form-row {
                        flex-direction: column;
                    }
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #475569;
                }

                .modern-select, .modern-date, .modern-textarea {
                    width: 100%;
                    padding: 12px 14px;
                    background: #ffffff;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    transition: all 0.2s;
                }

                .modern-select:focus, .modern-date:focus, .modern-textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .modern-date.error {
                    border-color: #fca5a5;
                    background: #fffbfa;
                }

                .balance-badge {
                    padding: 12px 16px;
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    color: #2563eb;
                    font-weight: 700;
                    border-radius: 10px;
                    text-align: center;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .error-message {
                    padding: 12px;
                    background: #fef2f2;
                    border: 1px solid #fee2e2;
                    color: #dc2626;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .success-info {
                    padding: 12px;
                    background: #f0fdf4;
                    border: 1px solid #dcfce7;
                    color: #16a34a;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .char-limit {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #94a3b8;
                }

                .char-limit.warning {
                    color: #f59e0b;
                }

                .modern-textarea {
                    min-height: 120px;
                    resize: none;
                    line-height: 1.5;
                }

                .modal-footer {
                    display: flex;
                    gap: 12px;
                    margin-top: 8px;
                }

                .btn-modal-cancel {
                    flex: 1;
                    height: 52px;
                    font-weight: 700;
                    color: #64748b;
                    background: #f1f5f9;
                    border-radius: 12px;
                    transition: all 0.2s;
                }

                .btn-modal-cancel:hover {
                    background: #e2e8f0;
                    color: #475569;
                }

                .btn-modal-submit {
                    flex: 2;
                    height: 52px;
                    font-weight: 700;
                    color: #ffffff;
                    background: #0f172a;
                    border-radius: 12px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn-modal-submit:hover:not(:disabled) {
                    background: #1e293b;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
                }

                .btn-modal-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .spinner-small {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: #ffffff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
