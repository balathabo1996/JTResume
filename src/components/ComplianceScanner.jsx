import React from 'react';

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
    <div className="compliance-checker container-fluid p-0 mb-3 mx-auto" style={{ maxWidth: '880px' }}>
      
      {/* 1. Show Active Warnings */}
      {issues.map(issue => (
        <div key={issue.id} className="compliance-card alert alert-danger border-danger border-opacity-25 d-flex align-items-start gap-3 p-3 mb-2 shadow-sm" style={{ borderLeftWidth: '4px' }}>
          <div className="compliance-info flex-grow-1">
            <div className="compliance-title fw-bold mb-1" style={{ fontSize: '0.88rem' }}>
              ⚠️ Compliance Risk Alert
            </div>
            <div className="compliance-desc" style={{ fontSize: '0.8rem' }}>
              {issue.text}
            </div>
          </div>
        </div>
      ))}

      {/* 2. Show Unified Guidance */}
      {issues.length === 0 && (
        <div className="compliance-card alert alert-success border-success border-opacity-25 d-flex align-items-start gap-3 p-3 mb-2 shadow-sm" style={{ borderLeftWidth: '4px' }}>
          <div className="compliance-info flex-grow-1">
            <div className="compliance-title fw-bold mb-1" style={{ fontSize: '0.88rem' }}>
              Layout Status: ATS Compliant & Safe
            </div>
            <div className="compliance-desc" style={{ fontSize: '0.8rem' }}>
              No personal identifier violations found. Your resume formatting is optimized for standard automated indexing. Keep experience bullet-points results-oriented with strong action verbs.
            </div>
          </div>
        </div>
      )}

      {/* 3. Small ATS Checklist Bar with Premium SVG Circle Meter */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 p-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-3 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          
          {/* Circular SVG Progress Score Ring */}
          <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
            <svg width="44" height="44" className="gauge-svg" style={{ transform: 'rotate(-90deg)' }}>
              <circle 
                cx="22" 
                cy="22" 
                r="18" 
                className="gauge-bg"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle 
                cx="22" 
                cy="22" 
                r="18" 
                className="gauge-stroke"
                stroke={displayScore > 75 ? '#10b981' : displayScore > 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3.5"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${(2 * Math.PI * 18) - (displayScore / 100) * (2 * Math.PI * 18)}`}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
              />
            </svg>
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold" style={{ fontSize: '0.78rem' }}>
              {displayScore}
            </div>
          </div>

          <div className="d-flex flex-column gap-0">
            <div className="fw-bold text-white mb-0" style={{ fontSize: '0.86rem' }}>ATS Score fit</div>
            <div className="text-secondary" style={{ fontSize: '0.74rem' }}>
              {targetKeywords.length > 0 ? "Target keyword match included" : "Based on content checks"}
            </div>
          </div>
        </div>

        {/* Mapped badge items */}
        <div className="d-flex gap-2 font-medium" style={{ fontSize: '0.76rem' }}>
          <span className={`badge d-inline-flex align-items-center gap-1 py-1.5 px-2.5 rounded-2 fw-medium border ${hasSummary ? 'bg-success-subtle border-success-subtle text-success' : 'bg-danger-subtle border-danger-subtle text-danger'}`} style={{ textTransform: 'none' }}>
            <span>{hasSummary ? '✓' : '✗'}</span> Summary
          </span>
          <span className={`badge d-inline-flex align-items-center gap-1 py-1.5 px-2.5 rounded-2 fw-medium border ${hasExperience ? 'bg-success-subtle border-success-subtle text-success' : 'bg-danger-subtle border-danger-subtle text-danger'}`} style={{ textTransform: 'none' }}>
            <span>{hasExperience ? '✓' : '✗'}</span> Experience
          </span>
          <span className={`badge d-inline-flex align-items-center gap-1 py-1.5 px-2.5 rounded-2 fw-medium border ${issues.length === 0 ? 'bg-success-subtle border-success-subtle text-success' : 'bg-danger-subtle border-danger-subtle text-danger'}`} style={{ textTransform: 'none' }}>
            <span>{issues.length === 0 ? '✓' : '✗'}</span> Policy Safe
          </span>
        </div>
      </div>

      {/* 4. Target Job Keyword Matcher Checklist */}
      {targetKeywords.length > 0 && (
        <div className="compliance-card mt-3 p-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-3 shadow-sm">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h4 className="fs-6 fw-bold text-light m-0 d-flex align-items-center gap-2">
              <span style={{ color: '#10b981' }}>🎯</span> Target Job Keyword Matcher
            </h4>
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 fw-bold" style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem' }}>
              {matchPercentage}% Match Rate
            </span>
          </div>
          <p className="text-secondary mb-3" style={{ fontSize: '0.76rem' }}>
            We've extracted {targetKeywords.length} key terms from your target job posting. Add them to your resume content to boost relevance.
          </p>
          <div className="d-flex flex-wrap gap-2">
            {targetKeywords.map(kw => {
              const isMatched = matchedKeywords.includes(kw);
              return (
                <span 
                  key={kw} 
                  className={`badge d-inline-flex align-items-center gap-1.5 py-2 px-3 rounded-pill border transition-all ${
                    isMatched 
                      ? 'bg-success bg-opacity-15 border-success border-opacity-30 text-success fw-bold' 
                      : 'bg-secondary bg-opacity-10 border-secondary border-opacity-15 text-secondary'
                  }`}
                  style={{ 
                    fontSize: '0.75rem', 
                    letterSpacing: '0.2px',
                    boxShadow: isMatched ? '0 0 10px rgba(16, 185, 129, 0.15)' : 'none' 
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
  );
}
