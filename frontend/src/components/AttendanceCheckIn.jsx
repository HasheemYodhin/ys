import { useState, useEffect } from 'react';
import { MapPin, Clock, LogIn, LogOut, Loader, Calendar } from 'lucide-react';

export default function AttendanceCheckIn({ employeeId, employeeName }) {
    const [status, setStatus] = useState('checked_out');
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [todayRecord, setTodayRecord] = useState(null);
    const [actualEmployeeId, setActualEmployeeId] = useState(null);

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Location error:', error);
                    setLocation({ latitude: 0, longitude: 0 });
                }
            );
        } else {
            setLocation({ latitude: 0, longitude: 0 });
        }

        // Fetch employee ID from employees collection
        fetchEmployeeId();

        return () => clearInterval(timer);
    }, [employeeName]);

    useEffect(() => {
        if (actualEmployeeId) {
            fetchTodayAttendance();
        }
    }, [actualEmployeeId]);

    const fetchEmployeeId = async () => {
        try {
            const response = await fetch('http://localhost:8000/employees/');
            if (response.ok) {
                const employees = await response.json();
                // Find employee by name
                const employee = employees.find(emp =>
                    `${emp.first_name} ${emp.last_name}`.toLowerCase() === employeeName?.toLowerCase()
                );
                if (employee) {
                    setActualEmployeeId(employee._id);
                } else {
                    console.error('Employee not found in database');
                }
            }
        } catch (error) {
            console.error('Failed to fetch employee:', error);
        }
    };

    const fetchTodayAttendance = async () => {
        if (!actualEmployeeId) return;

        try {
            const response = await fetch(`http://localhost:8000/attendance/today/${actualEmployeeId}`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setTodayRecord(data);
                    setStatus(data.check_out ? 'checked_out' : 'checked_in');
                }
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    };

    const handleCheckIn = async () => {
        if (!actualEmployeeId) {
            alert('Employee not found. Please contact administrator.');
            return;
        }

        if (!location) {
            alert('Please enable location services');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/attendance/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: actualEmployeeId,
                    employee_name: employeeName,
                    location: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
                    check_in: new Date().toISOString()
                })
            });

            if (response.ok) {
                const data = await response.json();
                setTodayRecord(data);
                setStatus('checked_in');
                alert('✓ Check-in successful!');
                await fetchTodayAttendance();
            } else {
                const error = await response.json();
                alert(error.detail || 'Check-in failed');
            }
        } catch (error) {
            console.error('Check-in error:', error);
            alert('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!actualEmployeeId) {
            alert('Employee not found. Please contact administrator.');
            return;
        }

        setLoading(true);
        try {
            console.log('Attempting checkout for employee:', actualEmployeeId);

            const response = await fetch('http://localhost:8000/attendance/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: actualEmployeeId,
                    check_out: new Date().toISOString()
                })
            });

            console.log('Checkout response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Checkout successful:', data);
                setTodayRecord(data);
                setStatus('checked_out');
                alert('✓ Check-out successful!');
                await fetchTodayAttendance();
            } else {
                const errorText = await response.text();
                console.error('Checkout failed:', errorText);
                try {
                    const error = JSON.parse(errorText);
                    alert(`Check-out failed: ${error.detail || 'Unknown error'}`);
                } catch {
                    alert(`Check-out failed: ${errorText}`);
                }
            }
        } catch (error) {
            console.error('Check-out error:', error);
            alert(`Network error: ${error.message}. Please check if backend is running.`);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        if (!date) return '-';

        // Ensure the date string is treated as UTC
        let dateObj = new Date(date);

        // If the date string doesn't end with 'Z', it might not be recognized as UTC
        if (typeof date === 'string' && !date.endsWith('Z')) {
            dateObj = new Date(date + 'Z');
        }

        return dateObj.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const calculateWorkHours = () => {
        if (!todayRecord?.check_in) return '0h 0m';
        const checkIn = new Date(todayRecord.check_in);
        const checkOut = todayRecord.check_out ? new Date(todayRecord.check_out) : new Date();
        const diff = checkOut - checkIn;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="simple-attendance-container">
            {/* Main Card */}
            <div className="attendance-card">
                {/* Time Display */}
                <div className="time-section">
                    <div className="time-display">
                        {currentTime.toLocaleTimeString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        })}
                    </div>
                    <div className="date-display">
                        <Calendar size={16} />
                        {currentTime.toLocaleDateString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`status-badge ${status === 'checked_in' ? 'checked-in' : 'checked-out'}`}>
                    <div className="status-dot"></div>
                    {status === 'checked_in' ? 'Checked In' : 'Checked Out'}
                </div>

                {/* Action Button */}
                <div className="button-section">
                    {status === 'checked_out' ? (
                        <button
                            className="action-btn check-in-btn"
                            onClick={handleCheckIn}
                            disabled={loading || !actualEmployeeId}
                        >
                            {loading ? (
                                <Loader className="spin-icon" size={24} />
                            ) : (
                                <>
                                    <LogIn size={24} />
                                    <span>Check In</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            className="action-btn check-out-btn"
                            onClick={handleCheckOut}
                            disabled={loading || !actualEmployeeId}
                        >
                            {loading ? (
                                <Loader className="spin-icon" size={24} />
                            ) : (
                                <>
                                    <LogOut size={24} />
                                    <span>Check Out</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Location */}
                {location && (
                    <div className="location-display">
                        <MapPin size={14} />
                        <span>Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            {todayRecord && (
                <div className="summary-section">
                    <div className="summary-card">
                        <div className="summary-icon check-in-icon">
                            <Clock size={20} />
                        </div>
                        <div className="summary-content">
                            <div className="summary-label">Check In</div>
                            <div className="summary-value">{todayRecord.check_in ? formatTime(todayRecord.check_in) : '-'}</div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon check-out-icon">
                            <Clock size={20} />
                        </div>
                        <div className="summary-content">
                            <div className="summary-label">Check Out</div>
                            <div className="summary-value">{todayRecord.check_out ? formatTime(todayRecord.check_out) : '-'}</div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon work-hours-icon">
                            <Clock size={20} />
                        </div>
                        <div className="summary-content">
                            <div className="summary-label">Work Hours</div>
                            <div className="summary-value">{calculateWorkHours()}</div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .simple-attendance-container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .attendance-card {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    border: 1px solid #e2e8f0;
                    margin-bottom: 24px;
                }

                .time-section {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .time-display {
                    font-size: 3.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    letter-spacing: -0.02em;
                    margin-bottom: 8px;
                }

                .date-display {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 1rem;
                    color: #64748b;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 20px;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin: 0 auto 32px;
                    display: flex;
                    width: fit-content;
                }

                .status-badge.checked-in {
                    background: #dcfce7;
                    color: #166534;
                }

                .status-badge.checked-out {
                    background: #f1f5f9;
                    color: #475569;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                .checked-in .status-dot {
                    background: #22c55e;
                }

                .checked-out .status-dot {
                    background: #94a3b8;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .button-section {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 24px;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 48px;
                    border-radius: 12px;
                    border: none;
                    font-size: 1.125rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: white;
                }

                .check-in-btn {
                    background: #22c55e;
                }

                .check-in-btn:hover:not(:disabled) {
                    background: #16a34a;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                }

                .check-out-btn {
                    background: #ef4444;
                }

                .check-out-btn:hover:not(:disabled) {
                    background: #dc2626;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .spin-icon {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .location-display {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    color: #94a3b8;
                }

                .summary-section {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 16px;
                }

                .summary-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .summary-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-center;
                    flex-shrink: 0;
                }

                .check-in-icon {
                    background: #dcfce7;
                    color: #166534;
                }

                .check-out-icon {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .work-hours-icon {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .summary-content {
                    flex: 1;
                }

                .summary-label {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .summary-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                @media (max-width: 768px) {
                    .attendance-card {
                        padding: 24px;
                    }

                    .time-display {
                        font-size: 2.5rem;
                    }

                    .action-btn {
                        padding: 14px 32px;
                        font-size: 1rem;
                    }

                    .summary-section {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
