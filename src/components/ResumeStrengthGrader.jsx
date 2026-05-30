/**
 * @file ResumeStrengthGrader.jsx
 * @description React component rendering the ResumeStrengthGrader UI element.
 * @author Thabotharan Balachandran
 */
import { useState } from 'react';

export default function ResumeStrengthGrader({ formData, activeSection, onSectionChange }) {
  const [activeTab, setActiveTab] = useState('improvements');

  let score = 0;
  let warnings = [];
  let strengths = [];

  // 1. Contact & Profile (30 pts)
  const { fullName, jobTitle, email, phone, summary } = formData?.personalInfo || {};
  
  if (fullName && fullName.trim().length > 0) {
    score += 10;
    strengths.push({ msg: "Full Name included", section: "personal" });
  } else {
    warnings.push({ msg: "Add your Full Name.", section: "personal" });
  }

  if (jobTitle && jobTitle.trim().length > 0) {
    score += 10;
    strengths.push({ msg: "Professional Job Title included", section: "personal" });
  } else {
    warnings.push({ msg: "Add a Professional Job Title.", section: "personal" });
  }

  if (email && email.trim().length > 0) {
    score += 5;
  } else {
    warnings.push({ msg: "Add your Email Address.", section: "personal" });
  }

  if (phone && phone.trim().length > 0) {
    score += 5;
  } else {
    warnings.push({ msg: "Add your Phone Number.", section: "personal" });
  }
  
  if (email && phone) {
      strengths.push({ msg: "Contact information is complete", section: "personal" });
  }

  // 2. Professional Summary (15 pts)
  const summaryLength = summary ? summary.trim().length : 0;
  if (summaryLength >= 50 && summaryLength <= 400) {
    score += 15;
    strengths.push({ msg: "Summary is of optimal length", section: "personal" });
  } else if (summaryLength > 400) {
    score += 8;
    warnings.push({ msg: "Your summary is too long.", section: "personal" });
  } else {
    warnings.push({ msg: "Add a Professional Summary (50-400 chars).", section: "personal" });
  }

  // 3. Work Experience (30 pts)
  const exp = formData?.workExperience || [];
  if (exp.length > 0) {
    score += 15;
    strengths.push({ msg: "Work Experience included", section: "experience" });
    
    const recentJob = exp[0];
    const desc = recentJob.description || "";
    if (/[%$0-9]/.test(desc)) {
      score += 15;
      strengths.push({ msg: "Recent job includes measurable metrics", section: "experience" });
    } else {
      warnings.push({ msg: "Add more measurable metrics (%, $, numbers) to your recent job.", section: "experience" });
    }
  } else {
    warnings.push({ msg: "Add at least one Work Experience entry.", section: "experience" });
  }

  // 4. Skills & Competencies (15 pts)
  const skills = formData?.skills || [];
  if (skills.length > 0) {
    score += 15;
    strengths.push({ msg: "Skills included", section: "skills" });
  } else {
    warnings.push({ msg: "You haven't added any skills.", section: "skills" });
  }

  // 5. Education (10 pts)
  const edu = formData?.education || [];
  if (edu.length > 0) {
    score += 10;
    strengths.push({ msg: "Education included", section: "education" });
  } else {
    warnings.push({ msg: "Add at least one Education entry.", section: "education" });
  }

  const getScoreColor = () => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const isActive = activeSection === 'resumeGrader';

  return (
    <div className={`form-group-card mb-4 ${isActive ? 'active' : ''}`} style={{ order: -200, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div
        className="card-header d-flex align-items-center justify-content-between p-3"
        onClick={() => onSectionChange(isActive ? null : 'resumeGrader')}
        style={{ cursor: "pointer", userSelect: "none", backgroundColor: 'rgba(0,0,0,0.1)' }}
      >
        <h3 className="m-0 d-flex align-items-center gap-2 fs-5">
          <svg className="card-header-icon text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Resume Strength Score
          <span className="ms-2 badge rounded-pill" style={{ backgroundColor: getScoreColor(), fontSize: '0.8rem' }}>{score}/100</span>
        </h3>
        <div className="d-flex align-items-center gap-2">
          <span className="card-chevron" style={{ transition: "transform 0.2s", transform: isActive ? "rotate(180deg)" : "none" }}>
            ▼
          </span>
        </div>
      </div>

      {isActive && (
        <div className="card-body p-4 border-top border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-4 mb-4">
          <div className="position-relative" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
              />
              <path
                strokeDasharray={`${score}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={getScoreColor()}
                strokeWidth="3"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s ease-out, stroke 0.5s ease' }}
              />
            </svg>
            <div className="position-absolute top-50 start-50 translate-middle text-center">
              <span className="fw-bold fs-4" style={{ color: getScoreColor() }}>{score}</span>
            </div>
          </div>
          <div>
            <h3 className="m-0 mb-1 fw-bold fs-5">Resume Strength</h3>
            <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>
              {score >= 80 ? "Great job! Your resume is looking strong." : "Keep adding details to improve your ATS score."}
            </p>
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <button 
            className={`btn btn-sm ${activeTab === 'improvements' ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('improvements')}
            style={{ borderRadius: '20px', transition: 'all 0.3s' }}
          >
            Improvements Required ({warnings.length})
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'strengths' ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('strengths')}
            style={{ borderRadius: '20px', transition: 'all 0.3s' }}
          >
            Strengths ({strengths.length})
          </button>
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
          {activeTab === 'improvements' && (
            <ul className="list-group list-group-flush border-0">
              {warnings.map((w, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between align-items-center mb-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '12px 16px' }}>
                  <span className="text-danger fw-medium" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ flexShrink: 0 }}><path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/><path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/></svg>
                    {w.msg}
                  </span>
                  <button 
                    className="btn btn-sm btn-danger px-3 rounded-pill" 
                    onClick={() => {
                        if (activeSection !== w.section) {
                            onSectionChange(w.section);
                        }
                        setTimeout(() => {
                          const el = document.querySelector(`[data-id="${w.section}"]`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 150);
                    }}
                    style={{ fontSize: '0.8rem', fontWeight: '500', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }}
                  >
                    Fix
                  </button>
                </li>
              ))}
              {warnings.length === 0 && (
                <li className="list-group-item d-flex align-items-center mb-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '12px 16px' }}>
                  <span className="text-success fw-medium" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/></svg>
                    All clear! No improvements needed.
                  </span>
                </li>
              )}
            </ul>
          )}
          
          {activeTab === 'strengths' && (
            <ul className="list-group list-group-flush border-0">
              {strengths.map((s, i) => (
                <li key={i} className="list-group-item d-flex align-items-center mb-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '12px 16px' }}>
                  <span className="text-success fw-medium" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ flexShrink: 0 }}><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/></svg>
                    {s.msg}
                  </span>
                </li>
              ))}
              {strengths.length === 0 && (
                <li className="list-group-item d-flex align-items-center mb-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '12px 16px' }}>
                  <span className="text-secondary fw-medium" style={{ fontSize: '0.9rem' }}>No strengths identified yet. Keep working!</span>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
