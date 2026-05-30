/**
 * @file ComplianceScanner.jsx
 * @description Source file for ComplianceScanner.jsx.
 * @author Thabotharan Balachandran
 */
import { useState } from 'react';

export default function ComplianceScanner({ 
  formData, 
  targetKeywords = [],
  matchedKeywords = [],
  matchPercentage = 0,
  jobDescription = '' // Need this for the API call
}) {
  const [isGeneratingLearningPaths, setIsGeneratingLearningPaths] = useState(false);
  const [learningPaths, setLearningPaths] = useState(null);
  const [learningPathError, setLearningPathError] = useState('');

  const { personalInfo, workExperience, education } = formData;
  
  // Calculate missing keywords
  const missingKeywords = targetKeywords.filter(kw => !matchedKeywords.includes(kw));

  const handleGenerateLearningPaths = async () => {
    if (missingKeywords.length === 0 || !jobDescription) return;
    
    setIsGeneratingLearningPaths(true);
    setLearningPathError('');
    try {
      const res = await fetch('/api/ai/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missingSkills: missingKeywords, jobDescription })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate learning paths');
      setLearningPaths(data.learningPaths);
    } catch (err) {
      setLearningPathError(err.message);
    } finally {
      setIsGeneratingLearningPaths(false);
    }
  };

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

  // Calculate 3 separate metrics
  const hasSummary = personalInfo.summary && personalInfo.summary.length > 50;
  const hasExperience = workExperience.length > 0;
  const hasEdu = education.length > 0;
  
  // 1. Content Completeness Score (0-100)
  let completenessScore = 0;
  if (hasSummary) completenessScore += 34;
  if (hasExperience) completenessScore += 33;
  if (hasEdu) completenessScore += 33;

  // 2. Policy Compliance Score (0-100)
  // Start at 100, subtract 25 for each issue
  let complianceScore = 100 - (issues.length * 25);
  complianceScore = Math.max(0, complianceScore);

  // 3. Keyword Match Score (0-100)
  // If no target keywords are provided, default to 0 to encourage gamification
  const keywordScore = targetKeywords.length > 0 ? matchPercentage : 0;

  // Blended Overall Score
  const displayScore = Math.round((completenessScore * 0.3) + (complianceScore * 0.3) + (keywordScore * 0.4));

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
        {/* Massive Gamified Header Section */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-center p-4 gap-5" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          
          {/* Circular 3-Ring SVG Speedometer */}
          <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '240px', height: '240px' }}>
            <svg width="240" height="240" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Keyword Match (Outer Ring - Emerald) */}
              <circle cx="120" cy="120" r="104" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="12" fill="transparent" />
              <circle cx="120" cy="120" r="104" stroke="#10b981" strokeWidth="12" 
                strokeDasharray="653.45" strokeDashoffset={653.45 - (keywordScore / 100) * 653.45} 
                strokeLinecap="round" fill="transparent" 
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)', filter: keywordScore === 100 ? 'url(#glow)' : 'none' }} />

              {/* Completeness (Middle Ring - Blue) */}
              <circle cx="120" cy="120" r="84" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="12" fill="transparent" />
              <circle cx="120" cy="120" r="84" stroke="#3b82f6" strokeWidth="12" 
                strokeDasharray="527.79" strokeDashoffset={527.79 - (completenessScore / 100) * 527.79} 
                strokeLinecap="round" fill="transparent" 
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)', filter: completenessScore === 100 ? 'url(#glow)' : 'none' }} />

              {/* Compliance (Inner Ring - Purple) */}
              <circle cx="120" cy="120" r="64" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="12" fill="transparent" />
              <circle cx="120" cy="120" r="64" stroke="#a855f7" strokeWidth="12" 
                strokeDasharray="402.12" strokeDashoffset={402.12 - (complianceScore / 100) * 402.12} 
                strokeLinecap="round" fill="transparent" 
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)', filter: complianceScore === 100 ? 'url(#glow)' : 'none' }} />
            </svg>
            
            {/* Center Blended Score */}
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              <span className="fw-bolder lh-1" style={{ fontSize: '2.8rem' }}>{displayScore}</span>
              <span className="fw-bold" style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px' }}>ATS SCORE</span>
            </div>
          </div>

          {/* Metric Legend */}
          <div className="d-flex flex-column gap-3 py-2">
            <div>
              <h3 className="fw-bold text-white mb-1" style={{ fontSize: '1.2rem', letterSpacing: '0px' }}>
                Your Resume Analytics
              </h3>
              <p className="mb-3" style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '300px' }}>
                Gamify your job search. Close all three rings to ensure your resume survives automated HR screening.
              </p>
            </div>
            
            <div className="d-flex align-items-center gap-3">
               <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'rgba(16, 185, 129, 0.15)' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="#10b981" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <div>
                  <div className="text-white fw-bold" style={{ fontSize: '0.85rem' }}>Job Match</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                    {targetKeywords.length > 0 ? `${keywordScore}% Keyword Fit` : 'Paste Job Description'}
                  </div>
               </div>
            </div>

            <div className="d-flex align-items-center gap-3">
               <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'rgba(59, 130, 246, 0.15)' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="#3b82f6" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" /></svg>
               </div>
               <div>
                  <div className="text-white fw-bold" style={{ fontSize: '0.85rem' }}>Completeness</div>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>{completenessScore}% Content Density</div>
               </div>
            </div>

            <div className="d-flex align-items-center gap-3">
               <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'rgba(168, 85, 247, 0.15)' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="#a855f7" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
               </div>
               <div>
                  <div className="text-white fw-bold" style={{ fontSize: '0.85rem' }}>Compliance</div>
                  <div style={{ fontSize: '0.75rem', color: '#a855f7' }}>{complianceScore}% Policy Safe</div>
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

        {/* 4. Target Job Keyword Matcher Checklist */}
        {targetKeywords.length > 0 && (
          <div className="p-4" style={{ background: 'rgba(16, 185, 129, 0.05)', borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="fs-6 fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#10b981' }}>
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '18px', height: '18px' }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                Target Job Keyword Matcher
              </h4>
            </div>
            <p className="mb-3" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Extracted terms from your target job description. Include these in your experience bullets to increase your Job Match score!
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

            {/* Learning Path Section */}
            {missingKeywords.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold m-0 text-light" style={{ fontSize: '0.9rem' }}>Skill Gap Analysis</h5>
                  {!learningPaths && (
                    <button 
                      onClick={handleGenerateLearningPaths}
                      disabled={isGeneratingLearningPaths}
                      className="btn btn-sm text-white fw-bold d-flex align-items-center gap-2 px-3 py-2"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', border: 'none', borderRadius: '8px' }}
                    >
                      {isGeneratingLearningPaths ? (
                        <><span className="spinner-border spinner-border-sm" /> Analyzing...</>
                      ) : (
                        <>✨ Generate Learning Path</>
                      )}
                    </button>
                  )}
                </div>

                {learningPathError && <div className="text-danger mb-2" style={{ fontSize: '0.8rem' }}>{learningPathError}</div>}

                {learningPaths && learningPaths.length > 0 && (
                  <div className="d-flex flex-column gap-3 mt-3">
                    {learningPaths.map((path, idx) => (
                      <div key={idx} className="p-3 rounded-3" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold m-0" style={{ color: '#f59e0b' }}>Missing: {path.skill}</h6>
                          <a href={path.linkUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-warning p-1 px-2" style={{ fontSize: '0.7rem' }}>
                            View Resources
                          </a>
                        </div>
                        <p className="text-secondary mb-2" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}><strong>Why it matters:</strong> {path.reason}</p>
                        <p className="text-light m-0" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}><strong>Coach's Advice:</strong> {path.actionableAdvice}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
