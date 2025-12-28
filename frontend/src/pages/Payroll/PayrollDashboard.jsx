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
                            <h3 className="text-2xl font-bold text-slate-900">₹{totalPayrollCost.toLocaleString('en-IN')}</h3>
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
                <div className="card-header p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-muted">Loading payroll data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Month</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Basic</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Allowances</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Deductions</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Net Salary</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payrollHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-slate-500">No payroll records found. Run payroll to generate data.</td>
                                    </tr>
                                ) : (
                                    payrollHistory
                                        .filter(record =>
                                            user?.role === 'Employer' ||
                                            record.employee_name.toLowerCase() === user?.name?.toLowerCase()
                                        )
                                        .map((record) => (
                                            <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">{record.employee_name}</td>
                                                <td className="px-6 py-4 text-slate-600">{record.month} {record.year}</td>
                                                <td className="px-6 py-4 text-right text-slate-900">₹{record.basic_salary.toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4 text-right text-green-600">₹{record.total_allowances.toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4 text-right text-red-600">-₹{record.total_deductions.toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-900">₹{record.net_salary.toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">{record.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button className="text-blue-600 hover:text-blue-700 transition-colors" title="Download Payslip">
                                                        <Download size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
