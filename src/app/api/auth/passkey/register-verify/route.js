import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import clientPromise from '../../../../../utils/mongodb';

const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

export async function POST(request) {
  try {
    const { email, fullName, credential } = await request.json();

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
      type: 'registration',
    });

    if (!challengeDoc) {
      return NextResponse.json({ error: 'Registration session expired. Please try again.' }, { status: 400 });
    }

    // Verify the registration response
    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: challengeDoc.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: false,
      });
    } catch (verifyError) {
      console.error('Verification failed:', verifyError);
      return NextResponse.json({ error: 'Passkey verification failed: ' + verifyError.message }, { status: 400 });
    }

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Passkey verification was not successful.' }, { status: 400 });
    }

    const {
      credential: verifiedCredential,
      credentialDeviceType,
      credentialBackedUp,
    } = verification.registrationInfo;

    // Delete the used challenge
    await db.collection('webauthn_challenges').deleteMany({
      email: cleanEmail,
      type: 'registration',
    });

    // Upsert user in users collection
    let user = await db.collection('users').findOne({ email: cleanEmail });
    if (!user) {
      const newUser = {
        fullName: fullName || cleanEmail.split('@')[0],
        email: cleanEmail,
        provider: 'passkey',
        createdAt: new Date(),
      };
      const result = await db.collection('users').insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };
    }

    // Store the passkey credential in MongoDB
    await db.collection('passkeys').insertOne({
      userId: user._id,
      email: cleanEmail,
      credentialID: Buffer.from(verifiedCredential.id).toString('base64url'),
      publicKey: Buffer.from(verifiedCredential.publicKey).toString('base64url'),
      counter: verifiedCredential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: credential.response?.transports || [],
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        provider: 'passkey',
        createdAt: user.createdAt,
      },
      message: 'Passkey registered and account created successfully!',
    });
  } catch (error) {
    console.error('Passkey register-verify error:', error);
    return NextResponse.json({ error: 'Server error during passkey registration.' }, { status: 500 });
  }
}
