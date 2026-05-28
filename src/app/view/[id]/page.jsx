"use client";
/**
 * @file page.jsx
 * @description Source file for page.jsx.
 * @author Jonathan T. Miller
 */
import { useEffect, useState, use } from 'react';
import ResumePreview from '../../../components/ResumePreview';

export default function ViewResumePage({ params }) {
  // Unwrap params using React.use() for Next.js 15+ compatibility in Client Components
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/resumes/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.resume) {
          setResumeData(data.resume);
        } else {
          setError(data.error || 'Resume not found');
        }
      })
      .catch(() => {
        setError('Failed to load resume');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-light">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-dark text-light">
        <h2 className="mb-3" style={{ color: '#f87171' }}>Resume Not Found</h2>
        <p style={{ color: '#94a3b8' }}>The resume you are looking for does not exist or the link is invalid.</p>
        <a href="/" className="btn mt-4" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 24px', fontWeight: 600, borderRadius: '8px' }}>
          Create Your Own on JTResume
        </a>
      </div>
    );
  }

  // Resume is found.
  return (
    <div className="min-vh-100 py-5 d-flex flex-column align-items-center" style={{ backgroundColor: '#0f172a' }}>
      <div className="mb-5">
        <a href="/" style={{ textDecoration: 'none', color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Build your own resume with JTResume
        </a>
      </div>
      
      <div className="w-100" style={{ maxWidth: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
        <div style={{ transform: 'scale(1)', transformOrigin: 'top center', marginBottom: '40px' }}>
          <ResumePreview 
            formData={resumeData.data || {}} 
            templateStyle={resumeData.templateStyle || 'modern'}
            accentColor={resumeData.accentColor || '#1e3a8a'}
            spacingTuning={resumeData.spacingTuning || 'normal'}
            fontPairing={resumeData.fontPairing || 'modern'}
          />
        </div>
      </div>
    </div>
  );
}
