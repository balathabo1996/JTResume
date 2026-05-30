/**
 * @file route.js
 * @description Source file for route.js.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { missingSkills, jobDescription } = await request.json();

    if (!missingSkills || missingSkills.length === 0) {
      return NextResponse.json({ success: true, learningPaths: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert technical career coach. 
A candidate is applying for a job, but their resume is missing the following key skills:
[${missingSkills.join(', ')}]

Here is the Job Description they are applying for context:
${jobDescription}

INSTRUCTIONS:
Provide a quick, actionable learning path for each missing skill so the candidate can learn the basics quickly and confidently add it to their resume.

You MUST respond with a valid JSON array matching the exact structure below. Do NOT wrap the JSON in markdown blocks like \`\`\`json. Return ONLY the raw JSON array string.

[
  {
    "skill": "<String: The exact name of the missing skill>",
    "reason": "<String: A 1-sentence explanation of why this skill is needed based on the job description. Be specific.>",
    "actionableAdvice": "<String: A 1-2 sentence recommendation on exactly what they should build or learn in a weekend to understand the basics.>",
    "linkUrl": "<String: A URL to search for a tutorial. Use this exact format: https://www.youtube.com/results?search_query=learn+[skill_name_url_encoded]+crash+course>"
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    let reply = response.text || '';
    
    // Clean up potential markdown formatting
    reply = reply.trim();
    if (reply.startsWith('```json')) reply = reply.slice(7);
    if (reply.startsWith('```')) reply = reply.slice(3);
    if (reply.endsWith('```')) reply = reply.slice(0, -3);
    reply = reply.trim();

    let learningPaths;
    try {
      learningPaths = JSON.parse(reply);
    } catch (e) {
      console.error("Failed to parse learning paths JSON:", reply);
      throw new Error("AI returned malformed JSON");
    }

    return NextResponse.json({ success: true, learningPaths });
  } catch (error) {
    console.error('Skill Gap API Error:', error);
    return NextResponse.json({ error: 'Failed to generate learning paths.' }, { status: 500 });
  }
}
