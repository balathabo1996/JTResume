/**
 * @file route.js
 * @description Next.js API route for handling backend logic related to route.js.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { rateLimit } from '../../../../utils/rate-limit';

const limiter = rateLimit({
  uniqueTokenPerInterval: 500,
  interval: 60000, // 1 minute
});

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const res = new NextResponse();
    await limiter.check(res, 10, ip); // Max 10 AI generations per minute

    const { content, role, company } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured.' }, { status: 500 });
    }

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'No content provided to enhance.' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // We expect HTML content from the RichTextEditor, so we should clean it or instruct the AI to return HTML list items
    let prompt = `You are an expert resume writer and career coach. I will give you a rough description or bullet points from a user's work experience.
Please rewrite them into powerful, action-oriented resume bullet points using the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
Make them sound highly professional, concise, and impactful.`;

    if (role || company) {
      prompt += `\nContext: The user held the role of "${role || 'Employee'}" at "${company || 'a company'}".`;
    }

    prompt += `\n\nHere is the raw content to enhance:\n${content}\n\nIMPORTANT: Return ONLY the raw HTML list items (e.g. <li>Enhanced...</li><li>Developed...</li>). Do not wrap it in <ul> tags, do not use markdown code blocks like \`\`\`html, just output the raw <li> elements directly. Do not include introductory text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.6,
      }
    });

    let enhancedHtml = response.text || '';
    
    // Clean up potential markdown formatting that the AI might add despite instructions
    enhancedHtml = enhancedHtml.replace(/```html/g, '').replace(/```/g, '').trim();

    return NextResponse.json({ success: true, enhancedContent: enhancedHtml });
  } catch (error) {
    console.error('AI Bullet Enhancement Error:', error);
    return NextResponse.json({ error: 'Failed to enhance bullet points. Please try again later.' }, { status: 500 });
  }
}
