import React, { useEffect, useState } from 'react';

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

export default function LandingPage({ onStartBuilder }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page bg-dark text-light min-vh-100 d-flex flex-column">
      
      {/* 1. Global Navigation Bar */}
      <nav className={`navbar navbar-expand-lg fixed-top transition-all ${scrolled ? 'glass-nav shadow-lg' : 'bg-transparent py-4'}`}>
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
            <ul className="navbar-nav ms-auto me-4 mb-2 mb-lg-0 gap-4 fw-medium" style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li className="nav-item"><a className="nav-link text-light nav-hover" href="#features">Features</a></li>
              <li className="nav-item"><a className="nav-link text-light nav-hover" href="#templates">Templates</a></li>
            </ul>
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-link text-light text-decoration-none fw-medium" style={{ fontSize: '0.9rem' }} onClick={onStartBuilder}>Sign In</button>
              <button className="btn btn-primary px-4 py-2 fw-bold rounded-pill shadow-lg cta-btn" onClick={onStartBuilder}>
                Build My Resume
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Spectacular Hero Section */}
      <section className="hero-section position-relative d-flex align-items-center" style={{ minHeight: '100vh', paddingTop: '80px', overflow: 'hidden' }}>
        {/* Dynamic Background Glows */}
        <div className="hero-glow hero-glow-1 position-absolute rounded-circle blur-4xl"></div>
        <div className="hero-glow hero-glow-2 position-absolute rounded-circle blur-4xl"></div>
        <div className="hero-grid position-absolute w-100 h-100 top-0 start-0"></div>

        <div className="container position-relative z-1">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 hero-text-content">

              <h1 className="display-3 fw-bolder mb-4 hero-title" style={{ letterSpacing: '-1.5px', lineHeight: '1.1' }}>
                Land your dream job with a <span className="text-gradient-primary">market-leading</span> resume.
              </h1>
              <p className="lead mb-5 text-secondary" style={{ fontSize: '1.15rem', maxWidth: '90%' }}>
                Create beautiful, ATS-optimized resumes in minutes. Stand out to recruiters with executive templates, real-time keyword scoring, and high-impact design presets.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <button className="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-pill shadow-lg cta-btn" onClick={onStartBuilder}>
                  Create My Resume Now
                  <svg className="ms-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
                <a href="#templates" className="btn btn-outline-light btn-lg px-4 py-3 fw-bold rounded-pill glass-btn">
                  View Templates
                </a>
              </div>
              <div className="mt-4 d-flex align-items-center gap-3 text-secondary" style={{ fontSize: '0.85rem' }}>
                <div className="d-flex gap-1">
                  {[1,2,3,4,5].map(i => <svg key={i} width="16" height="16" fill="#f59e0b" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>)}
                </div>
                <span>Trusted by 10,000+ professionals worldwide</span>
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
      <section id="features" className="py-5" style={{ background: 'linear-gradient(to bottom, #060913 0%, #0d1221 100%)' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="text-indigo fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Why JTResume?</span>
            <h2 className="display-5 fw-bold mt-2">The only tool you need to get hired.</h2>
          </div>
          <div className="row g-4">
            {[
              {
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>,
                title: "Real-Time ATS Parsing",
                desc: "Our engine scans your resume exactly like enterprise Applicant Tracking Systems do, ensuring you pass the bots."
              },
              {
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
                title: "Pixel-Perfect Designs",
                desc: "6 gorgeous layout paradigms mapped to 10 executive color palettes and 4 typographic principles."
              },
              {
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#gradient3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
                title: "100% Private",
                desc: "Your data never leaves your browser. No cloud storage, no account required. Build and export instantly."
              }
            ].map((f, i) => (
              <div className="col-md-4" key={i}>
                <div className="feature-card h-100 p-5 rounded-4 position-relative overflow-hidden" style={{ 
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  <div className="feature-icon-wrapper mb-4 d-inline-flex align-items-center justify-content-center rounded-3 position-relative z-1" style={{ 
                    width: '60px', height: '60px', 
                    background: 'rgba(255,255,255,0.02)',
                    boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02), 0 8px 16px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {f.icon}
                  </div>
                  <h4 className="fw-bolder mb-3 text-light position-relative z-1" style={{ fontSize: '1.25rem', letterSpacing: '-0.3px' }}>{f.title}</h4>
                  <p className="text-secondary mb-0 position-relative z-1" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Templates Showcase */}
      <section id="templates" className="py-5 overflow-hidden" style={{ background: '#0a0d16', position: 'relative' }}>
        <div className="container py-5 position-relative z-1">
          <div className="row align-items-center mb-0">
            <div className="col-lg-7">
              <h2 className="display-5 fw-bolder mb-3 text-light" style={{ letterSpacing: '-1px' }}>Templates</h2>
              <p className="lead text-secondary" style={{ fontSize: '1.1rem' }}>
                Explore our diverse selection of templates, each designed to fit different styles, professions, and personalities. JTResume currently offers 6 premium layouts, with more on the way.
              </p>
            </div>
          </div>
        </div>
        
        {/* Tilted Marquee Wrapper */}
        <div className="templates-perspective-wrapper" style={{ perspective: '1200px', transformStyle: 'preserve-3d', paddingBottom: '0px', marginTop: '-140px', overflow: 'hidden' }}>
          <div className="templates-marquee-container d-flex flex-column gap-4" style={{ 
            transform: 'rotateY(-8deg) rotateX(2deg) rotateZ(-1deg)',
            width: 'max-content',
            paddingLeft: '50px'
          }}>
             {/* Row 1 */}
             <div className="d-flex gap-4 px-3 marquee-track-1">
               {[...Array(4)].flatMap((_, arrayIndex) => [
                 { layout: 'sidebar', color: '#10b981', name: 'Kunhao Du' },
                 { layout: 'classic', color: '#0ea5e9', name: 'John Doe' },
                 { layout: 'centered', color: '#ec4899', name: 'Sarah Martinez' },
                 { layout: 'sidebar', color: '#8b5cf6', name: 'Alex Kowalski' },
                 { layout: 'classic', color: '#f59e0b', name: 'Marcus Chen' },
                 { layout: 'centered', color: '#14b8a6', name: 'Emma Wilson' },
               ].map((tpl, i) => (
                 <MiniResumeMockup key={`r1-${arrayIndex}-${i}`} layout={tpl.layout} color={tpl.color} name={tpl.name} />
               )))}
             </div>
             {/* Row 2 Offset */}
             <div className="d-flex gap-4 px-3 marquee-track-2" style={{ marginLeft: '-200px' }}>
               {[...Array(4)].flatMap((_, arrayIndex) => [
                 { layout: 'centered', color: '#14b8a6', name: 'Emma Wilson' },
                 { layout: 'sidebar', color: '#8b5cf6', name: 'Alex Kowalski' },
                 { layout: 'classic', color: '#f59e0b', name: 'Marcus Chen' },
                 { layout: 'sidebar', color: '#10b981', name: 'Kunhao Du' },
                 { layout: 'classic', color: '#0ea5e9', name: 'John Doe' },
                 { layout: 'centered', color: '#ec4899', name: 'Sarah Martinez' },
               ].map((tpl, i) => (
                 <MiniResumeMockup key={`r2-${arrayIndex}-${i}`} layout={tpl.layout} color={tpl.color} name={tpl.name} />
               )))}
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer border-top border-secondary border-opacity-25 py-4" style={{ background: '#04060d' }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="brand" style={{ transform: 'scale(0.8)' }}>
              <span className="brand-jt">JT</span>
              <span className="brand-resume">Resume</span>
            </div>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
              &copy; {new Date().getFullYear()} JTResume. All rights reserved.
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}
