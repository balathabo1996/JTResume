/**
 * @file route.js
 * @description Next.js API route for handling backend logic related to route.js.
 * @author Jonathan T. Miller
 */
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { resumeData, jobDescription, tone = 'professional' } = await request.json();

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

    let toneInstruction = "Use a standard, professional, and corporate tone. Be direct and polite.";
    if (tone === 'passionate') {
      toneInstruction = "Use a highly passionate, story-driven tone. Emphasize mission alignment, enthusiasm for the product/industry, and a strong desire to contribute to the company's vision.";
    } else if (tone === 'aggressive') {
      toneInstruction = "Use an aggressive, highly confident, data-driven tone. Skip the fluff and focus purely on hard metrics, ROI, and how your specific skills will immediately make the company money or save time. Do not use overly polite or submissive language.";
    }

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
1. Write a modern cover letter tailored to the job description.
2. Cross-reference the user's specific experience and skills to the requirements in the job description.
3. Keep it concise (around 300-400 words) and impactful.
4. TONE DIRECTIVE: ${toneInstruction} You MUST adopt this tone perfectly.
5. Do NOT use placeholders like "[Company Name]" if the company name is visible in the job description. Infer the company and role from the job description if possible.
6. Format the output in clean HTML (using <p> tags for paragraphs). Do NOT use markdown blocks like \`\`\`html.
7. Do not include introductory conversational text (e.g., "Here is your cover letter:"). Just output the raw HTML.
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
