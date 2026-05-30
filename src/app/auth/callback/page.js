/* eslint-disable react-hooks/set-state-in-effect */
'use client';

/**
 * @file page.js
 * @description Source file for page.js.
 * @author Thabotharan Balachandran
 */
import { useEffect, useState } from 'react';

export default function OAuthCallbackPage() {
  const [status, setStatus] = useState({ text: 'Completing sign-in...', ok: true });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state'); // provider name: 'google' | 'github' | 'linkedin'
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    // OAuth error (e.g. user cancelled)
    if (error) {
      const msg = errorDescription || error || 'Access denied by user.';
      setStatus({ text: msg, ok: false });
      if (window.opener) {
        window.opener.postMessage({ type: 'sso_error', error: msg }, window.location.origin);
      }
      setTimeout(() => window.close(), 2000);
      return;
    }

    if (!code || !state) {
      setStatus({ text: 'Invalid OAuth response.', ok: false });
      setTimeout(() => window.close(), 2000);
      return;
    }

    // Exchange the authorization code for user profile via our server-side API
    fetch('/api/auth/oauth-exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: state, code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);

        if (window.opener) {
          window.opener.postMessage({ type: 'sso_success', user: data.user }, window.location.origin);
        }
        setStatus({ text: '✓ Signed in successfully!', ok: true });
        setTimeout(() => window.close(), 800);
      })
      .catch((err) => {
        const msg = err.message || 'OAuth authentication failed.';
        setStatus({ text: msg, ok: false });
        if (window.opener) {
          window.opener.postMessage({ type: 'sso_error', error: msg }, window.location.origin);
        }
        setTimeout(() => window.close(), 2500);
      });
  }, []);

  const isSuccess = status.ok && status.text.includes('✓');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b0f19',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px',
        gap: '16px',
      }}
    >
      {isSuccess ? (
        <div style={{ fontSize: '48px', color: '#10b981' }}>✓</div>
      ) : status.ok ? (
        <div
          style={{
            width: '40px', height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        <div style={{ fontSize: '36px', color: '#ef4444' }}>✕</div>
      )}

      <p
        style={{
          color: isSuccess ? '#10b981' : status.ok ? '#94a3b8' : '#f87171',
          fontSize: '14px',
          margin: 0,
          textAlign: 'center',
          maxWidth: '300px',
        }}
      >
        {status.text}
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
