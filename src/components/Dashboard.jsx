/**
 * @file Dashboard.jsx
 * @description The user dashboard view. Lists the user's saved resumes, provides actions to create, 
 * import, delete, or rename resumes. Communicates heavily with the Next.js API routes (`/api/resumes`).
 * @author Thabotharan Balachandran
 */
import { useState, useEffect } from 'react';
import { encryptData } from '../utils/crypto';
import ImportModal from './ImportModal';

/**
 * @function Dashboard
 * @description Renders the authenticated user's workspace, allowing them to manage their resumes.
 * @param {Object} props - The component props.
 * @param {Object} props.user - The current authenticated user session data.
 * @param {Function} props.onGoHome - Navigation callback to return to the landing page.
 * @param {Function} props.onLogout - Callback to terminate the user session.
 * @param {Function} props.onOpenProfile - Callback to open the user profile editing modal.
 * @param {Function} props.onSelectResume - Navigation callback to open a specific resume in the editor.
 * @param {Function} props.onGenerateCoverLetter - Navigation callback to trigger AI cover letter generation for a resume.
 * @param {Function} props.onStartInterview - Navigation callback to launch the AI mock interview mode for a resume.
 */
export default function Dashboard({ user, onSelectResume, onLogout, onOpenProfile, onGoHome, onGenerateCoverLetter, onStartInterview }) {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  
  // Modal states
  const [showRename, setShowRename] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  
  const [showDelete, setShowDelete] = useState(false);
  const [deletingResumeId, setDeletingResumeId] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resumes?userId=${user.email || user._id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResumes(data.resumes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResumes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreateNew = () => {
    setCreateTitle("");
    setShowCreate(true);
  };

  const submitCreateNew = async (e) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.email || user._id, title: createTitle })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowCreate(false);
      onSelectResume(data.resumeId);
    } catch (err) {
      alert("Error creating resume: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportData = async (parsedResumeData) => {
    setActionLoading(true);
    try {
      const createRes = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.email || user._id, title: 'Imported Resume' })
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error);
      
      const resumeId = createData.resumeId;
      const e2eeKey = sessionStorage.getItem('e2ee_key');
      const payloadData = e2eeKey ? encryptData(parsedResumeData, e2eeKey) : parsedResumeData;
      
      await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payloadData, isEncrypted: !!e2eeKey })
      });
      
      onSelectResume(resumeId);
    } catch (err) {
      alert("Import failed: " + err.message);
    } finally {
      setActionLoading(false);
      setIsImportModalOpen(false);
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeletingResumeId(id);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deletingResumeId) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/resumes/${deletingResumeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      setShowDelete(false);
      await fetchResumes();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
      setDeletingResumeId(null);
    }
  };

  const handleDuplicate = async (e, id) => {
    e.stopPropagation();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: 'POST' });
      if (!res.ok) throw new Error("Failed to duplicate");
      await fetchResumes();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRenameModal = (e, resume) => {
    e.stopPropagation();
    setEditingResume(resume);
    setNewTitle(resume.title);
    setShowRename(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/resumes/${editingResume._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      if (!res.ok) throw new Error("Failed to rename");
      setShowRename(false);
      await fetchResumes();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-vh-100 text-light p-4" style={{ background: 'var(--ui-bg)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background glowing orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }}></div>

      <div className="container position-relative" style={{ maxWidth: '1000px', zIndex: 1 }}>
        
        {/* Top Navbar */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
          <div className="brand" style={{ userSelect: 'none', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={onGoHome}>
            <span className="brand-jt" style={{ fontSize: '1.75rem' }}>JT</span><span className="brand-resume" style={{ fontSize: '1.75rem' }}>Resume</span>
          </div>
          <div className="d-flex align-items-center gap-3">

            <div className="position-relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              onBlur={() => setTimeout(() => setShowProfileDropdown(false), 200)}
              style={{
                background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px 6px 16px', borderRadius: '30px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)' }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)' }}
            >
              <div className="text-start">
                <div className="fw-bold text-light" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>{user.fullName}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>User</div>
              </div>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(99,102,241,0.5)', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '800', color: '#fff', flexShrink: 0,
                }}>
                  {getInitials(user.fullName)}
                </div>
              )}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showProfileDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
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
                  onMouseDown={(e) => { e.preventDefault(); onOpenProfile(); }}
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
                  onMouseDown={(e) => { e.preventDefault(); onLogout(); }}
                  style={{ padding: '10px 14px', color: '#f87171', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', transition: 'all 0.2s', fontSize: '0.9rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#fca5a5' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f87171' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Logout
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="fw-bolder mb-1 text-gradient-primary">Your Resumes</h1>
          <p className="mb-0" style={{ color: '#94a3b8' }}>Manage and tailor your resumes for different applications.</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-secondary">Loading your resumes...</p>
          </div>
        ) : (
          <div className="row g-4">
            
            {/* Create New Card */}
            <div className="col-md-4 col-sm-6">
              <div 
                className="card h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center cursor-pointer"
                style={{ 
                  minHeight: '220px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  background: 'var(--ui-card-bg)',
                  border: '2px dashed rgba(99,102,241,0.5)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)'
                }}
                onClick={handleCreateNew}
                onMouseOver={(e) => { 
                  e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; 
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.8)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(99,102,241,0.15)';
                }}
                onMouseOut={(e) => { 
                  e.currentTarget.style.background = 'var(--ui-card-bg)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 8px 16px rgba(99,102,241,0.3)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <h5 className="fw-bolder mb-1 text-light" style={{ letterSpacing: '0.5px' }}>Create New</h5>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Start a blank resume</span>
              </div>
            </div>

            {/* Import Resume / Profile Card */}
            <div className="col-md-4 col-sm-6">
              <div 
                className="card h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center cursor-pointer"
                style={{ 
                  minHeight: '220px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  background: 'var(--ui-card-bg)',
                  border: '2px dashed rgba(245, 158, 11, 0.5)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)'
                }}
                onClick={() => setIsImportModalOpen(true)}
                onMouseOver={(e) => { 
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)'; 
                  e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.8)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.15)';
                }}
                onMouseOut={(e) => { 
                  e.currentTarget.style.background = 'var(--ui-card-bg)';
                  e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <h5 className="fw-bolder mb-1 text-light" style={{ letterSpacing: '0.5px' }}>Import Data</h5>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>LinkedIn PDF, Word, or Paste</span>
              </div>
            </div>

            {/* Resume Listing */}
            {resumes.map(resume => (
              <div className="col-md-4 col-sm-6" key={resume._id}>
                <div 
                  className="card h-100 position-relative"
                  style={{ 
                    minHeight: '220px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'var(--ui-card-bg)',
                    border: '1px solid var(--ui-card-border)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(12px)',
                    overflow: 'hidden'
                  }}
                  onClick={() => onSelectResume(resume._id)}
                  onMouseOver={(e) => { 
                    e.currentTarget.style.transform = 'translateY(-6px)'; 
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.3)'; 
                    e.currentTarget.querySelector('.card-gradient-overlay').style.opacity = '1';
                  }}
                  onMouseOut={(e) => { 
                    e.currentTarget.style.transform = 'none'; 
                    e.currentTarget.style.boxShadow = 'none'; 
                    e.currentTarget.querySelector('.card-gradient-overlay').style.opacity = '0';
                  }}
                >
                  {/* Subtle top gradient line */}
                  <div className="card-gradient-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #6366f1, #a855f7)', opacity: 0, transition: 'opacity 0.3s' }}></div>

                  <div className="card-body d-flex flex-column p-4">
                    
                    {/* Resume Icon & Title */}
                    <div className="d-flex flex-column align-items-center mb-3 text-center w-100">
                      <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 12px rgba(99,102,241,0.1)', transition: 'all 0.3s' }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      </div>
                      <h5 className="fw-bolder mb-1 text-light w-100 px-1" style={{ lineHeight: '1.4', wordBreak: 'break-word', overflowWrap: 'break-word', letterSpacing: '0.3px' }}>
                        {resume.title}
                      </h5>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginTop: '6px' }}>
                        Updated {new Date(resume.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-auto d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button 
                        className="btn btn-sm px-2 py-1 action-btn"
                        onClick={(e) => openRenameModal(e, resume)}
                        disabled={actionLoading}
                        title="Rename"
                        style={{ color: '#cbd5e1', background: 'transparent', border: 'none', transition: 'all 0.2s', borderRadius: '6px' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                      <button 
                        className="btn btn-sm px-2 py-1 action-btn"
                        onClick={(e) => handleDuplicate(e, resume._id)}
                        disabled={actionLoading}
                        title="Duplicate"
                        style={{ color: '#38bdf8', background: 'transparent', border: 'none', transition: 'all 0.2s', borderRadius: '6px' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(56,189,248,0.2)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                      <button 
                        className="btn btn-sm px-2 py-1 action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateCoverLetter(resume._id);
                        }}
                        disabled={actionLoading}
                        title="Generate Cover Letter"
                        style={{ color: '#a855f7', background: 'transparent', border: 'none', transition: 'all 0.2s', borderRadius: '6px' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = '#a855f7'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </button>
                      <button 
                        className="btn btn-sm px-2 py-1 action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onStartInterview) onStartInterview(resume._id);
                        }}
                        disabled={actionLoading}
                        title="Live Interview Prep"
                        style={{ color: '#2dd4bf', background: 'transparent', border: 'none', transition: 'all 0.2s', borderRadius: '6px' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(45,212,191,0.2)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = '#2dd4bf'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      </button>
                      <button 
                        className="btn btn-sm px-2 py-1 action-btn"
                        onClick={(e) => handleDeleteClick(e, resume._id)}
                        disabled={actionLoading}
                        title="Delete"
                        style={{ color: '#f87171', background: 'transparent', border: 'none', transition: 'all 0.2s', borderRadius: '6px' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* Rename Modal */}
      {showRename && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-light" style={{ background: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold">Rename Resume</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRename(false)}></button>
              </div>
              <form onSubmit={handleRename}>
                <div className="modal-body pt-3 pb-4 px-4">
                  <input 
                    type="text" 
                    className="form-control bg-dark text-light" 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)}
                    style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}
                    autoFocus
                  />
                </div>
                <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                  <button type="button" className="btn btn-link text-secondary text-decoration-none" onClick={() => setShowRename(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 rounded-3" disabled={actionLoading || !newTitle.trim()} style={{ background: '#6366f1', border: 'none' }}>
                    {actionLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create New Modal */}
      {showCreate && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-light" style={{ background: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold">Create New Resume</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreate(false)}></button>
              </div>
              <form onSubmit={submitCreateNew}>
                <div className="modal-body pt-3 pb-4 px-4">
                  <label className="form-label text-light mb-2">Enter a title for your new resume:</label>
                  <input 
                    type="text" 
                    className="form-control bg-dark text-light" 
                    value={createTitle} 
                    onChange={e => setCreateTitle(e.target.value)}
                    placeholder="e.g. Software Engineer Resume"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}
                    autoFocus
                  />
                </div>
                <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                  <button type="button" className="btn btn-link text-secondary text-decoration-none" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 rounded-3" disabled={actionLoading || !createTitle.trim()} style={{ background: '#6366f1', border: 'none' }}>
                    {actionLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-light" style={{ background: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold text-danger">Delete Resume</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDelete(false)}></button>
              </div>
              <div className="modal-body pt-3 pb-4 px-4">
                <p className="mb-0 text-light">Are you sure you want to delete this resume? This action cannot be undone.</p>
              </div>
              <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                <button type="button" className="btn btn-link text-secondary text-decoration-none" onClick={() => setShowDelete(false)}>Cancel</button>
                <button type="button" className="btn btn-danger px-4 rounded-3" onClick={confirmDelete} disabled={actionLoading} style={{ background: '#ef4444', border: 'none' }}>
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImportData={handleImportData}
      />
    </div>
  );
}
