import { NextResponse } from 'next/server';
import clientPromise from '../../../../../utils/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (clientPromise) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'jtresume');
      
      const originalResume = await db.collection('resumes').findOne({ _id: new ObjectId(id) });
      if (!originalResume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

      const duplicate = { ...originalResume };
      delete duplicate._id; // Let MongoDB generate a new ID
      duplicate.title = `${duplicate.title} (Copy)`;
      duplicate.createdAt = new Date().toISOString();
      duplicate.updatedAt = new Date().toISOString();

      const result = await db.collection('resumes').insertOne(duplicate);
      return NextResponse.json({ success: true, resumeId: result.insertedId });
    } else {
      const dataPath = path.join(process.cwd(), 'data', 'resumes.json');
      if (fs.existsSync(dataPath)) {
        let allResumes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const originalResume = allResumes.find(r => r._id === id);
        if (!originalResume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

        const duplicate = { ...originalResume };
        duplicate._id = Date.now().toString();
        duplicate.title = `${duplicate.title} (Copy)`;
        duplicate.createdAt = new Date().toISOString();
        duplicate.updatedAt = new Date().toISOString();

        allResumes.push(duplicate);
        fs.writeFileSync(dataPath, JSON.stringify(allResumes, null, 2));
        return NextResponse.json({ success: true, resumeId: duplicate._id });
      }
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Duplicate Resume Error:', error);
    return NextResponse.json({ error: 'Failed to duplicate resume' }, { status: 500 });
  }
}
