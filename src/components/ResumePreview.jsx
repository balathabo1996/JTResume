import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

export default function ResumePreview({ formData, country = 'usa', templateStyle, accentColor, spacingTuning = 'normal', fontPairing = 'modern' }) {
  const { personalInfo, workExperience, education, skills, certifications, references } = formData;

  const isEmpty = !personalInfo.fullName && workExperience.length === 0 && education.length === 0;

  if (isEmpty) {
    return (
      <div className="blueprint-frame" id="resume-print-target">
        <div className="blueprint-icon-pulsing">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ width: '32px', height: '32px', color: '#ffffff' }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h2 className="blueprint-title">Live Blueprint Preview Canvas</h2>
        <p className="blueprint-desc">
          Your ATS-optimized resume will compile here in real-time as you type. Choose a layout, customize your style, and fill in the details on the left!
        </p>

        <div className="blueprint-specs-grid">
          <div className="spec-item">
            <span className="spec-icon">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="spec-svg"
                style={{ width: '24px', height: '24px', color: '#60a5fa', filter: 'drop-shadow(0 2px 6px rgba(96, 165, 250, 0.2))' }}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </span>
            <span className="spec-label">Global ATS Standards</span>
          </div>
          <div className="spec-item">
            <span className="spec-icon">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="spec-svg"
                style={{ width: '24px', height: '24px', color: '#38bdf8', filter: 'drop-shadow(0 2px 6px rgba(56, 189, 248, 0.2))' }}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 11 2 2 4-4" />
              </svg>
            </span>
            <span className="spec-label">Compliance Scanners</span>
          </div>
          <div className="spec-item">
            <span className="spec-icon">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="spec-svg"
                style={{ width: '24px', height: '24px', color: '#fb923c', filter: 'drop-shadow(0 2px 6px rgba(251, 146, 60, 0.2))' }}
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            <span className="spec-label">Bullet Verb Boosters</span>
          </div>
          <div className="spec-item">
            <span className="spec-icon">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="spec-svg"
                style={{ width: '24px', height: '24px', color: '#fbbf24', filter: 'drop-shadow(0 2px 6px rgba(251, 191, 36, 0.2))' }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <span className="spec-label">100% Secure & Local</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate dynamic spacing values based on layout spacing tuner state (Letter standard is globally standard for resumes)
  const getSpacingVariables = () => {
    if (spacingTuning === 'compact') {
      return {
        '--resume-padding': '32px',
        '--resume-section-margin': '12px',
        '--resume-block-margin': '8px',
        '--resume-line-height': '1.3',
        '--resume-font-size-body': '0.8rem',
        '--resume-header-margin': '12px',
        '--resume-header-padding': '8px'
      };
    }
    if (spacingTuning === 'spacious') {
      return {
        '--resume-padding': '60px',
        '--resume-section-margin': '28px',
        '--resume-block-margin': '18px',
        '--resume-line-height': '1.65',
        '--resume-font-size-body': '0.92rem',
        '--resume-header-margin': '32px',
        '--resume-header-padding': '20px'
      };
    }
    // Default / Normal
    return {
      '--resume-padding': '48px',
      '--resume-section-margin': '20px',
      '--resume-block-margin': '14px',
      '--resume-line-height': '1.5',
      '--resume-font-size-body': '0.86rem',
      '--resume-header-margin': '24px',
      '--resume-header-padding': '16px'
    };
  };

  // Dynamic typography pairings to maximize professional presentation
  const getFontVariables = () => {
    if (fontPairing === 'editorial') {
      return {
        '--resume-font-heading': "'Playfair Display', serif",
        '--resume-font-body': "'Merriweather', serif",
      };
    }
    if (fontPairing === 'tech') {
      return {
        '--resume-font-heading': "'Outfit', sans-serif",
        '--resume-font-body': "'Roboto Mono', monospace",
      };
    }
    if (fontPairing === 'corporate') {
      return {
        '--resume-font-heading': "'Inter', sans-serif",
        '--resume-font-body': "'Inter', sans-serif",
      };
    }
    // Default / Modern
    return {
      '--resume-font-heading': "'Outfit', sans-serif",
      '--resume-font-body': "'Inter', sans-serif",
    };
  };

  const spacingStyles = getSpacingVariables();
  const fontStyles = getFontVariables();

  // Render inline custom variables to color code the paper output
  const colorStyles = {
    '--resume-accent': accentColor,
    '--resume-accent-light': `${accentColor}12`, // Add HEX alpha for light backgrounds
    ...spacingStyles,
    ...fontStyles
  };

  let paperContent;

  if (templateStyle === 'creative') {
    paperContent = (
      <div 
        className="resume-paper-wrapper letter template-creative"
        style={colorStyles}
        id="resume-print-target"
      >
        {/* Creative Column 1: Sidebar details */}
        <div className="creative-sidebar">
          <div className="resume-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <h1>{personalInfo.fullName || 'Your Name'}</h1>
            <div className="subtitle" style={{ fontSize: '0.95rem' }}>{personalInfo.jobTitle || 'Professional Role Title'}</div>
          </div>

          <div className="resume-meta-info">
            {personalInfo.email && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>{personalInfo.website}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="meta-item">
                <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}>
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <span>{personalInfo.linkedin}</span>
              </div>
            )}
          </div>

          {/* Languages spoken block */}
          {personalInfo.languages && (
            <div style={{ marginTop: '10px', background: 'var(--resume-accent-light)', borderLeft: '3px solid var(--resume-accent)', padding: '8px 10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--resume-accent)', letterSpacing: '0.4px' }}>Languages Spoken</div>
              <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '4px', fontWeight: 500 }}>{personalInfo.languages}</div>
            </div>
          )}

          {/* Compliance Toyfields warning visual overlays */}
          {(personalInfo.photoUrl || personalInfo.birthDate || personalInfo.maritalStatus) && (
            <div className="compliance-highlight" style={{ padding: '8px', borderRadius: '4px' }}>
              <span className="compliance-tooltip">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ width: '13px', height: '13px', marginRight: '4px', display: 'inline-block', verticalAlign: 'text-bottom' }}
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Sensitive Personal Info Included
              </span>
              {personalInfo.photoUrl && (
                <img 
                  src={personalInfo.photoUrl} 
                  alt="Profile" 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '8px auto', border: '2px solid var(--resume-accent)' }} 
                />
              )}
              <div style={{ fontSize: '0.76rem', color: '#7f1d1d', marginTop: '4px', fontWeight: 600 }}>
                {personalInfo.birthDate && <div>DOB: {personalInfo.birthDate}</div>}
                {personalInfo.maritalStatus && <div>Status: {personalInfo.maritalStatus}</div>}
              </div>
            </div>
          )}

          {/* Skills category lists */}
          {skills.length > 0 && (
            <div className="resume-section" style={{ marginTop: '16px' }}>
              <h2 className="resume-section-title" style={{ fontSize: '0.88rem' }}>Skills</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                {skills.map((sk, skIdx) => (
                  <div key={sk.id || skIdx} style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--resume-headings-color)', marginBottom: '4px' }}>{sk.category || 'Category'}</div>
                    <div style={{ color: '#475569', lineHeight: 1.4 }}>{sk.items.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications category lists */}
          {certifications.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title" style={{ fontSize: '0.88rem' }}>Certifications</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {certifications.map((cert, certIdx) => (
                  <div key={cert.id || certIdx} style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--resume-headings-color)' }}>{cert.name}</div>
                    <div style={{ color: '#64748b' }}>{cert.issuer} {cert.date && `(${cert.date})`}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Creative Column 2: Main Area */}
        <div className="creative-main">
          {personalInfo.summary && (
            <div className="resume-section">
              <h2 className="resume-section-title">Summary</h2>
              <p className="resume-summary-text">{personalInfo.summary}</p>
            </div>
          )}

          {workExperience.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title">Experience</h2>
              {workExperience.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="experience-block">
                  <div className="block-header">
                    <div className="block-title">
                      {exp.role || 'Role'} <span className="org">at {exp.company || 'Company'}</span>
                    </div>
                    <div className="block-date">{exp.startDate} – {exp.endDate || 'Present'}</div>
                  </div>
                  <div className="block-subtitle">
                    {exp.location}
                  </div>
                  <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exp.description || '') }} />
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title">Education</h2>
              {education.map((edu, eduIdx) => (
                <div key={edu.id || eduIdx} className="education-block">
                  <div className="block-header">
                    <div className="block-title">{edu.degree || 'Degree'}</div>
                    <div className="block-date">{edu.startDate} – {edu.endDate}</div>
                  </div>
                  <div className="block-subtitle">
                    {edu.school}, {edu.location}
                  </div>
                  {edu.details && (
                    <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '4px', color: '#475569' }}>
                      {edu.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* References block */}
          {references.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title">References</h2>
              <div className="references-grid">
                {references.map((ref, refIdx) => (
                  <div key={ref.id || refIdx} className="reference-card">
                    <div className="ref-name">{ref.name}</div>
                    <div className="ref-title">{ref.title}</div>
                    <div className="ref-details">{ref.contact}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else if (templateStyle === 'executive') {
    paperContent = (
      <div 
        className="resume-paper-wrapper letter template-executive"
        style={colorStyles}
        id="resume-print-target"
      >
        {/* Executive top banner block header */}
        <div className="executive-banner-header text-center">
          <h1>{personalInfo.fullName || 'Your Name'}</h1>
          <div className="subtitle fw-bold">{personalInfo.jobTitle || 'Professional Role Title'}</div>
          
          <div className="resume-meta-info justify-content-center">
            {personalInfo.email && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>{personalInfo.website}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="meta-item">
                <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}>
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <span>{personalInfo.linkedin}</span>
              </div>
            )}
          </div>

          {personalInfo.languages && (
            <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ width: '14px', height: '14px', color: '#60a5fa' }}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>Languages Spoken: <strong style={{ color: '#fff' }}>{personalInfo.languages}</strong></span>
            </div>
          )}
        </div>

        {/* Executive summary block */}
        {personalInfo.summary && (
          <div className="resume-section">
            <h2 className="resume-section-title executive-title">Executive Profile</h2>
            <p className="resume-summary-text">{personalInfo.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title executive-title">Professional Experience</h2>
            {workExperience.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="experience-block executive-block">
                <div className="block-header">
                  <div className="block-title" style={{ fontSize: '0.96rem' }}>
                    {exp.role || 'Role'} <span className="org" style={{ fontWeight: 700 }}>at {exp.company || 'Company'}</span>
                  </div>
                  <div className="block-date">{exp.startDate} – {exp.endDate || 'Present'}</div>
                </div>
                <div className="block-subtitle d-flex justify-content-between align-items-center mb-1">
                  <span>{exp.location}</span>
                </div>
                <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exp.description || '') }} />
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title executive-title">Education & Credentials</h2>
            {education.map((edu, eduIdx) => (
              <div key={edu.id || eduIdx} className="education-block executive-block">
                <div className="block-header">
                  <div className="block-title" style={{ fontSize: '0.96rem' }}>{edu.degree || 'Degree'}</div>
                  <div className="block-date">{edu.startDate} – {edu.endDate}</div>
                </div>
                <div className="block-subtitle">
                  {edu.school}, {edu.location}
                </div>
                {edu.details && (
                  <div style={{ fontSize: '0.82rem', fontStyle: 'italic', marginTop: '4px', color: '#475569' }}>
                    {edu.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title executive-title">Core Competencies & Skills</h2>
            <div className="skills-grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
              {skills.map((sk, skIdx) => (
                <div key={sk.id || skIdx} className="skills-category-row flex-column align-items-start">
                  <div className="category-name mb-0.5" style={{ fontSize: '0.86rem', color: 'var(--resume-accent)', fontWeight: 700 }}>{sk.category || 'Category'}</div>
                  <div className="category-items" style={{ fontSize: '0.84rem' }}>{sk.items.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title executive-title">Certifications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {certifications.map((cert, certIdx) => (
                <div key={cert.id || certIdx} style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--resume-headings-color)' }}>{cert.name}</span> — <span style={{ color: '#475569' }}>{cert.issuer} {cert.date && `(${cert.date})`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {references.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title executive-title">References</h2>
            <div className="references-grid">
              {references.map((ref, refIdx) => (
                <div key={ref.id || refIdx} className="reference-card">
                  <div className="ref-name">{ref.name}</div>
                  <div className="ref-title">{ref.title}</div>
                  <div className="ref-details">{ref.contact}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } else if (templateStyle === 'tech') {
    paperContent = (
      <div 
        className="resume-paper-wrapper letter template-tech"
        style={colorStyles}
        id="resume-print-target"
      >
        {/* Tech Header */}
        <div className="tech-header d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
          <div>
            <h1>{personalInfo.fullName || 'Your Name'}</h1>
            <div className="subtitle fw-bold mt-1" style={{ color: 'var(--resume-accent)', letterSpacing: '1px', fontSize: '0.98rem' }}>
              {`> ${personalInfo.jobTitle || 'Professional Role Title'}`}
            </div>
          </div>
          <div className="d-flex flex-column align-items-end gap-1" style={{ fontSize: '0.8rem', color: 'var(--resume-meta-color)' }}>
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.location && <div>{personalInfo.location}</div>}
            {personalInfo.website && <div style={{ color: 'var(--resume-accent)', fontWeight: 600 }}>{personalInfo.website}</div>}
            {personalInfo.linkedin && <div style={{ color: 'var(--resume-accent)', fontWeight: 600 }}>{personalInfo.linkedin}</div>}
          </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="resume-section">
            <h2 className="resume-section-title tech-title">Summary</h2>
            <p className="resume-summary-text" style={{ fontSize: '0.84rem' }}>{personalInfo.summary}</p>
          </div>
        )}

        {/* Skills rendered as elite technical tag badges */}
        {skills.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title tech-title">Technical Stack & Expertise</h2>
            <div className="d-flex flex-column gap-2 mt-2">
              {skills.map((sk, skIdx) => (
                <div key={sk.id || skIdx} className="d-flex flex-wrap align-items-baseline gap-2" style={{ fontSize: '0.84rem' }}>
                  <div className="fw-bold" style={{ width: '150px', flexShrink: 0, color: 'var(--resume-headings-color)' }}>{sk.category || 'Category'}:</div>
                  <div className="d-flex flex-wrap gap-1.5 flex-grow-1">
                    {sk.items.map((item, itemIdx) => (
                      <span 
                        key={itemIdx} 
                        className="tech-skill-pill px-2 py-0.5 rounded fw-semibold text-center"
                        style={{ 
                          fontSize: '0.74rem', 
                          background: 'var(--resume-accent-light)', 
                          color: 'var(--resume-accent)',
                          border: '1px solid rgba(var(--resume-accent), 0.1)',
                          display: 'inline-block'
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {workExperience.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title tech-title">Work History</h2>
            {workExperience.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="experience-block">
                <div className="block-header">
                  <div className="block-title">
                    <span style={{ color: 'var(--resume-accent)' }}>[exp]</span> {exp.role || 'Role'} <span className="org" style={{ color: 'var(--resume-headings-color)' }}>@ {exp.company || 'Company'}</span>
                  </div>
                  <div className="block-date">{exp.startDate} – {exp.endDate || 'Present'}</div>
                </div>
                <div className="block-subtitle mb-1" style={{ fontSize: '0.8rem' }}>
                  {exp.location}
                </div>
                <div className="rich-text-content" style={{ fontSize: '0.82rem' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exp.description || '') }} />
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title tech-title">Education</h2>
            {education.map((edu, eduIdx) => (
              <div key={edu.id || eduIdx} className="education-block">
                <div className="block-header">
                  <div className="block-title">
                    <span style={{ color: 'var(--resume-accent)' }}>[edu]</span> {edu.degree || 'Degree'}
                  </div>
                  <div className="block-date">{edu.startDate} – {edu.endDate}</div>
                </div>
                <div className="block-subtitle">
                  {edu.school}, {edu.location}
                </div>
                {edu.details && (
                  <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '4px', color: '#475569' }}>
                    {edu.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title tech-title">Certs & Accreditations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
              {certifications.map((cert, certIdx) => (
                <div key={cert.id || certIdx} style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--resume-headings-color)' }}>{cert.name}</span> — <span style={{ color: '#475569' }}>{cert.issuer} {cert.date && `(${cert.date})`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References Section */}
        {references.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title tech-title">References</h2>
            <div className="references-grid">
              {references.map((ref, refIdx) => (
                <div key={ref.id || refIdx} className="reference-card">
                  <div className="ref-name">{ref.name}</div>
                  <div className="ref-title">{ref.title}</div>
                  <div className="ref-details">{ref.contact}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } else if (templateStyle === 'academic') {
    paperContent = (
      <div 
        className="resume-paper-wrapper letter template-academic"
        style={colorStyles}
        id="resume-print-target"
      >
        {/* Academic editorial centered header */}
        <div className="academic-header text-center pb-2 mb-4">
          <h1>{personalInfo.fullName || 'Your Name'}</h1>
          <div className="subtitle font-italic" style={{ fontSize: '1.05rem', color: '#475569', fontStyle: 'italic', marginBottom: '14px' }}>
            {personalInfo.jobTitle || 'Professional Role Title'}
          </div>
          
          <div className="resume-meta-info justify-content-center" style={{ fontSize: '0.82rem', color: '#1e293b' }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.location && <span>• {personalInfo.location}</span>}
            {personalInfo.website && <span>• {personalInfo.website}</span>}
            {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
          </div>

          {personalInfo.languages && (
            <div style={{ marginTop: '8px', fontSize: '0.8rem', fontStyle: 'italic' }}>
              Languages Spoken: {personalInfo.languages}
            </div>
          )}
        </div>

        {/* Profile Summary */}
        {personalInfo.summary && (
          <div className="resume-section">
            <h2 className="resume-section-title academic-title">I. Summary of Qualifications</h2>
            <p className="resume-summary-text">{personalInfo.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title academic-title">II. Professional Appointments</h2>
            {workExperience.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="experience-block">
                <div className="block-header">
                  <div className="block-title fw-bold" style={{ fontSize: '0.94rem' }}>
                    {exp.role || 'Role'} — <span className="org font-normal" style={{ fontWeight: 'normal', fontStyle: 'italic' }}>{exp.company || 'Company'}</span>
                  </div>
                  <div className="block-date" style={{ fontWeight: 500 }}>{exp.startDate} – {exp.endDate || 'Present'}</div>
                </div>
                <div className="block-subtitle mb-1" style={{ fontStyle: 'italic', fontSize: '0.82rem' }}>
                  {exp.location}
                </div>
                <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exp.description || '') }} />
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title academic-title">III. Educational Background</h2>
            {education.map((edu, eduIdx) => (
              <div key={edu.id || eduIdx} className="education-block">
                <div className="block-header">
                  <div className="block-title fw-bold" style={{ fontSize: '0.94rem' }}>{edu.degree || 'Degree'}</div>
                  <div className="block-date" style={{ fontWeight: 500 }}>{edu.startDate} – {edu.endDate}</div>
                </div>
                <div className="block-subtitle mb-1" style={{ fontStyle: 'italic', fontSize: '0.82rem' }}>
                  {edu.school}, {edu.location}
                </div>
                {edu.details && (
                  <div style={{ fontSize: '0.82rem', marginTop: '4px', color: '#475569' }}>
                    {edu.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title academic-title">IV. Scholarly Competencies & Skills</h2>
            <div className="skills-grid-layout">
              {skills.map((sk, skIdx) => (
                <div key={sk.id || skIdx} className="skills-category-row">
                  <div className="category-name fw-bold" style={{ width: '200px' }}>{sk.category || 'Category'}:</div>
                  <div className="category-items">{sk.items.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title academic-title">V. Certifications & Affiliations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {certifications.map((cert, certIdx) => (
                <div key={cert.id || certIdx} style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--resume-headings-color)' }}>{cert.name}</span> — <span style={{ color: '#475569' }}>{cert.issuer} {cert.date && `(${cert.date})`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References Section */}
        {references.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title academic-title">VI. Professional References</h2>
            <div className="references-grid">
              {references.map((ref, refIdx) => (
                <div key={ref.id || refIdx} className="reference-card">
                  <div className="ref-name">{ref.name}</div>
                  <div className="ref-title">{ref.title}</div>
                  <div className="ref-details">{ref.contact}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    paperContent = (
      <div 
        className={`resume-paper-wrapper letter template-${templateStyle}`}
        style={colorStyles}
        id="resume-print-target"
      >
        {/* Resume Document Header */}
        <div className="resume-header">
          <h1>{personalInfo.fullName || 'Your Name'}</h1>
          <div className="subtitle">{personalInfo.jobTitle || 'Professional Role Title'}</div>
          
          <div className="resume-meta-info">
            {personalInfo.email && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="meta-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>{personalInfo.website}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="meta-item">
                <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}>
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <span>{personalInfo.linkedin}</span>
              </div>
            )}
          </div>

          {/* Languages spoken block */}
          {personalInfo.languages && (
            <div style={{ marginTop: '12px', background: 'var(--resume-accent-light)', borderLeft: '3px solid var(--resume-accent)', padding: '6px 12px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--resume-accent)' }}>Languages Spoken:</span>
              <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>{personalInfo.languages}</span>
            </div>
          )}

          {/* Anti-pattern Sensitive Compliance Field warning triggers */}
          {(personalInfo.photoUrl || personalInfo.birthDate || personalInfo.maritalStatus) && (
            <div className="compliance-highlight" style={{ marginTop: '12px', padding: '10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span className="compliance-tooltip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ width: '13px', height: '13px' }}
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Sensitive Personal Info (Anti-pattern)
              </span>
              {personalInfo.photoUrl && (
                <img 
                  src={personalInfo.photoUrl} 
                  alt="Profile" 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--resume-accent)' }} 
                />
              )}
              <div style={{ fontSize: '0.78rem', color: '#7f1d1d', fontWeight: 600 }}>
                {personalInfo.birthDate && <span>Date of Birth: {personalInfo.birthDate} | </span>}
                {personalInfo.maritalStatus && <span>Status: {personalInfo.maritalStatus}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Profile Summary Section */}
        {personalInfo.summary && (
          <div className="resume-section">
            <h2 className="resume-section-title">Professional Summary</h2>
            <p className="resume-summary-text">{personalInfo.summary}</p>
          </div>
        )}

        {/* Experience Section */}
        {workExperience.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title">Work Experience</h2>
            {workExperience.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="experience-block">
                <div className="block-header">
                  <div className="block-title">
                    {exp.role || 'Role'} <span className="org">at {exp.company || 'Company'}</span>
                  </div>
                  <div className="block-date">{exp.startDate} – {exp.endDate || 'Present'}</div>
                </div>
                <div className="block-subtitle">
                  {exp.location}
                </div>
                <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exp.description || '') }} />
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title">Education</h2>
            {education.map((edu, eduIdx) => (
              <div key={edu.id || eduIdx} className="education-block">
                <div className="block-header">
                  <div className="block-title">{edu.degree || 'Degree'}</div>
                  <div className="block-date">{edu.startDate} – {edu.endDate}</div>
                </div>
                <div className="block-subtitle">
                  {edu.school}, {edu.location}
                </div>
                {edu.details && (
                  <div style={{ fontSize: '0.82rem', fontStyle: 'italic', marginTop: '4px', color: '#475569' }}>
                    {edu.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title">Skills & Expertise</h2>
            <div className="skills-grid-layout">
              {skills.map((sk, skIdx) => (
                <div key={sk.id || skIdx} className="skills-category-row">
                  <div className="category-name">{sk.category || 'Category'}:</div>
                  <div className="category-items">{sk.items.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title">Certifications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {certifications.map((cert, certIdx) => (
                <div key={cert.id || certIdx} style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--resume-headings-color)' }}>{cert.name}</span> — <span style={{ color: '#475569' }}>{cert.issuer} {cert.date && `(${cert.date})`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References Section */}
        {references.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title">Professional References</h2>
            <div className="references-grid">
              {references.map((ref, refIdx) => (
                <div key={ref.id || refIdx} className="reference-card">
                  <div className="ref-name">{ref.name}</div>
                  <div className="ref-title">{ref.title}</div>
                  <div className="ref-details">{ref.contact}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return paperContent;
}
