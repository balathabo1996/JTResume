import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!clientPromise) {
      return NextResponse.json({ error: 'Database connection not available.' }, { status: 500 });
    }

    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'jtresume';
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Ensure the user actually has a password (they might be OAuth only, though the UI prevents this)
    if (!user.password) {
      return NextResponse.json({ error: 'This account does not use a password. Please sign in via your connected provider.' }, { status: 400 });
    }

    // Verify current password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    await usersCollection.updateOne(
      { email: cleanEmail },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json({ error: 'Server error during password change.' }, { status: 500 });
  }
}
