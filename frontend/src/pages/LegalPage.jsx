import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, Lock, FileText, ChevronLeft } from 'lucide-react';

export default function LegalPage() {
    const location = useLocation();
    const [content, setContent] = useState({ title: '', icon: null, text: [] });

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('privacy')) {
            setContent({
                title: 'Privacy Policy',
                icon: <Lock className="text-primary-600" size={48} />,
                text: [
                    'Your privacy is important to us. It is YS HR\'s policy to respect your privacy regarding any information we may collect from you across our website.',
                    'We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.',
                    'We also let you know why we’re collecting it and how it will be used.',
                    'We only retain collected information for as long as necessary to provide you with your requested service.',
                    'What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.',
                    'We don’t share any personally identifying information publicly or with third-parties, except when required to by law.'
                ]
            });
        } else if (path.includes('terms')) {
            setContent({
                title: 'Terms of Use',
                icon: <FileText className="text-primary-600" size={48} />,
                text: [
                    'By accessing our website, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.',
                    'If you do not agree with any of these terms, you are prohibited from using or accessing this site.',
                    'The materials contained in this website are protected by applicable copyright and trademark law.',
                    'Permission is granted to temporarily download one copy of the materials on YS HR\'s website for personal, non-commercial transitory viewing only.',
                    'This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials.'
                ]
            });
        } else if (path.includes('security')) {
            setContent({
                title: 'Security',
                icon: <Shield className="text-primary-600" size={48} />,
                text: [
                    'YS HR employs state-of-the-art security measures to protect your organization\'s data.',
                    'Our platform is built on secure infrastructure with multi-layer encryption for both data at rest and in transit.',
                    'We conduct regular third-party security audits and penetration testing to ensure the highest level of safety.',
                    'Access to sensitive data is strictly controlled through multi-factor authentication and role-based access management.',
                    'We maintain a robust incident response plan and 24/7 monitoring to mitigate potential threats instantaneously.'
                ]
            });
        }
    }, [location]);

    return (
        <div className="legal-page">
            <nav className="landing-nav glass">
                <div className="nav-container">
                    <Link to="/" className="logo">
                        <div className="logo-icon">YS</div>
                        <span>YS HR</span>
                    </Link>
                    <div className="nav-links">
                        <Link to="/" className="flex items-center gap-2">
                            <ChevronLeft size={18} /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <header className="page-hero">
                <div className="container">
                    <div className="legal-icon-wrapper mb-6">{content.icon}</div>
                    <h1>{content.title}</h1>
                    <p className="mx-auto">Last updated: December 2025</p>
                </div>
            </header>

            <main className="content-section">
                <div className="container">
                    <div className="legal-card glass">
                        {content.text.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </main>

            <style>{`
                .legal-page { background: #fcfcfc; min-height: 100vh; padding-top: 80px; }
                .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .mb-6 { margin-bottom: 24px; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .gap-2 { gap: 8px; }

                .landing-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; border-bottom: 1px solid rgba(0,0,0,0.05); }
                .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; }
                .logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
                .logo-icon { width: 40px; height: 40px; background: var(--grad-premium); color: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
                .logo span { font-size: 1.5rem; font-weight: 800; color: var(--slate-900); }
                .nav-links a { color: var(--slate-600); font-weight: 600; font-size: 0.95rem; text-decoration: none; }

                .page-hero { padding: 80px 0 60px; text-align: center; }
                .page-hero h1 { font-size: 3rem; font-weight: 800; color: var(--slate-900); margin-bottom: 16px; }
                .page-hero p { color: var(--slate-500); font-weight: 600; }
                .legal-icon-wrapper { display: flex; justify-content: center; }

                .legal-card { 
                    background: white; 
                    padding: 60px; 
                    border-radius: 32px; 
                    box-shadow: 0 20px 50px rgba(0,0,0,0.03); 
                    border: 1px solid #f0f0f0;
                    margin-bottom: 100px;
                }
                .legal-card p { 
                    font-size: 1.15rem; 
                    line-height: 1.8; 
                    color: #475569; 
                    margin-bottom: 24px; 
                }
                .legal-card p:last-child { margin-bottom: 0; }
            `}</style>
        </div>
    );
}
