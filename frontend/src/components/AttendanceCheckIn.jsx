import { useState, useEffect } from 'react';
import { MapPin, Clock, LogIn, LogOut, Loader, Calendar } from 'lucide-react';

export default function AttendanceCheckIn({ employeeId, employeeName, variant = 'standard' }) {
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
        <div className={`premium-attendance-v2 variant-${variant}`}>
            {/* Main Hero Card Section */}
            <div className="attendance-main-v2">
                {/* Time Display */}
                <div className="time-v2 text-center mb-6">
                    <div className="current-time-v2">
                        {currentTime.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        })}
                    </div>
                    <div className="current-date-v2 flex items-center justify-center gap-2 mt-2">
                        <Calendar size={14} className="text-teal-400" />
                        <span>
                            {currentTime.toLocaleDateString('en-US', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })}
                        </span>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex justify-center mb-6">
                    <div className={`status-pill-v2 ${status === 'checked_in' ? 'in' : 'out'}`}>
                        <div className="status-dot-v2"></div>
                        <span>{status === 'checked_in' ? 'On Duty' : 'Off Duty'}</span>
                    </div>
                </div>

                {/* Primary Action Button */}
                <div className="action-v2 mb-8">
                    {status === 'checked_out' ? (
                        <button
                            className="btn-check-in-v2 w-full"
                            onClick={handleCheckIn}
                            disabled={loading || !actualEmployeeId}
                        >
                            {loading ? (
                                <Loader className="spin-v2" size={20} />
                            ) : (
                                <>
                                    <LogIn size={22} />
                                    <span>Check In</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            className="btn-check-out-v2 w-full"
                            onClick={handleCheckOut}
                            disabled={loading || !actualEmployeeId}
                        >
                            {loading ? (
                                <Loader className="spin-v2" size={20} />
                            ) : (
                                <>
                                    <LogOut size={22} />
                                    <span>Check Out</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Metrics Stack - Only show in standard mode, hide in dashboard hero */}
                {variant !== 'hero' && (
                    <div className="metrics-stack-v2">
                        <div className="metric-item-v2 glass-mini">
                            <div className="metric-icon-v2 in">
                                <Clock size={18} />
                            </div>
                            <div className="metric-info-v2">
                                <span className="metric-lbl">Check In</span>
                                <span className="metric-val">{todayRecord?.check_in ? formatTime(todayRecord.check_in) : '--:--'}</span>
                            </div>
                        </div>

                        <div className="metric-item-v2 glass-mini">
                            <div className="metric-icon-v2 out">
                                <Clock size={18} />
                            </div>
                            <div className="metric-info-v2">
                                <span className="metric-lbl">Check Out</span>
                                <span className="metric-val">{todayRecord?.check_out ? formatTime(todayRecord.check_out) : '--:--'}</span>
                            </div>
                        </div>

                        <div className="metric-item-v2 glass-mini">
                            <div className="metric-icon-v2 hrs">
                                <Clock size={18} />
                            </div>
                            <div className="metric-info-v2">
                                <span className="metric-lbl">Duration</span>
                                <span className="metric-val">{calculateWorkHours()}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tiny Location Footer */}
                {location && (
                    <div className="loc-footer-v2 mt-8">
                        <MapPin size={10} />
                        <span>Loc: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                    </div>
                )}
            </div>

            <style>{`
                .premium-attendance-v2 {
                    width: 100%;
                    max-width: 420px;
                    margin: 0 auto;
                }

                .variant-standard .attendance-main-v2 {
                    background: white;
                    border-radius: 32px;
                    padding: 40px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.08);
                    border: 1px solid #f1f5f9;
                }

                .attendance-main-v2 {
                    padding: 15px;
                }

                .current-time-v2 {
                    font-size: 3.5rem;
                    font-weight: 800;
                    letter-spacing: -2px;
                    line-height: 1;
                    font-family: 'Inter', sans-serif;
                }

                /* Variant Specific Colors */
                .variant-hero .current-time-v2 { color: white; }
                .variant-standard .current-time-v2 { color: #0f172a; }

                .current-date-v2 {
                    color: #94a3b8;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .status-pill-v2 {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 16px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    background: rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .variant-hero .status-pill-v2 {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .status-pill-v2.in { color: #2dd4bf; }
                .status-pill-v2.out { color: #94a3b8; }

                .status-dot-v2 {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: currentColor;
                    box-shadow: 0 0 10px currentColor;
                }

                .btn-check-in-v2, .btn-check-out-v2 {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 18px;
                    border-radius: 20px;
                    border: none;
                    font-size: 1.1rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    color: white;
                }

                .btn-check-in-v2 {
                    background: linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%);
                    box-shadow: 0 10px 20px rgba(45, 212, 191, 0.25);
                }

                .btn-check-out-v2 {
                    background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%);
                    box-shadow: 0 10px 20px rgba(244, 63, 94, 0.25);
                }

                .btn-check-in-v2:hover, .btn-check-out-v2:hover {
                    transform: translateY(-4px) scale(1.02);
                }

                .btn-check-in-v2:disabled, .btn-check-out-v2:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Metrics Stack Styles */
                .metrics-stack-v2 {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .metric-item-v2.glass-mini {
                    background: rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    border-radius: 20px;
                    padding: 14px 20px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    transition: all 0.2s;
                }

                .variant-hero .metric-item-v2.glass-mini {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .metric-item-v2:hover {
                    background: rgba(0, 0, 0, 0.06);
                    transform: translateX(5px);
                }
                
                .variant-hero .metric-item-v2:hover {
                    background: rgba(255, 255, 255, 0.08);
                }

                .metric-icon-v2 {
                    width: 38px;
                    height: 38px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .metric-icon-v2.in { background: rgba(45, 212, 191, 0.1); color: #2dd4bf; }
                .metric-icon-v2.out { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
                .metric-icon-v2.hrs { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

                .metric-info-v2 { display: flex; flex-direction: column; }
                .metric-lbl { font-size: 0.7rem; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                .metric-val { font-size: 1rem; font-weight: 800; }
                
                .variant-hero .metric-val { color: white; }
                .variant-standard .metric-val { color: #0f172a; }

                .loc-footer-v2 {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    font-size: 0.65rem;
                    color: #94a3b8;
                    font-weight: 600;
                }

                .spin-v2 { animation: rotate 1s linear infinite; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
