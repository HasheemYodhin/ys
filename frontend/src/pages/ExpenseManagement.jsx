import { CreditCard, Plus, Receipt, CheckCircle, Clock, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EXPENSES = [
    { id: 1, category: 'Travel', amount: 450.00, date: '2025-12-20', description: 'Uber for client meeting', status: 'Approved' },
    { id: 2, category: 'Food', amount: 85.50, date: '2025-12-22', description: 'Team lunch', status: 'Pending' },
    { id: 3, category: 'Supplies', amount: 120.00, date: '2025-11-15', description: 'Office stationery', status: 'Approved' },
];

export default function ExpenseManagement() {
    const { user } = useAuth();
    const isEmployer = user?.role === 'Employer';

    return (
        <div className="expense-page">
            <div className="page-header flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Expense Management</h1>
                    <p className="page-subtitle">
                        {isEmployer ? "Review and approve business expense claims" : "Track and claim your business expenses"}
                    </p>
                </div>
                {!isEmployer && (
                    <button className="btn-premium">
                        <Plus size={18} /> Submit New Claim
                    </button>
                )}
            </div>

            <div className="stats-grid mb-8">
                <div className="card p-6 border-l-4 border-primary-500">
                    <h4 className="text-muted mb-2">Total Claims (This Month)</h4>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold font-mono">$535.50</span>
                    </div>
                </div>
                <div className="card p-6 border-l-4 border-green-500">
                    <h4 className="text-muted mb-2">Approved Amount</h4>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold font-mono text-green-600">$450.00</span>
                    </div>
                </div>
                <div className="card p-6 border-l-4 border-amber-500">
                    <h4 className="text-muted mb-2">Pending Claims</h4>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold font-mono text-amber-500">$85.50</span>
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="card-header p-6 border-b">
                    <h2 className="text-lg font-semibold">Recent Expense Claims</h2>
                </div>
                <div className="table-responsive">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                {isEmployer && <th className="p-4 font-semibold text-slate-600">Employee</th>}
                                <th className="p-4 font-semibold text-slate-600">Category</th>
                                <th className="p-4 font-semibold text-slate-600">Amount</th>
                                <th className="p-4 font-semibold text-slate-600">Date</th>
                                <th className="p-4 font-semibold text-slate-600">Description</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {EXPENSES.map((ex) => (
                                <tr key={ex.id} className="border-b hover:bg-slate-50 transition-colors">
                                    {isEmployer && <td className="p-4 font-bold">{user?.name}</td>}
                                    <td className="p-4 text-primary-600 font-medium">#{ex.category}</td>
                                    <td className="p-4 font-mono font-bold">${ex.amount.toFixed(2)}</td>
                                    <td className="p-4 text-muted">{ex.date}</td>
                                    <td className="p-4">{ex.description}</td>
                                    <td className="p-4">
                                        <span className={`badge-status ${ex.status.toLowerCase()}`}>
                                            {ex.status === 'Approved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            {ex.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button className="text-primary-600 hover:text-primary-800" title="View Receipt">
                                                <FileText size={18} />
                                            </button>
                                            {isEmployer && (
                                                <>
                                                    <button className="text-green-600 hover:text-green-800" title="Approve"><ThumbsUp size={18} /></button>
                                                    <button className="text-red-600 hover:text-red-800" title="Reject"><ThumbsDown size={18} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .expense-page { animation: fadeIn 0.4s ease-out; }
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
                .table-responsive { width: 100%; overflow-x: auto; }
            `}</style>
        </div>
    );
}
