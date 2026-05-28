"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import BuilderForm from './components/BuilderForm';
import ResumePreview from './components/ResumePreview';
import ComplianceScanner from './components/ComplianceScanner';
import ImportModal from './components/ImportModal';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import { generateDocx } from './utils/docxExport';

// Baseline Empty Resume state schema
const emptyResumeState = {
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    languages: "",
    summary: "",
    photoUrl: "",
    birthDate: "",
    maritalStatus: ""
  },
  workExperience: [],
  projects: [],
  education: [],
  skills: [],
  certifications: [],
  references: [],
  customSections: []
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'editor'
  const [user, setUser] = useState(null);
  
  // Profile Modal State
  const [profileOpen, setProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileMessage, setEditProfileMessage] = useState({ type: '', text: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfile, formState: { errors: profileErrors } } = useForm({ mode: 'onChange' });
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({ mode: 'onChange' });
  
  const [isInitializing, setIsInitializing] = useState(true); // Prevent flicker on reload
  const [formData, setFormData] = useState(emptyResumeState); // Empty slate by default for public deployment
  const [templateStyle, setTemplateStyle] = useState('modern');
  const [accentColor, setAccentColor] = useState('#1e3a8a'); // Default Classic Blue
  const [spacingTuning, setSpacingTuning] = useState('normal'); // 'compact' | 'normal' | 'spacious'
  const [fontPairing, setFontPairing] = useState('modern'); // 'modern' | 'editorial' | 'tech' | 'corporate'
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [focusedFieldTip, setFocusedFieldTip] = useState(null);
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Auto-save logic
  useEffect(() => {
    if (currentView === 'editor' && currentResumeId && !isInitializing) {
      const timer = setTimeout(async () => {
        setIsSaving(true);
        try {
          await fetch(`/api/resumes/${currentResumeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              data: formData,
              templateStyle,
              accentColor,
              spacingTuning,
              fontPairing
            })
          });
        } catch (e) {
          console.error("Auto-save failed", e);
        } finally {
          setIsSaving(false);
        }
      }, 1500); // 1.5s debounce
      return () => clearTimeout(timer);
    }
  }, [formData, templateStyle, accentColor, spacingTuning, fontPairing, currentResumeId, currentView, isInitializing]);

  // Persist session on reload
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setCurrentView('dashboard');
      } catch (err) {
        console.error('Failed to parse stored user session');
      }
    }
    setIsInitializing(false);
  }, []);

  // Dynamic Favicon per page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let color1 = "#f59e0b"; // Default Yellow
    let color2 = "#d97706";
    
    if (currentView === 'dashboard') {
      color1 = "#10b981"; // Emerald Green
      color2 = "#059669";
    } else if (currentView === 'editor') {
      color1 = "#3b82f6"; // Blue
      color2 = "#2563eb";
    } else if (currentView === 'landing') {
      color1 = "#f59e0b"; // Yellow
      color2 = "#d97706";
    } else if (currentView === 'auth') {
      color1 = "#ec4899"; // Pink
      color2 = "#db2777";
    }

    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <defs>
        <linearGradient id="jt-grad-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="64" fill="url(#jt-grad-dyn)" />
      <text x="128" y="176" font-family="system-ui, -apple-system, sans-serif" font-size="130" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-5">JT</text>
    </svg>`;

    const dataUrl = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
    
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = dataUrl;
  }, [currentView]);

  /* --- ADVANCED SAAS ATS SCANNER STATE & LOGIC --- */
  const [jobDescription, setJobDescription] = useState("");
  const [targetKeywords, setTargetKeywords] = useState([]);

  // Dictionary of standard high-impact ATS keywords
  const COMMON_PROFESSIONAL_KEYWORDS = [
    // Tech & Engineering
    "React", "Vue", "Angular", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Node.js", "Python", 
    "Java", "Go", "Golang", "C++", "C#", "Ruby", "PHP", "Rust", "Swift", "Kotlin", "AWS", "Azure", 
    "GCP", "Docker", "Kubernetes", "DevOps", "CI/CD", "Git", "GitHub", "SQL", "NoSQL", "PostgreSQL", 
    "MongoDB", "Redis", "Elasticsearch", "GraphQL", "REST", "APIs", "Microservices", "Serverless", 
    "Linux", "Terraform", "Ansible", "Jenkins", "Webpack", "Redux", "Tailwind", "Bootstrap", "Jest", 
    "Cypress", "Machine Learning", "AI", "Data Science", "Analytics", "Security", "Cryptography",
    
    // Agile & Project Management
    "Agile", "Scrum", "Kanban", "Product Management", "Project Management", "Jira", "Confluence", 
    "Leadership", "Mentorship", "Collaboration", "Strategy", "Roadmap", "Budgeting", "Product Launch",
    "Design", "UX", "UI", "Figma", "Marketing", "SEO", "Sales", "Business Development", "Finance", 
    "QA", "Testing", "SDLC", "Compliance", "Risk Management"
  ];

  const extractKeywords = (text) => {
    if (!text) return [];
    const matched = [];
    
    // 1. Dictionary matching (case-insensitive)
    COMMON_PROFESSIONAL_KEYWORDS.forEach(kw => {
      const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text)) {
        matched.push(kw);
      }
    });
    
    // 2. Dynamic acronym extraction (ALL CAPS words of 3-6 letters)
    const acronyms = text.match(/\b[A-Z]{3,6}\b/g) || [];
    acronyms.forEach(w => {
      if (!matched.includes(w) && !["AND", "THE", "FOR", "ITS", "NOT", "YOU", "ARE", "THEY", "THIS", "WILL"].includes(w)) {
        matched.push(w);
      }
    });

    return matched.slice(0, 15); // Return top 15 parsed keywords
  };

  const handleJobDescriptionChange = (text) => {
    setJobDescription(text);
    setTargetKeywords(extractKeywords(text));
  };

  // State-derived Keyword matcher scanning the resume details in real-time
  const getMatchedKeywords = () => {
    if (targetKeywords.length === 0) return [];
    
    let searchString = "";
    
    // Profile
    searchString += ` ${formData.personalInfo.fullName} ${formData.personalInfo.jobTitle} ${formData.personalInfo.summary}`;
    
    // Work
    formData.workExperience.forEach(exp => {
      searchString += ` ${exp.role} ${exp.company} ${exp.description}`;
    });
    
    // Education
    formData.education.forEach(edu => {
      searchString += ` ${edu.degree} ${edu.school} ${edu.details}`;
    });
    
    // Skills
    formData.skills.forEach(sk => {
      searchString += ` ${sk.category} ${sk.items.join(' ')}`;
    });
    
    // Certs
    formData.certifications.forEach(cert => {
      searchString += ` ${cert.name} ${cert.issuer}`;
    });

    return targetKeywords.filter(kw => {
      const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(searchString);
    });
  };

  const matchedKeywords = getMatchedKeywords();
  const matchPercentage = targetKeywords.length > 0 
    ? Math.round((matchedKeywords.length / targetKeywords.length) * 100) 
    : 0;

  // Accent color choices - expanded to 10 high-conversion corporate presets
  const colors = [
    { name: 'Classic Trust (Navy)', hex: '#1e3a8a' },
    { name: 'Modern Innovation (Indigo)', hex: '#4f46e5' },
    { name: 'Growth & Stability (Forest)', hex: '#064e3b' },
    { name: 'Bold Influence (Crimson)', hex: '#881337' },
    { name: 'Executive Elegance (Charcoal)', hex: '#334155' },
    { name: 'Creative Corporate (Teal)', hex: '#0d9488' },
    { name: 'Clean Tech (Steel Blue)', hex: '#0369a1' },
    { name: 'Warm Terracotta (Amber)', hex: '#b45309' },
    { name: 'Midnight Sapphire (Slate)', hex: '#0f172a' },
    { name: 'Rich Burgundy (Plum)', hex: '#701a75' }
  ];

  // SaaS Contextual Expert Tips
  const fieldTips = {
    fullName: "💡 Pro Tip: Use your standard full professional name. Avoid abbreviations or nicknames to ensure maximum ATS matching.",
    jobTitle: "💡 Pro Tip: Match your target job title exactly (e.g. 'Senior Systems Architect') to fit automated job criteria.",
    contact: "🔒 Privacy Tip: Do not include full street addresses. City, State/Province (e.g. 'Seattle, WA') is sufficient and safe.",
    summary: "💡 Style Tip: Keep summaries under 3-4 sentences. Highlight your highest impact credentials, action verbs, and core metrics.",
    sensitive: "⚠️ Compliance Risk: Do NOT add photos, birthdates, or marital details. Equal opportunity employment rules in US/CA/AU discourage these.",
    experience_bullets: "💡 Pro Tip: Quantify achievements with metrics (e.g., 'reduced load times by 40%') rather than just listing basic responsibilities.",
    skills: "💡 Formatting Tip: Group skills into categories (e.g., 'DevOps', 'Languages') and list tags separated by commas."
  };

  /* --- Data State Updaters --- */
  const updatePersonalInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateWorkExperience = (updatedList) => {
    setFormData(prev => ({ ...prev, workExperience: updatedList }));
  };

  const updateEducation = (updatedList) => {
    setFormData(prev => ({ ...prev, education: updatedList }));
  };

  const updateSkills = (updatedList) => {
    setFormData(prev => ({ ...prev, skills: updatedList }));
  };

  const updateCertifications = (updatedList) => {
    setFormData(prev => ({ ...prev, certifications: updatedList }));
  };

  const updateReferences = (updatedList) => {
    setFormData(prev => ({ ...prev, references: updatedList }));
  };

  const updateProjects = (updatedList) => {
    setFormData(prev => ({ ...prev, projects: updatedList }));
  };

  const updateCustomSections = (updatedList) => {
    setFormData(prev => ({ ...prev, customSections: updatedList }));
  };



  const handleClearData = () => {
    setFormData(emptyResumeState);
    setActiveSection(null);
  };

  // Direct PDF Export using Native Print System
  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyPublicLink = async () => {
    if (!currentResumeId) return;
    const url = `${window.location.origin}/view/${currentResumeId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };



  const handleImportData = (newData) => {
    setFormData(newData);
    setActiveSection(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProfileOpen(false);
    setIsEditingProfile(false);
    setShowPasswordForm(false);
    setPasswordMessage({ type: '', text: '' });
    resetPassword();
    setEditProfileMessage({ type: '', text: '' });
    setFormData(emptyResumeState);
    setCurrentView('landing');
  };

  const openProfileModal = () => {
    resetProfile({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' });
    setIsEditingProfile(false);
    setEditProfileMessage({ type: '', text: '' });
    setProfileOpen(true);
  };

  const handleProfileUpdate = async (data) => {
    setEditProfileMessage({ type: '', text: '' });
    setEditProfileLoading(true);

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmail: user.email,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      // Update local state and local storage
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setEditProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditingProfile(false);
        setEditProfileMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setEditProfileMessage({ type: 'danger', text: err.message });
    } finally {
      setEditProfileLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    setPasswordMessage({ type: '', text: '' });

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password.');
      }

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      resetPassword();
      setTimeout(() => setShowPasswordForm(false), 2000);
    } catch (err) {
      setPasswordMessage({ type: 'danger', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper: get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper: provider badge color
  const providerColor = { google: '#4285F4', github: '#24292e', linkedin: '#0a66c2' };
  const providerLabel = { google: 'Google', github: 'GitHub', linkedin: 'LinkedIn', email: 'Email & Password' };

  if (isInitializing) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onStartBuilder={() => setCurrentView('login')} 
        isAuthenticated={!!user}
        onSignOut={handleLogout}
        onGoToDashboard={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'login') {
    return <AuthPage onLogin={handleLoginSuccess} onBackToHome={() => setCurrentView('landing')} />;
  }

  return (
    <div className="app-root" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>

      {currentView === 'dashboard' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, overflowY: 'auto', backgroundColor: '#0f172a' }}>
          <Dashboard 
            user={user} 
            onGoHome={() => setCurrentView('landing')}
            onLogout={handleLogout}
            onOpenProfile={openProfileModal}
            onGenerateCoverLetter={(id) => {
              setCurrentResumeId(id);
              setCurrentView('coverLetter');
            }}
            onSelectResume={(id) => {
              setCurrentResumeId(id);
              setCurrentView('editor');
              fetch(`/api/resumes/${id}`)
                .then(res => res.json())
                .then(data => {
                  if (data.success && data.resume) {
                    setFormData(data.resume.data || emptyResumeState);
                    if (data.resume.templateStyle) setTemplateStyle(data.resume.templateStyle);
                    if (data.resume.accentColor) setAccentColor(data.resume.accentColor);
                    if (data.resume.spacingTuning) setSpacingTuning(data.resume.spacingTuning);
                    if (data.resume.fontPairing) setFontPairing(data.resume.fontPairing);
                  }
                });
            }} 
          />
        </div>
      )}

      {/* ── User Profile Modal ─────────────────────────────────────── */}
      {profileOpen && (
        <div
          onClick={() => setProfileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '0',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Header Cover Banner */}
            <div style={{
              height: '110px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.2 }}></div>
              <button
                onClick={() => setProfileOpen(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', fontSize: '18px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: '0 28px 28px 28px', position: 'relative', marginTop: '-42px' }}>
              
              {/* Overlapping Avatar and Action Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    style={{ width: '84px', height: '84px', borderRadius: '50%', border: '4px solid rgb(30, 41, 59)', objectFit: 'cover', background: 'rgb(30, 41, 59)' }}
                  />
                ) : (
                  <div style={{
                    width: '84px', height: '84px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                    border: '4px solid rgb(30, 41, 59)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', fontWeight: '800', color: '#fff',
                  }}>
                    {getInitials(user?.fullName)}
                  </div>
                )}

                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', fontWeight: '600', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '0' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Name & Email Info */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: '#f8fafc', fontSize: '22px', fontWeight: '800', margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>{user?.fullName || 'User'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>{user?.email}</span>
                  {user?.provider && user.provider !== 'email' && (
                    <span style={{ background: providerColor[user.provider] || '#6366f1', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                      {providerLabel[user.provider] || user.provider}
                    </span>
                  )}
                </div>
              </div>

              {editProfileMessage.text && (
                <div style={{ padding: '10px 14px', marginBottom: '20px', borderRadius: '8px', fontSize: '13px', background: editProfileMessage.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: editProfileMessage.type === 'success' ? '#34d399' : '#f87171', border: `1px solid ${editProfileMessage.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  {editProfileMessage.text}
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit(handleProfileUpdate)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Full Name</label>
                    <input
                      type="text"
                      {...registerProfile('fullName', { required: 'Full Name is required' })}
                      disabled={editProfileLoading}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${profileErrors.fullName ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#fff', fontSize: '14px', transition: 'border-color 0.2s' }}
                    />
                    {profileErrors.fullName && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{profileErrors.fullName.message}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Email Address</label>
                    <input
                      type="email"
                      {...registerProfile('email', { 
                        required: 'Email address is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      disabled={editProfileLoading}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${profileErrors.email ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#fff', fontSize: '14px', transition: 'border-color 0.2s' }}
                    />
                    {profileErrors.email && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{profileErrors.email.message}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Phone Number <span style={{ color: '#64748b', textTransform: 'none', fontWeight: '400' }}>(Optional)</span></label>
                    <input
                      type="text"
                      {...registerProfile('phone', {
                        pattern: {
                          value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
                          message: 'Invalid phone number format'
                        }
                      })}
                      disabled={editProfileLoading}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${profileErrors.phone ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#fff', fontSize: '14px', transition: 'border-color 0.2s' }}
                    />
                    {profileErrors.phone && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{profileErrors.phone.message}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        resetProfile({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' });
                        setEditProfileMessage({ type: '', text: '' });
                      }}
                      disabled={editProfileLoading}
                      style={{ flex: 1, padding: '12px', background: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                    >Cancel</button>
                    <button
                      type="submit"
                      disabled={editProfileLoading}
                      style={{ flex: 1, padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', opacity: editProfileLoading ? 0.7 : 1 }}
                    >
                      {editProfileLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                /* STATIC PROFILE DISPLAY */
                <>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</div>
                        <div style={{ color: '#f1f5f9', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>{user?.phone || '—'}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Since</div>
                        <div style={{ color: '#f1f5f9', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sign-in Method</div>
                      <div style={{ color: '#f1f5f9', fontSize: '14px', marginTop: '4px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        {providerLabel[user?.provider] || 'Email & Password'}
                      </div>
                    </div>
                  </div>

                  {/* Password Change Section (only for Email users) */}
                  {(!user?.provider || user?.provider === 'email') && (
                    <div style={{ marginTop: '20px' }}>
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        style={{
                          width: '100%', padding: '14px 16px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          color: '#e2e8f0', fontSize: '13px', fontWeight: '600',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#a5b4fc" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          Change Password
                        </div>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ transform: showPasswordForm ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showPasswordForm && (
                        <form onSubmit={handlePasswordSubmit(handlePasswordChange)} style={{ marginTop: '12px', padding: '20px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {passwordMessage.text && (
                            <div style={{ padding: '10px 12px', marginBottom: '16px', borderRadius: '8px', fontSize: '12px', background: passwordMessage.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: passwordMessage.type === 'success' ? '#34d399' : '#f87171', border: `1px solid ${passwordMessage.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                              {passwordMessage.text}
                            </div>
                          )}
                          
                          <div style={{ marginBottom: '16px' }}>
                            <input
                              type="password"
                              placeholder="Current Password"
                              {...registerPassword('currentPassword', { required: 'Current password is required' })}
                              disabled={passwordLoading}
                              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${passwordErrors.currentPassword ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#fff', fontSize: '13px', transition: 'border-color 0.2s' }}
                            />
                            {passwordErrors.currentPassword && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{passwordErrors.currentPassword.message}</span>}
                          </div>
                          <div style={{ marginBottom: '16px' }}>
                            <input
                              type="password"
                              placeholder="New Password"
                              {...registerPassword('newPassword', { 
                                required: 'New password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                                pattern: {
                                  value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
                                  message: 'Must contain an uppercase letter, a number, and a special character'
                                }
                              })}
                              disabled={passwordLoading}
                              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${passwordErrors.newPassword ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#fff', fontSize: '13px', transition: 'border-color 0.2s' }}
                            />
                            {passwordErrors.newPassword && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{passwordErrors.newPassword.message}</span>}
                          </div>
                          <div style={{ marginBottom: '20px' }}>
                            <input
                              type="password"
                              placeholder="Confirm New Password"
                              {...registerPassword('confirmPassword', { 
                                required: 'Please confirm your new password',
                                validate: (val, formValues) => val === formValues.newPassword || 'Passwords do not match'
                              })}
                              disabled={passwordLoading}
                              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${passwordErrors.confirmPassword ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#fff', fontSize: '13px', transition: 'border-color 0.2s' }}
                            />
                            {passwordErrors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{passwordErrors.confirmPassword.message}</span>}
                          </div>
                          <button
                            type="submit"
                            disabled={passwordLoading}
                            style={{
                              width: '100%', padding: '12px',
                              background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px',
                              fontWeight: '600', fontSize: '13px', cursor: passwordLoading ? 'not-allowed' : 'pointer',
                              opacity: passwordLoading ? 0.7 : 1, transition: 'opacity 0.2s'
                            }}
                          >
                            {passwordLoading ? 'Updating...' : 'Update Password'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {currentView === 'coverLetter' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, overflowY: 'hidden', backgroundColor: '#0f172a', display: 'flex' }}>
          <CoverLetterGenerator 
            resumeId={currentResumeId} 
            onBack={() => setCurrentView('dashboard')} 
            onGoHome={() => setCurrentView('landing')}
          />
        </div>
      )}

      {currentView === 'editor' && (
      <div className="app-container container-fluid p-0" style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
      {/* LEFT PANEL: The Interactive Builder Forms */}
      <div className={`app-sidebar bg-dark text-light border-end border-secondary border-opacity-25 flex-column h-100 overflow-y-auto ${mobileTab === 'editor' ? 'd-flex' : 'd-none d-lg-flex'}`}>
        
        {/* Sticky Top Sidebar Panel: Brand, Stepper, and Actions */}
        <div className="sidebar-sticky-header sticky-top shadow-sm" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0d1117 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Brand + User Avatar Header */}
          <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{ cursor: 'pointer', color: '#a5b4fc', display: 'flex', alignItems: 'center', padding: '4px' }} 
                onClick={() => setCurrentView('dashboard')}
                title="Return to Dashboard"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </div>
              <div 
                className="brand" 
                style={{ userSelect: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                onClick={() => setCurrentView('landing')}
                title="Return to Home"
              >
                <div>
                  <span className="brand-jt">JT</span><span className="brand-resume">Resume</span>
                </div>
              </div>
            </div>

            {/* User avatar button & Saving state */}
            <div className="d-flex align-items-center gap-2 position-relative">
              {isSaving && <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontStyle: 'italic', marginRight: '4px' }}>Saving...</span>}
              {user && (
                <>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    onBlur={() => setTimeout(() => setShowProfileDropdown(false), 200)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px 4px 12px', borderRadius: '30px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)' }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)' }}
                  >
                    <div className="text-start d-none d-md-block">
                      <div className="fw-bold text-light" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>{user.fullName}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>User</div>
                    </div>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(99,102,241,0.5)', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: '800', color: '#fff', flexShrink: 0,
                      }}>
                        {getInitials(user.fullName)}
                      </div>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showProfileDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div 
                      style={{
                        position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '200px',
                        background: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', padding: '8px', zIndex: 100,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
                      }}
                    >
                      <div style={{ position: 'absolute', top: '-6px', right: '30px', width: '12px', height: '12px', background: 'rgba(30, 41, 59, 0.95)', borderLeft: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }}></div>
                      
                      <button 
                        className="d-flex align-items-center gap-3 rounded-3"
                        onMouseDown={(e) => { e.preventDefault(); openProfileModal(); }}
                        style={{ padding: '10px 14px', color: '#e2e8f0', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', transition: 'all 0.2s', fontSize: '0.9rem' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e2e8f0' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Profile Settings
                      </button>
                      
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 8px' }}></div>
                      
                      <button 
                        className="d-flex align-items-center gap-3 rounded-3"
                        onMouseDown={(e) => { e.preventDefault(); handleLogout(); }}
                        style={{ padding: '10px 14px', color: '#f87171', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', transition: 'all 0.2s', fontSize: '0.9rem' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#fca5a5' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f87171' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Logout
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Step Progress Indicator Stepper */}
          <div className="px-3 pb-3">
            <div className="stepper-container d-flex align-items-center justify-content-between">
              {[
                { key: 'personal', num: 1, label: 'Profile', done: !!formData.personalInfo.fullName },
                { key: 'experience', num: 2, label: 'Work', done: formData.workExperience.length > 0 },
                { key: 'education', num: 3, label: 'Edu', done: formData.education.length > 0 },
                { key: 'skills', num: 4, label: 'Skills', done: formData.skills.length > 0 },
              ].map((step, idx) => (
                <React.Fragment key={step.key}>
                  <div className="d-flex flex-column align-items-center gap-1" style={{ flex: 1, cursor: 'pointer' }} onClick={() => setActiveSection(step.key)}>
                    <div className={`step-circle ${activeSection === step.key ? 'active' : ''} ${step.done ? 'done' : ''}`}>
                      {step.done ? '✓' : step.num}
                    </div>
                    <span className={`step-label ${activeSection === step.key ? 'active' : ''} ${step.done ? 'done' : ''}`}>{step.label}</span>
                  </div>
                  {idx < 3 && <div className={`step-line ${step.done ? 'active' : ''}`}></div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Dynamic Contextual Tip Card banner inside sticky panel */}
          {focusedFieldTip && fieldTips[focusedFieldTip] && (
            <div className="px-3 pb-2">
              <div className="m-0 py-2 px-3 rounded-3" style={{ background: 'rgba(99,102,241,0.08)', borderLeft: '3px solid #6366f1', fontSize: '0.78rem', color: '#a5b4fc' }}>
                {fieldTips[focusedFieldTip]}
              </div>
            </div>
          )}

          {/* Global Action Export & Import Panel */}
          <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              className="d-flex align-items-center justify-content-center gap-2 py-2 fw-bold w-100 rounded-3 border-0 mb-2 btn-export-pdf"
              onClick={handlePrintPDF}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Professional PDF
            </button>
            <button
              className="d-flex align-items-center justify-content-center gap-2 py-2 fw-bold w-100 rounded-3 border-0 mb-2 btn-export-pdf"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}
              onClick={() => generateDocx(formData)}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download DOCX (Word)
            </button>
            <button
              className="d-flex align-items-center justify-content-center gap-2 py-2 fw-bold w-100 rounded-3 mb-2"
              onClick={handleCopyPublicLink}
              style={{
                background: copySuccess ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                border: copySuccess ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)',
                color: copySuccess ? '#4ade80' : '#818cf8',
                transition: 'all 0.2s ease'
              }}
            >
              {copySuccess ? (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
              {copySuccess ? 'Link Copied!' : 'Copy Public Share Link'}
            </button>
            <button
              className="d-flex align-items-center justify-content-center gap-2 py-2 fw-medium w-100 rounded-3 btn-import-profile"
              onClick={() => setIsImportModalOpen(true)}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '15px', height: '15px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Resume / Import Profile
            </button>
          </div>
        </div>


        {/* Form sections */}
        <BuilderForm 
          formData={formData} 
          updatePersonalInfo={updatePersonalInfo}
          updateWorkExperience={updateWorkExperience}
          updateProjects={updateProjects}
          updateEducation={updateEducation}
          updateSkills={updateSkills}
          updateCertifications={updateCertifications}
          updateReferences={updateReferences}
          updateCustomSections={updateCustomSections}
          onClearData={handleClearData}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onFieldFocus={setFocusedFieldTip}
          onFieldBlur={() => setFocusedFieldTip(null)}
          jobDescription={jobDescription}
          onJobDescriptionChange={handleJobDescriptionChange}
        />
        
      </div>

      <div className={`app-canvas bg-dark flex-column align-items-center h-100 overflow-y-auto p-4 ${mobileTab === 'preview' ? 'd-flex' : 'd-none d-lg-flex'}`}>
        
        {/* Settings Configurations bar */}
        <div className="canvas-settings-bar mb-4 mx-auto" style={{ maxWidth: '880px', width: '100%', background: 'rgba(15,20,40,0.7)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '24px' }}>
          
          {/* Row 1: Resume Layout Templates Selector */}
          <div className="d-flex flex-column gap-3 mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', color: '#6366f1', textTransform: 'uppercase' }}>
                Step 1 — Select Resume Layout
              </span>
              <span style={{ fontSize: '0.63rem', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '999px', padding: '2px 10px', fontWeight: 600 }}>
                All ATS-Optimized
              </span>
            </div>
            <div className="row g-2">
              {[
                { id: 'classic', label: 'Classic Formal', desc: 'Traditional centered serif for finance, law, & consulting' },
                { id: 'modern', label: 'Modern Minimalist', desc: 'Sleek, highly polished standard for general corporate sectors' },
                { id: 'creative', label: 'Creative Executive', desc: 'Premium 2-column sidebar design to maximize layout hierarchy' },
                { id: 'executive', label: 'Executive Prestige', desc: 'Bold, structured corporate header layout for leadership impact' },
                { id: 'tech', label: 'Tech Minimalist', desc: 'High-density tech presentation with dynamic skill badge rows' },
                { id: 'academic', label: 'Academic Editorial', desc: 'Double-border editorial serif designed for researchers & scholars' }
              ].map(tpl => (
                <div className="col-md-4 col-sm-6" key={tpl.id}>
                  <button
                    type="button"
                    className={`template-card-btn text-start w-100 h-100 d-flex flex-column justify-content-between ${templateStyle === tpl.id ? 'active' : ''}`}
                    onClick={() => setTemplateStyle(tpl.id)}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: templateStyle === tpl.id ? '#fff' : '#e2e8f0', marginBottom: '4px' }}>{tpl.label}</div>
                    <div style={{ fontSize: '0.68rem', color: templateStyle === tpl.id ? 'rgba(255,255,255,0.92)' : '#94a3b8', lineHeight: '1.3' }}>{tpl.desc}</div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0 16px' }} />

          {/* Row 2: Aesthetic Details & Spacing */}
          <div className="row g-3">
            
            {/* Accent Color Palette Picker */}
            <div className="col-md-4 d-flex flex-column gap-2">
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', color: '#6366f1', textTransform: 'uppercase' }}>Step 2 — Theme Accent</span>
              <div className="d-flex flex-wrap gap-2 py-1">
                {colors.map(color => (
                  <button
                    key={color.name}
                    style={{
                      backgroundColor: color.hex, width: '24px', height: '24px', borderRadius: '50%',
                      border: accentColor === color.hex ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                      outline: accentColor === color.hex ? `3px solid ${color.hex}` : 'none',
                      outlineOffset: '2px',
                      boxShadow: accentColor === color.hex ? `0 0 10px ${color.hex}99` : 'inset 0 0 0 1px rgba(255,255,255,0.15)',
                      cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                    }}
                    onClick={() => setAccentColor(color.hex)}
                    title={color.name}
                  >
                    {accentColor === color.hex && (
                      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#fff', fontSize: '9px', fontWeight: 700 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Presets Selector */}
            <div className="col-md-4 d-flex flex-column gap-2">
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', color: '#6366f1', textTransform: 'uppercase' }}>Step 3 — Typography</span>
              <div className="d-grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {[
                  { id: 'modern', label: 'Modern' },
                  { id: 'editorial', label: 'Editorial' },
                  { id: 'tech', label: 'Tech Clean' },
                  { id: 'corporate', label: 'Corporate' }
                ].map(pair => (
                  <button
                    key={pair.id}
                    type="button"
                    className={`settings-pill-btn ${fontPairing === pair.id ? 'active' : ''}`}
                    onClick={() => setFontPairing(pair.id)}
                    style={{ padding: '8px 12px' }}
                  >
                    {pair.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing Fit Selector */}
            <div className="col-md-4 d-flex flex-column gap-2">
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', color: '#6366f1', textTransform: 'uppercase' }}>Step 4 — Spacing</span>
              <div className="d-flex gap-1">
                {[
                  { id: 'compact', label: 'Compact' },
                  { id: 'normal', label: 'Normal' },
                  { id: 'spacious', label: 'Open' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`settings-pill-btn ${spacingTuning === s.id ? 'active' : ''}`}
                    onClick={() => setSpacingTuning(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Realtime compliance alerts block */}
        <ComplianceScanner 
          formData={formData} 
          country="usa"
          targetKeywords={targetKeywords}
          matchedKeywords={matchedKeywords}
          matchPercentage={matchPercentage}
        />

        {/* Floating Paper Preview */}
        <div className="mt-3 mb-5 w-100 d-flex justify-content-center">
          <ResumePreview 
            formData={formData} 
            country="usa"
            templateStyle={templateStyle} 
            accentColor={accentColor}
            spacingTuning={spacingTuning}
            fontPairing={fontPairing}
          />
        </div>
      </div>

      {/* Overlay Modal for Uploading and Restoring backup files */}
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImportData={handleImportData}
      />

      {/* Mobile Bottom Navigation Bar (Visible only on lg and down) */}
      <div className="mobile-bottom-nav d-lg-none d-flex position-fixed bottom-0 start-0 w-100 bg-dark border-top border-secondary" style={{ zIndex: 1000, height: '64px' }}>
        <button 
          className={`mobile-nav-btn flex-fill d-flex flex-column align-items-center justify-content-center bg-transparent border-0 ${mobileTab === 'editor' ? 'active' : ''}`} 
          onClick={() => setMobileTab('editor')}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '22px', height: '22px', marginBottom: '2px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Editor</span>
        </button>
        <button 
          className={`mobile-nav-btn flex-fill d-flex flex-column align-items-center justify-content-center bg-transparent border-0 border-start border-secondary border-opacity-25 ${mobileTab === 'preview' ? 'active' : ''}`} 
          onClick={() => setMobileTab('preview')}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '22px', height: '22px', marginBottom: '2px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Preview</span>
        </button>
      </div>

      </div>
      )}

    </div>
  );
}

