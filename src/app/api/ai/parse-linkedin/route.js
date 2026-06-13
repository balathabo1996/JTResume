/**
 * @file route.js
 * @description API route for converting resume PDFs, docx, or raw text into standard JTResume structured JSON schema via generative AI mapping.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import pdfParse from 'pdf-parse';
import { rateLimit } from '../../../../utils/rate-limit';

const limiter = rateLimit({
  uniqueTokenPerInterval: 500,
  interval: 60000, // 1 minute
});

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const res = new NextResponse();
    await limiter.check(res, 5, ip); // Max 5 LinkedIn parses per minute

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from the PDF
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    if (!text || text.length < 50) {
      return NextResponse.json({ error: 'Could not extract sufficient text from the uploaded PDF.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
You are an expert resume parser. I am providing you with the raw text extracted from a LinkedIn Profile PDF export.
Your job is to parse this text and map it STRICTLY to the following JSON schema.
Do NOT include any markdown formatting, code blocks, or text outside of the JSON object. 
Return ONLY valid, raw JSON.

Schema:
{
  "personalInfo": { "fullName": "", "jobTitle": "", "email": "", "phone": "", "location": "", "website": "", "linkedin": "", "languages": "", "summary": "", "photoUrl": "", "birthDate": "", "maritalStatus": "" },
  "workExperience": [
    { "role": "", "company": "", "startDate": "", "endDate": "", "description": "", "location": "" }
  ],
  "education": [
    { "degree": "", "school": "", "startDate": "", "endDate": "", "details": "" }
  ],
  "skills": [
    { "category": "Top Skills", "items": ["Skill 1", "Skill 2"] }
  ],
  "certifications": [
    { "name": "", "issuer": "", "date": "" }
  ],
  "projects": [],
  "references": [],
  "customSections": []
}

Rules:
- For work experience, try to split bullet points using newline characters (\\n) in the 'description' field if applicable.
- Make the summary sound professional.
- Extract skills into a single 'Top Skills' category.
- If a field is missing, leave it as an empty string or empty array.
- CRITICAL: DO NOT hallucinate or invent dates. Only extract dates (e.g., startDate, endDate, birthDate) EXACTLY as they appear in the text. If a date is not mentioned, leave the field as an empty string "".

Here is the extracted LinkedIn text:
"""
${text.substring(0, 30000)}
"""
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text || '';
    let parsedData;
    
    try {
      parsedData = JSON.parse(jsonText);
    } catch (e) {
      void e;
      const cleanJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return NextResponse.json({ success: true, parsedData });
  } catch (error) {
    console.error('LinkedIn Parsing Error:', error);
    return NextResponse.json({ error: 'Failed to parse LinkedIn PDF.' }, { status: 500 });
  }
}
