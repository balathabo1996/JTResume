"use client";
import React, { useState, useEffect } from 'react';
import BuilderForm from './components/BuilderForm';
import ResumePreview from './components/ResumePreview';
import ComplianceScanner from './components/ComplianceScanner';
import ImportModal from './components/ImportModal';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import { mockResumeData } from './data/mockResumeData';

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
  const [editProfileForm, setEditProfileForm] = useState({ fullName: '', email: '', phone: '' });
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileMessage, setEditProfileMessage] = useState({ type: '', text: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  
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

  // Persist session on reload
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setCurrentView('editor');
      } catch (err) {
        console.error('Failed to parse stored user session');
      }
    }
    setIsInitializing(false);
  }, []);

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

  const handleResetToMock = () => {
    setFormData(mockResumeData);
    setActiveSection(null);
  };

  const handleClearData = () => {
    setFormData(emptyResumeState);
    setActiveSection(null);
  };

  // Direct PDF Export using Native Print System
  const handlePrintPDF = () => {
    window.print();
  };



  const handleImportData = (newData) => {
    setFormData(newData);
    setActiveSection(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('editor');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProfileOpen(false);
    setIsEditingProfile(false);
    setShowPasswordForm(false);
    setPasswordMessage({ type: '', text: '' });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setEditProfileMessage({ type: '', text: '' });
    setFormData(emptyResumeState);
    setCurrentView('landing');
  };

  const openProfileModal = () => {
    setEditProfileForm({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' });
    setIsEditingProfile(false);
    setEditProfileMessage({ type: '', text: '' });
    setProfileOpen(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setEditProfileMessage({ type: '', text: '' });
    setEditProfileLoading(true);

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmail: user.email,
          fullName: editProfileForm.fullName,
          email: editProfileForm.email,
          phone: editProfileForm.phone
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'danger', text: 'New password must be at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password.');
      }

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
  const providerColor = { google: '#4285F4', github: '#24292e', linkedin: '#0a66c2', passkey: '#6366f1' };
  const providerLabel = { google: 'Google', github: 'GitHub', linkedin: 'LinkedIn', passkey: 'Passkey', email: 'Email & Password' };

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
    return <LandingPage onStartBuilder={() => setCurrentView('login')} />;
  }

  if (currentView === 'login') {
    return <AuthPage onLogin={handleLoginSuccess} onBackToHome={() => setCurrentView('landing')} />;
  }

  return (
    <div className="app-container container-fluid p-0">

      {/* ── User Profile Modal ─────────────────────────────────────── */}
      {profileOpen && (
        <div
          onClick={() => setProfileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '24px',
              padding: '0',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Header banner */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              padding: '32px 28px 20px 28px',
              position: 'relative',
            }}>
              <button
                onClick={() => setProfileOpen(false)}
                style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
              >✕</button>

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    border: '3px solid rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', fontWeight: '800', color: '#fff',
                  }}>
                    {getInitials(user?.fullName)}
                  </div>
                )}
                <div>
                  <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px', lineHeight: 1.2 }}>{user?.fullName || 'User'}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '4px' }}>{user?.email}</div>
                  {user?.provider && user.provider !== 'email' && (
                    <span style={{
                      display: 'inline-block', marginTop: '6px',
                      background: providerColor[user.provider] || '#6366f1',
                      color: '#fff', fontSize: '11px', fontWeight: '600',
                      padding: '2px 10px', borderRadius: '999px',
                    }}>
                      via {providerLabel[user.provider] || user.provider}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px' }}>

              {editProfileMessage.text && (
                <div style={{ padding: '10px', marginBottom: '16px', borderRadius: '6px', fontSize: '12px', background: editProfileMessage.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: editProfileMessage.type === 'success' ? '#10b981' : '#f87171', border: `1px solid ${editProfileMessage.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  {editProfileMessage.text}
                </div>
              )}

              {isEditingProfile ? (
                /* EDIT PROFILE FORM */
                <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: '600', textTransform: 'uppercase' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={editProfileForm.fullName}
                      onChange={(e) => setEditProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={editProfileLoading}
                      style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: '600', textTransform: 'uppercase' }}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={editProfileForm.email}
                      onChange={(e) => setEditProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={editProfileLoading}
                      style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: '600', textTransform: 'uppercase' }}>Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={editProfileForm.phone}
                      onChange={(e) => setEditProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={editProfileLoading}
                      style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditProfileForm({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' });
                        setEditProfileMessage({ type: '', text: '' });
                      }}
                      disabled={editProfileLoading}
                      style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontWeight: '600', fontSize: '13px' }}
                    >Cancel</button>
                    <button
                      type="submit"
                      disabled={editProfileLoading}
                      style={{ flex: 2, padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', opacity: editProfileLoading ? 0.7 : 1 }}
                    >
                      {editProfileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                /* STATIC PROFILE DISPLAY */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      style={{ background: 'none', border: 'none', color: '#a5b4fc', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Edit Profile
                    </button>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</div>
                      <div style={{ color: '#e2e8f0', fontSize: '14px', marginTop: '2px' }}>{user?.fullName || '—'}</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
                      <div style={{ color: '#e2e8f0', fontSize: '14px', marginTop: '2px' }}>{user?.email || '—'}</div>
                    </div>
                  </div>

                  {user?.phone && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</div>
                        <div style={{ color: '#e2e8f0', fontSize: '14px', marginTop: '2px' }}>{user.phone}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sign-in Method</div>
                      <div style={{ color: '#e2e8f0', fontSize: '14px', marginTop: '2px' }}>{providerLabel[user?.provider] || 'Email & Password'}</div>
                    </div>
                  </div>

                  {user?.createdAt && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Since</div>
                        <div style={{ color: '#e2e8f0', fontSize: '14px', marginTop: '2px' }}>{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Password Change Section (only for Email users) */}
              {(!user?.provider || user?.provider === 'email') && (
                <div style={{ marginBottom: '24px' }}>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    style={{
                      width: '100%', padding: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#e2e8f0', fontSize: '13px', fontWeight: '600',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Change Password
                    </div>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ transform: showPasswordForm ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} style={{ marginTop: '12px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {passwordMessage.text && (
                        <div style={{ padding: '10px', marginBottom: '12px', borderRadius: '6px', fontSize: '12px', background: passwordMessage.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: passwordMessage.type === 'success' ? '#10b981' : '#f87171', border: `1px solid ${passwordMessage.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                          {passwordMessage.text}
                        </div>
                      )}
                      
                      <div style={{ marginBottom: '12px' }}>
                        <input
                          type="password"
                          placeholder="Current Password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          disabled={passwordLoading}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <input
                          type="password"
                          placeholder="New Password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          disabled={passwordLoading}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          disabled={passwordLoading}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        style={{
                          width: '100%', padding: '10px',
                          background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px',
                          fontWeight: '600', fontSize: '13px', cursor: passwordLoading ? 'not-allowed' : 'pointer',
                          opacity: passwordLoading ? 0.7 : 1
                        }}
                      >
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Logout button */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '13px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '12px',
                  color: '#f87171', fontWeight: '700', fontSize: '14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT PANEL: The Interactive Builder Forms */}
      <div className={`app-sidebar bg-dark text-light border-end border-secondary border-opacity-25 flex-column h-100 overflow-y-auto ${mobileTab === 'editor' ? 'd-flex' : 'd-none d-lg-flex'}`}>
        
        {/* Sticky Top Sidebar Panel: Brand, Stepper, and Actions */}
        <div className="sidebar-sticky-header sticky-top shadow-sm" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0d1117 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Brand + User Avatar Header */}
          <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-3">
            <div 
              className="brand" 
              style={{ userSelect: 'none', cursor: 'pointer' }} 
              onClick={() => setCurrentView('landing')}
              title="Return to Home"
            >
              <span className="brand-jt">JT</span>
              <span className="brand-resume">Resume</span>
            </div>

            {/* User avatar button */}
            {user && (
              <button
                onClick={openProfileModal}
                title={`Signed in as ${user.fullName}`}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(99,102,241,0.5)', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    border: '2px solid rgba(99,102,241,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '800', color: '#fff', flexShrink: 0,
                  }}>
                    {getInitials(user.fullName)}
                  </div>
                )}
              </button>
            )}
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

        {/* Welcome Onboarding widget */}
        <div className="mx-3 my-3 p-3 rounded-3 welcome-widget">
          <div className="fw-bold mb-2 d-flex align-items-center gap-2 welcome-widget-title">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Welcome to JTResume!
          </div>
          <ul className="list-unstyled mb-3 d-flex flex-column gap-1 welcome-list">
            <li className="d-flex align-items-start gap-2">
              <span style={{ color: '#6366f1', marginTop: '1px', flexShrink: 0 }}>▸</span> 
              <span>Type in fields or click <strong>Upload Resume</strong> to import your profile.</span>
            </li>
            <li className="d-flex align-items-start gap-2">
              <span style={{ color: '#6366f1', marginTop: '1px', flexShrink: 0 }}>▸</span> 
              <span>Pick a template, color & font for a pro look.</span>
            </li>
            <li className="d-flex align-items-start gap-2">
              <span style={{ color: '#6366f1', marginTop: '1px', flexShrink: 0 }}>▸</span> 
              <span>Export ATS-optimized PDFs in one click.</span>
            </li>
          </ul>
          <div className="d-flex flex-column gap-2">
            <div className="d-flex gap-2">
              <button
                className="flex-grow-1 py-2 rounded-3 border-0 fw-bold d-inline-flex align-items-center justify-content-center gap-1 btn-demo-profile"
                onClick={handleResetToMock}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px', flexShrink: 0 }}>
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                Load Demo Profile
              </button>
              <button
                className="flex-grow-1 py-2 rounded-3 fw-bold d-inline-flex align-items-center justify-content-center gap-1 btn-clear-all"
                onClick={handleClearData}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px', flexShrink: 0 }}>
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Clear All
              </button>
            </div>
            <div className="text-center py-1 rounded-pill privacy-badge">
              100% Private & Browser-Local
            </div>
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
          onResetToMock={handleResetToMock}
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
            onLoadDemo={handleResetToMock}
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
  );
}


