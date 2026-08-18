import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.js';

export function SandboxRoom({ 
  rawText, 
  onUpdateText, 
  timerDuration = 900, 
  targetWordGoal = 500,
  workingQuestion,
  strictSandboxDiscipline = true,
  onLeaveSandbox, 
  onNotify 
}) {
  const [lines, setLines] = useState(() => {
    return rawText ? rawText.split('\n') : [''];
  });
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  const [isPaused, setIsPaused] = useState(false);
  const [showStuckPrompt, setShowStuckPrompt] = useState(false);

  const editorRef = useRef(null);
  const activeLineRef = useRef(null);
  const mobileInputRef = useRef(null);
  const inactivityRef = useRef(0);
  const isComposingRef = useRef(false);

  // Sync timer duration if settings change
  useEffect(() => {
    setTimeRemaining(timerDuration);
  }, [timerDuration]);

  // Sync external rawText changes
  useEffect(() => {
    if (rawText !== lines.join('\n')) {
      const split = rawText ? rawText.split('\n') : [''];
      setLines(split.length === 0 ? [''] : split);
    }
  }, [rawText]);

  // Circular Timer Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          audioEngine.playChime();
          onNotify?.("Drafting Target Reached", "You completed your session target time. Continue writing or organize thoughts.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNotify]);

  // Inactivity Monitor (12s pulse, 30s stuck prompt & dim, 60s chime)
  useEffect(() => {
    const inactivityTimer = setInterval(() => {
      inactivityRef.current += 1;
      if (inactivityRef.current >= 12) {
        setIsPaused(true);
      }
      if (inactivityRef.current >= 30) {
        document.body.classList.add('sandbox-dimmed');
        setShowStuckPrompt(true);
      }
      if (inactivityRef.current >= 60) {
        audioEngine.playChime();
        onNotify?.("Drafting Paused", "60 seconds of stillness. Your thoughts are safely captured.");
        inactivityRef.current = 0;
      }
    }, 1000);

    return () => {
      clearInterval(inactivityTimer);
      document.body.classList.remove('sandbox-dimmed');
    };
  }, [onNotify]);

  const resetInactivity = () => {
    inactivityRef.current = 0;
    setIsPaused(false);
    setShowStuckPrompt(false);
    document.body.classList.remove('sandbox-dimmed');
  };

  // Auto-scroll active line into viewport center
  const scrollToActiveLine = () => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Focus both container and mobile invisible input
  const focusEditor = () => {
    resetInactivity();
    if (mobileInputRef.current) {
      mobileInputRef.current.focus({ preventScroll: true });
    }
    if (editorRef.current) {
      editorRef.current.focus({ preventScroll: true });
    }
    scrollToActiveLine();
  };

  // Auto-focus on mount
  useEffect(() => {
    focusEditor();
  }, []);

  // Insert text programmatically (e.g. from "I'm Stuck" prompt)
  const insertTextAtEnd = (textToInsert) => {
    resetInactivity();
    audioEngine.playThock(false);
    const newLines = [...lines];
    const lastIdx = newLines.length - 1;
    newLines[lastIdx] = (newLines[lastIdx] || '') + textToInsert;
    setLines(newLines);
    onUpdateText(newLines.join('\n'));
    setTimeout(focusEditor, 40);
  };

  // Handle "I'm Stuck" Button Click
  const handleStuckClick = () => {
    insertTextAtEnd("The thing I'm trying to say here is ");
    onNotify?.("Unblocked", "Permission to write badly granted. Just keep moving forward.");
  };

  // Desktop hardware keyboard handler
  const handleKeyDown = (e) => {
    // If strict discipline is enabled, block backspace/delete & arrows
    if (strictSandboxDiscipline) {
      const forbiddenKeys = [
        'Backspace', 'Delete',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End', 'PageUp', 'PageDown'
      ];

      if (forbiddenKeys.includes(e.key)) {
        e.preventDefault();
        return;
      }
    } else {
      // If backspace allowed, handle backspace on current line
      if (e.key === 'Backspace') {
        e.preventDefault();
        audioEngine.playThock(false);
        const newLines = [...lines];
        const lastIdx = newLines.length - 1;
        if (newLines[lastIdx].length > 0) {
          newLines[lastIdx] = newLines[lastIdx].slice(0, -1);
          setLines(newLines);
          onUpdateText(newLines.join('\n'));
        } else if (newLines.length > 1) {
          newLines.pop();
          setLines(newLines);
          onUpdateText(newLines.join('\n'));
        }
        return;
      }
    }

    resetInactivity();

    if (e.key === 'Enter') {
      e.preventDefault();
      audioEngine.playThock(true); // Return carriage clack
      const newLines = [...lines, ''];
      setLines(newLines);
      onUpdateText(newLines.join('\n'));
      setTimeout(scrollToActiveLine, 40);
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      audioEngine.playThock(false);
      const newLines = [...lines];
      newLines[newLines.length - 1] += e.key;
      setLines(newLines);
      onUpdateText(newLines.join('\n'));
      setTimeout(scrollToActiveLine, 40);
    }
  };

  // Mobile virtual keyboard beforeinput event
  const handleMobileBeforeInput = (e) => {
    resetInactivity();

    if (strictSandboxDiscipline) {
      if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward' || e.inputType === 'deleteByCut') {
        e.preventDefault();
        return;
      }
    } else {
      if (e.inputType === 'deleteContentBackward') {
        e.preventDefault();
        audioEngine.playThock(false);
        const newLines = [...lines];
        const lastIdx = newLines.length - 1;
        if (newLines[lastIdx].length > 0) {
          newLines[lastIdx] = newLines[lastIdx].slice(0, -1);
          setLines(newLines);
          onUpdateText(newLines.join('\n'));
        } else if (newLines.length > 1) {
          newLines.pop();
          setLines(newLines);
          onUpdateText(newLines.join('\n'));
        }
        return;
      }
    }

    if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') {
      e.preventDefault();
      audioEngine.playThock(true);
      const newLines = [...lines, ''];
      setLines(newLines);
      onUpdateText(newLines.join('\n'));
      setTimeout(scrollToActiveLine, 40);
      return;
    }

    if (e.data && !isComposingRef.current) {
      e.preventDefault();
      audioEngine.playThock(false);
      const newLines = [...lines];
      newLines[newLines.length - 1] += e.data;
      setLines(newLines);
      onUpdateText(newLines.join('\n'));
      setTimeout(scrollToActiveLine, 40);
    }
  };

  // Fallback mobile input change handler (for Android IME / composition)
  const handleMobileInput = (e) => {
    resetInactivity();
    const val = e.target.value;
    if (!val || isComposingRef.current) return;

    audioEngine.playThock(false);
    const newLines = [...lines];
    newLines[newLines.length - 1] += val;
    setLines(newLines);
    onUpdateText(newLines.join('\n'));
    
    // Reset the bridge value so it's fresh for next input
    e.target.value = '';
    setTimeout(scrollToActiveLine, 40);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e) => {
    isComposingRef.current = false;
    const val = e.data || e.target.value;
    if (val) {
      audioEngine.playThock(false);
      const newLines = [...lines];
      newLines[newLines.length - 1] += val;
      setLines(newLines);
      onUpdateText(newLines.join('\n'));
      if (mobileInputRef.current) mobileInputRef.current.value = '';
      setTimeout(scrollToActiveLine, 40);
    }
  };

  const totalLines = lines.length;
  const fullContent = lines.join('\n');
  const wordsCount = fullContent.trim() ? fullContent.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = (timeRemaining % 60).toString().padStart(2, '0');

  const circumference = 2 * Math.PI * 15.9155;
  const progress = timerDuration > 0 ? timeRemaining / timerDuration : 1;
  const strokeOffset = circumference * (1 - progress);

  return (
    <motion.section 
      id="room-sandbox" 
      className="room-container active-room"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Hidden Mobile Virtual Keyboard Input Bridge */}
      <textarea
        ref={mobileInputRef}
        className="sandbox-mobile-hidden-bridge"
        autoCapitalize="sentences"
        autoCorrect="on"
        autoComplete="off"
        spellCheck="true"
        inputMode="text"
        tabIndex={-1}
        aria-hidden="true"
        onBeforeInput={handleMobileBeforeInput}
        onInput={handleMobileInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
      />

      <div className="sandbox-header-bar">
        {/* Non-Anxiety Circular Session Timer with MM:SS */}
        <div 
          className={`circular-timer-container ${isPaused ? 'pulse-warning' : ''}`}
          title="Session Timer"
        >
          <svg className="circular-timer-svg" viewBox="0 0 36 36">
            <path className="timer-bg-circle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path 
              className="timer-progress-circle" 
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${strokeOffset}`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            />
          </svg>
          <div className="timer-meta">
            <div className="timer-time-display">
              <span className="timer-step-tag">Step 2</span>
              <span className="timer-label">{minutes}:{seconds}</span>
              <span className="timer-badge">{isPaused ? "Paused" : (strictSandboxDiscipline ? "Strict Flow" : "Free Writing")}</span>
            </div>
            <span className="timer-sub">
              {wordsCount} / {targetWordGoal} words ({Math.min(100, Math.round((wordsCount / targetWordGoal) * 100))}%) · {strictSandboxDiscipline ? "No Backspace" : "Backspace Active"}
            </span>
          </div>
        </div>

        <button className="btn btn-secondary sandbox-proceed-btn" onClick={onLeaveSandbox}>
          <span className="btn-text-desktop">Organize Thoughts (Ctrl+E)</span>
          <span className="btn-text-mobile">Organize</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Seamless Blended In-Editor Inquiry Header */}
      {workingQuestion && (
        <div className="blended-editor-inquiry">
          <span className="inquiry-symbol">✦</span>
          <span className="inquiry-text">"{workingQuestion}"</span>
        </div>
      )}

      {/* 3-Tier Visual Line Fading Canvas with Custom Typewriter Caret */}
      <div 
        ref={editorRef}
        className="sandbox-editor"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={focusEditor}
        onTouchStart={focusEditor}
      >
        {lines.map((lineText, idx) => {
          const isCurrent = idx === totalLines - 1;
          let fadeClass = 'faded-line';
          if (isCurrent) {
            fadeClass = 'current-line';
          } else if (idx >= totalLines - 4) {
            fadeClass = 'recent-line';
          }

          return (
            <div 
              key={idx} 
              ref={isCurrent ? activeLineRef : null}
              className={`sandbox-line ${fadeClass}`}
            >
              <span className="sandbox-line-text">{lineText === '' ? '\u00A0' : lineText}</span>
              {isCurrent && <span className="sandbox-caret" />}
            </div>
          );
        })}
      </div>

      {/* Manifesto "I'm Stuck" helper pill button */}
      <AnimatePresence>
        {showStuckPrompt && (
          <motion.div 
            className="stuck-prompt-container"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              className="stuck-prompt-btn" 
              onClick={handleStuckClick}
              type="button"
            >
              <Sparkles size={14} className="stuck-icon" />
              <span>Stuck? Write the worst version of this sentence.</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
