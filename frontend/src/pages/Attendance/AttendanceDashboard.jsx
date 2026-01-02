import { useState, useEffect } from 'react';
import { Clock, Calendar, UserCheck, History, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AttendanceCheckIn from '../../components/AttendanceCheckIn';

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

        // Auto-refresh every 10 seconds for employers
        if (user?.role === 'Employer') {
            const interval = setInterval(() => {
                fetchHistory();
            }, 10000); // Refresh every 10 seconds

            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://localhost:8000/attendance/');
            if (response.ok) {
                const data = await response.json();
                console.log('Attendance records fetched:', data);
                console.log('Total records:', data.length);
                setAttendanceHistory(data);
            } else {
                console.error('Failed to fetch attendance:', response.status);
            }
        } catch (error) {
            console.error("Fetch error", error);
        }
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
                    <h1 className="page-title">Attendance Log</h1>
                    <p className="page-subtitle">View and manage employee attendance records.</p>
                </div>
                <div className="flex gap-2">
                    {user?.role === 'Employer' && (
                        <button
                            className="btn-secondary flex items-center gap-2"
                            onClick={fetchHistory}
                        >
                            <Clock size={18} />
                            <span>Refresh</span>
                        </button>
                    )}
                    <div className="status-indicator">
                        <span className={`dot ${status === 'Checked In' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {status}
                    </div>
                </div>
            </div>

            {/* Employee Check-In Section */}
            {user?.role === 'Employee' && (
                <div className="mb-8">
                    <AttendanceCheckIn
                        employeeId={user?.id || user?._id || employeeId}
                        employeeName={user?.name}
                        variant="standard"
                    />
                </div>
            )}

            {/* Attendance table - Only for Employers */}
            {user?.role === 'Employer' && (
                <div className="card">
                    <div className="card-header p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">Today's Attendance Log</h3>
                        <span className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Department</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check In (IST)</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check Out (IST)</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Work Hours</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Break Time</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Location</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attendanceHistory
                                    .filter(record =>
                                        user?.role === 'Employer' ||
                                        record.employee_name.toLowerCase() === user?.name?.toLowerCase()
                                    )
                                    .map(record => {
                                        // Helper function to parse UTC datetime properly
                                        const parseUTCDate = (dateStr) => {
                                            if (!dateStr) return null;
                                            // Ensure UTC string has 'Z' suffix
                                            if (typeof dateStr === 'string' && !dateStr.endsWith('Z')) {
                                                return new Date(dateStr + 'Z');
                                            }
                                            return new Date(dateStr);
                                        };

                                        // Convert to IST
                                        const checkInDate = parseUTCDate(record.check_in);
                                        const checkInIST = checkInDate
                                            ? checkInDate.toLocaleTimeString('en-IN', {
                                                timeZone: 'Asia/Kolkata',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })
                                            : '-';

                                        const checkOutDate = parseUTCDate(record.check_out);
                                        const checkOutIST = checkOutDate
                                            ? checkOutDate.toLocaleTimeString('en-IN', {
                                                timeZone: 'Asia/Kolkata',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })
                                            : '-';

                                        // Calculate if late (after 9:30 AM IST)
                                        let isLate = false;
                                        if (checkInDate) {
                                            const istHour = parseInt(checkInDate.toLocaleTimeString('en-IN', {
                                                timeZone: 'Asia/Kolkata',
                                                hour: '2-digit',
                                                hour12: false
                                            }));
                                            const istMinute = parseInt(checkInDate.toLocaleTimeString('en-IN', {
                                                timeZone: 'Asia/Kolkata',
                                                minute: '2-digit'
                                            }));
                                            isLate = istHour > 9 || (istHour === 9 && istMinute > 30);
                                        }

                                        return (
                                            <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {record.employee_name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{record.employee_name}</p>
                                                            {isLate && <span className="text-xs text-orange-600 font-medium">Late</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{record.department || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-green-600" />
                                                        <span className="font-mono text-slate-900">{checkInIST}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-red-600" />
                                                        <span className="font-mono text-slate-900">{checkOutIST}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                                                        {record.work_hours || 0} hrs
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {record.break_time || '0'} min
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                        record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1 text-slate-500">
                                                        <MapPin size={14} />
                                                        <span className="text-xs">{record.location || 'Office'}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                {(user?.role === 'Employer' ? attendanceHistory.length === 0 : attendanceHistory.filter(r => r.employee_name.toLowerCase() === user?.name?.toLowerCase()).length === 0) && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                                            <UserCheck size={48} className="mx-auto mb-3 opacity-30" />
                                            <p>No attendance records found for today</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
