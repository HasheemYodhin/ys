import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Layout/Footer';

export default function Careers() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch('http://localhost:8000/cms/jobs');
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setJobs(data);
                    } else {
                        setJobs([
                            { id: 1, title: 'Senior Product Designer', department: 'Design', location: 'Remote', type: 'Full-time' },
                            { id: 2, title: 'Backend Engineer (Python)', department: 'Engineering', location: 'Silicon Valley, CA', type: 'Full-time' },
                            { id: 3, title: 'HR Operations Manager', department: 'People', location: 'London, UK', type: 'Full-time' },
                            { id: 4, title: 'Customer Success Lead', department: 'Operations', location: 'Remote', type: 'Full-time' },
                        ]);
                    }
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setJobs([
                    { id: 1, title: 'Senior Product Designer', department: 'Design', location: 'Remote', type: 'Full-time' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div className="secondary-page">
            <nav className="landing-nav glass">
                <div className="nav-container">
                    <Link to="/" className="logo">
                        <div className="logo-icon">YS</div>
                        <span>YS HR</span>
                    </Link>
                    <div className="nav-links">
                        <Link to="/">Back to Home</Link>
                        <Link to="/signup" className="btn-premium">Join Us</Link>
                    </div>
                </div>
            </nav>

            <header className="page-hero">
                <div className="container">
                    <div className="badge">Careers at YS HR</div>
                    <h1>Help us build the <span className="text-gradient">Future of Work</span></h1>
                    <p className="mx-auto">We're looking for passionate individuals to help us redefine how organizations manage and empower their people.</p>
                </div>
            </header>

            <section className="content-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Open Positions</h2>
                        <div className="filter-tabs">
                            <button className="active">All Departments</button>
                            <button>Engineering</button>
                            <button>Design</button>
                            <button>People</button>
                        </div>
                    </div>

                    <div className="jobs-grid">
                        {loading ? (
                            <div className="loading">Loading positions...</div>
                        ) : (
                            jobs.map(job => (
                                <div key={job.id} className="job-card">
                                    <div className="job-info">
                                        <h3>{job.title}</h3>
                                        <div className="job-meta">
                                            <span><Briefcase size={16} /> {job.department}</span>
                                            <span><MapPin size={16} /> {job.location}</span>
                                            <span><Clock size={16} /> {job.type}</span>
                                        </div>
                                    </div>
                                    <button className="btn-apply">
                                        Apply Now <ChevronRight size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
            <Footer />
            <style>{`
                .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
                .secondary-page { background: #fff; min-height: 100vh; padding-top: 80px; }
                
                .mx-auto { margin-left: auto; margin-right: auto; }
                .text-gradient { background: var(--grad-premium); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

                .landing-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid rgba(0,0,0,0.05); }
                .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; }
                .logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
                .logo-icon { width: 40px; height: 40px; background: var(--grad-premium); color: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
                .logo span { font-size: 1.5rem; font-weight: 800; color: var(--slate-900); }
                .nav-links { display: flex; align-items: center; gap: 32px; }
                .nav-links a { color: var(--slate-600); font-weight: 600; font-size: 0.95rem; transition: all 0.2s; text-decoration: none; }
                .btn-premium { padding: 10px 24px; background: var(--grad-premium); color: #fff; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.2); text-decoration: none; }

                .page-hero { padding: 100px 0; text-align: center; background: #fafafa; border-bottom: 1px solid #f0f0f0; }
                .page-hero h1 { font-size: 3.5rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 24px; }
                .page-hero p { font-size: 1.25rem; color: #64748b; max-width: 700px; margin-bottom: 0; line-height: 1.6; }

                .badge { display: inline-block; padding: 6px 16px; background: var(--primary-50); color: var(--primary-600); border-radius: 20px; font-weight: 700; font-size: 0.8rem; margin-bottom: 24px; border: 1px solid var(--primary-100); text-transform: uppercase; }

                .content-section { padding: 80px 0; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
                .section-header h2 { font-size: 2rem; font-weight: 800; }
                
                .filter-tabs { display: flex; gap: 12px; }
                .filter-tabs button { padding: 8px 20px; border-radius: 100px; border: 1px solid #e2e8f0; background: #fff; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
                .filter-tabs button.active { background: #0f172a; color: #fff; border-color: #0f172a; }

                .jobs-grid { display: flex; flex-direction: column; gap: 20px; }
                .job-card { display: flex; justify-content: space-between; align-items: center; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0; transition: all 0.3s; }
                .job-card:hover { border-color: var(--primary-500); transform: translateY(-3px); box-shadow: 0 20px 40px rgba(0,0,0,0.03); }
                
                .job-info h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; }
                .job-meta { display: flex; gap: 24px; color: #64748b; font-size: 0.95rem; }
                .job-meta span { display: flex; align-items: center; gap: 8px; }

                .btn-apply { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .job-card:hover .btn-apply { background: var(--primary-500); color: #fff; border-color: var(--primary-500); }
            `}</style>
        </div>
    );
}
