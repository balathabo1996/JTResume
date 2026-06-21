/* eslint-disable react-hooks/static-components */
/**
 * @file BuilderForm.jsx
 * @description The main form interface for constructing the resume. It provides the UI for dragging, 
 * dropping, and editing complex arrays of data like work experience, education, skills, and certifications.
 * Communicates with the top-level App component to synchronize the `formData` state.
 * @author Thabotharan Balachandran
 */
import { useState, useRef, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";
import MonthYearPicker from "./MonthYearPicker";
import { SortableList, DragHandle as SortableDragHandle } from "./SortableList";

/**
 * @function BuilderForm
 * @description A robust, multi-section form builder allowing users to reorder and edit their resume properties.
 * Includes dynamic sub-sections for complex data arrays with sorting capabilities.
 * @param {Object} props - The component props.
 * @param {Object} props.formData - The current resume data object.
 * @param {Function} props.updatePersonalInfo - Callback for personal info updates.
 * @param {Function} props.updateWorkExperience - Callback for experience updates.
 * @param {Function} props.updateProjects - Callback for project updates.
 * @param {Function} props.updateEducation - Callback for education updates.
 * @param {Function} props.updateSkills - Callback for skill updates.
 * @param {Function} props.updateCertifications - Callback for certification updates.
 * @param {Function} props.updateReferences - Callback for reference updates.
 * @param {Function} props.updateCustomSections - Callback for custom section updates.
 * @param {Function} props.onResetToMock - Callback to reset data.
 * @param {Function} props.onClearData - Callback to clear form.
 * @param {string|null} props.activeSection - Currently focused section.
 * @param {Function} props.onSectionChange - Toggle section focus.
 * @param {Function} props.onFieldFocus - Focus tracker.
 * @param {Function} props.onFieldBlur - Blur tracker.
 * @param {string} props.jobDescription - Current job description string.
 * @param {Function} props.onJobDescriptionChange - Job description update callback.
 */
export default function BuilderForm({
  formData,
  updatePersonalInfo,
  updateWorkExperience,
  updateProjects,
  updateEducation,
  updateSkills,
  updateCertifications,
  updateReferences,
  updateCustomSections,
  // eslint-disable-next-line no-unused-vars
  onResetToMock,
  // eslint-disable-next-line no-unused-vars
  onClearData,
  activeSection,
  onSectionChange,
  onFieldFocus,
  onFieldBlur,
  jobDescription,
  onJobDescriptionChange,
}) {
  const toggleSection = (section) => {
    onSectionChange(activeSection === section ? null : section);
  };

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [enhancingExpIdx, setEnhancingExpIdx] = useState(null);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.personalInfo.fullName,
          jobTitle: formData.personalInfo.jobTitle,
          keywords: [] // we can pass targetKeywords here if we want, but keeping it simple
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.summary) {
        updatePersonalInfo('summary', data.summary);
      }
    } catch (err) {
      alert("AI Summary Error: " + err.message);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleEnhanceBullet = async (content, role, company) => {
    try {
      const res = await fetch('/api/ai/enhance-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, role, company })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.enhancedContent;
    } catch (err) {
      alert("AI Enhance Error: " + err.message);
      return content;
    }
  };

  // ── Section reorder state ──────────────────────────────
  const [enhancingProjIdx, setEnhancingProjIdx] = useState(null);
  const [sectionOrder, setSectionOrder] = useState([
    'personal', 'experience', 'projects',
    'education', 'skills', 'certifications', 'references'
  ]);

  const [draggableSectionId, setDraggableSectionId] = useState(null);
  const [activeDragSection, setActiveDragSection] = useState(null);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const ALL_STANDARD_SECTIONS = [
    { id: 'experience', label: 'Work Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills & Competencies' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'references', label: 'References' }
  ];

  const deletedSections = ALL_STANDARD_SECTIONS.filter(
    sec => !sectionOrder.includes(sec.id)
  );

  const handleDeleteSection = (key) => {
    setSectionOrder(prev => prev.filter(item => item !== key));
    if (key === 'experience') updateWorkExperience([]);
    else if (key === 'projects') updateProjects([]);
    else if (key === 'education') updateEducation([]);
    else if (key === 'skills') updateSkills([]);
    else if (key === 'certifications') updateCertifications([]);
    else if (key === 'references') updateReferences([]);
    
    if (activeSection === key) {
      onSectionChange(null);
    }
  };

  // Synchronize custom sections into sectionOrder when customSections array changes (e.g. on load, import, mock data reset, etc.)
  useEffect(() => {
    const customSecs = formData.customSections || [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSectionOrder(prev => {
      let nextOrder = prev.filter(item => {
        const isStandard = ALL_STANDARD_SECTIONS.some(sec => sec.id === item) || item === 'personal' || item === 'jobScanner';
        if (isStandard) return true;
        const customId = item.replace(/^custom-/, '');
        return customSecs.some(sec => sec.id === customId);
      });

      customSecs.forEach(sec => {
        const itemKey = `custom-${sec.id}`;
        if (!nextOrder.includes(itemKey)) {
          nextOrder.push(itemKey);
        }
      });

      return nextOrder;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.customSections]);

  useEffect(() => {
    if (activeDragSection) {
      const handleGlobalMouseUp = () => {
        setActiveDragSection(null);
        dragItem.current = null;
        dragOverItem.current = null;
      };
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [activeDragSection]);

  const handleDragStart = (e, key) => {
    dragItem.current = key;
    e.dataTransfer.effectAllowed = 'move';
    setActiveDragSection(key);
  };

  const handleDragEnter = (e, key) => {
    dragOverItem.current = key;
  };

  const handleDragOver = (e, key) => {
    e.preventDefault();
    if (dragItem.current && dragItem.current !== key) {
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const midpoint = rect.height / 2;
      
      const dragIdx = sectionOrder.indexOf(dragItem.current);
      const hoverIdx = sectionOrder.indexOf(key);
      
      if (dragIdx === -1 || hoverIdx === -1) return;
      
      // Dragging down: only swap if cursor goes past midpoint
      if (dragIdx < hoverIdx && relativeY < midpoint) {
        return;
      }
      
      // Dragging up: only swap if cursor goes above midpoint
      if (dragIdx > hoverIdx && relativeY > midpoint) {
        return;
      }
      
      setSectionOrder(prev => {
        const arr = [...prev];
        const dIdx = arr.indexOf(dragItem.current);
        const hIdx = arr.indexOf(key);
        if (dIdx === -1 || hIdx === -1) return prev;
        
        arr.splice(dIdx, 1);
        arr.splice(hIdx, 0, dragItem.current);
        return arr;
      });
    }
  };

  const handleDragEnd = (e) => {
    setActiveDragSection(null);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const DragHandle = ({ sectionId }) => (
    <div 
      className="drag-handle" 
      onMouseEnter={() => setDraggableSectionId(sectionId)}
      onMouseLeave={() => setDraggableSectionId(null)}
      style={{ cursor: 'grab', padding: '0 8px', color: '#94a3b8' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
    </div>
  );

  // ── Array Items Reorder state ──────────────────────────────
  const [expandedItems, setExpandedItems] = useState({});
  const toggleItemCollapse = (itemKey) => {
    setExpandedItems(prev => {
      if (prev[itemKey]) {
        return { ...prev, [itemKey]: false };
      }
      return { [itemKey]: true };
    });
  };

  const containerRef = useRef(null);


  /* --- Experience Array Operations --- */
  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
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

  /* --- Projects Array Operations --- */
  const handleAddProject = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: '',
      techStack: '',
      liveUrl: '',
      githubUrl: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    updateProjects([...(formData.projects || []), newProject]);
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...(formData.projects || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateProjects(updated);
  };

  const handleRemoveProject = (index) => {
    const updated = (formData.projects || []).filter((_, i) => i !== index);
    updateProjects(updated);
  };

  const handleUpdateProjectDescriptionHtml = (index, htmlText) => {
    const updated = [...(formData.projects || [])];
    updated[index] = { ...updated[index], description: htmlText };
    updateProjects(updated);
  };

  /* --- Education Array Operations --- */
  const handleAddEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      details: "",
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
      category: "",
      items: [""],
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
    const items = tagsString.split(",").map((tag) => tag.trim());
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
      name: "",
      issuer: "",
      date: "",
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
      name: "",
      title: "",
      contact: "",
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

  /* --- Custom Sections Operations --- */
  const handleAddCustomSection = () => {
    const customId = `custom-${Date.now()}`;
    const newSection = {
      id: customId,
      title: 'Custom Section',
      items: []
    };
    updateCustomSections([...(formData.customSections || []), newSection]);
    setSectionOrder(prev => [...prev, `custom-${customId}`]);
    onSectionChange(`custom-${customId}`);
  };

  const handleUpdateCustomSectionTitle = (sectionIdx, value) => {
    const updated = [...(formData.customSections || [])];
    updated[sectionIdx] = { ...updated[sectionIdx], title: value };
    updateCustomSections(updated);
  };

  const handleRemoveCustomSection = (sectionIdx) => {
    const sectionToRemove = (formData.customSections || [])[sectionIdx];
    if (sectionToRemove) {
      setSectionOrder(prev => prev.filter(item => item !== `custom-${sectionToRemove.id}`));
    }
    const updated = (formData.customSections || []).filter((_, i) => i !== sectionIdx);
    updateCustomSections(updated);
  };

  const handleAddCustomItem = (sectionIdx) => {
    const updated = [...(formData.customSections || [])];
    const newItem = {
      id: `ci-${Date.now()}`,
      title: '',
      subtitle: '',
      startDate: '',
      endDate: '',
      location: '',
      description: ''
    };
    updated[sectionIdx] = {
      ...updated[sectionIdx],
      items: [...(updated[sectionIdx].items || []), newItem]
    };
    updateCustomSections(updated);
  };

  const handleUpdateCustomItem = (sectionIdx, itemIdx, field, value) => {
    const updated = [...(formData.customSections || [])];
    const items = [...(updated[sectionIdx].items || [])];
    items[itemIdx] = { ...items[itemIdx], [field]: value };
    updated[sectionIdx] = { ...updated[sectionIdx], items };
    updateCustomSections(updated);
  };

  const handleRemoveCustomItem = (sectionIdx, itemIdx) => {
    const updated = [...(formData.customSections || [])];
    updated[sectionIdx] = {
      ...updated[sectionIdx],
      items: updated[sectionIdx].items.filter((_, i) => i !== itemIdx)
    };
    updateCustomSections(updated);
  };


  return (
    <div className="form-section" ref={containerRef} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 0. TARGET JOB ATS SCANNER CARD */}
      <div data-id="jobScanner" style={{ order: -100 }}
        className={`form-group-card mb-3 ${activeSection === "jobScanner" ? "active" : ""}`}
      >
        <div
          className="card-header d-flex align-items-center justify-content-between"
          onClick={() => toggleSection("jobScanner")}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <h3 className="m-0 d-flex align-items-center gap-2">
            <svg
              className="card-header-icon text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ width: "20px", height: "20px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Target Job ATS Scanner
          </h3>
          <div className="d-flex align-items-center gap-2">
            <span
              className="card-chevron"
              style={{
                transition: "transform 0.2s",
                transform:
                  activeSection === "jobScanner" ? "rotate(180deg)" : "none",
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {activeSection === "jobScanner" && (
          <div className="card-body d-flex flex-column gap-3">
            <p
              className="text-secondary lh-base m-0"
              style={{ fontSize: "0.8rem" }}
            >
              Paste the job description of your target position below. We will
              dynamically extract critical keywords and provide a live ATS
              checklist to help you align your resume!
            </p>
            <div className="field d-flex flex-column gap-1">
              <label className="form-label">Target Job Description</label>
              <textarea
                className="input-control font-monospace"
                value={jobDescription || ""}
                onChange={(e) => onJobDescriptionChange(e.target.value)}
                placeholder="Paste job posting text here (e.g. 'Looking for a Senior React Developer with experience in AWS, TypeScript, CI/CD and DevOps...')"
                style={{
                  minHeight: "120px",
                  fontSize: "0.82rem",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 1. PERSONAL INFORMATION */}
      <div data-id="personal" style={{ order: sectionOrder.indexOf('personal') !== -1 ? sectionOrder.indexOf('personal') : 99 }} draggable={draggableSectionId === 'personal'} onDragStart={(e) => handleDragStart(e, 'personal')} onDragEnter={(e) => handleDragEnter(e, 'personal')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, 'personal')}
        className={`form-group-card mb-3 ${activeSection === "personal" ? "active" : ""} ${activeDragSection === "personal" ? "dragging" : ""}`}
      >
        <div
          className="card-header d-flex align-items-center justify-content-between"
          onClick={() => toggleSection("personal")}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <h3 className="m-0 d-flex align-items-center gap-2">
            <svg
              className="card-header-icon text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ width: "20px", height: "20px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Personal Information
          </h3>
          <div className="d-flex align-items-center gap-2">
            <DragHandle sectionId="personal" />
            <span
              className="card-chevron"
              style={{
                transition: "transform 0.2s",
                transform:
                  activeSection === "personal" ? "rotate(180deg)" : "none",
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {activeSection === "personal" && (
          <div className="card-body d-flex flex-column gap-3">
            <div className="field d-flex flex-column gap-1">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-control"
                value={formData.personalInfo.fullName || ""}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                onFocus={() => onFieldFocus("fullName")}
                onBlur={onFieldBlur}
                placeholder="e.g. Thabotharan Balachandran"
              />
            </div>

            <div className="field d-flex flex-column gap-1">
              <label className="form-label">Professional Title</label>
              <input
                type="text"
                className="input-control"
                value={formData.personalInfo.jobTitle || ""}
                onChange={(e) => updatePersonalInfo("jobTitle", e.target.value)}
                onFocus={() => onFieldFocus("jobTitle")}
                onBlur={onFieldBlur}
                placeholder="e.g. Senior Software Architect"
              />
            </div>

            <div className="row g-3">
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="input-control"
                  value={formData.personalInfo.email || ""}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  onFocus={() => onFieldFocus("contact")}
                  onBlur={onFieldBlur}
                  placeholder="e.g. contact@domain.com"
                />
              </div>
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.personalInfo.phone || ""}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  onFocus={() => onFieldFocus("contact")}
                  onBlur={onFieldBlur}
                  placeholder="e.g. +1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="row g-3">
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label">
                  Location (City, State/Prov)
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.personalInfo.location || ""}
                  onChange={(e) =>
                    updatePersonalInfo("location", e.target.value)
                  }
                  onFocus={() => onFieldFocus("contact")}
                  onBlur={onFieldBlur}
                  placeholder="e.g. Seattle, WA"
                />
              </div>
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label">Languages Spoken</label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.personalInfo.languages || ""}
                  onChange={(e) =>
                    updatePersonalInfo("languages", e.target.value)
                  }
                  onFocus={() => onFieldFocus("contact")}
                  onBlur={onFieldBlur}
                  placeholder="e.g. English (Native), French"
                />
              </div>
            </div>

            <div className="row g-3">
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label">Personal Website</label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.personalInfo.website || ""}
                  onChange={(e) =>
                    updatePersonalInfo("website", e.target.value)
                  }
                  onFocus={() => onFieldFocus("contact")}
                  onBlur={onFieldBlur}
                  placeholder="e.g. portfolio.dev"
                />
              </div>
              <div className="field col-md-6 d-flex flex-column gap-1">
                <label className="form-label">LinkedIn Link</label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.personalInfo.linkedin || ""}
                  onChange={(e) =>
                    updatePersonalInfo("linkedin", e.target.value)
                  }
                  onFocus={() => onFieldFocus("contact")}
                  onBlur={onFieldBlur}
                  placeholder="e.g. linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="field d-flex flex-column gap-1">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label mb-0">Professional Profile Summary</label>
                <button 
                  type="button" 
                  onClick={handleGenerateSummary} 
                  disabled={isGeneratingSummary}
                  className="btn btn-sm btn-outline-primary border-0 d-flex align-items-center gap-1"
                  style={{ fontSize: '0.8rem', padding: '2px 8px' }}
                >
                  {isGeneratingSummary ? (
                    <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg> Generate with AI</>
                  )}
                </button>
              </div>
              <textarea
                className="input-control"
                value={formData.personalInfo.summary || ""}
                onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                onFocus={() => onFieldFocus("summary")}
                onBlur={onFieldBlur}
                placeholder="Write a brief, high-impact summary of your technical credentials and key accomplishments..."
                style={{ minHeight: "90px" }}
              />
            </div>

          </div>
        )}
      </div>

      {/* 2. WORK EXPERIENCE */}
      {sectionOrder.includes('experience') && (
        <div data-id="experience" style={{ order: sectionOrder.indexOf('experience') !== -1 ? sectionOrder.indexOf('experience') : 99 }} draggable={draggableSectionId === 'experience'} onDragStart={(e) => handleDragStart(e, 'experience')} onDragEnter={(e) => handleDragEnter(e, 'experience')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, 'experience')}
          className={`form-group-card mb-3 ${activeSection === "experience" ? "active" : ""} ${activeDragSection === "experience" ? "dragging" : ""}`}
        >
          <div
            className="card-header d-flex align-items-center justify-content-between"
            onClick={() => toggleSection("experience")}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <h3 className="m-0 d-flex align-items-center gap-2">
              <svg
                className="card-header-icon text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ width: "20px", height: "20px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Work Experience
            </h3>
            <div className="d-flex align-items-center gap-2">
              <DragHandle sectionId="experience" />
              <button
                className="btn-repeater-delete"
                onClick={(e) => { e.stopPropagation(); handleDeleteSection("experience"); }}
                title="Delete Section"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
              <span
              className="card-chevron"
              style={{
                transition: "transform 0.2s",
                transform:
                  activeSection === "experience" ? "rotate(180deg)" : "none",
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {activeSection === "experience" && (
          <div className="card-body d-flex flex-column gap-3">
            <SortableList
              items={formData.workExperience}
              onReorder={updateWorkExperience}
              renderItem={(exp, expIdx) => (
                <>
                <div className="repeater-item-header d-flex align-items-center justify-content-between" onClick={() => toggleItemCollapse(exp.id || `exp-${expIdx}`)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span
                    className="fw-medium text-secondary d-flex align-items-center gap-1"
                    style={{ fontSize: "0.88rem" }}
                  >
                    <SortableDragHandle />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> Role #{expIdx + 1}: {exp.role || "New Position"}
                  </span>
                  <div className="d-flex align-items-center gap-2"><span style={{ color: '#94a3b8', transform: expandedItems[exp.id || `exp-${expIdx}`] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', fontSize: '0.8rem' }}>▼</span><button className="btn-repeater-delete"
                    onClick={(e) => { e.stopPropagation(); handleRemoveExperience(expIdx); }}
                    title="Remove Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button></div>
                </div>
                {expandedItems[exp.id || `exp-${expIdx}`] && (
                  <div className="repeater-item-body card-body p-3 d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">Job Title / Role</label>
                      <input
                        type="text"
                        className="input-control"
                        value={exp.role || ""}
                        onChange={(e) =>
                          handleUpdateExperienceItem(
                            expIdx,
                            "role",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Lead Developer"
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={exp.company || ""}
                        onChange={(e) =>
                          handleUpdateExperienceItem(
                            expIdx,
                            "company",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. ByteWave Inc."
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="field col-md-12 d-flex flex-column gap-1">
                      <label className="form-label">
                        Location (City, State/Prov)
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={exp.location || ""}
                        onChange={(e) =>
                          handleUpdateExperienceItem(
                            expIdx,
                            "location",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Austin, TX"
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">Start Date</label>
                      <MonthYearPicker
                        value={exp.startDate || ""}
                        onChange={(val) => handleUpdateExperienceItem(expIdx, "startDate", val)}
                        isEndDate={false}
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">End Date</label>
                      <MonthYearPicker
                        value={exp.endDate || ""}
                        onChange={(val) => handleUpdateExperienceItem(expIdx, "endDate", val)}
                        isEndDate={true}
                        presentLabel="I currently work here"
                      />
                    </div>
                  </div>

                  {/* Full WYSIWYG Editor for Achievements */}
                  <div className="field d-flex flex-column gap-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label mb-0">
                        Achievements & Key Duties
                      </label>
                      <button 
                        type="button" 
                        onClick={async () => {
                          setEnhancingExpIdx(expIdx);
                          const currentContent = Array.isArray(exp.description)
                            ? `<ul><li>${exp.description.join("</li><li>")}</li></ul>`
                            : exp.description || "";
                          const enhanced = await handleEnhanceBullet(currentContent, exp.role, exp.company);
                          handleUpdateDescriptionHtml(expIdx, enhanced);
                          setEnhancingExpIdx(null);
                        }} 
                        disabled={enhancingExpIdx === expIdx}
                        className="btn btn-sm btn-outline-info border-0 d-flex align-items-center gap-1"
                        style={{ fontSize: '0.8rem', padding: '2px 8px' }}
                      >
                        {enhancingExpIdx === expIdx ? (
                          <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enhancing...</>
                        ) : (
                          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg> Enhance with AI</>
                        )}
                      </button>
                    </div>
                    <RichTextEditor
                      value={
                        Array.isArray(exp.description)
                          ? `<ul><li>${exp.description.join("</li><li>")}</li></ul>`
                          : exp.description || ""
                      }
                      onChange={(content) =>
                        handleUpdateDescriptionHtml(expIdx, content)
                      }
                      onFocus={() => onFieldFocus("experience_bullets")}
                      onBlur={onFieldBlur}
                      placeholder="Write your accomplishments here..."
                    />
                    <span
                      className="help-prompt text-secondary mt-1 d-block"
                      style={{ fontSize: "0.76rem", fontStyle: "italic" }}
                    >
                      Pro Tip: Use the rich text editor above to format your
                      achievements with bullets, bold text, and alignments!
                    </span>
                  </div>
                </div>
                )}
                </>
              )}
            />

            <button
              className="btn btn-primary py-2 fw-semibold w-100"
              onClick={handleAddExperience}
            >
              + Add Experience Position
            </button>
          </div>
        )}
      </div>
      )}

      {/* 2b. PROJECTS */}
      {sectionOrder.includes('projects') && (
        <div data-id="projects" style={{ order: sectionOrder.indexOf('projects') !== -1 ? sectionOrder.indexOf('projects') : 99 }} draggable={draggableSectionId === 'projects'} onDragStart={(e) => handleDragStart(e, 'projects')} onDragEnter={(e) => handleDragEnter(e, 'projects')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, 'projects')} className={`form-group-card mb-3 ${activeSection === 'projects' ? 'active' : ''} ${activeDragSection === 'projects' ? 'dragging' : ''}`}>
          <div
            className="card-header d-flex align-items-center justify-content-between"
            onClick={() => toggleSection('projects')}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <h3 className="m-0 d-flex align-items-center gap-2">
              <svg className="card-header-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px', color: '#6366f1' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Projects
            </h3>
            <div className="d-flex align-items-center gap-2">
              <DragHandle sectionId="projects" />
              <button
                className="btn-repeater-delete"
                onClick={(e) => { e.stopPropagation(); handleDeleteSection("projects"); }}
                title="Delete Section"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
              <span className="card-chevron" style={{ transition: 'transform 0.2s', transform: activeSection === 'projects' ? 'rotate(180deg)' : 'none' }}>▼</span>
            </div>
          </div>

        {activeSection === 'projects' && (
          <div className="card-body d-flex flex-column gap-3">
            <SortableList
              items={formData.projects || []}
              onReorder={updateProjects}
              renderItem={(proj, projIdx) => (
                <>
                <div className="repeater-item-header d-flex align-items-center justify-content-between" onClick={() => toggleItemCollapse(proj.id || `proj-${projIdx}`)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span className="fw-medium d-flex align-items-center gap-1" style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    <SortableDragHandle />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg> Project #{projIdx + 1}: {proj.name || 'New Project'}
                  </span>
                  <div className="d-flex align-items-center gap-2"><span style={{ color: '#94a3b8', transform: expandedItems[proj.id || `proj-${projIdx}`] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', fontSize: '0.8rem' }}>▼</span><button className="btn-repeater-delete"
                    onClick={(e) => { e.stopPropagation(); handleRemoveProject(projIdx); }}
                    title="Remove Project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button></div>
                </div>
                {expandedItems[proj.id || `proj-${projIdx}`] && (
                  <div className="repeater-item-body d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">Project Name</label>
                      <input type="text" className="input-control" value={proj.name || ''} onChange={(e) => handleUpdateProject(projIdx, 'name', e.target.value)} placeholder="e.g. E-Commerce Platform" />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">Tech Stack</label>
                      <input type="text" className="input-control" value={proj.techStack || ''} onChange={(e) => handleUpdateProject(projIdx, 'techStack', e.target.value)} placeholder="e.g. React, Node.js, PostgreSQL" />
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">Start Date</label>
                      <MonthYearPicker value={proj.startDate || ''} onChange={(val) => handleUpdateProject(projIdx, 'startDate', val)} isEndDate={false} />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">End Date</label>
                      <MonthYearPicker value={proj.endDate || ''} onChange={(val) => handleUpdateProject(projIdx, 'endDate', val)} isEndDate={true} presentLabel="Ongoing project" />
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">🔗 Live URL (Optional)</label>
                      <input type="text" className="input-control" value={proj.liveUrl || ''} onChange={(e) => handleUpdateProject(projIdx, 'liveUrl', e.target.value)} placeholder="e.g. https://myapp.com" />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">💻 GitHub URL (Optional)</label>
                      <input type="text" className="input-control" value={proj.githubUrl || ''} onChange={(e) => handleUpdateProject(projIdx, 'githubUrl', e.target.value)} placeholder="e.g. github.com/user/repo" />
                    </div>
                  </div>
                  <div className="field d-flex flex-column gap-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label mb-0">Description & Key Highlights</label>
                      <button 
                        type="button" 
                        onClick={async () => {
                          setEnhancingProjIdx(projIdx);
                          const currentContent = Array.isArray(proj.description)
                            ? `<ul><li>${proj.description.join("</li><li>")}</li></ul>`
                            : proj.description || "";
                          const enhanced = await handleEnhanceBullet(currentContent, proj.title, 'Project');
                          handleUpdateProjectDescriptionHtml(projIdx, enhanced);
                          setEnhancingProjIdx(null);
                        }} 
                        disabled={enhancingProjIdx === projIdx}
                        className="btn btn-sm btn-outline-info border-0 d-flex align-items-center gap-1"
                        style={{ fontSize: '0.8rem', padding: '2px 8px' }}
                      >
                        {enhancingProjIdx === projIdx ? (
                          <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enhancing...</>
                        ) : (
                          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg> Enhance with AI</>
                        )}
                      </button>
                    </div>
                    <RichTextEditor
                      value={proj.description || ''}
                      onChange={(content) => handleUpdateProjectDescriptionHtml(projIdx, content)}
                      placeholder="Describe the project's purpose, impact, and your role..."
                    />
                  </div>
                </div>
                )}
                </>
              )}
            />
            <button className="btn btn-primary py-2 fw-semibold w-100" onClick={handleAddProject}>
              + Add Project
            </button>
          </div>
        )}
      </div>
      )}

      {/* 3. EDUCATION */}
      {sectionOrder.includes('education') && (
        <div data-id="education" style={{ order: sectionOrder.indexOf('education') !== -1 ? sectionOrder.indexOf('education') : 99 }} draggable={draggableSectionId === 'education'} onDragStart={(e) => handleDragStart(e, 'education')} onDragEnter={(e) => handleDragEnter(e, 'education')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, 'education')}
          className={`form-group-card mb-3 ${activeSection === "education" ? "active" : ""} ${activeDragSection === "education" ? "dragging" : ""}`}
        >
          <div
            className="card-header d-flex align-items-center justify-content-between"
            onClick={() => toggleSection("education")}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <h3 className="m-0 d-flex align-items-center gap-2">
              <svg
                className="card-header-icon text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ width: "20px", height: "20px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                />
              </svg>
              Education & Academic Background
            </h3>
            <div className="d-flex align-items-center gap-2">
              <DragHandle sectionId="education" />
              <button
                className="btn-repeater-delete"
                onClick={(e) => { e.stopPropagation(); handleDeleteSection("education"); }}
                title="Delete Section"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
              <span
              className="card-chevron"
              style={{
                transition: "transform 0.2s",
                transform:
                  activeSection === "education" ? "rotate(180deg)" : "none",
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {activeSection === "education" && (
          <div className="card-body d-flex flex-column gap-3">
            <SortableList
              items={formData.education}
              onReorder={updateEducation}
              renderItem={(edu, eduIdx) => (
                <>
                <div className="repeater-item-header d-flex align-items-center justify-content-between" onClick={() => toggleItemCollapse(edu.id || `edu-${eduIdx}`)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span
                    className="fw-medium text-secondary d-flex align-items-center gap-1"
                    style={{ fontSize: "0.88rem" }}
                  >
                    <SortableDragHandle />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a2 2 0 0 0-.019-3.838L12.83 4.336a2 2 0 0 0-1.66 0L2.6 7.08a2 2 0 0 0 0 3.838l9.36 4.336a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg> Education #{eduIdx + 1}: {edu.degree || "New Degree"}
                  </span>
                  <div className="d-flex align-items-center gap-2"><span style={{ color: '#94a3b8', transform: expandedItems[edu.id || `edu-${eduIdx}`] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', fontSize: '0.8rem' }}>▼</span><button className="btn-repeater-delete"
                    onClick={(e) => { e.stopPropagation(); handleRemoveEducation(eduIdx); }}
                    title="Remove Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button></div>
                </div>
                {expandedItems[edu.id || `edu-${eduIdx}`] && (
                  <div className="repeater-item-body card-body p-3 d-flex flex-column gap-3">
                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label">Degree / Certificate</label>
                    <input
                      type="text"
                      className="input-control"
                      value={edu.degree || ""}
                      onChange={(e) =>
                        handleUpdateEducationItem(
                          eduIdx,
                          "degree",
                          e.target.value,
                        )
                      }
                      placeholder="e.g. Bachelor of Science in Computer Science"
                    />
                  </div>

                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">School / University</label>
                      <input
                        type="text"
                        className="input-control"
                        value={edu.school || ""}
                        onChange={(e) =>
                          handleUpdateEducationItem(
                            eduIdx,
                            "school",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. University of Texas"
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">
                        Location (City, State/Prov)
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={edu.location || ""}
                        onChange={(e) =>
                          handleUpdateEducationItem(
                            eduIdx,
                            "location",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Austin, TX"
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">Start Date</label>
                      <MonthYearPicker
                        value={edu.startDate || ""}
                        onChange={(val) => handleUpdateEducationItem(eduIdx, "startDate", val)}
                        isEndDate={false}
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">End Date</label>
                      <MonthYearPicker
                        value={edu.endDate || ""}
                        onChange={(val) => handleUpdateEducationItem(eduIdx, "endDate", val)}
                        isEndDate={true}
                        presentLabel="Currently enrolled"
                      />
                    </div>
                  </div>

                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label">
                      Additional Details (Honors, Clubs, GPA)
                    </label>
                    <input
                      type="text"
                      className="input-control"
                      value={edu.details || ""}
                      onChange={(e) =>
                        handleUpdateEducationItem(
                          eduIdx,
                          "details",
                          e.target.value,
                        )
                      }
                      placeholder="e.g. Graduated Summa Cum Laude. Dean's List."
                    />
                  </div>
                </div>
                )}
                </>
              )}
            />

            <button
              className="btn btn-primary py-2 fw-semibold w-100"
              onClick={handleAddEducation}
            >
              + Add Education Block
            </button>
          </div>
        )}
      </div>
      )}

      {/* 4. SKILLS & CORE COMPETENCIES */}
      {sectionOrder.includes('skills') && (
        <div data-id="skills" style={{ order: sectionOrder.indexOf('skills') !== -1 ? sectionOrder.indexOf('skills') : 99 }} draggable={draggableSectionId === 'skills'} onDragStart={(e) => handleDragStart(e, 'skills')} onDragEnter={(e) => handleDragEnter(e, 'skills')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, 'skills')}
          className={`form-group-card mb-3 ${activeSection === "skills" ? "active" : ""} ${activeDragSection === "skills" ? "dragging" : ""}`}
        >
          <div
            className="card-header d-flex align-items-center justify-content-between"
            onClick={() => toggleSection("skills")}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <h3 className="m-0 d-flex align-items-center gap-2">
              <svg
                className="card-header-icon text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ width: "20px", height: "20px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Skills & Core Competencies
            </h3>
            <div className="d-flex align-items-center gap-2">
              <DragHandle sectionId="skills" />
              <button
                className="btn-repeater-delete"
                onClick={(e) => { e.stopPropagation(); handleDeleteSection("skills"); }}
                title="Delete Section"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
              <span
              className="card-chevron"
              style={{
                transition: "transform 0.2s",
                transform: activeSection === "skills" ? "rotate(180deg)" : "none",
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {activeSection === "skills" && (
          <div className="card-body d-flex flex-column gap-3">
            <SortableList
              items={formData.skills}
              onReorder={updateSkills}
              renderItem={(skill, skIdx) => (
                <>
                <div className="repeater-item-header d-flex align-items-center justify-content-between" onClick={() => toggleItemCollapse(skill.id || `sk-${skIdx}`)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span
                    className="fw-medium text-secondary d-flex align-items-center gap-1"
                    style={{ fontSize: "0.88rem" }}
                  >
                    <SortableDragHandle />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Skill Category: {skill.category || "New Category"}
                  </span>
                  <div className="d-flex align-items-center gap-2"><span style={{ color: '#94a3b8', transform: expandedItems[skill.id || `sk-${skIdx}`] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', fontSize: '0.8rem' }}>▼</span><button className="btn-repeater-delete"
                    onClick={(e) => { e.stopPropagation(); handleRemoveSkillCategory(skIdx); }}
                    title="Remove Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button></div>
                </div>
                {expandedItems[skill.id || `sk-${skIdx}`] && (
                  <div className="repeater-item-body card-body p-3 d-flex flex-column gap-3">
                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label">Category Title</label>
                    <input
                      type="text"
                      className="input-control"
                      value={skill.category || ""}
                      onChange={(e) =>
                        handleUpdateSkillCategory(skIdx, e.target.value)
                      }
                      onFocus={() => onFieldFocus("skills")}
                      onBlur={onFieldBlur}
                      placeholder="e.g. Languages or DevOps"
                    />
                  </div>

                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label">
                      Tags (Comma separated values)
                    </label>
                    <input
                      type="text"
                      className="input-control"
                      value={skill.items.join(", ") || ""}
                      onChange={(e) =>
                        handleUpdateSkillItems(skIdx, e.target.value)
                      }
                      onFocus={() => onFieldFocus("skills")}
                      onBlur={onFieldBlur}
                      placeholder="e.g. React, Next.js, Webpack, Redux"
                    />
                    <span
                      className="help-prompt text-secondary mt-1 d-block"
                      style={{ fontSize: "0.76rem", fontStyle: "italic" }}
                    >
                      Write tag entries separated by commas. We will render them
                      as neat items.
                    </span>
                  </div>
                </div>
                )}
                </>
              )}
            />

            <button
              className="btn btn-primary py-2 fw-semibold w-100"
              onClick={handleAddSkillCategory}
            >
              + Add Skill Category
            </button>
          </div>
        )}
      </div>
      )}

      {/* 5. CERTIFICATIONS */}
      {sectionOrder.includes('certifications') && (
        <div data-id="certifications" style={{ order: sectionOrder.indexOf('certifications') !== -1 ? sectionOrder.indexOf('certifications') : 99 }} draggable={draggableSectionId === 'certifications'} onDragStart={(e) => handleDragStart(e, 'certifications')} onDragEnter={(e) => handleDragEnter(e, 'certifications')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, 'certifications')}
          className={`form-group-card mb-3 ${activeSection === "certifications" ? "active" : ""} ${activeDragSection === "certifications" ? "dragging" : ""}`}
        >
          <div
            className="card-header d-flex align-items-center justify-content-between"
            onClick={() => toggleSection("certifications")}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <h3 className="m-0 d-flex align-items-center gap-2">
              <svg
                className="card-header-icon text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ width: "20px", height: "20px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"
                />
              </svg>
              Certifications & Training
            </h3>
            <div className="d-flex align-items-center gap-2">
              <DragHandle sectionId="certifications" />
              <button
                className="btn-repeater-delete"
                onClick={(e) => { e.stopPropagation(); handleDeleteSection("certifications"); }}
                title="Delete Section"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
              <span
                className="card-chevron"
                style={{
                  transition: "transform 0.2s",
                  transform:
                    activeSection === "certifications" ? "rotate(180deg)" : "none",
                }}
              >
                ▼
              </span>
            </div>
          </div>

        {activeSection === "certifications" && (
          <div className="card-body d-flex flex-column gap-3">
            <SortableList
              items={formData.certifications}
              onReorder={updateCertifications}
              renderItem={(cert, certIdx) => (
                <>
                <div className="repeater-item-header d-flex align-items-center justify-content-between" onClick={() => toggleItemCollapse(cert.id || `cert-${certIdx}`)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span
                    className="fw-medium text-secondary d-flex align-items-center gap-1"
                    style={{ fontSize: "0.88rem" }}
                  >
                    <SortableDragHandle />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg> Cert: {cert.name || "New Certification"}
                  </span>
                  <div className="d-flex align-items-center gap-2"><span style={{ color: '#94a3b8', transform: expandedItems[cert.id || `cert-${certIdx}`] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', fontSize: '0.8rem' }}>▼</span><button className="btn-repeater-delete"
                    onClick={(e) => { e.stopPropagation(); handleRemoveCertification(certIdx); }}
                    title="Remove Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button></div>
                </div>
                {expandedItems[cert.id || `cert-${certIdx}`] && (
                  <div className="repeater-item-body card-body p-3 d-flex flex-column gap-3">
                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label">Certification Name</label>
                    <input
                      type="text"
                      className="input-control"
                      value={cert.name || ""}
                      onChange={(e) =>
                        handleUpdateCertification(
                          certIdx,
                          "name",
                          e.target.value,
                        )
                      }
                      placeholder="e.g. AWS Certified Architect"
                    />
                  </div>

                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">Issuing Institution</label>
                      <input
                        type="text"
                        className="input-control"
                        value={cert.issuer || ""}
                        onChange={(e) =>
                          handleUpdateCertification(
                            certIdx,
                            "issuer",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Amazon Web Services"
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">Year of Issue</label>
                      <input
                        type="text"
                        className="input-control"
                        value={cert.date || ""}
                        onChange={(e) =>
                          handleUpdateCertification(
                            certIdx,
                            "date",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. 2024"
                      />
                    </div>
                  </div>
                </div>
                )}
                </>
              )}
            />

            <button
              className="btn btn-primary py-2 fw-semibold w-100"
              onClick={handleAddCertification}
            >
              + Add Certification
            </button>
          </div>
        )}
      </div>
      )}

      {/* 6. REFERENCES (Highly expected in Australia) */}
      {sectionOrder.includes('references') && (
        <div data-id="references" style={{ order: sectionOrder.indexOf('references') !== -1 ? sectionOrder.indexOf('references') : 99 }} draggable={draggableSectionId === 'references'} onDragStart={(e) => handleDragStart(e, 'references')} onDragEnter={(e) => handleDragEnter(e, 'references')} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, 'references')}
          className={`form-group-card mb-3 ${activeSection === "references" ? "active" : ""} ${activeDragSection === "references" ? "dragging" : ""}`}
        >
          <div
            className="card-header d-flex align-items-center justify-content-between"
            onClick={() => toggleSection("references")}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <h3 className="m-0 d-flex align-items-center gap-2">
              <svg
                className="card-header-icon text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ width: "20px", height: "20px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Professional References
            </h3>
            <div className="d-flex align-items-center gap-2">
              <DragHandle sectionId="references" />
              <button
                className="btn-repeater-delete"
                onClick={(e) => { e.stopPropagation(); handleDeleteSection("references"); }}
                title="Delete Section"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
              <span
              className="card-chevron"
              style={{
                transition: "transform 0.2s",
                transform:
                  activeSection === "references" ? "rotate(180deg)" : "none",
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {activeSection === "references" && (
          <div className="card-body d-flex flex-column gap-3">
            <SortableList
              items={formData.references}
              onReorder={updateReferences}
              renderItem={(ref, refIdx) => (
                <>
                <div className="repeater-item-header d-flex align-items-center justify-content-between" onClick={() => toggleItemCollapse(ref.id || `ref-${refIdx}`)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span
                    className="fw-medium text-secondary d-flex align-items-center gap-1"
                    style={{ fontSize: "0.88rem" }}
                  >
                    <SortableDragHandle />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Reference #{refIdx + 1}: {ref.name || "New Reference"}
                  </span>
                  <div className="d-flex align-items-center gap-2"><span style={{ color: '#94a3b8', transform: expandedItems[ref.id || `ref-${refIdx}`] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', fontSize: '0.8rem' }}>▼</span><button className="btn-repeater-delete"
                    onClick={(e) => { e.stopPropagation(); handleRemoveReference(refIdx); }}
                    title="Remove Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button></div>
                </div>
                {expandedItems[ref.id || `ref-${refIdx}`] && (
                  <div className="repeater-item-body card-body p-3 d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">Reference Name</label>
                      <input
                        type="text"
                        className="input-control"
                        value={ref.name || ""}
                        onChange={(e) =>
                          handleUpdateReference(refIdx, "name", e.target.value)
                        }
                        placeholder="e.g. Dr. Jane Carter"
                      />
                    </div>
                    <div className="field col-md-6 d-flex flex-column gap-1">
                      <label className="form-label">
                        Role / Relationship / Company
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={ref.title || ""}
                        onChange={(e) =>
                          handleUpdateReference(refIdx, "title", e.target.value)
                        }
                        placeholder="e.g. VP Engineering at Tesla"
                      />
                    </div>
                  </div>

                  <div className="field d-flex flex-column gap-1">
                    <label className="form-label">
                      Contact Info (Email / Phone)
                    </label>
                    <input
                      type="text"
                      className="input-control"
                      value={ref.contact || ""}
                      onChange={(e) =>
                        handleUpdateReference(refIdx, "contact", e.target.value)
                      }
                      placeholder="e.g. jane.carter@email.com | +1 (555) 902-1823"
                    />
                  </div>
                </div>
                )}
                </>
              )}
            />

            <button
              className="btn btn-primary py-2 fw-semibold w-100"
              onClick={handleAddReference}
            >
              + Add Reference
            </button>
          </div>
        )}
      </div>
      )}

      {/* DYNAMIC CUSTOM SECTIONS */}
      {(formData.customSections || []).map((section, sectionIdx) => (
        <div key={section.id} data-id={"custom-" + section.id} style={{ order: sectionOrder.indexOf("custom-" + section.id) !== -1 ? sectionOrder.indexOf("custom-" + section.id) : 99 }} draggable={draggableSectionId === "custom-" + section.id} onDragStart={(e) => handleDragStart(e, "custom-" + section.id)} onDragEnter={(e) => handleDragEnter(e, "custom-" + section.id)} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, "custom-" + section.id)} className={`form-group-card mb-3 ${activeSection === `custom-${section.id}` ? 'active' : ''} ${activeDragSection === "custom-" + section.id ? 'dragging' : ''}`}>
          <div
            className="card-header d-flex align-items-center justify-content-between"
            onClick={() => toggleSection(`custom-${section.id}`)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <h3 className="m-0 d-flex align-items-center gap-2">
              <svg className="card-header-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px', color: '#6366f1', flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <input
                type="text"
                className="custom-section-title-input"
                value={section.title}
                onChange={(e) => { e.stopPropagation(); handleUpdateCustomSectionTitle(sectionIdx, e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Section Title"
              />
            </h3>
            <div className="d-flex align-items-center gap-2">
              <DragHandle sectionId={"custom-" + section.id} />
              <button
                className="btn-repeater-delete"
                onClick={(e) => { e.stopPropagation(); handleRemoveCustomSection(sectionIdx); }}
                title="Remove Section"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
              <span
                className="card-chevron"
                style={{ transition: 'transform 0.2s', transform: activeSection === `custom-${section.id}` ? 'rotate(180deg)' : 'none', pointerEvents: 'none' }}
              >▼</span>
            </div>
          </div>

          {activeSection === `custom-${section.id}` && (
            <div className="card-body d-flex flex-column gap-3">
              <SortableList
                items={section.items || []}
                onReorder={(newItems) => {
                  const updatedSections = [...(formData.customSections || [])];
                  updatedSections[sectionIdx] = { ...updatedSections[sectionIdx], items: newItems };
                  updateCustomSections(updatedSections);
                }}
                renderItem={(item, itemIdx) => (
                  <>
                  <div className="repeater-item-header d-flex align-items-center justify-content-between" onClick={() => toggleItemCollapse(item.id || `custom-${section.id}-${itemIdx}`)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <span className="fw-medium d-flex align-items-center gap-1" style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      <SortableDragHandle />
                      📌 Entry #{itemIdx + 1}: {item.title || 'New Entry'}
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ color: '#94a3b8', transform: expandedItems[`custom-${section.id}-${itemIdx}`] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', fontSize: '0.8rem' }}>▼</span>
                      <button
                        className="btn-repeater-delete"
                        onClick={(e) => { e.stopPropagation(); handleRemoveCustomItem(sectionIdx, itemIdx); }}
                        title="Remove Entry"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </div>
                  {expandedItems[item.id || `custom-${section.id}-${itemIdx}`] && (
                  <div className="repeater-item-body d-flex flex-column gap-3">
                    <div className="row g-3">
                      <div className="field col-md-6 d-flex flex-column gap-1">
                        <label className="form-label">Title</label>
                        <input type="text" className="input-control" value={item.title || ''} onChange={(e) => handleUpdateCustomItem(sectionIdx, itemIdx, 'title', e.target.value)} placeholder="e.g. Project Name or Award" />
                      </div>
                      <div className="field col-md-6 d-flex flex-column gap-1">
                        <label className="form-label">Subtitle / Organization</label>
                        <input type="text" className="input-control" value={item.subtitle || ''} onChange={(e) => handleUpdateCustomItem(sectionIdx, itemIdx, 'subtitle', e.target.value)} placeholder="e.g. Company / Institution" />
                      </div>
                    </div>
                    <div className="row g-3">
                      <div className="field col-md-12 d-flex flex-column gap-1">
                        <label className="form-label">Location</label>
                        <input type="text" className="input-control" value={item.location || ''} onChange={(e) => handleUpdateCustomItem(sectionIdx, itemIdx, 'location', e.target.value)} placeholder="e.g. Remote / Austin, TX" />
                      </div>
                    </div>
                    <div className="row g-3">
                      <div className="field col-md-6 d-flex flex-column gap-1">
                        <label className="form-label">Start Date</label>
                        <MonthYearPicker value={item.startDate || ''} onChange={(val) => handleUpdateCustomItem(sectionIdx, itemIdx, 'startDate', val)} isEndDate={false} />
                      </div>
                      <div className="field col-md-6 d-flex flex-column gap-1">
                        <label className="form-label">End Date</label>
                        <MonthYearPicker value={item.endDate || ''} onChange={(val) => handleUpdateCustomItem(sectionIdx, itemIdx, 'endDate', val)} isEndDate={true} />
                      </div>
                    </div>
                    <div className="field d-flex flex-column gap-1">
                      <label className="form-label">Description</label>
                      <RichTextEditor
                        value={item.description || ''}
                        onChange={(content) => handleUpdateCustomItem(sectionIdx, itemIdx, 'description', content)}
                        placeholder="Describe achievements, details, or outcomes..."
                      />
                    </div>
                  </div>
                )}
                </>
              )}
            />
              <button className="btn btn-primary py-2 fw-semibold w-100" onClick={() => handleAddCustomItem(sectionIdx)}>
                + Add Entry
              </button>
            </div>
          )}
        </div>
      ))}

      {/* ADD SECTIONS PANEL */}
      <div style={{ order: 998, display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.1)', marginBottom: '32px' }} className="mb-4">
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Sections to Resume
        </div>
        
        {deletedSections.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
            {deletedSections.map(sec => (
              <button
                key={sec.id}
                onClick={() => {
                  setSectionOrder(prev => [...prev, sec.id]);
                  onSectionChange(sec.id);
                }}
                style={{
                  fontSize: '0.74rem',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600
                }}
                className="btn-restore-section"
              >
                <span>+</span> {sec.label}
              </button>
            ))}
          </div>
        )}
        
        <button
          onClick={handleAddCustomSection}
          style={{
            marginTop: deletedSections.length > 0 ? '8px' : '4px',
            fontSize: '0.76rem',
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          className="btn-add-custom-section"
        >
          <span>+</span> Add Custom Section
        </button>
      </div>

    </div>
  );
}
