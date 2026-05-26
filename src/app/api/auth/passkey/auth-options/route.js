import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import clientPromise from '../../../../../utils/mongodb';

const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'jtresume';
    const db = client.db(dbName);

    // Ensure TTL index exists on webauthn_challenges
    try {
      await db.collection('webauthn_challenges').createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 300, background: true }
      );
    } catch (_) { /* already exists */ }

    // Look up registered passkeys for this user
    const passkeys = await db.collection('passkeys')
      .find({ email: cleanEmail })
      .toArray();

    if (passkeys.length === 0) {
      return NextResponse.json(
        { error: 'No passkey registered for this account. Please register one first.', noPasskey: true },
        { status: 404 }
      );
    }

    const allowCredentials = passkeys.map((pk) => ({
      id: pk.credentialID,
      type: 'public-key',
      transports: pk.transports || ['internal'],
    }));

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      timeout: 60000,
      userVerification: 'preferred',
      allowCredentials,
    });

    // Store challenge for verification
    await db.collection('webauthn_challenges').deleteMany({
      email: cleanEmail,
      type: 'authentication',
    });

    await db.collection('webauthn_challenges').insertOne({
      email: cleanEmail,
      challenge: options.challenge,
      type: 'authentication',
      createdAt: new Date(),
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Passkey auth-options error:', error);
    return NextResponse.json({ error: 'Failed to generate authentication options.' }, { status: 500 });
  }
}
