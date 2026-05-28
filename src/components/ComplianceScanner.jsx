
/**
 * @file ComplianceScanner.jsx
 * @description React component rendering the ComplianceScanner UI element.
 * @author Jonathan T. Miller
 */
export default function ComplianceScanner({ 
  formData, 
  targetKeywords = [],
  matchedKeywords = [],
  matchPercentage = 0
}) {
  const { personalInfo, workExperience, education } = formData;
  
  // Scans for sensitive information
  const issues = [];
  
  if (personalInfo.photoUrl) {
    issues.push({
      id: 'photo',
      type: 'warning',
      text: `🚫 Photo Detected: Resumes with photos are commonly discarded by corporate recruitment systems to prevent discrimination claims.`
    });
  }
  
  if (personalInfo.birthDate) {
    issues.push({
      id: 'dob',
      type: 'warning',
      text: `🚫 Date of Birth Detected: Including birth dates is discouraged to comply with international age discrimination regulations.`
    });
  }
  
  if (personalInfo.maritalStatus) {
    issues.push({
      id: 'marital',
      type: 'warning',
      text: `🚫 Marital Status Detected: Family or marital status is protected under equal employment laws; remove it to keep your resume compliant.`
    });
  }

  // Calculate some simple ATS score parameters
  const hasSummary = personalInfo.summary && personalInfo.summary.length > 50;
  const hasExperience = workExperience.length > 0;
  const hasEdu = education.length > 0;
  
  let score = 50;
  if (hasSummary) score += 15;
  if (hasExperience) score += 20;
  if (hasEdu) score += 15;
  if (issues.length > 0) score -= (issues.length * 15);
  
  // Bound score
  score = Math.max(10, Math.min(100, score));

  // Blend keyword match percentage if we have target keywords
  const displayScore = targetKeywords.length > 0 
    ? Math.max(10, Math.min(100, Math.round((score * 0.4) + (matchPercentage * 0.6)))) 
    : score;

  return (
    <div className="compliance-checker container-fluid p-0 mb-4 mx-auto" style={{ maxWidth: '880px' }}>
      <div 
        style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden'
        }}
      >
        {/* Header Section */}
        <div className="d-flex align-items-center justify-content-between p-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="d-flex align-items-center gap-3">
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '48px', height: '48px',
                background: issues.length === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: issues.length === 0 ? '#10b981' : '#f59e0b',
                boxShadow: issues.length === 0 ? '0 0 20px rgba(16, 185, 129, 0.2)' : '0 0 20px rgba(245, 158, 11, 0.2)'
              }}
            >
              {issues.length === 0 ? (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="fw-bold mb-1 text-white" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                {issues.length === 0 ? 'ATS Compliant & Ready' : 'Optimization Required'}
              </h3>
              <p className="mb-0" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {issues.length === 0 
                  ? 'Your resume formatting is optimized for standard automated indexing.' 
                  : `${issues.length} compliance issue${issues.length > 1 ? 's' : ''} detected that may affect parsing.`}
              </p>
            </div>
          </div>

          {/* Circular SVG Progress Score Ring */}
          <div className="d-flex align-items-center gap-3">
             <div className="text-end d-none d-sm-block">
                <div className="fw-bold text-white mb-0" style={{ fontSize: '0.9rem' }}>ATS Match Score</div>
                <div style={{ fontSize: '0.75rem', color: displayScore > 75 ? '#10b981' : displayScore > 50 ? '#f59e0b' : '#ef4444' }}>
                   {displayScore > 75 ? 'Excellent Fit' : displayScore > 50 ? 'Average Fit' : 'Needs Work'}
                </div>
             </div>
             <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
               <svg width="56" height="56" className="gauge-svg" style={{ transform: 'rotate(-90deg)' }}>
                 <circle cx="28" cy="28" r="24" className="gauge-bg" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="4.5" fill="transparent" />
                 <circle cx="28" cy="28" r="24" className="gauge-stroke" stroke={displayScore > 75 ? '#10b981' : displayScore > 50 ? '#f59e0b' : '#ef4444'} strokeWidth="4.5" strokeDasharray={`${2 * Math.PI * 24}`} strokeDashoffset={`${(2 * Math.PI * 24) - (displayScore / 100) * (2 * Math.PI * 24)}`} strokeLinecap="round" fill="transparent" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease' }} />
               </svg>
               <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold" style={{ fontSize: '1.05rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                 {displayScore}
               </div>
             </div>
          </div>
        </div>

        {/* Content Section (Issues or Success message + Badges) */}
        <div className="p-4" style={{ background: 'rgba(0,0,0,0.15)' }}>
          
          {issues.length > 0 ? (
            <div className="mb-4">
              {issues.map(issue => (
                <div key={issue.id} className="d-flex align-items-start gap-3 p-3 mb-2 rounded-3" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ color: '#ef4444', marginTop: '2px' }}>
                    <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '18px', height: '18px' }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <div className="fw-bold mb-1" style={{ fontSize: '0.88rem', color: '#fca5a5' }}>Compliance Warning</div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{issue.text}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Status Badges */}
          <div className="d-flex gap-3 flex-wrap">
            <span className={`badge d-inline-flex align-items-center gap-2 py-2 px-3 rounded-pill fw-medium ${hasSummary ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'}`} style={{ textTransform: 'none', fontSize: '0.78rem' }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '14px', height: '14px', background: hasSummary ? '#10b981' : '#ef4444', color: '#fff' }}>
                {hasSummary ? <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '10px' }}><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '10px' }}><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
              </div>
              Professional Summary
            </span>

            <span className={`badge d-inline-flex align-items-center gap-2 py-2 px-3 rounded-pill fw-medium ${hasExperience ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'}`} style={{ textTransform: 'none', fontSize: '0.78rem' }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '14px', height: '14px', background: hasExperience ? '#10b981' : '#ef4444', color: '#fff' }}>
                {hasExperience ? <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '10px' }}><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '10px' }}><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
              </div>
              Work Experience
            </span>

            <span className={`badge d-inline-flex align-items-center gap-2 py-2 px-3 rounded-pill fw-medium ${issues.length === 0 ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'}`} style={{ textTransform: 'none', fontSize: '0.78rem' }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '14px', height: '14px', background: issues.length === 0 ? '#10b981' : '#ef4444', color: '#fff' }}>
                {issues.length === 0 ? <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '10px' }}><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '10px' }}><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
              </div>
              Policy Safe
            </span>
          </div>
        </div>

        {/* 4. Target Job Keyword Matcher Checklist (Integrated into the same card) */}
        {targetKeywords.length > 0 && (
          <div className="p-4" style={{ background: 'rgba(16, 185, 129, 0.05)', borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="fs-6 fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#10b981' }}>
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '18px', height: '18px' }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                Keyword Matcher
              </h4>
              <span className="badge bg-success text-white fw-bold shadow-sm" style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px' }}>
                {matchPercentage}% Target Match
              </span>
            </div>
            <p className="mb-3" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Extracted terms from your target job description. Include these in your experience bullets.
            </p>
            <div className="d-flex flex-wrap gap-2">
              {targetKeywords.map(kw => {
                const isMatched = matchedKeywords.includes(kw);
                return (
                  <span 
                    key={kw} 
                    className={`badge d-inline-flex align-items-center gap-1.5 py-2 px-3 rounded-pill border transition-all ${
                      isMatched 
                        ? 'bg-success bg-opacity-25 border-success border-opacity-50 text-success fw-bold' 
                        : 'bg-secondary bg-opacity-10 border-secondary border-opacity-25 text-secondary'
                    }`}
                    style={{ 
                      fontSize: '0.75rem', 
                      letterSpacing: '0.2px',
                      boxShadow: isMatched ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none' 
                    }}
                  >
                    <span className="d-flex align-items-center justify-content-center" style={{ width: '12px', height: '12px' }}>
                      {isMatched ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '12px', height: '12px' }}>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : '○'}
                    </span>
                    {kw}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
