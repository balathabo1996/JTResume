/**
 * @file opengraph-image.jsx
 * @description Source file for opengraph-image.jsx.
 * @author Thabotharan Balachandran
 */
import { ImageResponse } from 'next/og';
import clientPromise from '../../../utils/mongodb';

// Route segment config
export const runtime = 'nodejs';

// Image metadata
export const alt = 'JTResume Link Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  // Default values
  let name = 'Private Resume';
  let title = 'JTResume | Premium Resume Builder';

  try {
    const slug = params.slug;
    
    // Connect to MongoDB and fetch the specific resume by slug
    const client = await clientPromise;
    const db = client.db('jtresume_db');
    const resume = await db.collection('resumes').findOne({ shareUrlSlug: slug });
    
    // If we found it, extract the name and job title
    if (resume && resume.data && resume.data.personalInfo) {
      if (resume.data.personalInfo.fullName) {
        name = resume.data.personalInfo.fullName;
      }
      if (resume.data.personalInfo.jobTitle) {
        title = resume.data.personalInfo.jobTitle;
      }
    }
  } catch (e) {
    console.error('Failed to fetch data for OG image:', e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#0a0d16', // Dark slate background matching the brand
          padding: '80px 100px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Elegant Gold Inner Border */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            bottom: 40,
            left: 40,
            right: 40,
            border: '2px solid rgba(191, 149, 63, 0.4)', // Premium Gold color
            borderRadius: '24px',
          }}
        />

        {/* Small Logo / Branding Top Left */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '80px' }}>
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: '#fff',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a0d16',
              fontSize: '28px',
              fontWeight: 800,
              marginRight: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            JT
          </div>
          <span style={{ fontSize: '28px', color: '#94a3b8', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            JTResume Platform
          </span>
        </div>

        {/* Dynamic User Data */}
        <div
          style={{
            fontSize: '96px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-3px',
            lineHeight: 1.1,
            marginBottom: '20px',
            maxWidth: '1000px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: '52px',
            fontWeight: 500,
            color: '#bf953f', // Premium Gold
            fontStyle: 'italic',
            letterSpacing: '-1px',
            maxWidth: '1000px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {title}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
