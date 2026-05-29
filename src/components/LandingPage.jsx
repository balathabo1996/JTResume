/**
 * @file LandingPage.jsx
 * @description The unauthenticated public-facing landing page. Features hero banners, feature grids, 
 * an animated template showcase, and a contact form.
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const MiniResumeMockup = ({ layout, color, name }) => {
  const role = name === 'Emma Wilson' ? 'Product Designer' : name === 'Sarah Martinez' ? 'Marketing Manager' : 'Software Engineer';
  const summary = "Experienced professional with a proven track record of delivering high-quality results. Skilled in cross-functional collaboration, strategic planning, and innovative problem-solving.";
  const exp1 = "Senior " + role + " - TechCorp";
  const exp1Desc = "Spearheaded the redesign of the core product, resulting in a 40% increase in user engagement. Managed a team of 5 and implemented agile methodologies.";
  const exp2 = role + " - StartupInc";
  const exp2Desc = "Developed and maintained critical infrastructure serving millions of requests per day. Optimized performance and reduced latency by 30%.";
  const edu = "B.S. in Computer Science - State University, 2018";
  
  return (
    <div className="mini-resume shadow-xl bg-white overflow-hidden rounded d-flex flex-column" style={{ width: '300px', height: '420px', flexShrink: 0, userSelect: 'none' }}>
      {layout === 'sidebar' ? (
        <div className="d-flex h-100">
          <div style={{ width: '35%', backgroundColor: color }} className="p-3 text-white">
             <div className="rounded-circle bg-white opacity-75 mx-auto mb-3 mt-2" style={{ width: '40px', height: '40px' }}></div>
             <div className="fw-bold mb-1" style={{ fontSize: '7px', letterSpacing: '0.5px' }}>CONTACT</div>
             <div style={{ fontSize: '5px', opacity: 0.8, marginBottom: '2px' }}>hello@example.com</div>
             <div style={{ fontSize: '5px', opacity: 0.8, marginBottom: '2px' }}>(555) 123-4567</div>
             <div style={{ fontSize: '5px', opacity: 0.8, marginBottom: '12px' }}>San Francisco, CA</div>
             
             <div className="fw-bold mb-1" style={{ fontSize: '7px', letterSpacing: '0.5px' }}>SKILLS</div>
             <div style={{ fontSize: '5px', opacity: 0.8, marginBottom: '2px' }}>React / JavaScript</div>
             <div style={{ fontSize: '5px', opacity: 0.8, marginBottom: '2px' }}>Node.js / Express</div>
             <div style={{ fontSize: '5px', opacity: 0.8, marginBottom: '2px' }}>UI/UX Design</div>
             <div style={{ fontSize: '5px', opacity: 0.8, marginBottom: '12px' }}>Agile Leadership</div>
             
             <div className="fw-bold mb-1" style={{ fontSize: '7px', letterSpacing: '0.5px' }}>EDUCATION</div>
             <div style={{ fontSize: '5px', opacity: 0.8, lineHeight: '1.2' }}>{edu}</div>
          </div>
          <div className="flex-grow-1 p-3">
             <div className="fw-bolder text-dark mb-0" style={{ fontSize: '14px', letterSpacing: '-0.5px' }}>{name}</div>
             <div style={{ fontSize: '7px', color: color, fontWeight: 'bold', marginBottom: '8px' }}>{role}</div>
             
             <div className="fw-bold text-dark mb-1" style={{ fontSize: '7px', borderBottom: `1px solid ${color}`, paddingBottom: '2px' }}>PROFILE</div>
             <div className="text-secondary mb-3" style={{ fontSize: '5px', lineHeight: '1.4' }}>{summary}</div>

             <div className="fw-bold text-dark mb-1" style={{ fontSize: '7px', borderBottom: `1px solid ${color}`, paddingBottom: '2px' }}>EXPERIENCE</div>
             <div className="fw-bold text-dark mt-2" style={{ fontSize: '5.5px' }}>{exp1}</div>
             <div className="text-secondary mb-2" style={{ fontSize: '5px', lineHeight: '1.4' }}>{exp1Desc}</div>
             
             <div className="fw-bold text-dark mt-2" style={{ fontSize: '5.5px' }}>{exp2}</div>
             <div className="text-secondary mb-2" style={{ fontSize: '5px', lineHeight: '1.4' }}>{exp2Desc}</div>
          </div>
        </div>
      ) : (
        <div className="p-4 d-flex flex-column h-100">
           <div className={`mb-3 ${layout === 'centered' ? 'text-center' : ''}`} style={{ borderBottom: layout==='centered' ? 'none' : `1px solid ${color}`, borderTop: layout==='centered' ? `4px solid ${color}` : 'none' }}>
             <div className={`fw-bolder text-dark mb-1 ${layout==='centered' ? 'mt-2' : ''}`} style={{ fontSize: '16px', letterSpacing: '-0.5px' }}>{name}</div>
             <div style={{ fontSize: '7px', color: color, fontWeight: 'bold', marginBottom: '6px' }}>{role}</div>
           </div>
           
           <div className="d-flex flex-column flex-grow-1">
              <div className="w-100 mb-3">
                <div className="fw-bold text-dark mb-1" style={{ fontSize: '7px' }}>SUMMARY</div>
                <div className="text-secondary" style={{ fontSize: '5px', lineHeight: '1.4' }}>{summary}</div>
              </div>
              
              <div className="w-100">
                <div className="fw-bold text-dark mb-2" style={{ fontSize: '7px' }}>PROFESSIONAL EXPERIENCE</div>
                
                <div className="d-flex justify-content-between mb-1">
                  <div className="fw-bold text-dark" style={{ fontSize: '5.5px' }}>{exp1}</div>
                  <div className="text-secondary" style={{ fontSize: '5px' }}>2020 - Present</div>
                </div>
                <div className="text-secondary mb-3" style={{ fontSize: '5px', lineHeight: '1.4' }}>{exp1Desc}</div>

                <div className="d-flex justify-content-between mb-1">
                  <div className="fw-bold text-dark" style={{ fontSize: '5.5px' }}>{exp2}</div>
                  <div className="text-secondary" style={{ fontSize: '5px' }}>2018 - 2020</div>
                </div>
                <div className="text-secondary mb-3" style={{ fontSize: '5px', lineHeight: '1.4' }}>{exp2Desc}</div>
                
                <div className="fw-bold text-dark mb-1" style={{ fontSize: '7px' }}>EDUCATION</div>
                <div className="text-secondary" style={{ fontSize: '5px' }}>{edu}</div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

/**
 * @function LandingPage
 * @description Renders the public landing page showcasing features and templates.
 * @param {Object} props
 * @param {Function} props.onStartBuilder - Callback triggered when a user clicks the Sign In or Build Resume CTA.
 * @param {boolean} props.isAuthenticated - Used to toggle the header CTA between Sign In vs Dashboard.
 * @param {Function} props.onSignOut - Callback to terminate the session if the user is authenticated on this page.
 * @param {Function} props.onGoToDashboard - Callback to navigate an authenticated user straight to the dashboard.
 */
export default function LandingPage({ onStartBuilder, isAuthenticated, onSignOut, onGoToDashboard }) {
  const [scrolled, setScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Contact Form hook-form setup
  const { register, handleSubmit: handleHookSubmit, reset, formState: { errors } } = useForm({ mode: 'onChange' });
  const [contactSending, setContactSending] = useState(false);
  const [contactFeedback, setContactFeedback] = useState({ type: '', text: '' });

  const handleContactSubmit = async (formData) => {
    setContactSending(true);
    setContactFeedback({ type: '', text: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setContactFeedback({ type: 'success', text: data.message || 'Message sent successfully!' });
      reset();
    } catch (err) {
      setContactFeedback({ type: 'danger', text: err.message });
    } finally {
      setContactSending(false);
    }
  };

  useEffect(() => {
    const navContent = document.getElementById('navbarContent');

    const closeNavIfOpen = (e) => {
      if (navContent && navContent.classList.contains('show')) {
        // If it was a touch/click, ignore if it was inside the navbar itself
        if (e && e.type !== 'scroll') {
          const navbar = document.querySelector('.navbar');
          if (navbar && navbar.contains(e.target)) return;
        }
        
        const toggler = document.querySelector('.navbar-toggler');
        if (toggler && !toggler.classList.contains('collapsed')) {
          toggler.click();
        }
      }
    };

    const handleScroll = (e) => {
      setScrolled(window.scrollY > 20);
      closeNavIfOpen(e); // Close on scroll
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', closeNavIfOpen);
    window.addEventListener('touchstart', closeNavIfOpen, { passive: true });

    const handleShow = () => setIsNavOpen(true);
    const handleHide = () => setIsNavOpen(false);

    if (navContent) {
      navContent.addEventListener('show.bs.collapse', handleShow);
      navContent.addEventListener('hide.bs.collapse', handleHide);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', closeNavIfOpen);
      window.removeEventListener('touchstart', closeNavIfOpen);
      if (navContent) {
        navContent.removeEventListener('show.bs.collapse', handleShow);
        navContent.removeEventListener('hide.bs.collapse', handleHide);
      }
    };
  }, []);

  return (
    <div className="landing-page bg-dark text-light min-vh-100 d-flex flex-column">
      <style>{`
        @media (max-width: 991.98px) {
          #navbarContent {
            background-color: var(--ui-card-bg);
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            text-align: center;
            box-shadow: 0 15px 30px rgba(0,0,0,0.5);
          }
          .mobile-nav-inner {
            padding: 24px;
          }
          #navbarContent .navbar-nav {
            margin-bottom: 20px !important;
          }
          #navbarContent .nav-link {
            padding: 16px 0;
            font-size: 1rem;
            font-weight: 700;
            color: var(--ui-text-primary) !important;
            border-bottom: 1px solid var(--ui-card-border);
          }
          #navbarContent .d-flex.align-items-center.gap-3 {
            flex-direction: column;
            width: 100%;
            gap: 12px !important;
          }
          /* Sign In Button */
          #navbarContent .nav-signin-btn {
            width: 100%;
            background-color: var(--ui-bg) !important;
            color: var(--ui-text-primary) !important;
            border: 1px solid var(--ui-card-border);
            box-shadow: none !important;
            border-radius: 8px !important;
          }
          /* Build My Resume Button */
          #navbarContent .cta-btn {
            width: 100%;
            background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
            border: none;
            border-radius: 8px !important;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4) !important;
          }
        }
      `}</style>
      
      {/* 1. Global Navigation Bar */}
      <nav 
        className={`navbar navbar-expand-lg fixed-top ${(scrolled || isNavOpen) ? 'glass-nav shadow-lg' : 'bg-transparent py-4'}`}
        style={{ transition: 'all 0.35s ease-in-out' }}
      >
        <div className="container">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#">
            <div className="brand" style={{ userSelect: 'none', transform: 'scale(0.9)', transformOrigin: 'left center' }}>
              <span className="brand-jt">JT</span>
              <span className="brand-resume">Resume</span>
            </div>
          </a>
          
          <button className="navbar-toggler border-0 shadow-none text-light" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            <div className="mobile-nav-inner w-100 d-lg-flex align-items-lg-center">
              <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-4 fw-medium" style={{ fontSize: '0.9rem' }}>
              <li className="nav-item"><a className="nav-link text-light nav-hover" href="#features">Features</a></li>
              <li className="nav-item"><a className="nav-link text-light nav-hover" href="#templates">Templates</a></li>
              <li className="nav-item"><a className="nav-link text-light nav-hover" href="#contact">Contact</a></li>
              </ul>
              
              <div className="d-flex align-items-center justify-content-center gap-3 mt-3 mt-lg-0">

              {isAuthenticated ? (
                <>
                  <button className="btn btn-dark px-4 py-2 fw-bold rounded-pill auth-btn border border-secondary" onClick={onSignOut}>
                    Sign Out
                  </button>
                  <button className="btn btn-primary px-4 py-2 fw-bold rounded-pill shadow-lg cta-btn" onClick={onGoToDashboard}>
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-dark px-4 py-2 fw-bold rounded-pill auth-btn border border-secondary" onClick={onStartBuilder}>
                    Sign In
                  </button>
                  <button className="btn btn-primary px-4 py-2 fw-bold rounded-pill shadow-lg cta-btn" onClick={onStartBuilder}>
                    Build My Resume
                  </button>
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Spectacular Hero Section */}
      <section className="hero-section position-relative d-flex align-items-center" style={{ minHeight: '100vh', paddingTop: '130px', overflow: 'hidden' }}>
        {/* Dynamic Background Glows */}
        <div className="hero-glow hero-glow-1 position-absolute rounded-circle blur-4xl"></div>
        <div className="hero-glow hero-glow-2 position-absolute rounded-circle blur-4xl"></div>
        <div className="hero-grid position-absolute w-100 h-100 top-0 start-0"></div>

        <div className="container position-relative z-1">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 hero-text-content">


              <h1 className="display-3 fw-bolder mb-4 hero-title fade-in-up stagger-2" style={{ letterSpacing: '-1.5px', lineHeight: '1.1' }}>
                Land your dream job with a <span className="gradient-text">market-leading</span> resume.
              </h1>
              <p className="lead mb-5 text-secondary" style={{ fontSize: '1.15rem', maxWidth: '90%' }}>
                Create beautiful, ATS-optimized resumes in minutes. Stand out to recruiters with executive templates, real-time keyword scoring, and high-impact design presets.
              </p>
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-md-start w-100">
                <button className="btn btn-primary btn-lg px-4 px-md-5 py-3 fw-bold rounded-pill shadow-lg cta-btn text-nowrap w-100 w-md-auto d-flex align-items-center justify-content-center" onClick={isAuthenticated ? onGoToDashboard : onStartBuilder}>
                  {isAuthenticated ? 'Go to Dashboard' : 'Create My Resume Now'}
                  <svg className="ms-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
                <a href="#templates" className="btn btn-outline-light btn-lg px-4 py-3 fw-bold rounded-pill glass-btn text-center text-nowrap w-100 w-md-auto d-flex align-items-center justify-content-center">
                  View Templates
                </a>
              </div>

            </div>
            
            {/* Visual Mockup Right Side */}
            <div className="col-lg-6 hero-visual d-flex justify-content-lg-end justify-content-center mt-5 mt-lg-0">
              <div className="mockup-container position-relative" style={{ width: '380px', height: '480px' }}>
                <div className="mockup-glass-card shadow-2xl w-100 h-100">
                  <div className="mockup-resume-header border-bottom pb-3 mb-3 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="mockup-name fw-bolder mb-1">Jane Doe</div>
                      <div className="mockup-title text-indigo fw-semibold">Senior Product Designer</div>
                    </div>
                  </div>
                  <div className="mockup-section">
                    <div className="mockup-section-title">Experience</div>
                    <div className="mockup-job mt-2">
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Google</span>
                        <span className="text-muted">2020 - Present</span>
                      </div>
                      <div className="mockup-line w-100 mt-2"></div>
                      <div className="mockup-line w-75 mt-1"></div>
                      <div className="mockup-line w-85 mt-1"></div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="floating-badge badge-ats shadow-lg px-3 py-2 rounded-3 fw-bold d-flex align-items-center gap-2">
                  <div className="score-ring">95</div>
                  ATS Match Score
                </div>
                <div className="floating-badge badge-template shadow-lg px-3 py-2 rounded-3 fw-bold d-flex align-items-center gap-2">
                  🎨 Premium Executive Layout
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="py-5" style={{ background: 'var(--ui-bg)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-indigo fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Why JTResume?</span>
            <h2 className="display-5 fw-bold mt-2">The only tool you need to get hired.</h2>
          </div>
          <div className="row g-4">
            {[
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>,
                title: "ATS Match Scanner",
                desc: "Paste any job description to automatically extract keywords and monitor your ATS match score."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>,
                title: "Gemini AI Enhancer",
                desc: "Harness Google Gemini AI to instantly generate professional summaries, write cover letters, and enhance experience bullets."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" fill="url(#gradient3)" stroke="none"></path></svg>,
                title: "LinkedIn AI Parser",
                desc: "Instantly convert your exported LinkedIn PDF into a highly structured, ATS-ready layout using AI parsing."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
                title: "PDF & DOCX Export",
                desc: "Export instantly to perfectly scaled vector PDFs or ATS-friendly Microsoft Word documents."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>,
                title: "Fluid Drag & Drop",
                desc: "Smoothly reorder your individual jobs, skills, and education blocks with our buttery FLIP animation engine."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>,
                title: "Shareable Web Resumes",
                desc: "Publish your resume to a live URL with custom slugs, password protection, and live visitor analytics."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
                title: "Smart Auto-Fit Engine",
                desc: "Intelligently auto-compress typography, margins, and line-heights to fit your resume perfectly onto 1 or 2 pages."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
                title: "Bank-Grade Security",
                desc: "Keep your data private with zero-trust AES encryption, session validation, and secure auto-logout."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
                title: "Multi-Profile Management",
                desc: "Create and manage multiple distinct resumes tailored for completely different roles from a single dashboard."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
                title: "Live Preview Engine",
                desc: "Experience instant, side-by-side rendering. See how your resume looks in real-time as you type."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"></circle><path d="M13.5 9c-3.04 0-5.5 2.46-5.5 5.5s2.46 5.5 5.5 5.5 5.5-2.46 5.5-5.5S16.54 9 13.5 9z"></path><path d="M6.5 17.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path></svg>,
                title: "Dynamic Color Palettes",
                desc: "Customize the aesthetics with predefined accent colors and typography pairings to match your personal brand."
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>,
                title: "Smart Auto-Save",
                desc: "Never lose your progress. Our intelligent debounce system automatically saves your data as you edit."
              }
            ].map((f, i) => (
              <motion.div 
                className="col-lg-3 col-md-6" 
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.7, delay: (i % 4) * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <div className="feature-card glass-panel h-100 p-4 position-relative">
                  <div className="feature-icon-wrapper mb-4 d-inline-flex align-items-center justify-content-center rounded-3 position-relative z-1" style={{ 
                    width: '50px', height: '50px', 
                    background: 'rgba(255,255,255,0.02)',
                    boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02), 0 8px 16px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {f.icon}
                  </div>
                  <h4 className="fw-bolder mb-3 text-light position-relative z-1" style={{ fontSize: '1.1rem', letterSpacing: '-0.3px' }}>{f.title}</h4>
                  <p className="text-secondary mb-0 position-relative z-1" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Templates Showcase */}
      <section id="templates" className="py-5 overflow-hidden" style={{ background: 'var(--ui-bg)', position: 'relative' }}>
        <div className="container position-relative z-1">
          <div className="row align-items-center mb-0">
            <motion.div 
              className="col-lg-7"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <h2 className="display-5 fw-bolder mb-3 text-light" style={{ letterSpacing: '-1px' }}>Templates</h2>
              <p className="lead text-secondary" style={{ fontSize: '1.1rem' }}>
                Explore our diverse selection of templates, each designed to fit different styles, professions, and personalities. JTResume currently offers 6 premium layouts, with more on the way.
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Animated Infinite Marquee Grid */}
        <div className="container-fluid px-0 mt-2 position-relative z-1 overflow-hidden" style={{ paddingBottom: '20px' }}>
          <style>{`
            @keyframes infiniteScrollX {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes infiniteScrollXReverse {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .infinite-marquee {
              display: flex;
              width: max-content;
              animation: infiniteScrollX 35s linear infinite;
              padding: 5px 0;
            }
            .infinite-marquee:hover {
              animation-play-state: paused;
            }
            .infinite-marquee.reverse {
              animation: infiniteScrollXReverse 35s linear infinite;
            }
            .infinite-marquee.reverse:hover {
              animation-play-state: paused;
            }
            .template-item {
              margin: 0 -45px;
              transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
              transform: scale(0.65);
              cursor: pointer;
            }
            .template-item:hover {
              transform: scale(0.72) translateY(-15px);
              z-index: 100;
            }
          `}</style>

          {/* Track 1 - Moving Left */}
          <div className="infinite-marquee">
            {[
              { layout: 'sidebar', color: '#10b981', name: 'Kunhao Du', label: 'Executive Green' },
              { layout: 'classic', color: '#0ea5e9', name: 'John Doe', label: 'Classic Blue' },
              { layout: 'centered', color: '#ec4899', name: 'Sarah Martinez', label: 'Creative Pink' },
              { layout: 'sidebar', color: '#8b5cf6', name: 'Alex Kowalski', label: 'Tech Purple' },
              { layout: 'classic', color: '#f59e0b', name: 'Marcus Chen', label: 'Modern Amber' },
              { layout: 'centered', color: '#14b8a6', name: 'Emma Wilson', label: 'Minimal Teal' },
              { layout: 'sidebar', color: '#10b981', name: 'Kunhao Du', label: 'Executive Green' },
              { layout: 'classic', color: '#0ea5e9', name: 'John Doe', label: 'Classic Blue' },
              { layout: 'centered', color: '#ec4899', name: 'Sarah Martinez', label: 'Creative Pink' },
              { layout: 'sidebar', color: '#8b5cf6', name: 'Alex Kowalski', label: 'Tech Purple' },
              { layout: 'classic', color: '#f59e0b', name: 'Marcus Chen', label: 'Modern Amber' },
              { layout: 'centered', color: '#14b8a6', name: 'Emma Wilson', label: 'Minimal Teal' }
            ].map((tpl, i) => (
              <div 
                className="template-item position-relative d-flex justify-content-center" 
                key={`t1-${i}`}
                onMouseOver={(e) => {
                  e.currentTarget.querySelector('.template-glow').style.opacity = '1';
                  e.currentTarget.querySelector('.template-overlay').style.opacity = '1';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.querySelector('.template-glow').style.opacity = '0';
                  e.currentTarget.querySelector('.template-overlay').style.opacity = '0';
                }}
              >
                <div 
                  className="template-glow position-absolute w-100 h-100 rounded" 
                  style={{ 
                    background: `radial-gradient(circle at center, ${tpl.color}80 0%, transparent 70%)`,
                    filter: 'blur(35px)',
                    opacity: 0,
                    transition: 'opacity 0.5s',
                    top: 0, left: 0, zIndex: 0
                  }} 
                ></div>
                <div className="position-relative z-1 rounded-4 overflow-hidden shadow-lg" style={{ border: `1px solid rgba(255,255,255,0.08)` }}>
                  <MiniResumeMockup layout={tpl.layout} color={tpl.color} name={tpl.name} />
                  <div 
                    className="template-overlay position-absolute w-100 h-100 top-0 start-0 d-flex flex-column align-items-center justify-content-center"
                    style={{
                      background: 'rgba(10, 13, 22, 0.85)',
                      backdropFilter: 'blur(4px)',
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      zIndex: 10
                    }}
                  >
                    <span className="badge mb-3 px-3 py-2 fs-5 rounded-pill border" style={{ backgroundColor: `${tpl.color}30`, color: tpl.color, borderColor: `${tpl.color}50` }}>{tpl.label}</span>
                    <button className="btn fw-bold rounded-pill px-4 py-2 fs-5" style={{ background: tpl.color, color: '#fff', border: 'none', boxShadow: `0 4px 15px ${tpl.color}60` }} onClick={isAuthenticated ? onGoToDashboard : onStartBuilder}>Use Template</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Track 2 - Moving Right (Reversed) */}
          <div className="infinite-marquee reverse" style={{ marginTop: '-120px' }}>
            {[
              { layout: 'sidebar', color: '#10b981', name: 'Kunhao Du', label: 'Executive Green' },
              { layout: 'classic', color: '#0ea5e9', name: 'John Doe', label: 'Classic Blue' },
              { layout: 'centered', color: '#ec4899', name: 'Sarah Martinez', label: 'Creative Pink' },
              { layout: 'sidebar', color: '#8b5cf6', name: 'Alex Kowalski', label: 'Tech Purple' },
              { layout: 'classic', color: '#f59e0b', name: 'Marcus Chen', label: 'Modern Amber' },
              { layout: 'centered', color: '#14b8a6', name: 'Emma Wilson', label: 'Minimal Teal' },
              { layout: 'sidebar', color: '#10b981', name: 'Kunhao Du', label: 'Executive Green' },
              { layout: 'classic', color: '#0ea5e9', name: 'John Doe', label: 'Classic Blue' },
              { layout: 'centered', color: '#ec4899', name: 'Sarah Martinez', label: 'Creative Pink' },
              { layout: 'sidebar', color: '#8b5cf6', name: 'Alex Kowalski', label: 'Tech Purple' },
              { layout: 'classic', color: '#f59e0b', name: 'Marcus Chen', label: 'Modern Amber' },
              { layout: 'centered', color: '#14b8a6', name: 'Emma Wilson', label: 'Minimal Teal' }
            ].reverse().map((tpl, i) => (
              <div 
                className="template-item position-relative d-flex justify-content-center" 
                key={`t2-${i}`}
                onMouseOver={(e) => {
                  e.currentTarget.querySelector('.template-glow').style.opacity = '1';
                  e.currentTarget.querySelector('.template-overlay').style.opacity = '1';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.querySelector('.template-glow').style.opacity = '0';
                  e.currentTarget.querySelector('.template-overlay').style.opacity = '0';
                }}
              >
                <div 
                  className="template-glow position-absolute w-100 h-100 rounded" 
                  style={{ 
                    background: `radial-gradient(circle at center, ${tpl.color}80 0%, transparent 70%)`,
                    filter: 'blur(35px)',
                    opacity: 0,
                    transition: 'opacity 0.5s',
                    top: 0, left: 0, zIndex: 0
                  }} 
                ></div>
                <div className="position-relative z-1 rounded-4 overflow-hidden shadow-lg" style={{ border: `1px solid rgba(255,255,255,0.08)` }}>
                  <MiniResumeMockup layout={tpl.layout} color={tpl.color} name={tpl.name} />
                  <div 
                    className="template-overlay position-absolute w-100 h-100 top-0 start-0 d-flex flex-column align-items-center justify-content-center"
                    style={{
                      background: 'rgba(10, 13, 22, 0.85)',
                      backdropFilter: 'blur(4px)',
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      zIndex: 10
                    }}
                  >
                    <span className="badge mb-3 px-3 py-2 fs-5 rounded-pill border" style={{ backgroundColor: `${tpl.color}30`, color: tpl.color, borderColor: `${tpl.color}50` }}>{tpl.label}</span>
                    <button className="btn fw-bold rounded-pill px-4 py-2 fs-5" style={{ background: tpl.color, color: '#fff', border: 'none', boxShadow: `0 4px 15px ${tpl.color}60` }} onClick={isAuthenticated ? onGoToDashboard : onStartBuilder}>Use Template</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Contact Section */}
      <section id="contact" className="py-5" style={{ background: 'var(--ui-bg)', position: 'relative' }}>
        <div className="container position-relative z-1" style={{ maxWidth: '1000px' }}>
          <motion.div 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <span className="text-indigo fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Get in Touch</span>
            <h2 className="display-5 fw-bold mt-2">Have questions? Contact us!</h2>
            <p className="text-secondary mt-2">Drop us a line and our team will get back to you shortly.</p>
          </motion.div>

          {contactFeedback.text && (
            <div className={`alert alert-${contactFeedback.type} py-3 px-4 rounded-3 mb-4 text-center mx-auto`} style={{ maxWidth: '800px', fontSize: '0.9rem', fontWeight: 600 }}>
              {contactFeedback.text}
            </div>
          )}

          <div className="row g-5 align-items-stretch">
            {/* Contact Information */}
            <div className="col-lg-5">
              <div className="contact-card p-4 p-md-5 rounded-4 h-100">
                <h4 className="fw-bold mb-4 text-white">Contact Information</h4>
                <ul className="list-unstyled d-flex flex-column gap-4 mb-0 mt-4">
                  <li className="d-flex align-items-start gap-3">
                    <div style={{ color: '#8b5cf6', marginTop: '2px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm18 2L12 11.5 4 7v12h16V7zM4 5v.4l8 5.6 8-5.6V5H4z"/></svg>
                    </div>
                    <div>
                      <div className="form-label mb-1">Email</div>
                      <a href="mailto:balathabo96@gmail.com" className="text-secondary text-decoration-none fw-medium" style={{ fontSize: '0.85rem' }}>balathabo96@gmail.com</a>
                    </div>
                  </li>
                  <li className="d-flex align-items-start gap-3">
                    <div style={{ color: '#8b5cf6', marginTop: '2px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </div>
                    <div>
                      <div className="form-label mb-1">LinkedIn</div>
                      <a href="https://linkedin.com/in/balachandran-thabotharan-261895131" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none fw-medium" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>balachandran-thabotharan-261895131</a>
                    </div>
                  </li>
                  <li className="d-flex align-items-start gap-3">
                    <div style={{ color: '#8b5cf6', marginTop: '2px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    </div>
                    <div>
                      <div className="form-label mb-1">GitHub</div>
                      <a href="https://github.com/balathabo1996" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none fw-medium" style={{ fontSize: '0.85rem' }}>balathabo1996</a>
                    </div>
                  </li>
                  <li className="d-flex align-items-start gap-3">
                    <div style={{ color: '#8b5cf6', marginTop: '2px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M21.384 17.752a2.108 2.108 0 0 1-.522 3.359 7.526 7.526 0 0 1-5.476 1.48c-3.15-.36-6.42-1.93-9.1-4.6-2.68-2.68-4.24-5.95-4.6-9.1a7.526 7.526 0 0 1 1.48-5.476 2.108 2.108 0 0 1 3.359-.522l2.67 2.67a2.1 2.1 0 0 1 .49 2.58l-1.15 2.3c.63 1.51 1.75 2.94 3.09 4.28 1.34 1.34 2.77 2.46 4.28 3.09l2.3-1.15a2.1 2.1 0 0 1 2.58.49l2.67 2.67z"/></svg>
                    </div>
                    <div>
                      <div className="form-label mb-1">Phone</div>
                      <a href="tel:+14373831996" className="text-secondary text-decoration-none fw-medium" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>(437) 383-1996</a>
                    </div>
                  </li>
                  <li className="d-flex align-items-start gap-3">
                    <div style={{ color: '#8b5cf6', marginTop: '2px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                    </div>
                    <div>
                      <div className="form-label mb-1">Location</div>
                      <span className="text-secondary fw-medium" style={{ fontSize: '0.85rem' }}>Scarborough, Ontario, Canada</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-7">
              <div className="contact-card p-4 p-md-5 rounded-4 h-100">
                <form onSubmit={handleHookSubmit(handleContactSubmit)}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-light mb-2" style={{ fontSize: '0.85rem' }}>Full Name</label>
                  <input 
                    type="text" 
                    className={`form-control auth-input py-2.5 ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="John Doe" 
                    {...register('name', { required: 'Full Name is required' })}
                    disabled={contactSending}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-light mb-2" style={{ fontSize: '0.85rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    className={`form-control auth-input py-2.5 ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="john.doe@example.com" 
                    {...register('email', { 
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    disabled={contactSending}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold text-light mb-2" style={{ fontSize: '0.85rem' }}>Subject</label>
                  <input 
                    type="text" 
                    className={`form-control auth-input py-2.5 ${errors.subject ? 'is-invalid' : ''}`}
                    placeholder="How can we help you?" 
                    {...register('subject', { required: 'Subject is required' })}
                    disabled={contactSending}
                  />
                  {errors.subject && <div className="invalid-feedback">{errors.subject.message}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold text-light mb-2" style={{ fontSize: '0.85rem' }}>Message</label>
                  <textarea 
                    className={`form-control auth-input py-2.5 ${errors.message ? 'is-invalid' : ''}`}
                    rows="5"
                    placeholder="Tell us more about your inquiry..." 
                    {...register('message', { required: 'Message is required' })}
                    disabled={contactSending}
                  ></textarea>
                  {errors.message && <div className="invalid-feedback">{errors.message.message}</div>}
                </div>
                <div className="col-12 text-center mt-4">
                  <button type="submit" className="btn btn-primary px-5 py-3 fw-bold rounded-pill shadow-lg cta-btn" disabled={contactSending}>
                    {contactSending ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true">Sending...</span>
                    ) : (
                      <>
                        Send Message
                        <svg className="ms-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer border-top border-secondary border-opacity-25 py-4" style={{ background: 'var(--ui-bg)' }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <a href="#" className="brand text-decoration-none" style={{ transform: 'scale(0.8)' }}>
              <span className="brand-jt">JT</span>
              <span className="brand-resume">Resume</span>
            </a>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
              &copy; {new Date().getFullYear()} JTResume. All rights reserved.
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}
