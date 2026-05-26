import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import clientPromise from '../../../../../utils/mongodb';

const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const RP_NAME = process.env.WEBAUTHN_RP_NAME || 'JTResume';

export async function POST(request) {
  try {
    const { email, fullName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'jtresume';
    const db = client.db(dbName);

    // Ensure TTL index exists on webauthn_challenges (expires after 5 minutes)
    try {
      await db.collection('webauthn_challenges').createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 300, background: true }
      );
    } catch (_) { /* index may already exist */ }

    // Get existing credentials to exclude from re-registration
    const existingPasskeys = await db.collection('passkeys')
      .find({ email: cleanEmail })
      .toArray();

    const excludeCredentials = existingPasskeys.map((pk) => ({
      id: pk.credentialID,
      type: 'public-key',
      transports: pk.transports || [],
    }));

    // Generate a stable user ID from email (base64url-encoded)
    const userIDBuffer = Buffer.from(cleanEmail);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: userIDBuffer,
      userName: cleanEmail,
      userDisplayName: fullName || cleanEmail,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform', // uses device biometrics (Windows Hello, Touch ID, etc.)
      },
      supportedAlgorithmIDs: [-7, -257], // ES256 + RS256
    });

    // Store the challenge in MongoDB (TTL will auto-expire in 5 min)
    await db.collection('webauthn_challenges').deleteMany({
      email: cleanEmail,
      type: 'registration',
    });

    await db.collection('webauthn_challenges').insertOne({
      email: cleanEmail,
      challenge: options.challenge,
      type: 'registration',
      createdAt: new Date(),
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Passkey register-options error:', error);
    return NextResponse.json({ error: 'Failed to generate registration options.' }, { status: 500 });
  }
}
