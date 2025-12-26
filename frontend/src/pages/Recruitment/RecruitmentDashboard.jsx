import { useState, useEffect } from 'react';
import { Briefcase, Users, Plus, MapPin, CheckCircle, Search } from 'lucide-react';

export default function RecruitmentDashboard() {
    const [activeTab, setActiveTab] = useState('jobs');
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);

    // Form State for New Job
    const [newJob, setNewJob] = useState({ title: '', department: 'Engineering', location: 'Remote', type: 'Full-time' });

    useEffect(() => {
        fetchJobs();
        fetchCandidates();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch('http://localhost:8000/recruitment/jobs');
            if (res.ok) setJobs(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchCandidates = async () => {
        try {
            const res = await fetch('http://localhost:8000/recruitment/candidates');
            if (res.ok) setCandidates(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/recruitment/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newJob)
            });
            if (res.ok) {
                setShowJobModal(false);
                setNewJob({ title: '', department: 'Engineering', location: 'Remote', type: 'Full-time' });
                fetchJobs();
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <div className="page-container">
            <div className="page-header-flex">
                <div>
                    <h1 className="page-title">Recruitment & ATS</h1>
                    <p className="page-subtitle">Track job openings and candidates.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowJobModal(true)}>
                    <Plus size={18} />
                    <span>Post New Job</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid mb-8">
                <div className="card p-5 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Open Positions</p>
                        <h3 className="text-2xl font-bold">{jobs.length}</h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Users size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Applicants</p>
                        <h3 className="text-2xl font-bold">{candidates.length}</h3>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Hired This Month</p>
                        <h3 className="text-2xl font-bold">0</h3>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs mb-6 border-b border-gray-200 flex gap-6">
                <button
                    className={`pb-3 font-medium text-sm ${activeTab === 'jobs' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('jobs')}
                >
                    Active Jobs
                </button>
                <button
                    className={`pb-3 font-medium text-sm ${activeTab === 'candidates' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('candidates')}
                >
                    Candidates & Applications
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'jobs' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map(job => (
                        <div key={job._id} className="card p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">{job.department}</div>
                                <span className="text-xs text-gray-400">{new Date(job.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">{job.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                <div className="flex items-center gap-1"><MapPin size={14} /> {job.location}</div>
                                <div className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</div>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn btn-outline flex-1 text-sm">View Details</button>
                                <button className="btn btn-text text-sm text-gray-400">Edit</button>
                            </div>
                        </div>
                    ))}
                    {jobs.length === 0 && <div className="col-span-3 text-center p-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">No active job postings. Create one to get started.</div>}
                </div>
            ) : (
                <div className="card">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 text-gray-400 text-sm">
                        <span>Showing all candidates</span>
                        <div className="flex gap-2 items-center bg-white border border-gray-200 rounded px-2 py-1">
                            <Search size={14} />
                            <input className="outline-none text-xs w-48" placeholder="Search candidates..." />
                        </div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Candidate Name</th>
                                <th>Applied For</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map(cand => (
                                <tr key={cand._id}>
                                    <td className="font-medium text-gray-900">{cand.first_name} {cand.last_name}</td>
                                    <td>{cand.job_id}</td>
                                    <td>{cand.email}</td>
                                    <td><span className="status-badge status-active">{cand.status}</span></td>
                                    <td>{new Date(cand.applied_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {candidates.length === 0 && <tr><td colSpan="5" className="text-center p-8 text-gray-400">No applications yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Job Modal */}
            {showJobModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header"><h3>Post New Job</h3><button onClick={() => setShowJobModal(false)}>✕</button></div>
                        <form onSubmit={handleCreateJob} className="modal-form">
                            <div className="form-group">
                                <label>Job Title</label>
                                <input value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} required placeholder="e.g. Senior Product Designer" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Department</label>
                                    <select value={newJob.department} onChange={e => setNewJob({ ...newJob, department: e.target.value })}>
                                        <option>Engineering</option><option>Design</option><option>Product</option><option>Marketing</option><option>Sales</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })}>
                                        <option>Full-time</option><option>Part-time</option><option>Contract</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-text" onClick={() => setShowJobModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Posting...' : 'Create Job'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 24px; 
        }
        .bg-blue-50 { background-color: #eff6ff; } .text-blue-600 { color: #2563eb; }
        .bg-purple-50 { background-color: #f3e8ff; } .text-purple-600 { color: #9333ea; }
        .bg-green-50 { background-color: #f0fdf4; } .text-green-600 { color: #16a34a; }
        .bg-indigo-50 { background-color: #eef2ff; } .text-indigo-700 { color: #4338ca; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); z-index: 50; }
        .modal-card { background: white; width: 100%; max-width: 500px; border-radius: 12px; animation: slideUp 0.3s ease-out; }
        .modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; font-weight: 600; }
        .modal-form { padding: 24px; }
      `}</style>
        </div>
    );
}
