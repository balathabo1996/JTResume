import React, { useState } from 'react';

export default function AuthPage({ onLogin, onBackToHome }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login success instantly
    onLogin();
  };

  return (
    <div className="auth-page bg-dark min-vh-100 d-flex flex-column align-items-center justify-content-center p-4">
      
      {/* Return to Home button */}
      <button 
        onClick={onBackToHome} 
        className="btn btn-link text-secondary position-absolute top-0 start-0 m-4 text-decoration-none d-flex align-items-center gap-2"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
        Back to Home
      </button>

      <div className="auth-container w-100" style={{ maxWidth: '440px' }}>
        
        {/* Brand Logo Header */}
        <div className="text-center mb-4">
          <div className="brand d-inline-block mb-3" style={{ userSelect: 'none', transform: 'scale(1.1)' }}>
            <span className="brand-jt">JT</span>
            <span className="brand-resume">Resume</span>
          </div>
          
          {authMode === 'login' && (
            <>
              <h2 className="fw-bolder text-light mb-2" style={{ letterSpacing: '-0.5px' }}>Sign in to your account</h2>
              <div className="text-secondary d-flex justify-content-center align-items-center gap-1" style={{ fontSize: '0.9rem' }}>
                <span>Don't have an account?</span>
                <span onClick={() => setAuthMode('register')} className="text-light fw-medium text-decoration-none auth-toggle-link d-inline-flex align-items-center" style={{ cursor: 'pointer' }}>
                  Create one now <svg className="auth-arrow ms-1" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </span>
              </div>
            </>
          )}

          {authMode === 'register' && (
            <>
              <h2 className="fw-bolder text-light mb-2" style={{ letterSpacing: '-0.5px' }}>Create your account</h2>
              <div className="text-secondary d-flex justify-content-center align-items-center gap-1" style={{ fontSize: '0.9rem' }}>
                <span>Already have an account?</span>
                <span onClick={() => setAuthMode('login')} className="text-light fw-medium text-decoration-none auth-toggle-link d-inline-flex align-items-center" style={{ cursor: 'pointer' }}>
                  Sign in <svg className="auth-arrow ms-1" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </span>
              </div>
            </>
          )}

          {authMode === 'forgot' && (
            <>
              <h2 className="fw-bolder text-light mb-2" style={{ letterSpacing: '-0.5px' }}>Reset your password</h2>
              <div className="text-secondary d-flex justify-content-center align-items-center gap-1" style={{ fontSize: '0.9rem' }}>
                <span>Remember your password?</span>
                <span onClick={() => setAuthMode('login')} className="text-light fw-medium text-decoration-none auth-toggle-link d-inline-flex align-items-center" style={{ cursor: 'pointer' }}>
                  <svg className="auth-arrow auth-arrow-left me-1" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Back to Sign in
                </span>
              </div>
            </>
          )}
        </div>

        {/* Auth Forms */}
        {authMode === 'forgot' ? (
          <form onSubmit={(e) => { e.preventDefault(); alert("If an account exists, a password reset link was sent!"); setAuthMode('login'); }} className="mb-4">
            <div className="mb-4">
              <label className="form-label fw-bold text-light" style={{ fontSize: '0.85rem' }}>Email Address</label>
              <input 
                type="email" 
                className="form-control auth-input py-2.5" 
                placeholder="john.doe@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <div className="form-text text-secondary mt-2" style={{ fontSize: '0.75rem' }}>
                We'll send you a secure link to reset your password.
              </div>
            </div>
            <button type="submit" className="btn btn-light w-100 fw-bold py-2.5 auth-submit-btn text-dark" style={{ fontSize: '0.95rem' }}>
              Send Reset Link
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mb-4">
            {authMode === 'register' && (
              <div className="mb-3">
                <label className="form-label fw-bold text-light" style={{ fontSize: '0.85rem' }}>Full Name</label>
                <input 
                  type="text" 
                  className="form-control auth-input py-2.5" 
                  placeholder="John Doe" 
                  required
                />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label fw-bold text-light" style={{ fontSize: '0.85rem' }}>Email Address</label>
              <input 
                type="email" 
                className="form-control auth-input py-2.5" 
                placeholder="john.doe@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              {authMode === 'login' && (
                <div className="form-text text-secondary mt-2" style={{ fontSize: '0.75rem' }}>
                  You can also use your username to login.
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-bold text-light mb-0" style={{ fontSize: '0.85rem' }}>Password</label>
                {authMode === 'login' && (
                  <button type="button" onClick={() => setAuthMode('forgot')} className="btn btn-link p-0 align-baseline text-light fw-medium text-decoration-none" style={{ fontSize: '0.8rem' }}>Forgot Password?</button>
                )}
              </div>
              <div className="position-relative">
                <input 
                  type="password" 
                  className="form-control auth-input py-2.5 pe-5" 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div className="mb-4">
                <label className="form-label fw-bold text-light mb-1" style={{ fontSize: '0.85rem' }}>Confirm Password</label>
                <input 
                  type="password" 
                  className="form-control auth-input py-2.5" 
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button type="submit" className="btn btn-light w-100 fw-bold py-2.5 auth-submit-btn text-dark" style={{ fontSize: '0.95rem' }}>
              {authMode === 'login' ? 'Sign in' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Divider */}
        {authMode !== 'forgot' && (
          <>
            <div className="d-flex align-items-center mb-4">
              <div className="flex-grow-1 border-bottom border-secondary border-opacity-25"></div>
              <span className="px-3 text-light fw-bold" style={{ fontSize: '0.8rem' }}>or continue with</span>
              <div className="flex-grow-1 border-bottom border-secondary border-opacity-25"></div>
            </div>

            {/* OAuth Buttons */}
            <div className="row g-3">
              <div className="col-6">
                <button type="button" className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 oauth-btn oauth-passkey" onClick={onLogin}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Passkey</span>
                </button>
              </div>
              <div className="col-6">
                <button type="button" className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 oauth-btn oauth-google" onClick={onLogin}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
                  <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Google</span>
                </button>
              </div>
              <div className="col-6">
                <button type="button" className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 oauth-btn oauth-github" onClick={onLogin}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                  <span className="fw-bold" style={{ fontSize: '0.9rem' }}>GitHub</span>
                </button>
              </div>
              <div className="col-6">
                <button type="button" className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 oauth-btn oauth-linkedin" onClick={onLogin}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                  <span className="fw-bold" style={{ fontSize: '0.9rem' }}>LinkedIn</span>
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
