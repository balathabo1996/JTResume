/**
 * @file route.js
 * @description Next.js API route for handling backend logic related to route.js.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { loginSchema } from '../../../../utils/validators';
import { rateLimit } from '../../../../utils/rate-limit';

const limiter = rateLimit({
  uniqueTokenPerInterval: 500,
  interval: 60000 * 15, // 15 minutes
});

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const res = new NextResponse();
    await limiter.check(res, 10, ip); // Max 10 login attempts per 15 minutes
    
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, password } = validation.data;

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

    if (user.provider && user.provider !== 'credentials') {
      return NextResponse.json({ error: `This email is registered via ${user.provider}. Please sign in using ${user.provider}.` }, { status: 400 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    // Issue JWT Token
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'super-secret-jtresume-key-123';
    
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '7d' });

    const response = NextResponse.json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'Sign in successful!'
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Server error during sign in.' }, { status: 500 });
  }
}
