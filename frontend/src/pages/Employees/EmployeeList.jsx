import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, User, Mail, Briefcase, Calendar } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:8000/employees/');
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleEmployeeAdded = (newEmployee) => {
        setEmployees([...employees, newEmployee]);
        setIsModalOpen(false);
    };

    const filteredEmployees = employees.filter(emp =>
        emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            <div className="page-header-flex">
                <div>
                    <h1 className="page-title">Employees</h1>
                    <p className="page-subtitle">Manage your team members and their details.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    Add Employee
                </button>
            </div>

            <div className="filter-bar card">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-actions">
                    <button className="btn btn-outline">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            <div className="card table-card">
                {loading ? (
                    <div className="loading-state">Loading employees...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((employee) => (
                                <tr key={employee._id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-circle">
                                                {employee.first_name[0]}{employee.last_name[0]}
                                            </div>
                                            <div className="user-info">
                                                <span className="user-name">{employee.first_name} {employee.last_name}</span>
                                                <span className="user-email">{employee.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="role-text">{employee.role}</span>
                                    </td>
                                    <td>
                                        <span className="dept-badge">{employee.department}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${employee.status.toLowerCase().replace(' ', '-')}`}>
                                            {employee.status}
                                        </span>
                                    </td>
                                    <td>{employee.date_of_joining}</td>
                                    <td>
                                        <button className="action-btn">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        No employees found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <AddEmployeeModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleEmployeeAdded}
                />
            )}

            <style>{`
        .page-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          margin-bottom: 24px;
        }

        .search-wrapper {
          position: relative;
          width: 320px;
        }

        .search-input {
          width: 100%;
          padding: 10px 16px 10px 36px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          outline: none;
        }
        
        .search-input:focus {
          border-color: var(--primary-500);
        }

        .btn-outline {
          background: white;
          border: 1px solid var(--border-color);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .table-card {
          padding: 0;
          overflow: hidden;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 16px 24px;
          background: var(--slate-50);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.85rem;
          border-bottom: 1px solid var(--border-color);
        }

        .data-table td {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
          vertical-align: middle;
        }
        
        .data-table tr:last-child td {
          border-bottom: none;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-circle {
          width: 40px;
          height: 40px;
          background: var(--primary-100);
          color: var(--primary-700);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          color: var(--text-main);
        }

        .user-email {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .dept-badge {
          background: var(--slate-100);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          color: var(--slate-600);
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-active { background: #dcfce7; color: #16a34a; }
        .status-on-leave { background: #ffedd5; color: #ea580c; }
        .status-terminated { background: #fee2e2; color: #dc2626; }

        .action-btn {
          background: none;
          color: var(--text-muted);
          padding: 4px;
          border-radius: 4px;
        }
        
        .action-btn:hover {
          background: var(--slate-100);
          color: var(--text-main);
        }
        
        .loading-state, .empty-state {
          text-align: center;
          padding: 48px;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}
