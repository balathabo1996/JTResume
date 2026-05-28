'use client';
import React, { useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { swaggerSpec } from '../../lib/swagger-spec';

export default function ApiDocs() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <defs>
        <linearGradient id="jt-grad-api" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#7e22ce" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="64" fill="url(#jt-grad-api)" />
      <text x="128" y="176" font-family="system-ui, -apple-system, sans-serif" font-size="130" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-5">JT</text>
    </svg>`;

    const dataUrl = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = dataUrl;
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060913', padding: '20px 0' }}>
      <style>{`
        /* Swagger UI Obsidian Dark Theme Overrides */
        .swagger-ui {
          color: #f3f4f6 !important;
          font-family: 'Inter', sans-serif !important;
        }
        .swagger-ui .info {
          display: none !important;
        }
        
        /* Layout & Scheme */
        .swagger-ui .scheme-container {
          background: rgba(13, 18, 30, 0.4) !important;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06) !important;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        /* Operations Blocks */
        .swagger-ui .opblock {
          background: rgba(13, 18, 30, 0.55) !important;
          border: 1px solid rgba(255,255,255,0.06) !important;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          margin-bottom: 15px;
        }
        .swagger-ui .opblock .opblock-summary-method {
          background: #6366f1 !important;
          border-radius: 6px;
        }
        .swagger-ui .opblock-summary-description {
          color: #cbd5e1 !important;
        }
        .swagger-ui .opblock-summary-path {
          color: #f1f5f9 !important;
        }
        .swagger-ui .opblock-summary-path__deprecated {
          color: #94a3b8 !important;
        }
        .swagger-ui .opblock-body {
          background: rgba(10, 14, 26, 0.8) !important;
        }

        /* Tables & Typography inside blocks */
        .swagger-ui table thead tr td, .swagger-ui table thead tr th {
          color: #94a3b8 !important;
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        }
        .swagger-ui .parameter__name, .swagger-ui .parameter__type {
          color: #e2e8f0 !important;
        }
        .swagger-ui .parameter__in {
          color: #64748b !important;
        }
        .swagger-ui .opblock-description-wrapper p, .swagger-ui .responses-inner h4, .swagger-ui .responses-inner h5 {
          color: #cbd5e1 !important;
        }
        .swagger-ui .response-col_status, .swagger-ui .response-col_description {
          color: #cbd5e1 !important;
        }
        
        /* Code blocks & JSON */
        .swagger-ui .highlight-code {
          background: rgba(0,0,0,0.3) !important;
        }
        .swagger-ui .microlight {
          color: #a5b4fc !important;
        }
        
        /* Models section */
        .swagger-ui section.models {
          background: rgba(13, 18, 30, 0.55) !important;
          border: 1px solid rgba(255,255,255,0.06) !important;
          border-radius: 12px;
          margin-top: 30px;
        }
        .swagger-ui section.models h4 {
          color: #f1f5f9 !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        }
        .swagger-ui section.models h4:hover {
          background: rgba(255,255,255,0.02) !important;
        }
        .swagger-ui .model-title, .swagger-ui .model {
          color: #cbd5e1 !important;
        }
        .swagger-ui .prop-type, .swagger-ui .prop-format {
          color: #818cf8 !important;
        }

        /* Inputs & Buttons */
        .swagger-ui input, .swagger-ui select, .swagger-ui textarea {
          background: rgba(255,255,255,0.05) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 6px;
        }
        .swagger-ui input:focus, .swagger-ui select:focus, .swagger-ui textarea:focus {
          border-color: #6366f1 !important;
          outline: none;
        }
        .swagger-ui .btn {
          background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
          color: #fff !important;
          border: none !important;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35) !important;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .swagger-ui .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5) !important;
        }
        .swagger-ui .btn.cancel {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #fca5a5 !important;
          border: 1px solid rgba(239, 68, 68, 0.4) !important;
          box-shadow: none !important;
        }
        .swagger-ui .btn.authorize {
          background: rgba(16, 185, 129, 0.1) !important;
          color: #34d399 !important;
          border: 1px solid rgba(16, 185, 129, 0.4) !important;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.15) !important;
        }

        /* Expand/collapse icons */
        .swagger-ui svg {
          fill: #94a3b8 !important;
        }

        /* Customizing specific methods based on color if needed */
        .swagger-ui .opblock.opblock-post { border-color: rgba(16, 185, 129, 0.3) !important; background: rgba(16, 185, 129, 0.05) !important; }
        .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #10b981 !important; }
        
        .swagger-ui .opblock.opblock-get { border-color: rgba(59, 130, 246, 0.3) !important; background: rgba(59, 130, 246, 0.05) !important; }
        .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #3b82f6 !important; }
        
        .swagger-ui .opblock.opblock-put { border-color: rgba(245, 158, 11, 0.3) !important; background: rgba(245, 158, 11, 0.05) !important; }
        .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #f59e0b !important; }
        
        .swagger-ui .opblock.opblock-delete { border-color: rgba(239, 68, 68, 0.3) !important; background: rgba(239, 68, 68, 0.05) !important; }
        .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4444 !important; }
      `}</style>
      <div className="container pt-4">
        <div className="d-flex align-items-start justify-content-between mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="d-flex align-items-center gap-3">
            <div 
              className="d-flex align-items-center justify-content-center rounded-3" 
              style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#ffffff" viewBox="0 0 16 16">
                <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                <path d="M4.603 12.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.701 19.701 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .471.215c.392.398.19 1.868-.228 3.036q-.031.086-.065.175c.01.036.02.072.03.109q.181.65.5 1.347c.246.536.54 1.041.865 1.512a15.82 15.82 0 0 0 1.84.208c.536.02.96.064 1.25.267.336.236.425.61.321 1.025a1.44 1.44 0 0 1-1.33.95c-.322 0-.67-.14-1.04-.41-.326-.237-.478-.604-.515-.97-.042-.423.05-.884.22-1.378-.456-.27-.923-.532-1.396-.789a22.25 22.25 0 0 1-1.631-.837c-.504.288-1.01.554-1.52.793-.195.09-.395.178-.6.262-.751.31-1.428.528-1.996.657-.492.112-.924.16-1.272.16zM8.384 4.331c-.048.272-.057.697.025 1.08.041.192.091.385.15.575.14-.54.27-1.077.38-1.55.07-.301.12-.55.15-.71a.36.36 0 0 0-.12-.132.2.2 0 0 0-.17-.037c-.07.017-.18.09-.215.174zm-.188 5.753c.1-.11.205-.224.316-.345.093-.102.189-.208.286-.318-.465-.213-.93-.453-1.39-.714-.14.15-.28.304-.415.465a7.35 7.35 0 0 0-1.12 1.593c.094.02.188.04.282.057.48.087 1.134.195 2.041-.738z"/>
              </svg>
            </div>
            <div>
              <h1 className="mb-1 text-white fw-bold" style={{ letterSpacing: '-0.5px' }}>JTResume API Console</h1>
              <p className="mb-0 text-secondary" style={{ fontSize: '15px' }}>
                Comprehensive API Documentation for AI Generation, Authentication, and Resume Management endpoints.
              </p>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3 px-4 py-2 rounded-pill mt-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-secondary" style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Powered by</span>
            <img src="https://static1.smartbear.co/swagger/media/assets/images/swagger_logo.svg" alt="Swagger" height="24" />
          </div>
        </div>
        
        <SwaggerUI spec={swaggerSpec} />
      </div>
    </div>
  );
}
