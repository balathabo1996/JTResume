/**
 * @file route.js
 * @description Source file for route.js.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { resumeData, jobDescription, messages } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format the chat history into a single string for analysis
    const formattedTranscript = messages.map(msg => 
      `${msg.role === 'model' ? 'INTERVIEWER' : 'CANDIDATE'}: ${msg.text}`
    ).join('\n\n');

    const prompt = `
You are an expert technical recruiter and interview coach. 
A candidate just finished a "Grill Me" mock interview. 
Here is the transcript of their interview:
-------------------
${formattedTranscript}
-------------------

Here is their resume data:
${JSON.stringify(resumeData)}

Here is the job description they are applying for:
${jobDescription}

INSTRUCTIONS:
Evaluate the candidate's performance in the interview. You MUST respond with a valid JSON object matching the exact structure below. Do NOT wrap the JSON in markdown blocks like \`\`\`json. Return ONLY the raw JSON string.

{
  "score": <Number between 0 and 100 representing their overall interview performance>,
  "strengths": [
    "<String: Key strength 1>",
    "<String: Key strength 2>"
  ],
  "weaknesses": [
    "<String: Critical weakness 1>",
    "<String: Critical weakness 2>"
  ],
  "examples": [
    {
      "topic": "<String: The topic of the question (e.g., 'System Design')>",
      "feedback": "<String: Actionable advice on how they could have answered a specific question better>"
    },
    {
      "topic": "<String: Another topic>",
      "feedback": "<String: Specific feedback>"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    let reply = response.text || '';
    
    // Clean up potential markdown formatting if the model disobeys
    reply = reply.trim();
    if (reply.startsWith('```json')) reply = reply.slice(7);
    if (reply.startsWith('```')) reply = reply.slice(3);
    if (reply.endsWith('```')) reply = reply.slice(0, -3);
    reply = reply.trim();

    let evaluationData;
    try {
      evaluationData = JSON.parse(reply);
    } catch (e) {
      console.error("Failed to parse evaluation JSON:", reply);
      throw new Error("AI returned malformed JSON");
    }

    return NextResponse.json({ success: true, evaluation: evaluationData });
  } catch (error) {
    console.error('Interview Evaluate API Error:', error);
    return NextResponse.json({ error: 'Failed to generate interview evaluation.' }, { status: 500 });
  }
}
