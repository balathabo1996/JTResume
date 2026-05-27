import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { fullName, email, password, phone } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      fullName,
      email: cleanEmail,
      phone: phone || '',
      password: hashedPassword,
      createdAt: new Date()
    };

    if (clientPromise) {
      const client = await clientPromise;
      const dbName = process.env.MONGODB_DB || 'jtresume';
      const db = client.db(dbName);
      const usersCollection = db.collection('users');

      // Check if user exists
      const existingUser = await usersCollection.findOne({ email: cleanEmail });
      if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
      }

      await usersCollection.insertOne(newUser);
      return NextResponse.json({ success: true, message: 'Account created successfully!' });
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
        return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
      }

      users.push(newUser);
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
      return NextResponse.json({ success: true, message: 'Account created successfully (local fallback)!' });
    }
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Server error during registration.' }, { status: 500 });
  }
}
