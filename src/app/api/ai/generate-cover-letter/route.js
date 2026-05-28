/**
 * @file route.js
 * @description Next.js API route for handling backend logic related to route.js.
 * @author Jonathan T. Miller
 */
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { resumeData, jobDescription } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured.' }, { status: 500 });
    }

    if (!jobDescription || jobDescription.trim() === '') {
      return NextResponse.json({ error: 'No job description provided.' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Extract key parts of the resume for context
    const name = resumeData.personalInfo?.fullName || '[Your Name]';
    const email = resumeData.personalInfo?.email || '[Your Email]';
    const phone = resumeData.personalInfo?.phone || '';
    
    const experienceText = resumeData.workExperience?.map(
      exp => `${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate}):\n${Array.isArray(exp.description) ? exp.description.join('\n') : exp.description}`
    ).join('\n\n') || 'No work experience provided.';
    
    const skillsText = resumeData.skills?.map(s => s.name).join(', ') || 'No skills provided.';

    const prompt = `You are an expert career coach and professional copywriter.
I need you to write a highly tailored, compelling cover letter for a user applying for a job.

### User Information:
Name: ${name}
Email: ${email}
Phone: ${phone}

### User's Experience:
${experienceText}

### User's Skills:
${skillsText}

### Target Job Description:
${jobDescription}

### Instructions:
1. Write a professional, modern cover letter.
2. Cross-reference the user's specific experience and skills to the requirements in the job description.
3. Keep it concise (around 300-400 words) and impactful.
4. Do NOT use placeholders like "[Company Name]" if the company name is visible in the job description. Infer the company and role from the job description if possible.
5. Format the output in clean HTML (using <p> tags for paragraphs). Do NOT use markdown blocks like \`\`\`html.
6. Do not include introductory conversational text (e.g., "Here is your cover letter:"). Just output the raw HTML.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    let coverLetterHtml = response.text || '';
    
    // Clean up potential markdown formatting that the AI might add despite instructions
    coverLetterHtml = coverLetterHtml.replace(/```html/g, '').replace(/```/g, '').trim();

    return NextResponse.json({ success: true, coverLetter: coverLetterHtml });
  } catch (error) {
    console.error('AI Cover Letter Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate cover letter. Please try again later.' }, { status: 500 });
  }
}
