import { NextResponse } from 'next/server';
import clientPromise from '../../../../utils/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (clientPromise) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'jtresume');
      const resume = await db.collection('resumes').findOne({ _id: new ObjectId(id) });
      if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      return NextResponse.json({ success: true, resume });
    } else {
      const dataPath = path.join(process.cwd(), 'data', 'resumes.json');
      if (fs.existsSync(dataPath)) {
        const allResumes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const resume = allResumes.find(r => r._id === id);
        if (resume) return NextResponse.json({ success: true, resume });
      }
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Fetch Resume Error:', error);
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    if (clientPromise) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'jtresume');
      
      // If we are passing the whole document including _id, remove _id from update
      delete updateData._id;

      await db.collection('resumes').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return NextResponse.json({ success: true });
    } else {
      const dataPath = path.join(process.cwd(), 'data', 'resumes.json');
      if (fs.existsSync(dataPath)) {
        let allResumes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const index = allResumes.findIndex(r => r._id === id);
        if (index > -1) {
          allResumes[index] = { ...allResumes[index], ...updateData };
          fs.writeFileSync(dataPath, JSON.stringify(allResumes, null, 2));
          return NextResponse.json({ success: true });
        }
      }
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Update Resume Error:', error);
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (clientPromise) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'jtresume');
      await db.collection('resumes').deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({ success: true });
    } else {
      const dataPath = path.join(process.cwd(), 'data', 'resumes.json');
      if (fs.existsSync(dataPath)) {
        let allResumes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        allResumes = allResumes.filter(r => r._id !== id);
        fs.writeFileSync(dataPath, JSON.stringify(allResumes, null, 2));
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Delete Resume Error:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
