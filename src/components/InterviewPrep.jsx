/**
 * @file InterviewPrep.jsx
 * @description React component rendering the InterviewPrep UI element.
 * @author Jonathan T. Miller
 */
import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'isomorphic-dompurify';

export default function InterviewPrep({ resumeId, onBack, onGoHome }) {
  const [resumeData, setResumeData] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);
  
  const [jobDescription, setJobDescription] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState([]); // { role: 'user' | 'model', text: '' }
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  
  const chatEndRef = useRef(null);

  // Fetch the target resume
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoadingResume(true);
        const res = await fetch(`/api/resumes/${resumeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load resume');
        setResumeData(data.resume);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingResume(false);
      }
    };
    if (resumeId) fetchResume();
  }, [resumeId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const sendToAI = async (chatHistory) => {
    setIsTyping(true);
    setError('');
    try {
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription, messages: chatHistory })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response');
      
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStart = () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }
    setIsStarted(true);
    const initialHistory = [];
    sendToAI(initialHistory); // AI will start the conversation
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!currentInput.trim() || isTyping) return;
    
    const newMsg = { role: 'user', text: currentInput };
    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setCurrentInput('');
    
    sendToAI(updatedHistory);
  };

  if (loadingResume) {
    return (
      <div className="bg-dark min-vh-100 w-100 d-flex justify-content-center align-items-center text-light">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-3">Loading Resume Data...</span>
      </div>
    );
  }

  return (
    <div className="app-container container-fluid p-0 bg-dark text-light vh-100 w-100 d-flex flex-column overflow-hidden">
      {/* Header */}
      <div className="sidebar-sticky-header sticky-top shadow-sm px-3 py-2 px-md-4 py-md-3 d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <button 
            onClick={onBack} 
            className="btn btn-link text-light text-decoration-none d-flex align-items-center p-0"
            style={{ color: '#2dd4bf', alignSelf: 'center' }}
            title="Return to Dashboard"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          
          <div 
            className="brand d-flex flex-shrink-0" 
            style={{ userSelect: 'none', cursor: 'pointer', alignItems: 'baseline', width: '150px' }} 
            onClick={onGoHome}
            title="Return to Home"
          >
            <div>
              <span className="brand-jt">JT</span><span className="brand-resume">Resume</span>
            </div>
          </div>
          
          <div className="d-none d-sm-block" style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 4px', alignSelf: 'center' }}></div>
          
          <h5 className="m-0 fw-bold" style={{ fontSize: '1.1rem', background: 'linear-gradient(to right, #2dd4bf, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
            <span style={{ marginRight: '8px' }}>🎙️</span>Live Interview
          </h5>
        </div>

        {resumeData && (
          <span className="text-secondary fw-semibold bg-dark border border-secondary rounded px-2 py-1 text-truncate ms-auto" style={{ fontSize: '0.8rem', maxWidth: '140px' }}>
            Resume: <span className="text-light">{resumeData.title}</span>
          </span>
        )}
      </div>

      <div className="d-flex flex-grow-1 overflow-hidden">
        
        {/* Left Side: Setup */}
        <div className={`col-lg-4 col-md-5 border-end border-secondary border-opacity-25 p-4 d-flex flex-column ${isStarted ? 'd-none d-md-flex' : 'w-100'}`} style={{ background: '#1e293b' }}>
          <div className="mb-3">
            <h5 className="fw-bold mb-1">Target Job Description</h5>
            <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
              Paste the job description. Our AI interviewer will tailor questions based on the intersection of your resume and this job.
            </p>
          </div>
          
          <textarea
            className="form-control bg-dark text-light flex-grow-1 border-secondary mb-3"
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isStarted}
            style={{ resize: 'none', borderRadius: '12px', padding: '16px', opacity: isStarted ? 0.7 : 1 }}
          />

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {!isStarted ? (
            <button 
              className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 text-white" 
              style={{ borderRadius: '12px', fontSize: '1.1rem', background: 'linear-gradient(135deg, #0d9488, #0369a1)', border: 'none' }}
              onClick={handleStart}
              disabled={!jobDescription.trim()}
            >
              Start Mock Interview
            </button>
          ) : (
            <div className="alert alert-info py-2" style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.3)', borderRadius: '12px' }}>
              Interview in progress... Refresh to restart.
            </div>
          )}
        </div>

        {/* Right Side: Chat Interface */}
        {isStarted && (
          <div className="col-lg-8 col-md-7 d-flex flex-column position-relative h-100" style={{ background: '#0f172a' }}>
            
            {/* Chat History */}
            <div className="flex-grow-1 overflow-y-auto p-4 d-flex flex-column gap-4">
              {messages.length === 0 && !isTyping && (
                <div className="text-center text-secondary mt-5">Starting interview...</div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div 
                    style={{
                      maxWidth: '75%',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                      borderBottomLeftRadius: msg.role === 'model' ? '4px' : '16px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #0d9488, #0f766e)' : 'rgba(30, 41, 59, 0.8)',
                      border: msg.role === 'model' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      color: '#fff',
                      fontSize: '1rem',
                      lineHeight: '1.5',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text.replace(/\\n/g, '<br/>')) }}
                  />
                </div>
              ))}

              {isTyping && (
                <div className="d-flex justify-content-start">
                  <div style={{ padding: '14px 18px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="spinner-grow spinner-grow-sm text-info me-1" role="status"></span>
                    <span className="spinner-grow spinner-grow-sm text-info me-1" role="status" style={{ animationDelay: '0.2s' }}></span>
                    <span className="spinner-grow spinner-grow-sm text-info" role="status" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4" style={{ background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <form onSubmit={handleSend} className="d-flex gap-2 position-relative">
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="Type your answer here..."
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  disabled={isTyping}
                  style={{ borderRadius: '30px', padding: '14px 20px', paddingRight: '50px' }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary rounded-circle position-absolute d-flex align-items-center justify-content-center"
                  disabled={!currentInput.trim() || isTyping}
                  style={{ width: '40px', height: '40px', right: '8px', top: '50%', transform: 'translateY(-50%)', background: '#0ea5e9', border: 'none' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
