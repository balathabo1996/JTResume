/**
 * @file route.js
 * @description API route for resetting user passwords using active token references.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    let userFound = false;
    if (clientPromise) {
      const client = await clientPromise;
      const dbName = process.env.MONGODB_DB || 'jtresume';
      const db = client.db(dbName);
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ email: cleanEmail });
      if (!user) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }

      userFound = true;

      // Validate code and expiry
      if (!user.resetCode || user.resetCode !== cleanCode) {
        return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
      }

      if (!user.resetCodeExpiry || new Date() > new Date(user.resetCodeExpiry)) {
        return NextResponse.json({ error: 'Verification code has expired.' }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear code
      await usersCollection.updateOne(
        { email: cleanEmail },
        {
          $set: { password: hashedPassword },
          $unset: { resetCode: '', resetCodeExpiry: '' }
        }
      );
    } else {
      // isOffline fallback
      const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
      if (fs.existsSync(usersFilePath)) {
        const fileData = fs.readFileSync(usersFilePath, 'utf8');
        const users = JSON.parse(fileData || '[]');
        const userIndex = users.findIndex(u => u.email === cleanEmail);

        if (userIndex !== -1) {
          const user = users[userIndex];
          userFound = true;

          if (!user.resetCode || user.resetCode !== cleanCode) {
            return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
          }

          if (!user.resetCodeExpiry || new Date() > new Date(user.resetCodeExpiry)) {
            return NextResponse.json({ error: 'Verification code has expired.' }, { status: 400 });
          }

          const hashedPassword = await bcrypt.hash(newPassword, 10);
          user.password = hashedPassword;
          delete user.resetCode;
          delete user.resetCodeExpiry;

          fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
        }
      }

      if (!userFound) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully! You can now log in.' 
    });

  } catch (error) {
    console.error('Reset Password API error:', error);
    return NextResponse.json({ error: 'Server error during password reset.' }, { status: 500 });
  }
}
