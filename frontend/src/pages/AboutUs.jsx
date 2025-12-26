import { Link } from 'react-router-dom';
import { Award, Users, Globe, Zap, Target, Heart } from 'lucide-react';
import Footer from '../components/Layout/Footer';

export default function AboutUs() {
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
                        <Link to="/contact" className="btn-premium">Contact Us</Link>
                    </div>
                </div>
            </nav>

            <header className="page-hero">
                <div className="container">
                    <div className="badge">Our Story</div>
                    <h1>Reimagining <span className="text-gradient">Human Resources</span></h1>
                    <p className="mx-auto">We're on a mission to build the most intuitive and powerful HR suite for modern organizations worldwide.</p>
                </div>
            </header>

            <section className="content-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">500+</div>
                            <p>Global Customers</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">99.9%</div>
                            <p>System Uptime</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">24/7</div>
                            <p>Premium Support</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">10M+</div>
                            <p>Employees Managed</p>
                        </div>
                    </div>

                    <div className="values-section">
                        <div className="section-header text-center">
                            <h2>Our Core <span className="text-gradient">Values</span></h2>
                            <p className="mx-auto">What drives us every single day to build better tools for your team.</p>
                        </div>
                        <div className="values-grid">
                            <div className="value-card">
                                <div className="v-icon" style={{ backgroundColor: '#e0e7ff' }}><Target color="#4f46e5" /></div>
                                <h3>Product Excellence</h3>
                                <p>We are obsessed with quality and creating tools that are both powerful and beautiful.</p>
                            </div>
                            <div className="value-card">
                                <div className="v-icon" style={{ backgroundColor: '#ecfdf5' }}><Heart color="#059669" /></div>
                                <h3>People First</h3>
                                <p>Human connections are at the heart of HR. Our technology is built to empower people.</p>
                            </div>
                            <div className="value-card">
                                <div className="v-icon" style={{ backgroundColor: '#fff7ed' }}><Zap color="#d97706" /></div>
                                <h3>Continuous Innovation</h3>
                                <p>The world of work is changing fast. We're here to lead that change with cutting-edge tech.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
            <style>{`
                .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
                .secondary-page { background: #fff; min-height: 100vh; padding-top: 80px; }
                
                .mx-auto { margin-left: auto; margin-right: auto; }
                .text-center { text-align: center; }
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
                .page-hero h1 { font-size: 4rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 24px; }
                .page-hero p { font-size: 1.25rem; color: #64748b; max-width: 700px; line-height: 1.6; }

                .badge { display: inline-block; padding: 6px 16px; background: var(--primary-50); color: var(--primary-600); border-radius: 20px; font-weight: 700; font-size: 0.8rem; margin-bottom: 24px; border: 1px solid var(--primary-100); text-transform: uppercase; }

                .content-section { padding: 80px 0; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 100px; }
                .stat-card { text-align: center; padding: 40px; background: #fff; border: 1px solid #f0f0f0; border-radius: 24px; transition: all 0.3s; }
                .stat-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.03); border-color: var(--primary-200); }
                .stat-value { font-size: 2.5rem; font-weight: 800; color: var(--slate-900); margin-bottom: 8px; }
                .stat-card p { color: #64748b; font-weight: 600; }

                .values-section .section-header { margin-bottom: 60px; }
                .values-section h2 { font-size: 3rem; font-weight: 800; margin-bottom: 16px; }
                .values-section p { font-size: 1.1rem; color: #64748b; max-width: 600px; }

                .values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
                .value-card { padding: 40px; border-radius: 32px; background: #fff; border: 1px solid #f0f0f0; transition: all 0.3s; }
                .value-card:hover { border-color: var(--primary-200); box-shadow: 0 20px 40px rgba(0,0,0,0.03); }
                .v-icon { width: 60px; height: 60px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
                .value-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 16px; }
                .value-card p { color: #64748b; line-height: 1.7; }

                @media (max-width: 768px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .values-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
