/**
 * @file route.js
 * @description Next.js API route for handling backend logic related to route.js.
 * @author Thabotharan Balachandran
 */
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { contactSchema } from '../../../utils/validators';
import { rateLimit } from '../../../utils/rate-limit';

const limiter = rateLimit({
  uniqueTokenPerInterval: 500,
  interval: 60000 * 60, // 1 hour
});

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const res = new NextResponse();
    await limiter.check(res, 5, ip); // Max 5 emails per hour
    
    const body = await request.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    const cleanEmail = email.toLowerCase().trim();
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD is not configured in .env.');
      return NextResponse.json(
        { error: 'Contact email service is temporarily unavailable.' },
        { status: 503 }
      );
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f7f6;
            color: #333333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #e1e8ed;
          }
          .header {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 35px 30px;
            line-height: 1.6;
          }
          .field-label {
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            color: #8b5cf6;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
          }
          .field-value {
            font-size: 15px;
            color: #1f2937;
            margin-bottom: 25px;
            background-color: #f9fafb;
            padding: 12px 16px;
            border-radius: 6px;
            border-left: 3px solid #6366f1;
          }
          .message-box {
            background-color: #f9fafb;
            padding: 16px;
            border-radius: 6px;
            border-left: 3px solid #10b981;
            font-size: 15px;
            color: #374151;
            white-space: pre-line;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New JTResume Inquiry</h1>
          </div>
          <div class="content">
            
            <div class="field-label">Sender Name</div>
            <div class="field-value">${name}</div>

            <div class="field-label">Sender Email</div>
            <div class="field-value">${cleanEmail}</div>

            <div class="field-label">Subject</div>
            <div class="field-value">${subject}</div>

            <div class="field-label">Message</div>
            <div class="message-box">${message}</div>

          </div>
          <div class="footer">
            This message was sent securely from the JTResume Contact Form.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"JTResume Contact Form" <${gmailUser}>`,
      to: gmailUser, // Send the email to yourself (the owner)
      replyTo: cleanEmail, // Let the owner easily hit "reply" to write back to the sender
      subject: `[Contact Form] ${subject}`,
      html: emailHtml
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We will get in touch with you shortly.'
    });

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending your message. Please try again.' },
      { status: 500 }
    );
  }
}
