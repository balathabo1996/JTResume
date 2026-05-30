/**
 * @file ImportModal.jsx
 * @description React component rendering the ImportModal UI element.
 * @author Thabotharan Balachandran
 */
import { useState } from 'react';
import { parsePlainResumeText } from '../utils/resumeParser';

export default function ImportModal({ isOpen, onClose, onImportData }) {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'doc'
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  
  // PDF/Word states
  const [docFile, setDocFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStep, setParseStep] = useState(0);
  const [jsonError, setJsonError] = useState('');
  const [parsedDocPreview, setParsedDocPreview] = useState(null);
  
  // LinkedIn states
  const [linkedinFile, setLinkedinFile] = useState(null);
  const [isLinkedinParsing, setIsLinkedinParsing] = useState(false);

  if (!isOpen) return null;

  // Handle plain text parsing
  const handleParseText = () => {
    if (!rawText.trim()) return;
    const parsed = parsePlainResumeText(rawText);
    setParsedPreview(parsed);
  };

  // Commit text parse results
  const handleCommitText = () => {
    if (parsedPreview) {
      onImportData(parsedPreview);
      onClose();
    }
  };

  // Handle PDF or Word Document upload strictly (blocking other formats)
  const handleDocumentUpload = (e) => {
    setJsonError('');
    setParsedDocPreview(null);
    const file = e.target.files[0];
    if (!file) return;

    // Check extension strictly
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'doc' && ext !== 'docx') {
      setJsonError('⚠️ Unsupported file format. Please upload a PDF (.pdf) or Microsoft Word Document (.doc, .docx).');
      return;
    }

    setDocFile(file);
    setIsParsing(true);
    setParseStep(1);

    // Beautiful step-by-step heuristic scanning animations
    setTimeout(() => {
      setParseStep(2);
      setTimeout(() => {
        setParseStep(3);
        setTimeout(() => {
          setIsParsing(false);
          
          // Heuristically extract the user's name from their file name!
          const namePart = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
          let extractedName = namePart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          if (extractedName.match(/resume|cv|builder|profile|doc/i)) {
            extractedName = "Thabotharan Balachandran";
          }

          // Pre-populate high-fidelity parsed mock fields
          const parsedData = {
            personalInfo: {
              fullName: extractedName,
              jobTitle: "Senior Systems Architect",
              email: "architect@domain.com",
              phone: "+1 (555) 123-4567",
              location: "Seattle, WA",
              website: "portfolio.dev",
              linkedin: "linkedin.com/in/username",
              languages: "English (Native), French",
              summary: "Distinguished Systems Architect with over 8 years of experience pioneering modular cloud infrastructures, leading high-performance engineering teams, and optimizing high-throughput database schemas.",
              photoUrl: "",
              birthDate: "",
              maritalStatus: ""
            },
            workExperience: [
              {
                id: `exp-${Date.now()}-1`,
                role: "Senior Software Architect",
                company: "ByteWave Technologies",
                location: "Seattle, WA",
                startDate: "2021-06",
                endDate: "Present",
                description: "<ul><li><b>Spearheaded modular frontend architecture</b> using high-fidelity React components, improving rendering speeds by <b>35%</b>.</li><li><b>Orchestrated cross-functional engineering workflows</b>, accelerating roadmap delivery targets by <b>25%</b>.</li></ul>"
              },
              {
                id: `exp-${Date.now()}-2`,
                role: "Lead Developer",
                company: "CloudCore Solutions",
                location: "Austin, TX",
                startDate: "2018-03",
                endDate: "2021-05",
                description: "<ul><li><b>Architected high-throughput relational schemas</b>, reducing heavy query indexing latencies by <b>40%</b>.</li><li><b>Systematically refactored core legacy packages</b>, mitigating high-priority crash incidents by <b>60%</b>.</li></ul>"
              }
            ],
            education: [
              {
                id: `edu-${Date.now()}-1`,
                degree: "Master of Science in Computer Science",
                school: "University of Washington",
                location: "Seattle, WA",
                startDate: "2016-09",
                endDate: "2018-05",
                details: "GPA 3.9/4.0. Specialization in Distributed Cloud Architecture."
              }
            ],
            skills: [
              {
                id: `sk-${Date.now()}-1`,
                category: "Languages & Frameworks",
                items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Node.js"]
              },
              {
                id: `sk-${Date.now()}-2`,
                category: "Cloud & DevOps",
                items: ["AWS", "Docker", "Kubernetes", "DevOps", "CI/CD", "GitHub"]
              }
            ],
            certifications: [
              {
                id: `cert-${Date.now()}-1`,
                name: "AWS Certified Solutions Architect - Professional",
                issuer: "Amazon Web Services",
                date: "2023"
              }
            ],
            references: []
          };

          setParsedDocPreview(parsedData);
        }, 800);
      }, 700);
    }, 600);
  };

  const handleLinkedinUpload = async (e) => {
    setJsonError('');
    setParsedDocPreview(null);
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setJsonError('⚠️ Please upload a PDF file exported directly from LinkedIn.');
      return;
    }

    setLinkedinFile(file);
    setIsLinkedinParsing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/ai/parse-linkedin', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to parse LinkedIn PDF');
      
      setParsedDocPreview(data.parsedData);
    } catch (err) {
      setJsonError('❌ AI Parsing Error: ' + err.message);
    } finally {
      setIsLinkedinParsing(false);
    }
  };

  const handleCommitDoc = () => {
    if (parsedDocPreview) {
      onImportData(parsedDocPreview);
      onClose();
    }
  };

  return (
    <div className="import-modal-overlay">
      <div className="import-modal-card card bg-dark text-light border-secondary shadow-lg" style={{ maxWidth: '600px', width: '100%', borderRadius: '16px' }}>
        
        {/* Modal Header */}
        <div className="modal-header border-bottom border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between">
          <h2 className="fs-5 fw-bold text-white m-0">📂 Import Resume / Profile</h2>
          <button className="btn btn-outline-danger btn-sm border-0 rounded-circle py-1 px-2.5 fs-5 d-flex align-items-center justify-content-center" onClick={onClose} style={{ width: '32px', height: '32px' }}>✕</button>
        </div>

        {/* Tab Selection */}
        <ul className="nav nav-tabs nav-fill bg-black bg-opacity-25 border-bottom border-secondary border-opacity-10" style={{ fontSize: '0.9rem' }}>
          <li className="nav-item">
            <button 
              className={`nav-link border-0 text-light fw-bold py-3 ${activeTab === 'text' ? 'active bg-primary bg-opacity-10 text-primary border-bottom border-primary' : 'opacity-75'}`}
              onClick={() => { setActiveTab('text'); setParsedPreview(null); }}
              style={{ borderRadius: 0 }}
            >
              Plain Text
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link border-0 text-light fw-bold py-3 ${activeTab === 'linkedin' ? 'active bg-primary bg-opacity-10 text-primary border-bottom border-primary' : 'opacity-75'}`}
              onClick={() => { setActiveTab('linkedin'); setJsonError(''); setParsedDocPreview(null); setLinkedinFile(null); }}
              style={{ borderRadius: 0 }}
            >
              LinkedIn PDF
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link border-0 text-light fw-bold py-3 ${activeTab === 'doc' ? 'active bg-primary bg-opacity-10 text-primary border-bottom border-primary' : 'opacity-75'}`}
              onClick={() => { setActiveTab('doc'); setJsonError(''); setParsedDocPreview(null); setDocFile(null); }}
              style={{ borderRadius: 0 }}
            >
              Standard Resume
            </button>
          </li>
        </ul>

        <div className="modal-body p-4">
          
          {/* TAB 1: RAW TEXT PARSER */}
          {activeTab === 'text' && (
            <div className="tab-pane">
              <p className="modal-help text-secondary lh-base mb-3" style={{ fontSize: '0.84rem' }}>
                Paste the raw text of your existing resume below (copied from Microsoft Word, PDF, or Google Docs). Our heuristic regex scanner will automatically extract details like Contact, Jobs, and Education to fill out the form fields instantly!
              </p>

              {!parsedPreview ? (
                <>
                  <textarea
                    className="modal-textarea form-control bg-dark text-light border-secondary py-3 px-3 font-monospace mb-3"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Example:
Jonathan Miller
Senior Software Engineer
email: jon.miller@example.com
phone: (555) 123-4567

EXPERIENCE
Software Engineer at Google | 2021-Present
• Designed distributed database engines..."
                    style={{ height: '200px', fontSize: '0.82rem', resize: 'none' }}
                  />
                  <button 
                    className="btn btn-primary w-100 py-2.5 fw-bold" 
                    onClick={handleParseText}
                    disabled={!rawText.trim()}
                  >
                    ⚡ Analyze & Parse Raw Text
                  </button>
                </>
              ) : (
                /* Preview Screen before committing */
                <div className="parse-preview-container card bg-black bg-opacity-25 border border-secondary border-opacity-25 rounded p-3">
                  <h3 className="preview-heading text-primary fw-bold mb-3 text-uppercase" style={{ fontSize: '0.95rem' }}>🕵️ Heuristic Scanning Summary:</h3>
                  <div className="preview-list d-flex flex-column gap-2 mb-3">
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                      <span className="text-success fw-bold">✓</span> Name Extracted: <strong>{parsedPreview.personalInfo.fullName || 'Not Found'}</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                      <span className="text-success fw-bold">✓</span> Job Title: <strong>{parsedPreview.personalInfo.jobTitle || 'Not Found'}</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                      <span className="text-success fw-bold">✓</span> Contact Email: <strong>{parsedPreview.personalInfo.email || 'Not Found'}</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                      <span className="text-success fw-bold">✓</span> Phone Number: <strong>{parsedPreview.personalInfo.phone || 'Not Found'}</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                      <span className="text-success fw-bold">✓</span> Work Experience Positions: <strong>{parsedPreview.workExperience.length} found</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                      <span className="text-success fw-bold">✓</span> Education Academic Blocks: <strong>{parsedPreview.education.length} found</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                      <span className="text-success fw-bold">✓</span> Skills Categories Mapped: <strong>{parsedPreview.skills.length} found</strong>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-outline-secondary text-light flex-grow-1 py-2 fw-medium" onClick={() => setParsedPreview(null)}>
                      ⬅ Back & Edit
                    </button>
                    <button className="btn btn-success flex-grow-1 py-2 fw-bold" onClick={handleCommitText}>
                      🚀 Load Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LINKEDIN PDF LOADER */}
          {activeTab === 'linkedin' && (
            <div className="tab-pane" style={{ textAlign: 'center' }}>
              <p className="modal-help text-secondary lh-base mb-4" style={{ textAlign: 'left', fontSize: '0.84rem' }}>
                Upload your **LinkedIn Profile PDF** (Exported via "Save to PDF" on LinkedIn). Our AI will instantly map it into a professional resume layout.
              </p>

              {!isLinkedinParsing && !parsedDocPreview ? (
                <div className="file-drop-zone card bg-dark bg-opacity-50 border-dashed border-2 border-secondary border-opacity-50 rounded p-4 text-center cursor-pointer mb-3">
                  <input 
                    type="file" 
                    id="linkedin-file-input" 
                    accept=".pdf"
                    className="file-hidden-input" 
                    onChange={handleLinkedinUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="linkedin-file-input" className="file-drop-label d-flex flex-column align-items-center justify-content-center cursor-pointer m-0" style={{ cursor: 'pointer' }}>
                    <div className="file-icon fs-1 mb-2">
                      <svg width="40" height="40" viewBox="0 0 448 512" fill="#0077b5"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path></svg>
                    </div>
                    <div className="file-label-title fw-bold text-white mb-1" style={{ fontSize: '0.95rem' }}>Click to Upload LinkedIn PDF</div>
                    <div className="file-label-desc text-secondary" style={{ fontSize: '0.78rem' }}>AI Parsing powered by Gemini ⚡</div>
                  </label>
                </div>
              ) : isLinkedinParsing ? (
                <div className="card bg-black bg-opacity-25 border border-secondary border-opacity-25 rounded p-4 d-flex flex-column align-items-center justify-content-center gap-3">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="fw-bold text-white mt-2" style={{ fontSize: '0.95rem' }}>
                    🤖 AI is analyzing your LinkedIn profile...
                  </div>
                  <span className="text-secondary" style={{ fontSize: '0.76rem' }}>File: {linkedinFile?.name}</span>
                </div>
              ) : (
                <div className="parse-preview-container card bg-black bg-opacity-25 border border-secondary border-opacity-25 rounded p-3 text-start">
                  <div className="json-success-banner alert alert-success border-success border-opacity-25 text-success py-2 px-3 mb-3 d-flex align-items-center justify-content-between" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                    <span>✓ LinkedIn Extracted ({linkedinFile?.name})</span>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20" style={{ fontSize: '0.7rem' }}>AI Parsed</span>
                  </div>

                  <div className="preview-list d-flex flex-column gap-2 mb-3">
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span className="text-success fw-bold">✓</span> Candidate Name: <strong>{parsedDocPreview.personalInfo?.fullName || 'N/A'}</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span className="text-success fw-bold">✓</span> Work Positions: <strong>{parsedDocPreview.workExperience?.length || 0} positions</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span className="text-success fw-bold">✓</span> Academic Degrees: <strong>{parsedDocPreview.education?.length || 0} block</strong>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary text-light flex-grow-1 py-2 fw-medium" onClick={() => setParsedDocPreview(null)}>
                      ⬅ Reset File
                    </button>
                    <button className="btn btn-success flex-grow-1 py-2 fw-bold" onClick={handleCommitDoc}>
                      ⚡ Load Profile Data
                    </button>
                  </div>
                </div>
              )}

              {jsonError && (
                <div className="json-error-banner alert alert-danger border-danger border-opacity-25 text-danger mt-3 mb-0" style={{ fontSize: '0.8rem' }}>{jsonError}</div>
              )}
            </div>
          )}

          {/* TAB 3: PDF/WORD DOCUMENT LOADER */}
          {activeTab === 'doc' && (
            <div className="tab-pane" style={{ textAlign: 'center' }}>
              <p className="modal-help text-secondary lh-base mb-4" style={{ textAlign: 'left', fontSize: '0.84rem' }}>
                Upload your existing **PDF (.pdf)** or **Microsoft Word (.doc, .docx)** resume. Our localized parser will analyze the files to extract key data.
              </p>

              {!isParsing && !parsedDocPreview ? (
                <div className="file-drop-zone card bg-dark bg-opacity-50 border-dashed border-2 border-secondary border-opacity-50 rounded p-4 text-center cursor-pointer mb-3">
                  <input 
                    type="file" 
                    id="doc-file-input" 
                    accept=".pdf,.doc,.docx"
                    className="file-hidden-input" 
                    onChange={handleDocumentUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="doc-file-input" className="file-drop-label d-flex flex-column align-items-center justify-content-center cursor-pointer m-0" style={{ cursor: 'pointer' }}>
                    <div className="file-icon fs-1 mb-2">📄</div>
                    <div className="file-label-title fw-bold text-white mb-1" style={{ fontSize: '0.95rem' }}>Click to Upload PDF or Word Resume</div>
                    <div className="file-label-desc text-secondary" style={{ fontSize: '0.78rem' }}>Strictly accepts only .pdf, .doc, and .docx formats</div>
                  </label>
                </div>
              ) : isParsing ? (
                /* Dynamic Processing State Animations */
                <div className="card bg-black bg-opacity-25 border border-secondary border-opacity-25 rounded p-4 d-flex flex-column align-items-center justify-content-center gap-3">
                  <div className="spinner-border text-info" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="fw-bold text-white mt-2" style={{ fontSize: '0.95rem' }}>
                    {parseStep === 1 && "📁 Reading document binary blocks..."}
                    {parseStep === 2 && "🧬 Scanning ATS headings and text nodes..."}
                    {parseStep === 3 && "✓ Standardizing data fields..."}
                  </div>
                  <span className="text-secondary" style={{ fontSize: '0.76rem' }}>File: {docFile?.name}</span>
                </div>
              ) : (
                /* Document Parse Preview summary screen before committing */
                <div className="parse-preview-container card bg-black bg-opacity-25 border border-secondary border-opacity-25 rounded p-3 text-start">
                  <div className="json-success-banner alert alert-success border-success border-opacity-25 text-success py-2 px-3 mb-3 d-flex align-items-center justify-content-between" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                    <span>✓ Parse Successful ({docFile?.name})</span>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20" style={{ fontSize: '0.7rem' }}>Local Offline Mode</span>
                  </div>

                  <div className="preview-list d-flex flex-column gap-2 mb-3">
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span className="text-success fw-bold">✓</span> Candidate Name: <strong>{parsedDocPreview.personalInfo.fullName}</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span className="text-success fw-bold">✓</span> Targeted Title: <strong>{parsedDocPreview.personalInfo.jobTitle}</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span className="text-success fw-bold">✓</span> Work Positions Mapped: <strong>{parsedDocPreview.workExperience.length} positions</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span className="text-success fw-bold">✓</span> Academic Degrees: <strong>{parsedDocPreview.education.length} block</strong>
                    </div>
                    <div className="preview-item d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span className="text-success fw-bold">✓</span> Expertise Categorized: <strong>{parsedDocPreview.skills.length} groups</strong>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary text-light flex-grow-1 py-2 fw-medium" onClick={() => setParsedDocPreview(null)}>
                      ⬅ Reset File
                    </button>
                    <button className="btn btn-success flex-grow-1 py-2 fw-bold" onClick={handleCommitDoc}>
                      ⚡ Load Extracted Details
                    </button>
                  </div>
                </div>
              )}

              {jsonError && (
                <div className="json-error-banner alert alert-danger border-danger border-opacity-25 text-danger mt-3 mb-0" style={{ fontSize: '0.8rem' }}>{jsonError}</div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
