/**
 * @file AuthPage.jsx
 * @description React component rendering the AuthPage UI element.
 * @author Thabotharan Balachandran
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage({ onLogin, onBackToHome }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resetStep, setResetStep] = useState('email'); // 'email' | 'code'

  // react-hook-form initialization
  const { register, handleSubmit: handleHookSubmit, reset, formState: { errors } } = useForm({ mode: 'onChange' });

  const handleSendCode = async (formData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');
      if (data.code) {
        setMessage({ type: 'success', text: `Verification Code: ${data.code} (Enter this code below)` });
      } else {
        setMessage({ type: 'success', text: data.message || 'Verification code sent!' });
      }
      setResetStep('code');
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (formData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({ type: 'danger', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.resetCode, newPassword: formData.newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');
      setMessage({ type: 'success', text: data.message || 'Password reset! Switching to sign in...' });
      reset({ email: formData.email });
      setTimeout(() => { setAuthMode('login'); setResetStep('email'); setMessage({ type: '', text: '' }); }, 2000);
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (formData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      if (authMode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: 'danger', text: 'Passwords do not match.' });
          setLoading(false);
          return;
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName: formData.fullName, email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed.');
        setMessage({ type: 'success', text: data.message || 'Registration successful!' });
        reset({ email: formData.email });
        setTimeout(() => { setAuthMode('login'); setMessage({ type: '', text: '' }); }, 1500);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Sign in failed.');
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ type: 'success', text: 'Sign in successful! Entering workspace...' });
        setTimeout(() => { onLogin(data.user, formData.password); }, 800);
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Real OAuth (Google / GitHub / LinkedIn) ───────────────────────
  const handleOAuthLogin = (provider) => {
    const width = 520;
    const height = 680;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    setLoading(true);
    setMessage({ type: '', text: '' });

    const popup = window.open(
      `/auth/sso?provider=${provider}`,
      'OAuthLogin',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=no,scrollbars=no`
    );

    if (!popup) {
      setMessage({ type: 'danger', text: 'Popup blocked! Please allow popups for this site.' });
      setLoading(false);
      return;
    }

    const messageListener = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'sso_success') {
        const ssoProfile = event.data.user;
        try {
          const res = await fetch('/api/auth/sso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName: ssoProfile.fullName, email: ssoProfile.email, provider: ssoProfile.provider })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to sync session.');
          localStorage.setItem('user', JSON.stringify(data.user));
          setMessage({ type: 'success', text: data.message || `Signed in via ${provider}!` });
          setTimeout(() => { onLogin(data.user); setLoading(false); }, 800);
        } catch (err) {
          setMessage({ type: 'danger', text: err.message });
          setLoading(false);
        }
        window.removeEventListener('message', messageListener);
      }

      if (event.data?.type === 'sso_error') {
        setMessage({ type: 'danger', text: event.data.error || 'OAuth sign-in failed.' });
        setLoading(false);
        window.removeEventListener('message', messageListener);
      }
    };

    window.addEventListener('message', messageListener);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setLoading(false);
        window.removeEventListener('message', messageListener);
      }
    }, 1000);
  };

  return (
    <div className="auth-page bg-dark min-vh-100 d-flex flex-column align-items-center justify-content-center p-4">
      {/* Static Brand Logo Header */}
      <div className="text-center mb-4" style={{ zIndex: 20 }}>
        <div className="brand d-inline-block" style={{ userSelect: 'none', transform: 'scale(1.1)', cursor: 'pointer' }} onClick={onBackToHome}>
          <span className="brand-jt text-light">JT</span>
          <span className="brand-resume text-secondary">Resume</span>
        </div>
      </div>

      <motion.div 
        layout
        className="auth-card shadow-2xl d-flex p-0 overflow-hidden" 
        style={{ 
          maxWidth: '900px', 
          width: '100%', 
          minHeight: '600px', 
          flexDirection: authMode === 'register' ? 'row-reverse' : 'row' 
        }}
      >
        
        {/* Info Panel (Hidden on very small screens, visible on md+) */}
        <motion.div 
          layout="position"
          className="col-12 col-md-5 d-none d-md-flex flex-column align-items-center justify-content-center text-center p-5 position-relative" 
          style={{ background: 'linear-gradient(135deg, #2e1065 0%, #0f172a 100%)', zIndex: 10 }}
        >
          <AnimatePresence mode="wait">
            {authMode === 'register' ? (
              <motion.div key="register-info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="fw-bold text-white mb-3">Welcome Back!</h2>
                <p className="text-white-50 mb-4 px-3" style={{ fontSize: '0.95rem' }}>To keep connected with us please login with your personal info</p>
                <button className="btn btn-outline-light rounded-pill px-5 py-2 fw-bold" style={{ letterSpacing: '1px' }} onClick={() => { if (!loading) { setAuthMode('login'); setMessage({ type: '', text: '' }); } }}>SIGN IN</button>
              </motion.div>
            ) : (
              <motion.div key="login-info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="fw-bold text-white mb-3">Hello, Friend!</h2>
                <p className="text-white-50 mb-4 px-3" style={{ fontSize: '0.95rem' }}>Enter your personal details and start journey with us</p>
                <button className="btn btn-outline-light rounded-pill px-5 py-2 fw-bold" style={{ letterSpacing: '1px' }} onClick={() => { if (!loading) { setAuthMode('register'); setMessage({ type: '', text: '' }); } }}>SIGN UP</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Form Panel */}
        <motion.div 
          layout="position"
          className="col-12 col-md-7 d-flex flex-column justify-content-center px-4 py-5 p-md-5"
          style={{ backgroundColor: 'var(--ui-card-bg)', zIndex: 5 }}
        >
          {/* Dynamic Header */}
          <div className="text-center mb-4">
            <h2 className="fw-bolder text-light mb-2" style={{ letterSpacing: '-0.5px' }}>
              {authMode === 'login' ? 'Sign in to JTResume' : authMode === 'register' ? 'Create Account' : 'Reset your password'}
            </h2>
            
            {/* Mobile Only: Toggle Link */}
            <div className="d-md-none text-secondary d-flex flex-wrap justify-content-center align-items-center gap-1 text-center" style={{ fontSize: '0.9rem' }}>
              {authMode === 'login' && (
                <>
                  <span>Don't have an account?</span>
                  <span onClick={() => { if (!loading) { setAuthMode('register'); setMessage({ type: '', text: '' }); } }} className="text-light fw-medium text-decoration-none" style={{ cursor: 'pointer' }}>Create one now</span>
                </>
              )}
              {authMode === 'register' && (
                <>
                  <span>Already have an account?</span>
                  <span onClick={() => { if (!loading) { setAuthMode('login'); setMessage({ type: '', text: '' }); } }} className="text-light fw-medium text-decoration-none" style={{ cursor: 'pointer' }}>Sign in</span>
                </>
              )}
              {authMode === 'forgot' && (
                <>
                  <span>Remember your password?</span>
                  <span onClick={() => { if (!loading) { setAuthMode('login'); setMessage({ type: '', text: '' }); } }} className="text-light fw-medium text-decoration-none" style={{ cursor: 'pointer' }}>Back to Sign in</span>
                </>
              )}
            </div>
          </div>

          {/* Social OAuth Icons (only for login/register) */}
          {authMode !== 'forgot' && (
            <div className="d-flex justify-content-center gap-3 mb-4">
              <button
                type="button"
                className="btn btn-dark rounded-circle d-flex align-items-center justify-content-center border border-secondary oauth-btn"
                style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.05)' }}
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                title="Google"
              >
                 <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
              </button>
              <button
                type="button"
                className="btn btn-dark rounded-circle d-flex align-items-center justify-content-center border border-secondary oauth-btn"
                style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.05)' }}
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
                title="GitHub"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </button>
              <button
                type="button"
                className="btn btn-dark rounded-circle d-flex align-items-center justify-content-center border border-secondary oauth-btn"
                style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.05)' }}
                onClick={() => handleOAuthLogin('linkedin')}
                disabled={loading}
                title="LinkedIn"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
              </button>
            </div>
          )}

          {authMode !== 'forgot' && (
             <div className="text-center text-secondary mb-4" style={{ fontSize: '0.85rem' }}>
               or use your email account:
             </div>
          )}

          {/* Message Toast */}
          {message.text && (
            <div className={`alert alert-${message.type} py-2 px-3 rounded-3 mb-3 text-center`} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {message.text}
            </div>
          )}

          {/* Forms */}
          {authMode === 'forgot' ? (
            resetStep === 'email' ? (
              <form onSubmit={handleHookSubmit(handleSendCode)} className="mb-4">
                <div className="form-floating mb-4">
                  <input
                    type="email"
                    id="forgotEmail"
                    className={`form-control auth-input ${errors.email ? 'is-invalid' : ''}`}
                    placeholder=" "
                    {...register('email', { 
                      required: 'Email address is required',
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                    })}
                    disabled={loading}
                  />
                  <label htmlFor="forgotEmail">Email Address</label>
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  <div className="form-text text-secondary mt-2" style={{ fontSize: '0.75rem' }}>
                    We'll send you a secure 6-digit verification code.
                  </div>
                </div>
                <button type="submit" className="btn btn-light w-100 fw-bold py-2 auth-submit-btn text-dark" style={{ fontSize: '0.95rem' }} disabled={loading}>
                  {loading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleHookSubmit(handleResetPassword)} className="mb-4">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    id="resetCode"
                    className={`form-control auth-input text-center fw-bold ${errors.resetCode ? 'is-invalid' : ''}`}
                    placeholder=" "
                    maxLength={6}
                    {...register('resetCode', { required: 'Verification code is required' })}
                    disabled={loading}
                    style={{ letterSpacing: '4px', fontSize: '1.2rem' }}
                  />
                  <label htmlFor="resetCode">6-Digit Verification Code</label>
                  {errors.resetCode && <div className="invalid-feedback">{errors.resetCode.message}</div>}
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    id="resetNewPassword"
                    className={`form-control auth-input ${errors.newPassword ? 'is-invalid' : ''}`}
                    placeholder=" "
                    {...register('newPassword', { 
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      pattern: {
                        value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
                        message: 'Must contain an uppercase letter, a number, and a special character'
                      }
                    })}
                    disabled={loading}
                  />
                  <label htmlFor="resetNewPassword">New Password</label>
                  {errors.newPassword && <div className="invalid-feedback">{errors.newPassword.message}</div>}
                </div>
                <div className="form-floating mb-4">
                  <input
                    type="password"
                    id="resetConfirmPassword"
                    className={`form-control auth-input ${errors.confirmNewPassword ? 'is-invalid' : ''}`}
                    placeholder=" "
                    {...register('confirmNewPassword', { 
                      required: 'Confirm new password is required',
                      validate: (val, formValues) => val === formValues.newPassword || 'Passwords do not match'
                    })}
                    disabled={loading}
                  />
                  <label htmlFor="resetConfirmPassword">Confirm New Password</label>
                  {errors.confirmNewPassword && <div className="invalid-feedback">{errors.confirmNewPassword.message}</div>}
                </div>
                <button type="submit" className="btn btn-light w-100 fw-bold py-2 auth-submit-btn text-dark mb-3" style={{ fontSize: '0.95rem' }} disabled={loading}>
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => { if (!loading) { setResetStep('email'); setMessage({ type: '', text: '' }); } }}
                  className="btn btn-link text-secondary w-100 text-decoration-none"
                  style={{ fontSize: '0.8rem' }}
                  disabled={loading}
                >
                  Change email or request new code
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleHookSubmit(handleAuthSubmit)} className="mb-4">
              {authMode === 'register' && (
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    id="registerFullName"
                    className={`form-control auth-input ${errors.fullName ? 'is-invalid' : ''}`}
                    placeholder=" "
                    {...register('fullName', { required: authMode === 'register' ? 'Full name is required' : false })}
                    disabled={loading}
                  />
                  <label htmlFor="registerFullName">Full Name</label>
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName.message}</div>}
                </div>
              )}
              {authMode === 'register' && (
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    id="registerPhone"
                    className={`form-control auth-input ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder=" "
                    {...register('phone', {
                      pattern: {
                        value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
                        message: 'Invalid phone number format'
                      }
                    })}
                    disabled={loading}
                  />
                  <label htmlFor="registerPhone">Phone Number (Optional)</label>
                  {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                </div>
              )}
              <div className="form-floating mb-3">
                <input
                  type="email"
                  id="authEmail"
                  className={`form-control auth-input ${errors.email ? 'is-invalid' : ''}`}
                  placeholder=" "
                  {...register('email', { 
                    required: 'Email address is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                  })}
                  disabled={loading}
                />
                <label htmlFor="authEmail">Email Address</label>
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>
              <div className="form-floating mb-4">
                <input
                  type="password"
                  id="authPassword"
                  className={`form-control auth-input ${errors.password ? 'is-invalid' : ''}`}
                  placeholder=" "
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: authMode === 'register' ? { value: 8, message: 'Password must be at least 8 characters' } : undefined,
                    pattern: authMode === 'register' ? {
                      value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
                      message: 'Must contain an uppercase letter, a number, and a special character'
                    } : undefined
                  })}
                  disabled={loading}
                />
                <label htmlFor="authPassword">Password</label>
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>
              {authMode === 'login' && (
                <div className="d-flex justify-content-end mb-4 mt-n3">
                  <button type="button" onClick={() => { if (!loading) setAuthMode('forgot'); }} className="btn btn-link p-0 text-light fw-medium text-decoration-none forgot-link" style={{ fontSize: '0.8rem' }} disabled={loading}>
                    Forgot Password?
                  </button>
                </div>
              )}
              {authMode === 'register' && (
                <div className="form-floating mb-4">
                  <input
                    type="password"
                    id="registerConfirmPassword"
                    className={`form-control auth-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder=" "
                    {...register('confirmPassword', { 
                      required: authMode === 'register' ? 'Confirm password is required' : false,
                      validate: authMode === 'register' ? ((val, formValues) => val === formValues.password || 'Passwords do not match') : undefined
                    })}
                    disabled={loading}
                  />
                  <label htmlFor="registerConfirmPassword">Confirm Password</label>
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                </div>
              )}
              <button type="submit" className="btn btn-light w-100 fw-bold py-2 auth-submit-btn text-dark" style={{ fontSize: '0.95rem', borderRadius: '50px' }} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {authMode === 'login' ? 'Signing in...' : 'Creating Account...'}
                  </>
                ) : (
                  authMode === 'login' ? 'SIGN IN' : 'SIGN UP'
                )}
              </button>
            </form>
          )}

        </motion.div>
      </motion.div>
    </div>
  );
}
