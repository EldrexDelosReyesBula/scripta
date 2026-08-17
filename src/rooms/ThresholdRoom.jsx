import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import { AtmosphericSky } from '../components/AtmosphericSky.jsx';
import { audioEngine } from '../audio/audioEngine.js';

export function ThresholdRoom({ 
  workingQuestion, 
  onStartSession,
  onSetQuestion, 
  onEnterSandbox, 
  settings 
}) {
  const [questionInput, setQuestionInput] = useState(workingQuestion || '');
  const [isShaking, setIsShaking] = useState(false);

  const hasValidInput = questionInput.trim().length > 0;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const finalQ = questionInput.trim();
    
    if (!finalQ) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    audioEngine.playSwell();
    
    if (typeof onStartSession === 'function') {
      onStartSession(finalQ);
    } else {
      onSetQuestion?.(finalQ);
      onEnterSandbox?.(finalQ);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <motion.section 
      id="room-threshold" 
      className="room-container active-room"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <AtmosphericSky 
        enabled={settings?.weather !== 'off'} 
        weather={settings?.weather || 'auto'}
      />

      <div className="threshold-content">
        <motion.div 
          className="threshold-logo-wrapper"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', damping: 20 }}
        >
          <img 
            src="/assets/scripta-logo.svg" 
            alt="Scripta Emblem" 
            className="threshold-hero-logo" 
          />
        </motion.div>

        <div className="threshold-badge">
          <Compass size={14} />
          <span>Step 1 of 4 · The Threshold</span>
        </div>

        <h1 className="threshold-question">"What are you trying to think about?"</h1>

        <form className="threshold-input-wrapper" onSubmit={handleSubmit}>
          <motion.div
            animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
            style={{ width: '100%' }}
          >
            <input 
              type="text" 
              className={`input-text threshold-input ${isShaking ? 'input-error' : ''}`}
              placeholder="Type your core inquiry, problem, or topic..." 
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </motion.div>
        </form>

        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleSubmit}
          disabled={!hasValidInput}
          style={{ 
            opacity: hasValidInput ? 1 : 0.45,
            cursor: hasValidInput ? 'pointer' : 'not-allowed',
            transition: 'all 0.25s ease'
          }}
        >
          <span>Enter The Sandbox</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.section>
  );
}
