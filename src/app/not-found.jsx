'use client';
/**
 * @file not-found.jsx
 * @description Hyper-premium client-side 404 error page. Rendered with custom glassmorphic layout, mesh gradients, and interactive hover animations.
 * @author Thabotharan Balachandran
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden">
      
      {/* Animated Abstract Orbs in Background */}
      <motion.div 
        animate={{ 
          x: mousePosition.x * -60,
          y: mousePosition.y * -60,
        }}
        transition={{ type: "spring", stiffness: 40, damping: 25 }}
        className="position-absolute w-100 h-100 top-0 start-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="position-absolute rounded-circle"
          style={{
            width: '45vw',
            height: '45vw',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
            top: '5%',
            left: '5%',
            filter: 'blur(80px)'
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="position-absolute rounded-circle"
          style={{
            width: '40vw',
            height: '40vw',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
            bottom: '5%',
            right: '5%',
            filter: 'blur(80px)'
          }}
        />
      </motion.div>

      {/* Glassmorphism Container */}
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center p-5 rounded-4 shadow-2xl"
        style={{ 
          zIndex: 10, 
          maxWidth: '560px',
          background: 'var(--ui-card-bg)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <h1 
            className="fw-bold mb-2" 
            style={{ 
              fontSize: '9.5rem', 
              lineHeight: '1',
              letterSpacing: '-0.06em',
              background: 'linear-gradient(135deg, #a5b4fc 0%, #ec4899 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 15px 35px rgba(99, 102, 241, 0.35))'
            }}
          >
            404
          </h1>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-light fw-bolder mb-3 mt-2"
          style={{ letterSpacing: '-0.5px', fontSize: '2rem' }}
        >
          Lost in the void
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-secondary mb-5 px-sm-4"
          style={{ fontSize: '1.05rem', lineHeight: '1.6' }}
        >
          We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps it never existed in this timeline.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link href="/" className="text-decoration-none">
            <button 
              className="btn d-inline-flex align-items-center justify-content-center gap-2 px-5 py-3 rounded-pill fw-bold"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.35)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '1px',
                fontSize: '0.9rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(99, 102, 241, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.35)';
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              BACK TO REALITY
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
