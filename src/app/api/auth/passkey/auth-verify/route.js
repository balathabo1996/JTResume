import { NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import clientPromise from '../../../../../utils/mongodb';

const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

export async function POST(request) {
  try {
    const { email, credential } = await request.json();

    if (!email || !credential) {
      return NextResponse.json({ error: 'Email and credential are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'jtresume';
    const db = client.db(dbName);

    // Retrieve stored challenge
    const challengeDoc = await db.collection('webauthn_challenges').findOne({
      email: cleanEmail,
      type: 'authentication',
    });

    if (!challengeDoc) {
      return NextResponse.json({ error: 'Authentication session expired. Please try again.' }, { status: 400 });
    }

    // Find the matching passkey credential in DB
    const credentialIDFromResponse = credential.id;
    const storedPasskey = await db.collection('passkeys').findOne({
      email: cleanEmail,
      credentialID: credentialIDFromResponse,
    });

    if (!storedPasskey) {
      return NextResponse.json({ error: 'Passkey not found. Please register this device first.' }, { status: 404 });
    }

    // Verify the authentication response
    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: challengeDoc.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: storedPasskey.credentialID,
          publicKey: Buffer.from(storedPasskey.publicKey, 'base64url'),
          counter: storedPasskey.counter,
          transports: storedPasskey.transports,
        },
        requireUserVerification: false,
      });
    } catch (verifyError) {
      console.error('Auth verification failed:', verifyError);
      return NextResponse.json({ error: 'Passkey authentication failed: ' + verifyError.message }, { status: 400 });
    }

    if (!verification.verified) {
      return NextResponse.json({ error: 'Passkey authentication was not verified.' }, { status: 400 });
    }

    // Update the credential counter (replay attack protection)
    await db.collection('passkeys').updateOne(
      { _id: storedPasskey._id },
      { $set: { counter: verification.authenticationInfo.newCounter } }
    );

    // Delete the used challenge
    await db.collection('webauthn_challenges').deleteMany({
      email: cleanEmail,
      type: 'authentication',
    });

    // Fetch or create the user record
    let user = await db.collection('users').findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json({ error: 'User account not found. Please register first.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        provider: user.provider || 'passkey',
        createdAt: user.createdAt,
      },
      message: 'Passkey authentication successful!',
    });
  } catch (error) {
    console.error('Passkey auth-verify error:', error);
    return NextResponse.json({ error: 'Server error during passkey authentication.' }, { status: 500 });
  }
}
