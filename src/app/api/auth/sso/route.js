/**
 * @file route.js
 * @description API route for processing corporate single sign-on parameters and tokens.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { fullName, email, provider } = await request.json();

    if (!email || !provider || !fullName) {
      return NextResponse.json({ error: 'Missing required SSO profile fields.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let dbUser = null;

    if (clientPromise) {
      const client = await clientPromise;
      const dbName = process.env.MONGODB_DB || 'jtresume';
      const db = client.db(dbName);
      const usersCollection = db.collection('users');

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: cleanEmail });

      if (existingUser) {
        if (existingUser.provider && existingUser.provider !== provider) {
          return NextResponse.json({ error: `This email is registered with ${existingUser.provider}. Please sign in using ${existingUser.provider}.` }, { status: 400 });
        } else if (!existingUser.provider || existingUser.provider === 'credentials') {
          return NextResponse.json({ error: `This email is already registered. Please sign in with your password.` }, { status: 400 });
        }
        dbUser = existingUser;
      } else {
        // Create new cloud user record from SSO profile
        const newUser = {
          fullName,
          email: cleanEmail,
          provider,
          createdAt: new Date()
        };
        const result = await usersCollection.insertOne(newUser);
        dbUser = {
          _id: result.insertedId,
          ...newUser
        };
      }
    } else {
      // Fallback local file storage
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const usersFilePath = path.join(dataDir, 'users.json');
      let users = [];
      if (fs.existsSync(usersFilePath)) {
        const fileData = fs.readFileSync(usersFilePath, 'utf8');
        users = JSON.parse(fileData || '[]');
      }

      const existingUser = users.find(u => u.email === cleanEmail);

      if (existingUser) {
        if (existingUser.provider && existingUser.provider !== provider) {
          return NextResponse.json({ error: `This email is registered with ${existingUser.provider}. Please sign in using ${existingUser.provider}.` }, { status: 400 });
        } else if (!existingUser.provider || existingUser.provider === 'credentials') {
          return NextResponse.json({ error: `This email is already registered. Please sign in with your password.` }, { status: 400 });
        }
        dbUser = existingUser;
      } else {
        const newUser = {
          fullName,
          email: cleanEmail,
          provider,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
        dbUser = newUser;
      }
    }

    // Return the authenticated database user record
    return NextResponse.json({
      success: true,
      user: dbUser,
      message: `Signed in successfully via ${provider.toUpperCase()} (Cloud synced!)`
    });

  } catch (error) {
    console.error('SSO Authentication API error:', error);
    return NextResponse.json({ error: 'Server error during SSO authentication.' }, { status: 500 });
  }
}
