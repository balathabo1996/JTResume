'use client';
/**
 * @file page.jsx
 * @description Next.js API route for handling backend logic related to page.jsx.
 * @author Jonathan T. Miller
 */
import { useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { swaggerSpec } from '../../lib/swagger-spec';

export default function ApiDocs() {
  useEffect(() => {
    // Dynamically update the body background to white specifically for this page
    // to override the global dark mode CSS without breaking the rest of the app.
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#3b4151';
    
    return () => {
      // Revert when leaving the page
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Classic Swagger Topbar matching the provided screenshot */}
      <div style={{ backgroundColor: '#1b1b1b', padding: '10px 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            backgroundColor: '#85ea2d', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#1b1b1b', 
            fontWeight: '900', 
            fontFamily: 'monospace',
            fontSize: '14px',
            letterSpacing: '-2px',
            paddingLeft: '2px' /* Slight optical adjustment for centering monospace */
          }}>
            {'{...}'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700', lineHeight: '1' }}>
              Swagger
            </span>
            <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: '500', letterSpacing: '0.5px' }}>
              Supported by SMARTBEAR
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Swagger UI */}
      <div>
        <SwaggerUI spec={swaggerSpec} />
      </div>
    </div>
  );
}
