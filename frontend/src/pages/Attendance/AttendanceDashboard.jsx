import { useState, useEffect } from 'react';
import { Clock, Calendar, UserCheck, History, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AttendanceDashboard() {
    const { user } = useAuth();
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [status, setStatus] = useState('Checked Out');
    const [loading, setLoading] = useState(false);
    const [employeeId, setEmployeeId] = useState(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await fetch('http://localhost:8000/employees/');
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        // Try to find the employee that matches the logged in user
                        const matched = data.find(emp =>
                            `${emp.first_name} ${emp.last_name}`.toLowerCase() === user?.name?.toLowerCase()
                        );
                        setEmployeeId(matched ? matched._id : data[0]._id);
                    }
                }
            } catch (e) { console.error("No employees found check setup"); }
        };
        fetchEmployee();
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://localhost:8000/attendance/');
            if (response.ok) {
                setAttendanceHistory(await response.json());
            }
        } catch (error) { console.error("Fetch error", error); }
    };

    const handleAttendanceAction = async (type) => {
        if (!employeeId) {
            alert("Please create an employee first to simulate attendance.");
            return;
        }
        setLoading(true);
        const endpoint = type === 'in' ? 'checkin' : 'checkout';

        try {
            const response = await fetch(`http://localhost:8000/attendance/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId })
            });

            if (response.ok) {
                setStatus(type === 'in' ? 'Checked In' : 'Checked Out');
                await fetchHistory();
            } else {
                const err = await response.json();
                alert(err.detail);
            }
        } catch (error) {
            alert("Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Attendance & Tracking</h1>
                    <p className="page-subtitle">Manage daily work hours and logs.</p>
                </div>
                <div className="flex gap-2">
                    <div className="status-indicator">
                        <span className={`dot ${status === 'Checked In' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {status}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Clock In/Out Hero Card */}
                <div className="card clock-card lg:col-span-1">
                    <div className="clock-header">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Time</span>
                        <h2 className="text-3xl font-bold text-slate-800 my-2">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </h2>
                        <span className="text-sm text-primary-600 font-semibold bg-primary-50 px-3 py-1 rounded-full">
                            {new Date().toDateString()}
                        </span>
                    </div>

                    <div className="action-area my-8">
                        {status === 'Checked Out' ? (
                            <button
                                className="btn-circle btn-checkin"
                                onClick={() => handleAttendanceAction('in')}
                                disabled={loading}
                            >
                                <MapPin size={32} />
                                <span>Check In</span>
                            </button>
                        ) : (
                            <button
                                className="btn-circle btn-checkout"
                                onClick={() => handleAttendanceAction('out')}
                                disabled={loading}
                            >
                                <History size={32} />
                                <span>Check Out</span>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Location: Office (IP: 192.168.1.1)
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card p-6 flex items-center gap-4 border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                                <UserCheck size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Days Present</p>
                                <h3 className="text-2xl font-bold text-slate-900">24</h3>
                                <p className="text-xs text-green-600 font-medium">+2 from last month</p>
                            </div>
                        </div>
                        <div className="card p-6 flex items-center gap-4 border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Avg. Work Hours</p>
                                <h3 className="text-2xl font-bold text-slate-900">8.5 hrs</h3>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 flex-1 flex flex-col justify-center items-center border border-slate-100 shadow-sm bg-slate-50/50">
                        <h4 className="font-semibold text-slate-700 mb-2 w-full text-left">Weekly Insight</h4>
                        <div className="text-slate-400 text-sm italic">
                            Activity Graph Placeholder (Chart.js / Recharts)
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header p-4 border-b border-gray-100 flex justify-between">
                    <h3 className="font-semibold text-gray-800">Attendance Log</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Employe</th>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Hours</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceHistory
                            .filter(record =>
                                user?.role === 'Employer' ||
                                record.employee_name.toLowerCase() === user?.name?.toLowerCase()
                            )
                            .map(record => (
                                <tr key={record._id}>
                                    <td className="font-medium">{record.employee_name}</td>
                                    <td>{record.date}</td>
                                    <td>{record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-'}</td>
                                    <td>{record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-'}</td>
                                    <td className="font-mono">{record.work_hours} h</td>
                                    <td>
                                        <span className="status-badge status-active">{record.status}</span>
                                    </td>
                                </tr>
                            ))}
                        {(user?.role === 'Employer' ? attendanceHistory.length === 0 : attendanceHistory.filter(r => r.employee_name.toLowerCase() === user?.name?.toLowerCase()).length === 0) && (
                            <tr><td colSpan="6" className="text-center p-8 text-gray-400">No records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
        .clock-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 32px;
            background: linear-gradient(to bottom right, #ffffff, #f8fafc);
        }
        .clock-header {
            text-align: center;
            margin-bottom: 32px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .text-uppercase { text-transform: uppercase; font-size: 0.7rem; }
        
        .btn-circle {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .btn-checkin {
            background: linear-gradient(135deg, #4f46e5, #4338ca);
            color: white;
        }
        .btn-checkin:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4);
        }

        .btn-checkout {
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white;
        }
        .btn-checkout:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 20px 25px -5px rgba(234, 88, 12, 0.4);
        }

        .btn-circle svg { margin-bottom: 4px; }
        .btn-circle span { font-weight: 600; font-size: 1.1rem; }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: white;
            border: 1px solid var(--border-color);
            border-radius: full;
            border-radius: 999px;
            font-size: 0.875rem;
            color: var(--text-muted);
        }
        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .bg-green-500 { background-color: #22c55e; }
        .bg-gray-400 { background-color: #9ca3af; }
        .bg-indigo-50 { background-color: #eef2ff; }
        .bg-orange-50 { background-color: #fff7ed; }
        .text-orange-600 { color: #ea580c; }
      `}</style>
        </div>
    );
}
