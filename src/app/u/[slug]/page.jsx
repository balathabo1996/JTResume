/* eslint-disable react-hooks/set-state-in-effect */
"use client";

/**
 * @file page.jsx
 * @description Source file for page.jsx.
 * @author Jonathan T. Miller
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ResumePreview from '../../../components/ResumePreview';

export default function PublicResumePage() {
  const params = useParams();
  const slug = params?.slug;

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');

  const fetchResume = useCallback(async (pwd = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/resumes/share/${slug}?password=${encodeURIComponent(pwd)}`);
      const data = await res.json();

      if (res.status === 401 && data.requiresPassword) {
        setRequiresPassword(true);
        if (pwd) setError('Incorrect password');
      } else if (!res.ok) {
        setError(data.error || 'Failed to load resume');
      } else {
        setResume(data.resume);
        setRequiresPassword(false);
      }
    } catch (err) {
      void err;
      setError('An error occurred while loading the resume.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchResume();
    }
  }, [slug, fetchResume]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password) {
      fetchResume(password);
    }
  };

  if (loading && !requiresPassword) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: '#090d16', color: '#fff' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error && !requiresPassword) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: '#090d16', color: '#fff' }}>
        <div className="text-center">
          <h2 className="mb-3 text-danger">Access Denied</h2>
          <p className="text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (requiresPassword && !resume) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: '#090d16', color: '#fff' }}>
        <div className="card shadow-lg p-4" style={{ background: '#1e293b', border: '1px solid #334155', maxWidth: '400px', width: '100%' }}>
          <h3 className="text-center mb-4" style={{ color: '#f8fafc' }}>Protected Resume</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                autoFocus
              />
            </div>
            {error && <div className="text-danger mb-3 small">{error}</div>}
            <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading}>
              {loading ? 'Verifying...' : 'View Resume'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#090d16', minHeight: '100vh', padding: '20px 0' }}>
      <div className="container-fluid d-flex justify-content-center">
        {resume && (
          <ResumePreview 
            formData={resume.data} 
            templateStyle={resume.templateStyle || 'modern'} 
            country={resume.country || 'usa'} 
            accentColor={resume.accentColor || '#4f46e5'} 
            spacingTuning={resume.spacingTuning || 'normal'}
            fontPairing={resume.fontPairing || 'modern'}
          />
        )}
      </div>
    </div>
  );
}
