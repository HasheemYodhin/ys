import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddEmployeeModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        department: 'Engineering',
        status: 'Active',
        date_of_joining: new Date().toISOString().split('T')[0],
        salary: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('http://localhost:8000/employees/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    salary: parseFloat(formData.salary) || 0
                }),
            });

            if (response.ok) {
                const newEmployee = await response.json();
                onSuccess(newEmployee);
            } else {
                alert("Failed to create employee");
            }
        } catch (error) {
            console.error("Error creating employee", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>Add New Employee</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Role / Job Title</label>
                            <input
                                type="text"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                placeholder="e.g. Senior Developer"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <select name="department" value={formData.department} onChange={handleChange}>
                                <option value="Engineering">Engineering</option>
                                <option value="HR">HR</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Finance">Finance</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Joining Date</label>
                            <input
                                type="date"
                                name="date_of_joining"
                                value={formData.date_of_joining}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Salary (Annual)</label>
                            <input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder="80000"
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-text" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Employee'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(4px);
        }

        .modal-card {
          background: white;
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 600px;
          box-shadow: var(--shadow-xl);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .close-btn {
          background: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        
        .close-btn:hover { color: var(--text-main); }

        .modal-form {
          padding: 24px;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 16px;
          flex: 1;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-main);
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          background: var(--slate-50);
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          background: white;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px var(--primary-50);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        
        .btn-text {
          background: none;
          color: var(--text-muted);
          padding: 8px 16px;
        }
        
        .btn-text:hover {
          color: var(--text-main);
          background: var(--slate-50);
          border-radius: var(--radius-md);
        }
      `}</style>
        </div>
    );
}
