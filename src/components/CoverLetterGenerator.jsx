/**
 * @file CoverLetterGenerator.jsx
 * @description React component rendering the CoverLetterGenerator UI element.
 * @author Thabotharan Balachandran
 */
import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { generateCoverLetterDocx } from '../utils/coverLetterDocxExport';

export default function CoverLetterGenerator({ resumeId, onBack, onGoHome }) {
  const [resumeData, setResumeData] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);
  
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetterHtml, setCoverLetterHtml] = useState('');
  const [tone, setTone] = useState('professional');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch the target resume
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoadingResume(true);
        const res = await fetch(`/api/resumes/${resumeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load resume');
        setResumeData(data.resume);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingResume(false);
      }
    };
    if (resumeId) fetchResume();
  }, [resumeId]);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    setCoverLetterHtml('');
    setCopied(false);

    try {
      const res = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription, tone })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      
      setCoverLetterHtml(DOMPurify.sanitize(data.coverLetter || ''));
    } catch (err) {
      setError('Failed to generate cover letter: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    // Create a temporary element to extract plain text from HTML
    const tempElement = document.createElement('div');
    tempElement.innerHTML = coverLetterHtml;
    const plainText = tempElement.innerText;
    
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('cover-letter-paper');
    if (!element) return;
    const opt = {
      margin:       0,
      filename:     `${resumeData?.personalInfo?.fullName || 'Cover_Letter'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    window.html2pdf().set(opt).from(element).save();
  };

  const handleDownloadDOCX = () => {
    generateCoverLetterDocx(resumeData, coverLetterHtml);
  };

  if (loadingResume) {
    return (
      <div className="bg-dark min-vh-100 d-flex justify-content-center align-items-center text-light">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-3">Loading Resume Data...</span>
      </div>
    );
  }

  return (
    <div className="app-container container-fluid p-0 bg-dark text-light vh-100 w-100 d-flex flex-column overflow-hidden">
      {/* Header */}
      <div className="sidebar-sticky-header sticky-top shadow-sm px-3 py-2 px-md-4 py-md-3 d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ background: 'var(--ui-bg)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <button 
            onClick={onBack} 
            className="btn btn-link text-light text-decoration-none d-flex align-items-center p-0"
            style={{ color: '#a5b4fc', alignSelf: 'center' }}
            title="Return to Dashboard"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          
          <div 
            className="brand d-flex flex-shrink-0" 
            style={{ userSelect: 'none', cursor: 'pointer', alignItems: 'baseline', width: '150px' }} 
            onClick={onGoHome}
            title="Return to Home"
          >
            <div>
              <span className="brand-jt">JT</span><span className="brand-resume">Resume</span>
            </div>
          </div>
          
          <div className="d-none d-sm-block" style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 4px', alignSelf: 'center' }}></div>
          
          <h5 className="m-0 fw-bold" style={{ fontSize: '1.1rem', background: 'linear-gradient(to right, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
            <span style={{ marginRight: '8px' }}>✨</span>AI Cover Letter
          </h5>
        </div>

        {resumeData && (
          <span className="text-secondary fw-semibold bg-dark border border-secondary rounded px-2 py-1 text-truncate ms-auto" style={{ fontSize: '0.8rem', maxWidth: '140px' }}>
            Resume: <span className="text-light">{resumeData.title}</span>
          </span>
        )}
      </div>

      <div className="row g-0 flex-grow-1 overflow-hidden">
        {/* Left Pane: Job Description Input */}
        <div className="col-lg-5 col-md-6 border-end border-secondary border-opacity-25 p-4 d-flex flex-column h-100 overflow-y-auto" style={{ background: 'var(--ui-card-bg)' }}>
          <div className="mb-3">
            <h5 className="fw-bold mb-1">Target Job Description</h5>
            <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Paste the job description below. We'll cross-reference your resume and generate a tailored cover letter.</p>
          </div>
          
          <textarea
            className="form-control bg-dark text-light flex-grow-1 border-secondary"
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            style={{ resize: 'none', borderRadius: '12px', padding: '16px' }}
          />

          {/* Tone Selector */}
          <div className="mt-4 mb-2">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#e2e8f0' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Select Letter Tone
            </h6>
            <div className="d-flex flex-column gap-2">
              <button
                className={`btn d-flex flex-column align-items-start text-start p-3 w-100 rounded-3 border transition-all ${tone === 'professional' ? 'bg-primary bg-opacity-10 border-primary' : 'bg-transparent border-secondary border-opacity-25 text-secondary'}`}
                onClick={() => setTone('professional')}
                style={{ cursor: 'pointer' }}
              >
                <span className={`fw-bold mb-1 ${tone === 'professional' ? 'text-primary' : 'text-light'}`}>Professional & Direct</span>
                <span style={{ fontSize: '0.8rem' }}>The standard, corporate approach. Safe for any application.</span>
              </button>
              
              <button
                className={`btn d-flex flex-column align-items-start text-start p-3 w-100 rounded-3 border transition-all ${tone === 'passionate' ? 'bg-success bg-opacity-10 border-success' : 'bg-transparent border-secondary border-opacity-25 text-secondary'}`}
                onClick={() => setTone('passionate')}
                style={{ cursor: 'pointer' }}
              >
                <span className={`fw-bold mb-1 ${tone === 'passionate' ? 'text-success' : 'text-light'}`}>Passionate & Story-Driven</span>
                <span style={{ fontSize: '0.8rem' }}>Focuses on mission alignment. Perfect for startups or non-profits.</span>
              </button>

              <button
                className={`btn d-flex flex-column align-items-start text-start p-3 w-100 rounded-3 border transition-all ${tone === 'aggressive' ? 'bg-warning bg-opacity-10 border-warning' : 'bg-transparent border-secondary border-opacity-25 text-secondary'}`}
                onClick={() => setTone('aggressive')}
                style={{ cursor: 'pointer' }}
              >
                <span className={`fw-bold mb-1 ${tone === 'aggressive' ? 'text-warning' : 'text-light'}`}>Aggressive & Data-Driven</span>
                <span style={{ fontSize: '0.8rem' }}>Focuses purely on ROI and hard metrics. Perfect for sales or fintech.</span>
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger mt-4 mb-0 py-2">{error}</div>}

          <button 
            className="btn btn-primary w-100 mt-4 py-3 fw-bold d-flex align-items-center justify-content-center gap-2" 
            style={{ borderRadius: '12px', fontSize: '1.1rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}
            onClick={handleGenerate}
            disabled={isGenerating || !jobDescription.trim()}
          >
            {isGenerating ? (
              <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating Magic...</>
            ) : (
              <>✨ Generate Cover Letter ✨</>
            )}
          </button>
        </div>

        {/* Right Pane: Generated Output */}
        <div className="col-lg-7 col-md-6 p-4 d-flex flex-column h-100 position-relative overflow-y-auto" style={{ background: 'var(--ui-bg)' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold m-0">Your Cover Letter</h5>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                onClick={handleDownloadPDF}
                disabled={!coverLetterHtml}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> 
                PDF
              </button>
              <button 
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                onClick={handleDownloadDOCX}
                disabled={!coverLetterHtml}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Word
              </button>
              <button 
                className={`btn ${copied ? 'btn-success' : 'btn-light'} btn-sm d-flex align-items-center gap-2 text-dark fw-semibold`}
                onClick={handleCopy}
                disabled={!coverLetterHtml}
              >
                {copied ? (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy</>
                )}
              </button>
            </div>
          </div>

          <div className="flex-grow-1 overflow-auto d-flex justify-content-center p-3" style={{ background: 'var(--ui-card-bg)', borderRadius: '12px' }}>
            <div 
              id="cover-letter-paper"
              className="bg-white text-dark shadow-lg position-relative" 
              style={{ 
                width: '100%', 
                maxWidth: '800px', 
                minHeight: '100%',
                padding: '1in', 
                boxSizing: 'border-box',
                aspectRatio: '1 / 1.414' 
              }}
            >
              {isGenerating ? (
                <div className="h-100 d-flex flex-column justify-content-center align-items-center text-secondary">
                  <div className="spinner-grow text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                  <h5 className="fw-bold">Analyzing Your Resume...</h5>
                  <p>Crafting the perfect introduction...</p>
                </div>
              ) : coverLetterHtml ? (
                <div className="cover-letter-content" style={{ fontSize: '11pt', fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: '1.6', color: '#333' }}>
                  
                  {/* Dynamic Letterhead */}
                  <div className="text-center mb-5 border-bottom border-secondary border-opacity-25 pb-4">
                    <h1 className="fw-bold mb-2" style={{ color: '#111', fontSize: '24pt', letterSpacing: '1px' }}>
                      {(resumeData?.personalInfo?.fullName || 'Your Name').toUpperCase()}
                    </h1>
                    <div style={{ fontSize: '10pt', color: '#555' }}>
                      {[
                        resumeData?.personalInfo?.email,
                        resumeData?.personalInfo?.phone,
                        resumeData?.personalInfo?.location,
                        resumeData?.personalInfo?.linkedin
                      ].filter(Boolean).join('  |  ')}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mb-4">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>

                  {/* AI Generated Body */}
                  <div 
                    className="cover-letter-body" 
                    dangerouslySetInnerHTML={{ __html: coverLetterHtml }} 
                  />
                </div>
              ) : (
                <div className="h-100 d-flex flex-column justify-content-center align-items-center text-secondary opacity-50">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <h4>Ready to Write</h4>
                  <p>Your generated cover letter will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .cover-letter-body p { margin-bottom: 1em; }
        .cover-letter-body p:last-child { margin-bottom: 0; }
      `}</style>
    </div>
  );
}
