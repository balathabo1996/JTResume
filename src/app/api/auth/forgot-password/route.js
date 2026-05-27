import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';
import nodemailer from 'nodemailer';
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

    // Send email using Nodemailer
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">JTResume Password Reset</h2>
          <p>You requested a password reset. Use the verification code below to reset your password:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
            ${verificationCode}
          </div>
          <p style="color: #6b7280; font-size: 12px; text-align: center;">This code will expire in 10 minutes.</p>
        </div>
      `;

      await transporter.sendMail({
        from: `"JTResume Security" <${gmailUser}>`,
        to: cleanEmail,
        subject: `Your JTResume Password Reset Code: ${verificationCode}`,
        html: emailHtml
      });
    } else {
      console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD is not configured. Email not sent.');
      // For local development without env vars, you might still want to log the code
      console.log('Verification Code (Development Mode):', verificationCode);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent to your email address!'
    });

  } catch (error) {
    console.error('Forgot Password API error:', error);
    return NextResponse.json({ error: 'Server error during forgot password request.' }, { status: 500 });
  }
}
