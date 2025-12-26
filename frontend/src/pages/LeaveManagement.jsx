import { useState } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

const LEAVE_REQUESTS = [
    { id: 1, type: 'Annual Leave', start: '2025-12-28', end: '2025-12-30', reason: 'Family vacation', status: 'Pending' },
    { id: 2, type: 'Sick Leave', start: '2025-12-15', end: '2025-12-16', reason: 'Flu symptoms', status: 'Approved' },
    { id: 3, type: 'Casual Leave', start: '2025-11-20', end: '2025-11-20', reason: 'Personal work', status: 'Rejected' },
];

export default function LeaveManagement() {
    return (
        <div className="leave-page">
            <div className="page-header flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Leave Management</h1>
                    <p className="page-subtitle">Track and manage your time off requests</p>
                </div>
                <button className="btn-premium">
                    <Plus size={18} /> Apply for Leave
                </button>
            </div>

            <div className="stats-grid mb-8">
                <div className="card p-6">
                    <h4 className="text-muted mb-2">Total Paid Leaves</h4>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold">24</span>
                        <span className="text-sm text-muted mb-1">Days remaining</span>
                    </div>
                </div>
                <div className="card p-6">
                    <h4 className="text-muted mb-2">Sick Leaves</h4>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold">12</span>
                        <span className="text-sm text-muted mb-1">Days remaining</span>
                    </div>
                </div>
                <div className="card p-6">
                    <h4 className="text-muted mb-2">Pending Requests</h4>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-amber-500">2</span>
                        <span className="text-sm text-muted mb-1">Awaiting approval</span>
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="card-header flex justify-between items-center p-6 border-b">
                    <h2 className="text-lg font-semibold">My Leave History</h2>
                </div>
                <div className="table-responsive">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="p-4 font-semibold text-slate-600">Leave Type</th>
                                <th className="p-4 font-semibold text-slate-600">Start Date</th>
                                <th className="p-4 font-semibold text-slate-600">End Date</th>
                                <th className="p-4 font-semibold text-slate-600">Reason</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LEAVE_REQUESTS.map((req) => (
                                <tr key={req.id} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium">{req.type}</td>
                                    <td className="p-4">{req.start}</td>
                                    <td className="p-4">{req.end}</td>
                                    <td className="p-4 text-muted">{req.reason}</td>
                                    <td className="p-4">
                                        <span className={`badge-status ${req.status.toLowerCase()}`}>
                                            {req.status === 'Approved' && <CheckCircle size={14} />}
                                            {req.status === 'Pending' && <Clock size={14} />}
                                            {req.status === 'Rejected' && <XCircle size={14} />}
                                            {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .leave-page { animation: fadeIn 0.4s ease-out; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
                .badge-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .badge-status.approved { background: #dcfce7; color: #166534; }
                .badge-status.pending { background: #fef3c7; color: #92400e; }
                .badge-status.rejected { background: #fee2e2; color: #991b1b; }
                .table-responsive { width: 100%; overflow-x: auto; }
            `}</style>
        </div>
    );
}
