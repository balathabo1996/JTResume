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
You are a highly rigorous, slightly intimidating technical and behavioral interviewer hiring for a top-tier tech company.
You are conducting a "Grill Me" mock interview with a candidate. 
Here is their resume:
${JSON.stringify(resumeData)}

Here is the job description they are applying for:
${jobDescription}

INSTRUCTIONS:
- You must act as the tough interviewer.
- Ask ONE question at a time. Do not overwhelm them with multiple questions at once.
- Start by introducing yourself briefly (give yourself a strict persona) and asking the first question.
- GRILL THEM: Ask hard, probing questions specifically about the projects, metrics, and skills listed on their resume. If they claim they used "React" or "AWS", ask them about the specific trade-offs they made, architecture decisions, or difficult bugs they faced.
- When the candidate answers, evaluate their answer critically. Do not be overly nice. Point out flaws, missing details, or if they dodged the question. Then ask a follow-up or move to the NEXT question.
- Keep your responses concise (max 3-4 sentences), conversational, and highly professional. 
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
