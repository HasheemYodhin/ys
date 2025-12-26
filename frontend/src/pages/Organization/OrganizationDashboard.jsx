import { useState, useEffect } from 'react';
import { Network, Building2, User } from 'lucide-react';

export default function OrganizationDashboard() {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('http://localhost:8000/employees/');
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);

                // Group by Department
                const groups = {};
                data.forEach(emp => {
                    if (!groups[emp.department]) groups[emp.department] = [];
                    groups[emp.department].push(emp);
                });
                setDepartments(groups);
            }
        } catch (error) {
            console.error("Org Chart Error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Organization Structure</h1>
                <p className="page-subtitle">Departments and hierarchy overview.</p>
            </div>

            {/* Departments Overview */}
            <h3 className="section-title mb-4 flex items-center gap-2 text-gray-700 font-semibold">
                <Building2 size={20} /> Departments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {Object.keys(departments).map((dept, idx) => (
                    <div key={idx} className="card p-6 border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-lg text-gray-800">{dept}</h4>
                                <p className="text-sm text-gray-500">{departments[dept].length} Members</p>
                            </div>
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <User size={18} />
                            </div>
                        </div>
                    </div>
                ))}
                {Object.keys(departments).length === 0 && !loading && <p className="text-gray-400">No departments found.</p>}
            </div>

            {/* Visual Org Chart (Simple Tree) */}
            <h3 className="section-title mb-6 flex items-center gap-2 text-gray-700 font-semibold">
                <Network size={20} /> Company Hierarchy
            </h3>

            <div className="org-chart-container overflow-auto pb-12">
                <div className="tree">
                    <ul>
                        <li>
                            <div className="node-ceo">
                                <img src="https://ui-avatars.com/api/?name=CEO" alt="CEO" className="w-10 h-10 rounded-full mx-auto mb-2" />
                                <strong>CEO / Founder</strong>
                            </div>
                            <ul>
                                {Object.keys(departments).map((dept) => (
                                    <li key={dept}>
                                        <div className="node-dept">
                                            <strong>{dept}</strong>
                                        </div>
                                        {departments[dept].length > 0 && (
                                            <ul>
                                                {departments[dept].map(emp => (
                                                    <li key={emp._id}>
                                                        <div className="node-emp">
                                                            <span>{emp.first_name} {emp.last_name}</span>
                                                            <small>{emp.role}</small>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

            <style>{`
        /* Simple CSS Tree Implementation */
        .tree ul {
            padding-top: 20px; position: relative;
            transition: all 0.5s;
            display: flex; justify-content: center;
        }
        .tree li {
            float: left; text-align: center;
            list-style-type: none;
            position: relative;
            padding: 20px 5px 0 5px;
            transition: all 0.5s;
        }
        /* Connectors */
        .tree li::before, .tree li::after {
            content: ''; position: absolute; top: 0; right: 50%;
            border-top: 1px solid #ccc; width: 50%; height: 20px;
        }
        .tree li::after {
            right: auto; left: 50%; border-left: 1px solid #ccc;
        }
        .tree li:only-child::after, .tree li:only-child::before {
            display: none;
        }
        .tree li:only-child { padding-top: 0;}
        .tree li:first-child::before, .tree li:last-child::after {
            border: 0 none;
        }
        .tree li:last-child::before{
            border-right: 1px solid #ccc;
            border-radius: 0 5px 0 0;
        }
        .tree li:first-child::after{
            border-radius: 5px 0 0 0;
        }
        .tree ul ul::before{
            content: ''; position: absolute; top: 0; left: 50%;
            border-left: 1px solid #ccc; width: 0; height: 20px;
        }
        
        /* Node Styles */
        .tree li div {
            border: 1px solid #e5e7eb;
            padding: 12px 16px;
            text-decoration: none;
            color: #374151;
            font-family: inherit;
            font-size: 0.85rem;
            display: inline-block;
            border-radius: 8px;
            background: white;
            transition: all 0.5s;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            min-width: 140px;
        }
        .tree li div:hover {
            background: #f9fafb; border-color: #9ca3af;
        }
        
        .node-ceo { background: #eef2ff !important; border-color: #c7d2fe !important; font-size: 1rem !important; }
        .node-dept { background: #f0fdf4 !important; border-color: #bbf7d0 !important; font-weight: 600; }
        .node-emp span { display: block; font-weight: 500; }
        .node-emp small { color: #9ca3af; font-size: 0.75rem; }
      `}</style>
        </div>
    );
}
