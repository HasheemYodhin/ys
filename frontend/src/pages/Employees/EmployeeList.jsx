import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, User, Mail, Briefcase, Calendar, Trash2, Edit2 } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import { API_BASE_URL } from '../../config';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [departmentFilter, setDepartmentFilter] = useState('All');

  const fetchEmployees = async () => {
    try {
      const empRes = await fetch(`${API_BASE_URL}/employees/`);
      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(data);
      } else {
        console.error("Failed to fetch employees status:", empRes.status);
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }

    try {
      const attRes = await fetch(`${API_BASE_URL}/attendance/today`);
      if (attRes.ok) {
        const attData = await attRes.json();
        const attMap = {};
        attData.forEach(record => {
          attMap[record.employee_id] = record;
        });
        setAttendance(attMap);
      } else {
        console.warn("Failed to fetch attendance status:", attRes.status);
      }
    } catch (error) {
      console.warn("Failed to fetch attendance data", error);
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

  const handleEmployeeUpdated = (updatedEmployee) => {
    setEmployees(employees.map(emp => emp._id === updatedEmployee._id ? updatedEmployee : emp));
    setEditingEmployee(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this employee? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEmployees(employees.filter(emp => emp._id !== id));
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to delete employee'}`);
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("Connection error: Could not reach the server.");
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      (emp.employee_id && emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = departmentFilter === 'All' || emp.department === departmentFilter;

    return matchesSearch && matchesFilter;
  });

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-container">
      <div className="page-header-flex">
        {/* ... header content ... */}
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
            placeholder="Search by name, email, role, or ID..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <div className="select-wrapper">
            <Filter size={18} className="filter-icon-absolute" />
            <select
              className="filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card table-card">
        {loading ? (
          <div className="loading-state">Loading employees...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Role</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => {
                const empAttendance = attendance[employee._id];
                return (
                  <tr key={employee._id}>
                    <td>
                      <span className="id-text">{employee.employee_id || '-'}</span>
                    </td>
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
                      <div className="role-info">
                        <span className="role-text">{employee.role}</span>
                        <span className="dept-text">{employee.department}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${employee.status.toLowerCase().replace(' ', '-')}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td>
                      <span className="time-text">
                        {empAttendance ? formatTime(empAttendance.check_in) : '-'}
                      </span>
                    </td>
                    <td>
                      <span className="time-text">
                        {empAttendance ? formatTime(empAttendance.check_out) : '-'}
                      </span>
                    </td>
                    <td>
                      <div className="action-row">
                        <button
                          className="action-btn"
                          title="Edit employee"
                          onClick={() => setEditingEmployee(employee)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="action-btn btn-delete"
                          onClick={() => handleDelete(employee._id)}
                          title="Remove employee"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-state">
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

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSuccess={handleEmployeeUpdated}
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

        .btn-delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-row {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        
        .loading-state, .empty-state {
          text-align: center;
          padding: 48px;
          color: var(--text-muted);
        }

        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .filter-icon-absolute {
          position: absolute;
          left: 12px;
          color: var(--slate-500);
          pointer-events: none;
        }

        .filter-select {
          appearance: none;
          background: white;
          border: 1px solid var(--border-color);
          padding: 8px 16px 8px 40px;
          border-radius: var(--radius-md);
          font-family: inherit;
          font-size: 0.9rem;
          color: var(--slate-700);
          cursor: pointer;
          outline: none;
          min-width: 180px;
        }

        .filter-select:hover {
          border-color: var(--slate-300);
          background: var(--slate-50);
        }

        .id-text {
          font-family: monospace;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .time-text {
          font-family: monospace;
          color: var(--text-main);
          font-weight: 500;
        }

        .role-info {
          display: flex;
          flex-direction: column;
        }

        .dept-text {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
