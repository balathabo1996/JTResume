/**
 * @file route.js
 * @description Next.js API route for handling backend logic related to route.js.
 * @author Jonathan T. Miller
 */
import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';
import fs from 'fs';
import path from 'path';

export async function DELETE(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (clientPromise) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'jtresume');
      
      const user = await db.collection('users').findOne({ email });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      // Delete user
      await db.collection('users').deleteOne({ email });
      // Delete all associated resumes (match by email or user._id)
      await db.collection('resumes').deleteMany({
        $or: [
          { userId: email },
          { userId: user._id.toString() }
        ]
      });

      // Clear the session cookie
      const response = NextResponse.json({ success: true, message: 'Account deleted' });
      response.cookies.set({
        name: 'auth_token',
        value: '',
        httpOnly: true,
        maxAge: 0 // Expire immediately
      });

      return response;
    } else {
      // Local fallback
      const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
      const resumesFilePath = path.join(process.cwd(), 'data', 'resumes.json');
      
      if (fs.existsSync(usersFilePath)) {
        let users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
        const user = users.find(u => u.email === email);
        if (user) {
          users = users.filter(u => u.email !== email);
          fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

          if (fs.existsSync(resumesFilePath)) {
            let resumes = JSON.parse(fs.readFileSync(resumesFilePath, 'utf8'));
            resumes = resumes.filter(r => r.userId !== email && r.userId !== user._id);
            fs.writeFileSync(resumesFilePath, JSON.stringify(resumes, null, 2));
          }
          
          const response = NextResponse.json({ success: true, message: 'Account deleted' });
          response.cookies.set({
            name: 'auth_token',
            value: '',
            httpOnly: true,
            maxAge: 0 // Expire immediately
          });
          return response;
        }
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Delete Account Error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
