/**
 * @file route.js
 * @description Next.js API route for handling backend logic related to route.js.
 * @author Jonathan T. Miller
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

    // Construct the context for the AI
    const systemInstruction = `
You are an expert technical and behavioral interviewer hiring for a company. 
You are conducting a mock interview with a candidate. 
Here is their resume:
${JSON.stringify(resumeData)}

Here is the job description they are applying for:
${jobDescription}

INSTRUCTIONS:
- You must act as the interviewer.
- Ask ONE question at a time.
- Start by introducing yourself briefly and asking the first question.
- When the candidate answers, briefly evaluate their answer (praise good points, or point out what they could have elaborated on), and then ask the NEXT question.
- Keep your responses concise, conversational, and professional. 
- Ask a mix of behavioral and technical questions relevant to the job description and their resume.
- Use simple HTML for formatting your response (e.g., <b>bold</b>, <ul><li>list</li></ul>, <br/>). Do not use markdown.
`;

    // Map our message format to Gemini's format
    const contents = [];
    
    // Add the initial context as the first user message if this is the start of the chat
    if (messages.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: "Hello! I am ready to begin the mock interview. Please introduce yourself and ask the first question." }]
      });
    } else {
      // We need to inject the initial prompt into the very first user message of the history
      // so the AI always remembers the context, since we don't have a dedicated system instruction in this SDK version
      const mappedMessages = messages.map((msg, index) => {
        let text = msg.text;
        if (index === 0 && msg.role === 'user') {
           // We'll actually handle this below
        }
        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text }]
        };
      });
      contents.push(...mappedMessages);
    }

    // Since GoogleGenAI `generateContent` might not support systemInstruction perfectly in all versions, 
    // we prepend the system instruction to the very first user message to guarantee it's respected.
    if (contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `[SYSTEM CONTEXT: ${systemInstruction}]\n\nCandidate says: ` + contents[0].parts[0].text;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        temperature: 0.7,
      }
    });

    const reply = response.text || '';

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Interview API Error:', error);
    return NextResponse.json({ error: 'Failed to communicate with AI interviewer.' }, { status: 500 });
  }
}
