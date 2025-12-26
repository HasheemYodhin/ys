import { useState, useEffect } from 'react';
import { Banknote, CreditCard, Calendar, Download, Play } from 'lucide-react';

export default function PayrollDashboard() {
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
            <div className="page-header-flex">
                <div>
                    <h1 className="page-title">Payroll & Compliance</h1>
                    <p className="page-subtitle">Manage salaries, taxes, and payslips.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleRunPayroll}
                    disabled={runningPayroll}
                >
                    <Play size={18} />
                    {runningPayroll ? 'Processing...' : 'Run This Month Payroll'}
                </button>
            </div>

            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-icon bg-green-100 text-green-600">
                        <Banknote size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Disbursed (YTD)</span>
                        <span className="stat-value">${totalPayrollCost.toLocaleString()}</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-blue-100 text-blue-600">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Next Pay Date</span>
                        <span className="stat-value">Dec 31, 2025</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon bg-purple-100 text-purple-600">
                        <CreditCard size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Pending Reviews</span>
                        <span className="stat-value">0</span>
                    </div>
                </div>
            </div>

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
                                payrollHistory.map((record) => (
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
                                            <button className="action-btn text-blue-600">
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
