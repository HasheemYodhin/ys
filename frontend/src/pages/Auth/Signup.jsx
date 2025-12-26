import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, Phone, ArrowRight, ChevronRight } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    password: '',
    role: 'Employee'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup({
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        company: formData.company,
        phone: formData.phone,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-content">
            <Link to="/" className="auth-brand">
              <div className="logo-icon-lg text-white">YS</div>
              <h1 className="text-white">YS HR</h1>
            </Link>
            <p className="badge-light">Join the Elite</p>
            <div className="auth-quote">
              <h2 className="quote-text">Scale your organization with tools built for <span className="text-secondary-glow">perfection.</span></h2>
              <p className="quote-sub">The most premium HR suite for modern, people-first teams.</p>
            </div>

            <div className="auth-features">
              <div className="a-feature">
                <div className="a-dot"></div>
                <span>Automated Payroll & Compliance</span>
              </div>
              <div className="a-feature">
                <div className="a-dot"></div>
                <span>Advanced Workforce Analytics</span>
              </div>
              <div className="a-feature">
                <div className="a-dot"></div>
                <span>Enterprise-Grade Security</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrapper glass">
            <div className="auth-header">
              <h2>Create an account</h2>
              <p>Start your 14-day free trial. No credit card required.</p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Work Email</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Company Name</label>
                  <div className="input-wrapper">
                    <Building size={18} className="input-icon" />
                    <input
                      type="text"
                      name="company"
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>I am an</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="select-premium"
                      required
                    >
                      <option value="Employee">Employee</option>
                      <option value="Employer">Employer (HR/Admin)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Secure Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button className="btn-premium w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Start Free Trial now'} <ArrowRight size={18} />
              </button>
            </form>

            <p className="auth-footer">
              Already using YS HR? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .auth-wrapper {
          min-height: 100vh;
          background: #f8fafc;
        }

        .auth-container {
          display: flex;
          min-height: 100vh;
        }

        .auth-left {
          flex: 1.2;
          background: var(--grad-premium);
          padding: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .auth-left::before {
          content: '';
          position: absolute;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          top: -25%;
          left: -25%;
        }

        .auth-content {
          position: relative;
          z-index: 1;
          max-width: 500px;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 60px;
          text-decoration: none;
        }

        .logo-icon-lg {
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.8rem;
        }

        .auth-brand h1 {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .badge-light {
          display: inline-block;
          padding: 6px 16px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.8rem;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .quote-text {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .text-secondary-glow {
          color: #fbd38d;
          text-shadow: 0 0 20px rgba(251, 211, 141, 0.4);
        }

        .quote-sub {
          font-size: 1.25rem;
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: 60px;
        }

        .auth-features {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .a-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          font-size: 1.05rem;
        }

        .a-dot {
          width: 10px;
          height: 10px;
          background: #fbd38d;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(251, 211, 141, 0.6);
        }

        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #f8fafc;
        }

        .auth-form-wrapper {
          width: 100%;
          max-width: 550px;
          background: white;
          padding: 60px;
          border-radius: 40px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.08);
          border: 1px solid #f0f0f0;
        }

        .auth-header {
          margin-bottom: 40px;
        }

        .auth-header h2 {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .auth-header p {
          color: var(--slate-500);
          font-size: 1.1rem;
        }

        .auth-error {
          background: #fff1f2;
          color: #e11d48;
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 30px;
          font-size: 0.95rem;
          font-weight: 600;
          text-align: center;
          border: 1px solid #ffe4e6;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group label {
          display: block;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--slate-700);
          margin-bottom: 10px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--slate-400);
        }

        .input-wrapper input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border-radius: 14px;
          border: 1px solid var(--slate-200);
          font-size: 1rem;
          transition: all 0.2s;
          background: #fcfcfc;
        }

        .input-wrapper input:focus, .select-premium:focus {
          border-color: var(--primary-500);
          outline: none;
          background: white;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .select-premium {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border-radius: 14px;
          border: 1px solid var(--slate-200);
          font-size: 1rem;
          transition: all 0.2s;
          background: #fcfcfc;
          appearance: none;
          cursor: pointer;
          color: var(--slate-700);
          font-weight: 500;
        }

        .select-premium:focus {
          background: white;
        }

        .btn-premium {
          margin-top: 10px;
          justify-content: center;
          padding: 16px;
          font-size: 1.1rem;
        }

        .auth-footer {
          text-align: center;
          margin-top: 40px;
          color: var(--slate-500);
          font-size: 1rem;
        }

        .auth-footer a {
          color: var(--primary-600);
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 1100px) {
          .auth-left { display: none; }
          .auth-container { justify-content: center; }
        }

        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
          .auth-form-wrapper { padding: 32px; }
        }
      `}</style>
    </div>
  );
}
