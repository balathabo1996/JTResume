/**
 * @file route.js
 * @description API route for fetching or updating public sharing status and slug maps for shared resumes.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../utils/mongodb';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    let resume = null;

    if (clientPromise) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'jtresume');
      resume = await db.collection('resumes').findOne({ slug });

      if (resume) {
        // Increment views asynchronously
        db.collection('resumes').updateOne({ slug }, { $inc: { views: 1 } }).catch(console.error);
      }
    } else {
      const dataPath = path.join(process.cwd(), 'data', 'resumes.json');
      if (fs.existsSync(dataPath)) {
        const allResumes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        resume = allResumes.find(r => r.slug === slug);
        if (resume) {
          resume.views = (resume.views || 0) + 1;
          fs.writeFileSync(dataPath, JSON.stringify(allResumes, null, 2));
        }
      }
    }

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (!resume.isPublic) {
      return NextResponse.json({ error: 'This resume is not public' }, { status: 403 });
    }

    if (resume.password && resume.password !== password) {
      return NextResponse.json({ error: 'Password required or incorrect', requiresPassword: true }, { status: 401 });
    }

    // Strip sensitive fields before sending
    const safeResume = {
      ...resume,
      password: undefined,
      userId: undefined
    };

    return NextResponse.json({ success: true, resume: safeResume });
  } catch (error) {
    console.error('Fetch Public Resume Error:', error);
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
  }
}
