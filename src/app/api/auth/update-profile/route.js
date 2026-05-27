import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';

export async function POST(request) {
  try {
    const { currentEmail, fullName, email, phone } = await request.json();

    if (!currentEmail || !fullName || !email) {
      return NextResponse.json({ error: 'Name and Email are required.' }, { status: 400 });
    }

    const cleanCurrentEmail = currentEmail.toLowerCase().trim();
    const cleanNewEmail = email.toLowerCase().trim();

    if (!clientPromise) {
      return NextResponse.json({ error: 'Database connection not available.' }, { status: 500 });
    }

    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'jtresume';
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: cleanCurrentEmail });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Check if the new email is already taken by someone else
    if (cleanNewEmail !== cleanCurrentEmail) {
      const emailExists = await usersCollection.findOne({ email: cleanNewEmail });
      if (emailExists) {
        return NextResponse.json({ error: 'That email address is already in use.' }, { status: 400 });
      }
    }

    // Update the user's profile in the database
    const updateData = {
      fullName,
      email: cleanNewEmail,
      phone: phone || '',
      updatedAt: new Date()
    };

    await usersCollection.updateOne(
      { email: cleanCurrentEmail },
      { $set: updateData }
    );

    // Return the updated user without the password
    const updatedUser = await usersCollection.findOne({ email: cleanNewEmail });
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    console.error('Update profile API error:', error);
    return NextResponse.json({ error: 'Server error during profile update.' }, { status: 500 });
  }
}
