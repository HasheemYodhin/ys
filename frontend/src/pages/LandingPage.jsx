import { Link } from 'react-router-dom';
import {
  Shield, Zap, BarChart3, Users, ChevronRight, Check,
  Smartphone, Globe, Award, Heart, Mail, Phone, MapPin,
  Facebook, Twitter, Linkedin, Youtube, Instagram
} from 'lucide-react';
import Footer from '../components/Layout/Footer';

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      {/* Navigation */}
      <nav className="landing-nav glass">
        <div className="nav-container">
          <Link to="/" className="logo">
            <div className="logo-icon">YS</div>
            <span>YS HR</span>
          </Link>
          <div className="nav-links">
            <a href="#features">Product</a>
            <Link to="/about">Solutions</Link>
            <a href="#pricing">Pricing</a>
            <Link to="/login" className="login-link">Sign In</Link>
            <Link to="/signup" className="btn-premium">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero centered">
        <div className="hero-content">
          <div className="badge">HR Management Redefined</div>
          <h1>The Most <span className="text-gradient">Premium</span> HR Suite for Modern Teams</h1>
          <p className="mx-auto">Streamline your payroll, attendance, and recruitment with a beautiful, intuitive interface built for scale.</p>
          <div className="hero-actions flex justify-center">
            <Link to="/signup" className="btn-premium">Start Free Trial <ChevronRight size={18} /></Link>
            <Link to="/contact" className="btn-secondary">Request Demo</Link>
          </div>
          <div className="hero-stats justify-center">
            <div className="hero-stat"><strong>500+</strong> Companies</div>
            <div className="hero-stat"><strong>99.9%</strong> Uptime</div>
            <div className="hero-stat"><strong>24/7</strong> Support</div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="trusted-section">
        <p>TRUSTED BY INNOVATIVE TEAMS WORLDWIDE</p>
        <div className="logo-strip">
          <div className="logo-placeholder">VELOCITY</div>
          <div className="logo-placeholder">HORIZON</div>
          <div className="logo-placeholder">AETHER</div>
          <div className="logo-placeholder">PULSE</div>
          <div className="logo-placeholder">ZENITH</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <div className="badge">Features</div>
          <h2>Everything you need to <span className="text-gradient">succeed</span></h2>
          <p>A comprehensive suite of tools designed to handle every aspect of modern HR management.</p>
        </div>
        <div className="features-grid">
          <div className="feature-item">
            <div className="f-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}><Zap /></div>
            <h3>Smart Payroll</h3>
            <p>Automate complex payroll cycles, tax filings, and compliance with one click.</p>
          </div>
          <div className="feature-item">
            <div className="f-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}><Users /></div>
            <h3>Self-Service</h3>
            <p>Empower employees with dedicated portals for leaves, payslips, and profiles.</p>
          </div>
          <div className="feature-item">
            <div className="f-icon" style={{ backgroundColor: '#fff7ed', color: '#d97706' }}><BarChart3 /></div>
            <h3>Advanced Analytics</h3>
            <p>Gain deep insights into workforce trends and performance with visual reports.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <div className="badge">Pricing</div>
          <h2>A plan for every <span className="text-gradient">stage</span></h2>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Starter</h3>
            <div className="price">$49<span>/mo</span></div>
            <p>Essential HR tools for small teams of up to 20 employees.</p>
            <Link to="/signup" className="btn-secondary w-full text-center block" style={{ marginTop: '24px', display: 'block' }}>Get Started</Link>
          </div>
          <div className="pricing-card featured">
            <div className="badge" style={{ position: 'absolute', top: '24px', right: '24px', margin: 0 }}>MOST POPULAR</div>
            <h3>Professional</h3>
            <div className="price">$99<span>/mo</span></div>
            <p>Everything in Starter plus advanced analytics and integrations.</p>
            <Link to="/signup" className="btn-premium w-full text-center" style={{ marginTop: '24px', justifyContent: 'center' }}>Buy Pro Plan</Link>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Custom</div>
            <p>Scalable solutions for large organizations with 500+ users.</p>
            <Link to="/contact" className="btn-secondary w-full text-center block" style={{ marginTop: '24px', display: 'block' }}>Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style>{`
        .mx-auto { margin-left: auto; margin-right: auto; }
        .flex { display: flex; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .block { display: block; }
        .w-full { width: 100%; }
        .mb-4 { margin-bottom: 16px; }

        .landing-wrapper {
          background-color: #ffffff;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .hero.centered {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          text-align: center;
          padding: 120px 24px 80px;
        }

        .hero-content h1 {
          font-size: 4.5rem;
          line-height: 1.1;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 24px;
          letter-spacing: -0.04em;
          max-width: 900px;
        }

        .hero-content p.mx-auto {
          margin-left: auto;
          margin-right: auto;
          font-size: 1.35rem;
          color: var(--slate-500);
          margin-bottom: 40px;
          max-width: 650px;
          line-height: 1.6;
        }

        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--grad-premium);
          color: #fff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
        }

        .logo span {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--slate-900);
          letter-spacing: -0.02em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-links a {
          color: var(--slate-600);
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .nav-links a:hover { color: var(--primary-600); }

        .btn-premium {
          padding: 12px 28px;
          background: var(--grad-premium);
          color: #fff;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
          transition: all 0.3s;
        }

        .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4); }

        .btn-secondary {
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 700;
          background: white;
          border: 1px solid var(--slate-200);
          color: var(--slate-700);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

        .hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 60px;
        }

        .hero-stats {
          display: flex;
          gap: 40px;
          border-top: 1px solid var(--slate-100);
          padding-top: 32px;
        }

        .hero-stat { color: var(--slate-400); font-size: 0.85rem; font-weight: 500; }
        .hero-stat strong { color: var(--slate-900); font-weight: 800; display: block; font-size: 1.25rem; margin-bottom: 2px; }

        .badge {
          display: inline-block;
          padding: 6px 16px;
          background: var(--primary-50);
          color: var(--primary-600);
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.8rem;
          margin-bottom: 24px;
          border: 1px solid var(--primary-100);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .trusted-section { padding: 60px 24px; text-align: center; border-bottom: 1px solid var(--slate-100); }
        .trusted-section p { color: var(--slate-400); font-weight: 700; font-size: 0.75rem; letter-spacing: 0.2em; margin-bottom: 40px; }
        .logo-strip { display: flex; justify-content: center; gap: 80px; opacity: 0.4; filter: grayscale(1); }
        .logo-placeholder { font-weight: 900; font-size: 1.25rem; color: var(--slate-900); }

        .features-section { padding: 120px 24px; max-width: 1200px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 80px; }
        .section-header h2 { font-size: 3.5rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 20px; }
        .section-header p { font-size: 1.25rem; color: var(--slate-500); max-width: 600px; margin: 0 auto; }
        
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .feature-item { padding: 40px; border-radius: 24px; transition: all 0.3s; border: 1px solid transparent; }
        .feature-item:hover { background: #fff; border-color: var(--slate-100); box-shadow: 0 20px 40px rgba(0,0,0,0.03); transform: translateY(-5px); }
        .f-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        .feature-item h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; color: var(--slate-900); }
        .feature-item p { color: var(--slate-500); line-height: 1.6; }

        .pricing-section { padding: 120px 24px; background: #fafafa; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 1200px; margin: 0 auto; }
        .pricing-card { background: white; padding: 48px; border-radius: 32px; border: 1px solid var(--slate-200); position: relative; transition: all 0.3s; }
        .pricing-card:hover { transform: translateY(-10px); box-shadow: 0 40px 80px rgba(0,0,0,0.05); }
        .pricing-card.featured { border: 2px solid var(--primary-500); box-shadow: 0 20px 50px rgba(99, 102, 241, 0.1); }
        .price { font-size: 4rem; font-weight: 800; display: flex; align-items: baseline; gap: 4px; margin: 32px 0 12px; }
        .price span { font-size: 1.1rem; color: var(--slate-400); font-weight: 600; }
        
        @media (max-width: 1024px) {
          .nav-links { display: none; }
          .hero-content h1 { font-size: 3.5rem; }
          .hero-content p.mx-auto { max-width: 100%; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .pricing-grid { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}
