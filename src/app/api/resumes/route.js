/**
 * @file route.js
 * @description Next.js API route for handling backend logic related to route.js.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import clientPromise from '../../../utils/mongodb';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (clientPromise) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'jtresume');
      const resumes = await db.collection('resumes').find({ userId }).sort({ updatedAt: -1 }).toArray();
      
      // Auto-generate slugs for old resumes that don't have them
      const generateSlug = () => Math.random().toString(36).substring(2, 8);
      
      const updatedResumes = await Promise.all(resumes.map(async (resume) => {
        if (!resume.slug) {
          const newSlug = generateSlug();
          await db.collection('resumes').updateOne({ _id: resume._id }, { $set: { slug: newSlug, isPublic: false, password: "", views: 0 } });
          return { ...resume, slug: newSlug, isPublic: false, password: "", views: 0 };
        }
        return resume;
      }));
      
      return NextResponse.json({ success: true, resumes: updatedResumes });
    } else {
      // Local fallback
      const dataPath = path.join(process.cwd(), 'data', 'resumes.json');
      if (fs.existsSync(dataPath)) {
        const allResumes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const generateSlug = () => Math.random().toString(36).substring(2, 8);
        let hasChanges = false;
        const userResumes = allResumes.filter(r => r.userId === userId).map(r => {
          if (!r.slug) {
            r.slug = generateSlug();
            r.isPublic = false;
            r.password = "";
            r.views = 0;
            hasChanges = true;
          }
          return r;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        if (hasChanges) {
          fs.writeFileSync(dataPath, JSON.stringify(allResumes, null, 2));
        }
        return NextResponse.json({ success: true, resumes: userResumes });
      }
      return NextResponse.json({ success: true, resumes: [] });
    }
  } catch (error) {
    console.error('Fetch Resumes Error:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, title } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const generateSlug = () => Math.random().toString(36).substring(2, 8);
    
    const newResume = {
      userId,
      title: title || 'Untitled Resume',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slug: generateSlug(),
      isPublic: false,
      password: "",
      views: 0,
      data: {
        personalInfo: { fullName: "", jobTitle: "", email: "", phone: "", location: "", website: "", linkedin: "", languages: "", summary: "", photoUrl: "", birthDate: "", maritalStatus: "" },
        workExperience: [],
        projects: [],
        education: [],
        skills: [],
        certifications: [],
        references: [],
        customSections: []
      }
    };

    if (clientPromise) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'jtresume');
      const result = await db.collection('resumes').insertOne(newResume);
      return NextResponse.json({ success: true, resumeId: result.insertedId });
    } else {
      // Local fallback
      const dataPath = path.join(process.cwd(), 'data', 'resumes.json');
      let allResumes = [];
      if (fs.existsSync(dataPath)) {
        allResumes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      }
      const id = Date.now().toString();
      newResume._id = id;
      allResumes.push(newResume);
      if (!fs.existsSync(path.join(process.cwd(), 'data'))) fs.mkdirSync(path.join(process.cwd(), 'data'));
      fs.writeFileSync(dataPath, JSON.stringify(allResumes, null, 2));
      return NextResponse.json({ success: true, resumeId: id });
    }
  } catch (error) {
    console.error('Create Resume Error:', error);
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
  }
}
