import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';

export default function BuilderForm({ 
  formData, 
  updatePersonalInfo, 
  updateWorkExperience, 
  updateEducation, 
  updateSkills, 
  updateCertifications, 
  updateReferences,
  onResetToMock,
  onClearData,
  activeSection,
  onSectionChange,
  onFieldFocus,
  onFieldBlur,
  jobDescription,
  onJobDescriptionChange
}) {
  const toggleSection = (section) => {
    onSectionChange(activeSection === section ? null : section);
  };

  // Helper arrays for action verbs
  const actionVerbs = [
    "Architected", "Pioneered", "Orchestrated", "Formulated", "Spearheaded", 
    "Mentored", "Designed", "Executed", "Optimized", "Formulated", 
    "Collaborated", "Reduced", "Streamlined", "Engineered", "Fostered"
  ];

  /* --- Heuristic AI Bullet Point Optimizer --- */
  const handleAiOptimizeBullet = (index, currentText) => {
    const cleanText = currentText ? currentText.replace(/<[^>]*>/g, '').trim() : "";
    let optimized = "";
    
    if (/helped build|helped write|wrote code|worked on|helped with/i.test(cleanText)) {
      optimized = `<li><b>Spearheaded modular frontend architecture</b> using high-fidelity React components, improving rendering speeds by <b>35%</b> and boosting UX responsiveness.</li>`;
    } else if (/managed|led team|responsible for team|lead developer/i.test(cleanText)) {
      optimized = `<li><b>Orchestrated cross-functional engineering workflows</b>, accelerating roadmap delivery targets by <b>25%</b> and fostering Agile mentorship.</li>`;
    } else if (/database|sql|postgres|mongo|queries/i.test(cleanText)) {
      optimized = `<li><b>Architected high-throughput relational schemas</b>, reducing heavy query indexing latencies by <b>40%</b>.</li>`;
    } else if (/bug|fix|resolved|solved/i.test(cleanText)) {
      optimized = `<li><b>Systematically refactored core legacy packages</b>, mitigating high-priority crash incidents by <b>60%</b>.</li>`;
    } else {
      optimized = `<li><b>Pioneered and engineered high-impact SaaS deliverables</b>, achieving a <b>20%</b> enhancement in key operational and user-retention metrics.</li>`;
    }
    
    handleUpdateDescriptionHtml(index, `<ul>${optimized}</ul>`);
  };

  /* --- Experience Array Operations --- */
  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      role: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    updateWorkExperience([...formData.workExperience, newExp]);
  };

  const handleUpdateExperienceItem = (index, field, value) => {
    const updated = [...formData.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    updateWorkExperience(updated);
  };

  const handleRemoveExperience = (index) => {
    const updated = formData.workExperience.filter((_, i) => i !== index);
    updateWorkExperience(updated);
  };

  const handleUpdateDescriptionHtml = (index, htmlText) => {
    const updated = [...formData.workExperience];
    updated[index] = { ...updated[index], description: htmlText };
    updateWorkExperience(updated);
  };

  /* --- Education Array Operations --- */
  const handleAddEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      details: ''
    };
    updateEducation([...formData.education, newEdu]);
  };

  const handleUpdateEducationItem = (index, field, value) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: value };
    updateEducation(updated);
  };

  const handleRemoveEducation = (index) => {
    const updated = formData.education.filter((_, i) => i !== index);
    updateEducation(updated);
  };

  /* --- Skills Categorized Operations --- */
  const handleAddSkillCategory = () => {
    const newSkill = {
      id: `sk-${Date.now()}`,
      category: '',
      items: ['']
    };
    updateSkills([...formData.skills, newSkill]);
  };

  const handleUpdateSkillCategory = (index, categoryName) => {
    const updated = [...formData.skills];
    updated[index] = { ...updated[index], category: categoryName };
    updateSkills(updated);
  };

  const handleUpdateSkillItems = (index, tagsString) => {
    const updated = [...formData.skills];
    // Split by comma and trim whitespace
    const items = tagsString.split(',').map(tag => tag.trim());
    updated[index] = { ...updated[index], items };
    updateSkills(updated);
  };

  const handleRemoveSkillCategory = (index) => {
    const updated = formData.skills.filter((_, i) => i !== index);
    updateSkills(updated);
  };

  /* --- Certifications Operations --- */
  const handleAddCertification = () => {
    const newCert = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: ''
    };
    updateCertifications([...formData.certifications, newCert]);
  };

  const handleUpdateCertification = (index, field, value) => {
    const updated = [...formData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    updateCertifications(updated);
  };

  const handleRemoveCertification = (index) => {
    const updated = formData.certifications.filter((_, i) => i !== index);
    updateCertifications(updated);
  };

  /* --- References Operations --- */
  const handleAddReference = () => {
    const newRef = {
      id: `ref-${Date.now()}`,
      name: '',
      title: '',
      contact: ''
    };
    updateReferences([...formData.references, newRef]);
  };

  const handleUpdateReference = (index, field, value) => {
    const updated = [...formData.references];
    updated[index] = { ...updated[index], [field]: value };
    updateReferences(updated);
  };

  const handleRemoveReference = (index) => {
    const updated = formData.references.filter((_, i) => i !== index);
    updateReferences(updated);
  };

  return (
    <div className="form-section p-3">
      
      {/* 0. TARGET JOB ATS SCANNER CARD */}
      <div className={`form-group-card card bg-dark text-light border-secondary mb-3 ${activeSection === 'jobScanner' ? 'active border-primary shadow-sm' : 'border-opacity-25'}`}>
        <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between" onClick={() => toggleSection('jobScanner')} style={{ cursor: 'pointer', userSelect: 'none' }}>
          <h3 className="fs-6 fw-bold text-light m-0 d-flex align-items-center gap-2">
            <svg className="card-header-icon text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Target Job ATS Scanner
          </h3>
          <span className="card-chevron" style={{ transition: 'transform 0.2s', transform: activeSection === 'jobScanner' ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
        
        {activeSection === 'jobScanner' && (
          <div className="card-body p-4 d-flex flex-column gap-3">
            <p className="text-secondary lh-base m-0" style={{ fontSize: '0.8rem' }}>
              Paste the job description of your target position below. We will dynamically extract critical keywords and provide a live ATS checklist to help you align your resume!
            </p>
            <div className="field d-flex flex-column gap-1">
              <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Target Job Description</label>
              <textarea 
                className="input-control form-control bg-dark border-secondary text-light py-2 px-3 font-monospace" 
                value={jobDescription || ''} 
                onChange={(e) => onJobDescriptionChange(e.target.value)}
                placeholder="Paste job posting text here (e.g. 'Looking for a Senior React Developer with experience in AWS, TypeScript, CI/CD and DevOps...')"
                style={{ minHeight: '120px', fontSize: '0.82rem', resize: 'vertical' }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* 1. PERSONAL INFORMATION */}
      <div className={`form-group-card card bg-dark text-light border-secondary mb-3 ${activeSection === 'personal' ? 'active border-primary shadow-sm' : 'border-opacity-25'}`}>
        <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between" onClick={() => toggleSection('personal')} style={{ cursor: 'pointer', userSelect: 'none' }}>
          <h3 className="fs-6 fw-bold text-light m-0 d-flex align-items-center gap-2">
            <svg className="card-header-icon text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h3>
          <span className="card-chevron" style={{ transition: 'transform 0.2s', transform: activeSection === 'personal' ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
        
        {activeSection === 'personal' && (
          <div className="card-body p-4 d-flex flex-column gap-3">
            <div className="field d-flex flex-column gap-1">
              <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Full Name</label>
              <input 
                type="text" 
                className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                value={formData.personalInfo.fullName || ''} 
                onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                onFocus={() => onFieldFocus('fullName')}
                onBlur={onFieldBlur}
                placeholder="e.g. Jonathan T. Miller"
              />
            </div>

            <div className="field d-flex flex-column gap-1">
              <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Professional Title</label>
              <input 
                type="text" 
                className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                value={formData.personalInfo.jobTitle || ''} 
                onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                onFocus={() => onFieldFocus('jobTitle')}
                onBlur={onFieldBlur}
                placeholder="e.g. Senior Software Architect"
              />
            </div>

            <div className="row g-3">
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Email Address</label>
                <input 
                  type="email" 
                  className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                  value={formData.personalInfo.email || ''} 
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  onFocus={() => onFieldFocus('contact')}
                  onBlur={onFieldBlur}
                  placeholder="e.g. contact@domain.com"
                />
              </div>
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Phone Number</label>
                <input 
                  type="text" 
                  className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                  value={formData.personalInfo.phone || ''} 
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  onFocus={() => onFieldFocus('contact')}
                  onBlur={onFieldBlur}
                  placeholder="e.g. +1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="row g-3">
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Location (City, State/Prov)</label>
                <input 
                  type="text" 
                  className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                  value={formData.personalInfo.location || ''} 
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  onFocus={() => onFieldFocus('contact')}
                  onBlur={onFieldBlur}
                  placeholder="e.g. Seattle, WA"
                />
              </div>
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Languages Spoken</label>
                <input 
                  type="text" 
                  className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                  value={formData.personalInfo.languages || ''} 
                  onChange={(e) => updatePersonalInfo('languages', e.target.value)}
                  onFocus={() => onFieldFocus('contact')}
                  onBlur={onFieldBlur}
                  placeholder="e.g. English (Native), French"
                />
              </div>
            </div>

            <div className="row g-3">
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Personal Website</label>
                <input 
                  type="text" 
                  className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                  value={formData.personalInfo.website || ''} 
                  onChange={(e) => updatePersonalInfo('website', e.target.value)}
                  onFocus={() => onFieldFocus('contact')}
                  onBlur={onFieldBlur}
                  placeholder="e.g. portfolio.dev"
                />
              </div>
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>LinkedIn Link</label>
                <input 
                  type="text" 
                  className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                  value={formData.personalInfo.linkedin || ''} 
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  onFocus={() => onFieldFocus('contact')}
                  onBlur={onFieldBlur}
                  placeholder="e.g. linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="field d-flex flex-column gap-1">
              <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Professional Profile Summary</label>
              <textarea 
                className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                value={formData.personalInfo.summary || ''} 
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                onFocus={() => onFieldFocus('summary')}
                onBlur={onFieldBlur}
                placeholder="Write a brief, high-impact summary of your technical credentials and key accomplishments..."
                style={{ minHeight: '90px' }}
              />
            </div>

            {/* --- COMPLIANCE TOY-BOX TRIGGERS (TO ALLOW DEMOING COMPLIANCE SCANNER WARNS) --- */}
            <div className="pt-3 mt-2 border-top border-secondary border-opacity-10">
              <p className="help-prompt text-warning fw-bold mb-2" style={{ fontSize: '0.76rem' }}>
                Compliance Test Fields (Anti-Pattern Triggers):
              </p>
              
              <div className="row g-3">
                <div className="field col-md-6 d-flex flex-column gap-1">
                  <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Date of Birth (Optional Trigger)</label>
                  <input 
                    type="text" 
                    className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                    value={formData.personalInfo.birthDate || ''} 
                    onChange={(e) => updatePersonalInfo('birthDate', e.target.value)}
                    onFocus={() => onFieldFocus('sensitive')}
                    onBlur={onFieldBlur}
                    placeholder="e.g. Oct 12, 1989"
                  />
                </div>
                <div className="field col-md-6 d-flex flex-column gap-1">
                  <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Marital Status (Optional Trigger)</label>
                  <input 
                    type="text" 
                    className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                    value={formData.personalInfo.maritalStatus || ''} 
                    onChange={(e) => updatePersonalInfo('maritalStatus', e.target.value)}
                    onFocus={() => onFieldFocus('sensitive')}
                    onBlur={onFieldBlur}
                    placeholder="e.g. Married / Single"
                  />
                </div>
              </div>
              <div className="field col-12 d-flex flex-column gap-1 mt-2">
                <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Photo URL (Optional Trigger)</label>
                <input 
                  type="text" 
                  className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                  value={formData.personalInfo.photoUrl || ''} 
                  onChange={(e) => updatePersonalInfo('photoUrl', e.target.value)}
                  onFocus={() => onFieldFocus('sensitive')}
                  onBlur={onFieldBlur}
                  placeholder="e.g. https://domain.com/photo.jpg"
                />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 2. WORK EXPERIENCE */}
      <div className={`form-group-card card bg-dark text-light border-secondary mb-3 ${activeSection === 'experience' ? 'active border-primary shadow-sm' : 'border-opacity-25'}`}>
        <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between" onClick={() => toggleSection('experience')} style={{ cursor: 'pointer', userSelect: 'none' }}>
          <h3 className="fs-6 fw-bold text-light m-0 d-flex align-items-center gap-2">
            <svg className="card-header-icon text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Work Experience
          </h3>
          <span className="card-chevron" style={{ transition: 'transform 0.2s', transform: activeSection === 'experience' ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>

        {activeSection === 'experience' && (
          <div className="card-body p-4 d-flex flex-column gap-3">
            {formData.workExperience.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="repeater-item card bg-black bg-opacity-25 border border-secondary border-opacity-25 rounded mb-3">
                <div className="repeater-item-header card-header bg-transparent border-bottom border-secondary border-opacity-10 py-2 px-3 d-flex align-items-center justify-content-between">
                  <span className="fw-medium text-secondary" style={{ fontSize: '0.88rem' }}>💼 Role #{expIdx + 1}: {exp.role || 'New Position'}</span>
                  <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', padding: 0 }} onClick={() => handleRemoveExperience(expIdx)}>✕</button>
                </div>
                <div className="repeater-item-body card-body p-3 d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Job Title / Role</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={exp.role || ''} 
                        onChange={(e) => handleUpdateExperienceItem(expIdx, 'role', e.target.value)}
                        placeholder="e.g. Lead Developer"
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Company / Organization</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={exp.company || ''} 
                        onChange={(e) => handleUpdateExperienceItem(expIdx, 'company', e.target.value)}
                        placeholder="e.g. ByteWave Inc."
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Location (City, State/Prov)</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={exp.location || ''} 
                        onChange={(e) => handleUpdateExperienceItem(expIdx, 'location', e.target.value)}
                        placeholder="e.g. Austin, TX"
                      />
                    </div>
                    <div className="field col-md-6">
                      <div className="row g-2">
                        <div className="field col-6 d-flex flex-column gap-1">
                          <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Start Date</label>
                          <input 
                            type="text" 
                            className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                            value={exp.startDate || ''} 
                            onChange={(e) => handleUpdateExperienceItem(expIdx, 'startDate', e.target.value)}
                            placeholder="e.g. 2021-06"
                          />
                        </div>
                        <div className="field col-6 d-flex flex-column gap-1">
                          <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>End Date</label>
                          <input 
                            type="text" 
                            className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                            value={exp.endDate || ''} 
                            onChange={(e) => handleUpdateExperienceItem(expIdx, 'endDate', e.target.value)}
                            placeholder="e.g. Present or 2023-05"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full WYSIWYG Editor for Achievements */}
                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Achievements & Key Duties</label>
                    <RichTextEditor 
                      value={Array.isArray(exp.description) ? `<ul><li>${exp.description.join('</li><li>')}</li></ul>` : (exp.description || '')}
                      onChange={(content) => handleUpdateDescriptionHtml(expIdx, content)}
                      onFocus={() => onFieldFocus('experience_bullets')}
                      onBlur={onFieldBlur}
                      placeholder="Write your accomplishments here..."
                    />
                    <div className="mt-2 p-2.5 bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded d-flex flex-column gap-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="text-info fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                          ✨ Local AI Bullet Optimizer
                        </span>
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25" style={{ fontSize: '0.65rem', padding: '0.15rem 0.35rem' }}>Local Heuristics</span>
                      </div>
                      <p className="text-secondary m-0" style={{ fontSize: '0.74rem', lineHeight: '1.25' }}>
                        Scan your text for weak language (e.g. "helped build", "wrote SQL") and instantly rewrite it using strong action verbs and quantitative impact metrics.
                      </p>
                      <div className="d-flex flex-wrap gap-2 align-items-center mt-1">
                        <button 
                          type="button"
                          className="btn btn-outline-info btn-xs py-1 px-2.5 fw-semibold d-flex align-items-center gap-1 rounded-pill" 
                          style={{ fontSize: '0.74rem', transition: 'all 0.2s' }}
                          onClick={() => handleAiOptimizeBullet(expIdx, exp.description)}
                        >
                          ⚡ Optimize Achievements
                        </button>
                        <div className="d-flex gap-1 flex-wrap">
                          {actionVerbs.slice(0, 5).map((verb) => (
                            <span key={verb} className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-10" style={{ fontSize: '0.68rem', cursor: 'help' }} title={`Use '${verb}' to start your bullet point.`}>
                              {verb}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="help-prompt text-secondary mt-1 d-block" style={{ fontSize: '0.76rem', fontStyle: 'italic' }}>
                      Pro Tip: Use the rich text editor above to format your achievements with bullets, bold text, and alignments!
                    </span>
                  </div>

                </div>
              </div>
            ))}

            <button className="btn btn-primary py-2 fw-semibold w-100" onClick={handleAddExperience}>
              + Add Experience Position
            </button>
          </div>
        )}
      </div>

      {/* 3. EDUCATION */}
      <div className={`form-group-card card bg-dark text-light border-secondary mb-3 ${activeSection === 'education' ? 'active border-primary shadow-sm' : 'border-opacity-25'}`}>
        <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between" onClick={() => toggleSection('education')} style={{ cursor: 'pointer', userSelect: 'none' }}>
          <h3 className="fs-6 fw-bold text-light m-0 d-flex align-items-center gap-2">
            <svg className="card-header-icon text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            Education & Academic Background
          </h3>
          <span className="card-chevron" style={{ transition: 'transform 0.2s', transform: activeSection === 'education' ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>

        {activeSection === 'education' && (
          <div className="card-body p-4 d-flex flex-column gap-3">
            {formData.education.map((edu, eduIdx) => (
              <div key={edu.id || eduIdx} className="repeater-item card bg-black bg-opacity-25 border border-secondary border-opacity-25 rounded mb-3">
                <div className="repeater-item-header card-header bg-transparent border-bottom border-secondary border-opacity-10 py-2 px-3 d-flex align-items-center justify-content-between">
                  <span className="fw-medium text-secondary" style={{ fontSize: '0.88rem' }}>🎓 Education #{eduIdx + 1}: {edu.degree || 'New Degree'}</span>
                  <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', padding: 0 }} onClick={() => handleRemoveEducation(eduIdx)}>✕</button>
                </div>
                <div className="repeater-item-body card-body p-3 d-flex flex-column gap-3">
                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Degree / Certificate</label>
                    <input 
                      type="text" 
                      className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                      value={edu.degree || ''} 
                      onChange={(e) => handleUpdateEducationItem(eduIdx, 'degree', e.target.value)}
                      placeholder="e.g. Bachelor of Science in Computer Science"
                    />
                  </div>

                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>School / University</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={edu.school || ''} 
                        onChange={(e) => handleUpdateEducationItem(eduIdx, 'school', e.target.value)}
                        placeholder="e.g. University of Texas"
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Location (City, State/Prov)</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={edu.location || ''} 
                        onChange={(e) => handleUpdateEducationItem(eduIdx, 'location', e.target.value)}
                        placeholder="e.g. Austin, TX"
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Start Date</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={edu.startDate || ''} 
                        onChange={(e) => handleUpdateEducationItem(eduIdx, 'startDate', e.target.value)}
                        placeholder="e.g. 2012-09"
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>End Date</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={edu.endDate || ''} 
                        onChange={(e) => handleUpdateEducationItem(eduIdx, 'endDate', e.target.value)}
                        placeholder="e.g. 2016-05"
                      />
                    </div>
                  </div>

                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Additional Details (Honors, Clubs, GPA)</label>
                    <input 
                      type="text" 
                      className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                      value={edu.details || ''} 
                      onChange={(e) => handleUpdateEducationItem(eduIdx, 'details', e.target.value)}
                      placeholder="e.g. Graduated Summa Cum Laude. Dean's List."
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-primary py-2 fw-semibold w-100" onClick={handleAddEducation}>
              + Add Education Block
            </button>
          </div>
        )}
      </div>

      {/* 4. SKILLS & CORE COMPETENCIES */}
      <div className={`form-group-card card bg-dark text-light border-secondary mb-3 ${activeSection === 'skills' ? 'active border-primary shadow-sm' : 'border-opacity-25'}`}>
        <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between" onClick={() => toggleSection('skills')} style={{ cursor: 'pointer', userSelect: 'none' }}>
          <h3 className="fs-6 fw-bold text-light m-0 d-flex align-items-center gap-2">
            <svg className="card-header-icon text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Skills & Core Competencies
          </h3>
          <span className="card-chevron" style={{ transition: 'transform 0.2s', transform: activeSection === 'skills' ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>

        {activeSection === 'skills' && (
          <div className="card-body p-4 d-flex flex-column gap-3">
            {formData.skills.map((skill, skIdx) => (
              <div key={skill.id || skIdx} className="repeater-item card bg-black bg-opacity-25 border border-secondary border-opacity-25 rounded mb-3">
                <div className="repeater-item-header card-header bg-transparent border-bottom border-secondary border-opacity-10 py-2 px-3 d-flex align-items-center justify-content-between">
                  <span className="fw-medium text-secondary" style={{ fontSize: '0.88rem' }}>⚡ Skill Category: {skill.category || 'New Category'}</span>
                  <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', padding: 0 }} onClick={() => handleRemoveSkillCategory(skIdx)}>✕</button>
                </div>
                <div className="repeater-item-body card-body p-3 d-flex flex-column gap-3">
                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Category Title</label>
                    <input 
                      type="text" 
                      className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                      value={skill.category || ''} 
                      onChange={(e) => handleUpdateSkillCategory(skIdx, e.target.value)}
                      onFocus={() => onFieldFocus('skills')}
                      onBlur={onFieldBlur}
                      placeholder="e.g. Languages or DevOps"
                    />
                  </div>

                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Tags (Comma separated values)</label>
                    <input 
                      type="text" 
                      className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                      value={skill.items.join(', ') || ''} 
                      onChange={(e) => handleUpdateSkillItems(skIdx, e.target.value)}
                      onFocus={() => onFieldFocus('skills')}
                      onBlur={onFieldBlur}
                      placeholder="e.g. React, Next.js, Webpack, Redux"
                    />
                    <span className="help-prompt text-secondary mt-1 d-block" style={{ fontSize: '0.76rem', fontStyle: 'italic' }}>Write tag entries separated by commas. We will render them as neat items.</span>
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-primary py-2 fw-semibold w-100" onClick={handleAddSkillCategory}>
              + Add Skill Category
            </button>
          </div>
        )}
      </div>

      {/* 5. CERTIFICATIONS */}
      <div className={`form-group-card card bg-dark text-light border-secondary mb-3 ${activeSection === 'certifications' ? 'active border-primary shadow-sm' : 'border-opacity-25'}`}>
        <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between" onClick={() => toggleSection('certifications')} style={{ cursor: 'pointer', userSelect: 'none' }}>
          <h3 className="fs-6 fw-bold text-light m-0 d-flex align-items-center gap-2">
            <svg className="card-header-icon text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Certifications & Training
          </h3>
          <span className="card-chevron" style={{ transition: 'transform 0.2s', transform: activeSection === 'certifications' ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>

        {activeSection === 'certifications' && (
          <div className="card-body p-4 d-flex flex-column gap-3">
            {formData.certifications.map((cert, certIdx) => (
              <div key={cert.id || certIdx} className="repeater-item card bg-black bg-opacity-25 border border-secondary border-opacity-25 rounded mb-3">
                <div className="repeater-item-header card-header bg-transparent border-bottom border-secondary border-opacity-10 py-2 px-3 d-flex align-items-center justify-content-between">
                  <span className="fw-medium text-secondary" style={{ fontSize: '0.88rem' }}>🎖️ Cert: {cert.name || 'New Certification'}</span>
                  <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', padding: 0 }} onClick={() => handleRemoveCertification(certIdx)}>✕</button>
                </div>
                <div className="repeater-item-body card-body p-3 d-flex flex-column gap-3">
                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Certification Name</label>
                    <input 
                      type="text" 
                      className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                      value={cert.name || ''} 
                      onChange={(e) => handleUpdateCertification(certIdx, 'name', e.target.value)}
                      placeholder="e.g. AWS Certified Architect"
                    />
                  </div>

                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Issuing Institution</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={cert.issuer || ''} 
                        onChange={(e) => handleUpdateCertification(certIdx, 'issuer', e.target.value)}
                        placeholder="e.g. Amazon Web Services"
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Year of Issue</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={cert.date || ''} 
                        onChange={(e) => handleUpdateCertification(certIdx, 'date', e.target.value)}
                        placeholder="e.g. 2024"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-primary py-2 fw-semibold w-100" onClick={handleAddCertification}>
              + Add Certification
            </button>
          </div>
        )}
      </div>

      {/* 6. REFERENCES (Highly expected in Australia) */}
      <div className={`form-group-card card bg-dark text-light border-secondary mb-3 ${activeSection === 'references' ? 'active border-primary shadow-sm' : 'border-opacity-25'}`}>
        <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between" onClick={() => toggleSection('references')} style={{ cursor: 'pointer', userSelect: 'none' }}>
          <h3 className="fs-6 fw-bold text-light m-0 d-flex align-items-center gap-2">
            <svg className="card-header-icon text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Professional References
          </h3>
          <span className="card-chevron" style={{ transition: 'transform 0.2s', transform: activeSection === 'references' ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>

        {activeSection === 'references' && (
          <div className="card-body p-4 d-flex flex-column gap-3">
            <span className="help-prompt text-primary fw-semibold mt-0 mb-2 d-block" style={{ fontSize: '0.76rem' }}>
              🇦🇺 Australian Standard Highlight: Standard CVs in Australia typically include references or mark them 'Available upon request'.
            </span>
            {formData.references.map((ref, refIdx) => (
              <div key={ref.id || refIdx} className="repeater-item card bg-black bg-opacity-25 border border-secondary border-opacity-25 rounded mb-3">
                <div className="repeater-item-header card-header bg-transparent border-bottom border-secondary border-opacity-10 py-2 px-3 d-flex align-items-center justify-content-between">
                  <span className="fw-medium text-secondary" style={{ fontSize: '0.88rem' }}>👤 Reference #{refIdx + 1}: {ref.name || 'New Reference'}</span>
                  <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', padding: 0 }} onClick={() => handleRemoveReference(refIdx)}>✕</button>
                </div>
                <div className="repeater-item-body card-body p-3 d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Reference Name</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={ref.name || ''} 
                        onChange={(e) => handleUpdateReference(refIdx, 'name', e.target.value)}
                        placeholder="e.g. Dr. Jane Carter"
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Role / Relationship / Company</label>
                      <input 
                        type="text" 
                        className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                        value={ref.title || ''} 
                        onChange={(e) => handleUpdateReference(refIdx, 'title', e.target.value)}
                        placeholder="e.g. VP Engineering at Tesla"
                      />
                    </div>
                  </div>

                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Contact Info (Email / Phone)</label>
                    <input 
                      type="text" 
                      className="input-control form-control bg-dark border-secondary text-light py-2 px-3" 
                      value={ref.contact || ''} 
                      onChange={(e) => handleUpdateReference(refIdx, 'contact', e.target.value)}
                      placeholder="e.g. jane.carter@email.com | +1 (555) 902-1823"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-primary py-2 fw-semibold w-100" onClick={handleAddReference}>
              + Add Reference
            </button>
          </div>
        )}
      </div>



    </div>
  );
}
