import { useState, useEffect } from 'react';
import { Banknote, CreditCard, Calendar, Download, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PayrollDashboard() {
    const { user } = useAuth();
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [runningPayroll, setRunningPayroll] = useState(false);

    const fetchPayroll = async () => {
        try {
            const response = await fetch('http://localhost:8000/payroll/');
            if (response.ok) {
                const data = await response.json();
                setPayrollHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch payroll history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRunPayroll = async () => {
        setRunningPayroll(true);
        const today = new Date();
        const month = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();

        try {
            const response = await fetch('http://localhost:8000/payroll/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, year })
            });

            if (response.ok) {
                await fetchPayroll();
                alert(`Payroll processed successfully for ${month} ${year}`);
            } else {
                alert("Failed to run payroll");
            }
        } catch (error) {
            console.error("Error running payroll", error);
        } finally {
            setRunningPayroll(false);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, []);

    const totalPayrollCost = payrollHistory.reduce((sum, record) => sum + record.net_salary, 0);

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Payroll & Compliance</h1>
                    <p className="page-subtitle">
                        {user?.role === 'Employer'
                            ? "Manage salaries, taxes, and payslips."
                            : "View your recent pay slips and earnings."}
                    </p>
                </div>
                {user?.role === 'Employer' && (
                    <button
                        className="btn-primary flex items-center gap-2"
                        onClick={handleRunPayroll}
                        disabled={runningPayroll}
                    >
                        <Play size={18} />
                        {runningPayroll ? 'Processing...' : 'Run This Month Payroll'}
                    </button>
                )}
            </div>

            {user?.role === 'Employer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="card stat-card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                            <Banknote size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Disbursed (YTD)</p>
                            <h3 className="text-2xl font-bold text-slate-900">${totalPayrollCost.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="card stat-card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Next Pay Date</p>
                            <h3 className="text-2xl font-bold text-slate-900">Dec 31, 2025</h3>
                        </div>
                    </div>
                    <div className="card stat-card p-6 flex items-center gap-4 md:col-span-2 lg:col-span-1">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
                            <h3 className="text-2xl font-bold text-slate-900">0</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="card table-card mt-6">
                <div className="card-header p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-muted">Loading payroll data...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Month</th>
                                <th>Basic</th>
                                <th>Allowances</th>
                                <th>Deductions</th>
                                <th>Net Salary</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="empty-state">No payroll records found. Run payroll to generate data.</td>
                                </tr>
                            ) : (
                                payrollHistory
                                    .filter(record =>
                                        user?.role === 'Employer' ||
                                        record.employee_name.toLowerCase() === user?.name?.toLowerCase()
                                    )
                                    .map((record) => (
                                        <tr key={record._id}>
                                            <td className="font-medium text-gray-900">{record.employee_name}</td>
                                            <td>{record.month} {record.year}</td>
                                            <td>${record.basic_salary.toLocaleString()}</td>
                                            <td>${record.total_allowances.toLocaleString()}</td>
                                            <td className="text-red-500">-${record.total_deductions.toLocaleString()}</td>
                                            <td className="font-bold text-green-600">${record.net_salary.toLocaleString()}</td>
                                            <td>
                                                <span className="status-badge status-active">{record.status}</span>
                                            </td>
                                            <td>
                                                <button className="action-btn text-blue-600" title="Download Payslip">
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
        .bg-green-100 { background-color: #dcfce7; }
        .text-green-600 { color: #16a34a; }
        .bg-blue-100 { background-color: #dbeafe; }
        .text-blue-600 { color: #2563eb; }
        .bg-purple-100 { background-color: #f3e8ff; }
        .text-purple-600 { color: #9333ea; }
        .text-red-500 { color: #ef4444; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }

        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1;
        }

        .mt-6 { margin-top: 24px; }
      `}</style>
        </div>
    );
}
