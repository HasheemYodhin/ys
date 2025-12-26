import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="landing-footer">
            <div className="footer-top">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="logo mb-4">
                            <div className="logo-icon">YS</div>
                            <span>YS HR</span>
                        </Link>
                        <p className="footer-desc">The next generation HR Suite designed for people-first organizations. Built with love and efficiency.</p>
                        <div className="social-links">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><Facebook size={20} /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><Twitter size={20} /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><Linkedin size={20} /></a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><Youtube size={20} /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
                        </div>
                    </div>
                    <div className="footer-links">
                        <h4>Product</h4>
                        <a href="#features">HR Software</a>
                        <a href="#features">Payroll Software</a>
                        <a href="#features">Expense Claims</a>
                        <a href="#features">Recruitment</a>
                        <a href="#features">Performance</a>
                    </div>
                    <div className="footer-links">
                        <h4>Resources</h4>
                        <a href="#">HR Guides</a>
                        <a href="#">Labor Laws</a>
                        <a href="#">Statutory Wiki</a>
                        <a href="#">Webinars</a>
                        <a href="#">Academy</a>
                    </div>
                    <div className="footer-links">
                        <h4>Company</h4>
                        <Link to="/about">About Us</Link>
                        <Link to="/customers">Customers</Link>
                        <Link to="/careers">Careers</Link>
                        <Link to="/media">Media Kit</Link>
                        <Link to="/contact">Contact Us</Link>
                    </div>
                    <div className="footer-links">
                        <h4>Connect</h4>
                        <a href="mailto:support@yshr.com" className="contact-item"><Mail size={16} /> support@yshr.com</a>
                        <a href="tel:+18001234567" className="contact-item"><Phone size={16} /> +1 (800) 123-4567</a>
                        <div className="contact-item"><MapPin size={16} /> 123 Business Ave, Suite 100, Silicon Valley, CA</div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p>&copy; 2025 YS HR Management Private Limited. All rights reserved.</p>
                    <div className="legal-links">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Use</Link>
                        <Link to="/security">Security</Link>
                    </div>
                </div>
            </div>

            <style>{`
                .landing-footer { background: #0f172a; color: #fff; padding: 100px 24px 40px; }
                .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr; gap: 60px; }
                .footer-desc { color: #94a3b8; line-height: 1.7; margin-bottom: 32px; font-size: 0.95rem; }
                .mb-4 { margin-bottom: 16px; }

                .social-links { display: flex; gap: 20px; }
                .social-links a { 
                    width: 48px; 
                    height: 48px; 
                    border-radius: 50%; 
                    background: rgba(255, 255, 255, 0.05); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: #94a3b8; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                }
                .social-links a:hover { 
                    background: rgba(255, 255, 255, 0.1); 
                    color: #fff; 
                    transform: translateY(-3px);
                }

                .footer-links h4 { font-size: 1.1rem; font-weight: 700; margin-bottom: 24px; color: #fff; }
                .footer-links a { display: block; color: #94a3b8; text-decoration: none; margin-bottom: 12px; font-size: 0.95rem; transition: color 0.2s; }
                .footer-links a:hover { color: #fff; }

                .footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 40px; margin-top: 80px; }
                .footer-bottom-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; color: #475569; font-size: 1rem; }
                .legal-links { display: flex; gap: 32px; }
                .legal-links a { color: #475569; text-decoration: none; font-weight: 500; transition: color 0.2s ease; }
                .legal-links a:hover { color: #94a3b8; }
                .contact-item { display: flex; align-items: center; gap: 8px; color: #94a3b8; margin-bottom: 12px; text-decoration: none; font-size: 0.95rem; }

                @media (max-width: 1024px) {
                    .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
                }
                @media (max-width: 600px) {
                    .footer-grid { grid-template-columns: 1fr; }
                    .footer-bottom-content { flex-direction: column; gap: 20px; text-align: center; }
                }
            `}</style>
        </footer>
    );
}
