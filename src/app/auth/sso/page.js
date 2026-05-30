/* global process */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

/**
 * @file page.js
 * @description Source file for page.js.
 * @author Thabotharan Balachandran
 */
import { useEffect, useState } from 'react';

export default function SSOPage() {
  const [status, setStatus] = useState('Connecting to provider...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get('provider');

    if (!provider || !['google', 'github', 'linkedin'].includes(provider)) {
      setStatus('Unknown provider. Please close this window.');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    let oauthUrl = '';

    if (provider === 'google') {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
        setStatus('Google OAuth is not configured yet. See .env file.');
        return;
      }
      oauthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&state=google` +
        `&access_type=online` +
        `&prompt=select_account`;
    }

    if (provider === 'github') {
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      if (!clientId || clientId === 'YOUR_GITHUB_CLIENT_ID') {
        setStatus('GitHub OAuth is not configured yet. See .env file.');
        return;
      }
      oauthUrl =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=user%3Aemail` +
        `&state=github`;
    }

    if (provider === 'linkedin') {
      const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
      if (!clientId || clientId === 'YOUR_LINKEDIN_CLIENT_ID') {
        setStatus('LinkedIn OAuth is not configured yet. See .env file.');
        return;
      }
      oauthUrl =
        `https://www.linkedin.com/oauth/v2/authorization` +
        `?response_type=code` +
        `&client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&state=linkedin`;
    }

    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b0f19',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        gap: '16px',
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
