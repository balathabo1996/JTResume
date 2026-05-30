/**
 * @file ShareModal.jsx
 * @description React component rendering the ShareModal UI element.
 * @author Thabotharan Balachandran
 */
import { useState, useEffect } from 'react';

export default function ShareModal({ isOpen, onClose, currentResumeId, user }) {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [slug, setSlug] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState('');
  const [views, setViews] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchResumeData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/resumes?userId=${user.email}`);
        const data = await res.json();
        if (data.success) {
          const current = data.resumes.find(r => r._id === currentResumeId);
          if (current) {
            setResumeData(current);
            setSlug(current.slug || '');
            setIsPublic(current.isPublic || false);
            setPassword(current.password || '');
            setViews(current.views || 0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch resume settings', err);
      }
      setLoading(false);
    };

    if (isOpen && currentResumeId && user) {
      fetchResumeData();
    }
  }, [isOpen, currentResumeId, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = { ...resumeData, slug, isPublic, password };
      
      const res = await fetch(`/api/resumes/${currentResumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      if (res.ok) {
        setResumeData(updatedData);
      }
    } catch (err) {
      console.error('Failed to update share settings', err);
    }
    setSaving(false);
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/u/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
      <div className="modal-content" style={{ background: 'var(--ui-card-bg)', border: '1px solid #334155', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          ✕
        </button>
        
        <h3 className="mb-4" style={{ color: '#f8fafc', fontWeight: 600 }}>Share & Publish Resume</h3>
        
        {loading ? (
          <div className="text-center text-light py-4">Loading settings...</div>
        ) : (
          <div>
            <div className="mb-4 p-3 rounded" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ color: '#a5b4fc', fontSize: '0.9rem', fontWeight: 500 }}>Live Analytics</span>
                <span style={{ background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {views} Views
                </span>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                {views === 0 ? "Publish your resume to start tracking views!" : `${views} recruiters or hiring managers have viewed your resume.`}
              </div>
            </div>

            <div className="mb-3 form-check form-switch d-flex align-items-center gap-2">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="isPublicToggle" 
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ cursor: 'pointer', width: '40px', height: '20px' }}
              />
              <label className="form-check-label text-light" htmlFor="isPublicToggle" style={{ cursor: 'pointer', fontWeight: 500 }}>
                Publish to Web (Publicly Accessible)
              </label>
            </div>

            <div className="mb-3">
              <label className="form-label text-light mb-1" style={{ fontSize: '0.9rem' }}>Custom URL Slug</label>
              <div className="input-group">
                <span className="input-group-text" style={{ background: 'var(--ui-bg)', border: '1px solid #334155', color: '#94a3b8', borderRight: 'none' }}>
                  jtresume.com/u/
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                  style={{ background: 'var(--ui-bg)', border: '1px solid #334155', color: '#fff', borderLeft: 'none' }}
                />
              </div>
              <div className="form-text mt-1" style={{ color: '#64748b', fontSize: '0.8rem' }}>Letters, numbers, and hyphens only.</div>
            </div>

            <div className="mb-4">
              <label className="form-label text-light mb-1" style={{ fontSize: '0.9rem' }}>Password Protection (Optional)</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Leave blank for no password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: 'var(--ui-bg)', border: '1px solid #334155', color: '#fff' }}
              />
            </div>

            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary flex-grow-1 fw-bold"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              
              <button 
                className="btn btn-outline-light fw-bold"
                onClick={handleCopy}
                disabled={!isPublic}
                style={{ width: '140px', borderColor: copySuccess ? '#4ade80' : '#475569', color: copySuccess ? '#4ade80' : '#fff' }}
              >
                {copySuccess ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
