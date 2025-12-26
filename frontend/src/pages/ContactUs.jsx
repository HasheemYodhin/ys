import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Layout/Footer';

export default function ContactUs() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        };

        try {
            const response = await fetch('http://localhost:8000/cms/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                setSubmitted(true);
            } else {
                alert('Something went wrong. Please try again later.');
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            alert('Could not connect to the server. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

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
                        <Link to="/signup" className="btn-premium">Get Started</Link>
                    </div>
                </div>
            </nav>

            <header className="page-hero">
                <div className="container">
                    <div className="badge">Contact Us</div>
                    <h1>Let's start a <span className="text-gradient">Conversation</span></h1>
                    <p className="mx-auto">Have questions? We're here to help you find the perfect HR solution for your organization.</p>
                </div>
            </header>

            <section className="content-section">
                <div className="container">
                    <div className="contact-wrapper">
                        <div className="contact-info-grid">
                            <div className="info-card">
                                <div className="info-icon" style={{ backgroundColor: '#e0e7ff' }}><Mail color="#4f46e5" /></div>
                                <h3>Email Us</h3>
                                <p>Our team is here to help.</p>
                                <a href="mailto:support@yshr.com">support@yshr.com</a>
                            </div>
                            <div className="info-card">
                                <div className="info-icon" style={{ backgroundColor: '#ecfdf5' }}><Phone color="#059669" /></div>
                                <h3>Call Us</h3>
                                <p>Mon-Fri from 9am to 6pm.</p>
                                <a href="tel:+18001234567">+1 (800) 123-4567</a>
                            </div>
                            <div className="info-card">
                                <div className="info-icon" style={{ backgroundColor: '#fff7ed' }}><MapPin color="#d97706" /></div>
                                <h3>Visit Us</h3>
                                <p>Come say hello at our office.</p>
                                <span>123 Business Ave, Silicon Valley, CA</span>
                            </div>
                        </div>

                        <div className="contact-form-container glass">
                            {submitted ? (
                                <div className="success-state text-center">
                                    <div className="success-icon"><CheckCircle2 size={64} color="#059669" /></div>
                                    <h2>Message Sent!</h2>
                                    <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                                    <button onClick={() => setSubmitted(false)} className="btn-secondary">Send another message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input type="text" name="name" placeholder="John Doe" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input type="email" name="email" placeholder="john@example.com" required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <select name="subject" required>
                                            <option value="">Select a subject</option>
                                            <option value="sales">Sales Inquiry</option>
                                            <option value="support">Technical Support</option>
                                            <option value="demo">Request a Demo</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Message</label>
                                        <textarea name="message" rows="5" placeholder="How can we help you?" required></textarea>
                                    </div>
                                    <button className="btn-premium w-full justify-center" disabled={loading}>
                                        {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                                    </button>
                                </form>
                            )}
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

                .content-section { padding: 80px 0; background: #fff; }
                
                .contact-wrapper { display: flex; flex-direction: column; gap: 80px; }
                .contact-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .info-card { padding: 40px; border-radius: 32px; background: #fff; border: 1px solid #f0f0f0; text-align: center; transition: all 0.3s; }
                .info-card:hover { border-color: var(--primary-200); transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.03); }
                .info-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
                .info-card h3 { font-size: 1.25rem; font-weight: 800; margin-bottom: 8px; }
                .info-card p { color: #64748b; font-size: 0.95rem; margin-bottom: 16px; }
                .info-card a, .info-card span { color: var(--slate-900); font-weight: 700; text-decoration: none; font-size: 1.1rem; }

                .contact-form-container { max-width: 800px; margin: 0 auto; padding: 60px; border-radius: 40px; background: #fff; border: 1px solid #f0f0f0; box-shadow: 0 40px 80px rgba(0,0,0,0.05); }
                .contact-form { display: flex; flex-direction: column; gap: 24px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .form-group label { display: block; font-size: 0.95rem; font-weight: 600; color: var(--slate-700); margin-bottom: 10px; }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 1rem; transition: all 0.2s; }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary-500); outline: none; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

                .success-state { padding: 40px 0; }
                .success-icon { margin-bottom: 24px; display: flex; justify-content: center; }
                .success-state h2 { font-size: 2rem; font-weight: 800; margin-bottom: 12px; }
                .success-state p { font-size: 1.1rem; color: #64748b; margin-bottom: 32px; }

                .btn-secondary { padding: 12px 24px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-secondary:hover { background: #f8fafc; }

                @media (max-width: 768px) {
                    .contact-info-grid { grid-template-columns: 1fr; }
                    .form-grid { grid-template-columns: 1fr; }
                    .contact-form-container { padding: 32px; }
                }
            `}</style>
        </div>
    );
}
