import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    let userFound = false;

    if (clientPromise) {
      const client = await clientPromise;
      const dbName = process.env.MONGODB_DB || 'jtresume';
      const db = client.db(dbName);
      const usersCollection = db.collection('users');

      // Check if user exists
      const user = await usersCollection.findOne({ email: cleanEmail });
      if (!user) {
        return NextResponse.json({ error: 'Email address is not registered.' }, { status: 404 });
      }

      userFound = true;

      // Update user with reset code and expiry
      await usersCollection.updateOne(
        { email: cleanEmail },
        { 
          $set: { 
            resetCode: verificationCode,
            resetCodeExpiry: codeExpiry
          } 
        }
      );
    } else {
      // Fallback local file storage
      const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
      if (fs.existsSync(usersFilePath)) {
        const fileData = fs.readFileSync(usersFilePath, 'utf8');
        const users = JSON.parse(fileData || '[]');
        const userIndex = users.findIndex(u => u.email === cleanEmail);

        if (userIndex !== -1) {
          userFound = true;
          users[userIndex].resetCode = verificationCode;
          users[userIndex].resetCodeExpiry = codeExpiry.toISOString();
          fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
        }
      }

      if (!userFound) {
        return NextResponse.json({ error: 'Email address is not registered.' }, { status: 404 });
      }
    }

    // Return the code directly in the response for security and ease of use, keeping Nodemailer reserved for Contact Page.
    return NextResponse.json({ 
      success: true, 
      message: 'Verification code generated successfully!',
      code: verificationCode
    });

  } catch (error) {
    console.error('Forgot Password API error:', error);
    return NextResponse.json({ error: 'Server error during forgot password request.' }, { status: 500 });
  }
}
