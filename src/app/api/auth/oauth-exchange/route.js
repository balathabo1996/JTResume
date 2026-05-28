/**
 * @file route.js
 * @description Next.js API route for handling backend logic related to route.js.
 * @author Jonathan T. Miller
 */
import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const REDIRECT_URI = `${APP_URL}/auth/callback`;

// ── Google ──────────────────────────────────────────────────────────
async function exchangeGoogle(code) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    throw new Error(tokenData.error_description || tokenData.error);
  }

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileRes.json();

  if (!profile.email) throw new Error('Google did not return an email address.');

  return {
    fullName: profile.name || profile.email.split('@')[0],
    email: profile.email,
    provider: 'google',
    avatar: profile.picture || null,
  };
}

// ── GitHub ──────────────────────────────────────────────────────────
async function exchangeGitHub(code) {
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    throw new Error(tokenData.error_description || tokenData.error);
  }

  const profileRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'JTResume-App',
    },
  });
  const profile = await profileRes.json();

  // GitHub may hide email — fetch primary email separately
  let email = profile.email;
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'JTResume-App',
      },
    });
    const emails = await emailsRes.json();
    const primary = Array.isArray(emails) && emails.find((e) => e.primary && e.verified);
    email = primary ? primary.email : (Array.isArray(emails) && emails[0]?.email);
  }

  if (!email) throw new Error('GitHub did not return a verified email address.');

  return {
    fullName: profile.name || profile.login,
    email,
    provider: 'github',
    avatar: profile.avatar_url || null,
  };
}

// ── LinkedIn ─────────────────────────────────────────────────────────
async function exchangeLinkedIn(code) {
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    throw new Error(tokenData.error_description || tokenData.error);
  }

  // LinkedIn OpenID Connect userinfo endpoint (requires openid scope)
  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileRes.json();

  const fullName =
    profile.name ||
    [profile.given_name, profile.family_name].filter(Boolean).join(' ') ||
    profile.email?.split('@')[0] ||
    'LinkedIn User';

  if (!profile.email) throw new Error('LinkedIn did not return an email address.');

  return {
    fullName,
    email: profile.email,
    provider: 'linkedin',
    avatar: profile.picture || null,
  };
}

// ── Main handler ─────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { provider, code } = await request.json();

    if (!code || !provider) {
      return NextResponse.json({ error: 'Missing provider or authorization code.' }, { status: 400 });
    }

    let userProfile;

    if (provider === 'google') {
      userProfile = await exchangeGoogle(code);
    } else if (provider === 'github') {
      userProfile = await exchangeGitHub(code);
    } else if (provider === 'linkedin') {
      userProfile = await exchangeLinkedIn(code);
    } else {
      return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    // Upsert user in MongoDB
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'jtresume';
    const db = client.db(dbName);

    const cleanEmail = userProfile.email.toLowerCase().trim();
    const existingUser = await db.collection('users').findOne({ email: cleanEmail });

    let dbUser;
    if (existingUser) {
      await db.collection('users').updateOne(
        { email: cleanEmail },
        {
          $set: {
            provider: userProfile.provider,
            avatar: userProfile.avatar,
            lastLogin: new Date(),
          },
        }
      );
      dbUser = { ...existingUser, provider: userProfile.provider, avatar: userProfile.avatar };
    } else {
      const newUser = {
        fullName: userProfile.fullName,
        email: cleanEmail,
        provider: userProfile.provider,
        avatar: userProfile.avatar,
        createdAt: new Date(),
      };
      const result = await db.collection('users').insertOne(newUser);
      dbUser = { _id: result.insertedId, ...newUser };
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: dbUser._id,
        fullName: dbUser.fullName,
        email: dbUser.email,
        provider: dbUser.provider,
        avatar: dbUser.avatar,
        createdAt: dbUser.createdAt,
      },
    });
  } catch (error) {
    console.error('OAuth exchange error:', error);
    return NextResponse.json(
      { error: error.message || 'OAuth authentication failed.' },
      { status: 500 }
    );
  }
}
