/**
 * @file route.js
 * @description Next.js API route for handling backend logic related to route.js.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { name, jobTitle, keywords } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = `Write a highly professional, 2-3 sentence executive summary for a resume. `;
    if (name) prompt += `The candidate's name is ${name}. `;
    if (jobTitle) prompt += `Their current/target job title is ${jobTitle}. `;
    if (keywords && keywords.length > 0) {
      prompt += `Please try to naturally incorporate some of these keywords if relevant: ${keywords.join(', ')}. `;
    }
    prompt += `Make it sound experienced, action-oriented, and impactful. Do not use generic buzzwords unnecessarily. Do not include any formatting or quotes, just the plain text summary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const summaryText = response.text || '';

    return NextResponse.json({ success: true, summary: summaryText.trim() });
  } catch (error) {
    console.error('AI Summary Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate summary. Please try again later.' }, { status: 500 });
  }
}
