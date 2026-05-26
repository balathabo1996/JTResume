import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    if (clientPromise) {
      const client = await clientPromise;
      const dbName = process.env.MONGODB_DB || 'jtresume';
      const db = client.db(dbName);
      const usersCollection = db.collection('users');
      user = await usersCollection.findOne({ email: cleanEmail });
    } else {
      // Fallback local file storage
      const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
      if (fs.existsSync(usersFilePath)) {
        const fileData = fs.readFileSync(usersFilePath, 'utf8');
        const users = JSON.parse(fileData || '[]');
        user = users.find(u => u.email === cleanEmail);
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    // Return success along with the user details (except password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'Sign in successful!'
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Server error during sign in.' }, { status: 500 });
  }
}
