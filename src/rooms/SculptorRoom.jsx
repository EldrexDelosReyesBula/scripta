import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Sparkles, CheckCircle2, Feather, Copy, Check } from 'lucide-react';
import { COMPLEX_WORDS } from '../data/complexWords.js';
import { audioEngine } from '../audio/audioEngine.js';

export function SculptorRoom({ 
  cards, 
  finalText: savedFinalText, 
  onUpdateFinalText, 
  onFinalize,
  onRecordToolUsage,
  onNotify
}) {
  const [paragraphs, setParagraphs] = useState(() => {
    return cards.map((c, idx) => ({
      id: c.id,
      label: c.label || `Block ${idx + 1}`,
      text: c.text
    }));
  });

  const [isHemingway, setIsHemingway] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [tooltip, setTooltip] = useState(null);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);
  const speechSynthRef = useRef(window.speechSynthesis || null);
  const sentencesRef = useRef([]);

  // Compute full continuous text
  const fullText = paragraphs.map(p => p.text).join('\n\n');

  useEffect(() => {
    onUpdateFinalText(fullText);
  }, [paragraphs]);

  // Statistics calculation
  const words = fullText.trim() ? fullText.trim().split(/\s+/).filter(w => w.length > 0) : [];
  const sentences = fullText.match(/[^.!?\n]+[.!?\n]+/g) || [];
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;
  const avgSentenceLength = Math.round(wordCount / sentenceCount);
  const readingTimeMins = Math.max(1, Math.ceil(wordCount / 200));
  const adverbs = words.filter(w => w.toLowerCase().endsWith('ly'));
  const adverbDensity = wordCount > 0 ? ((adverbs.length / wordCount) * 100).toFixed(1) : 0;

  const stats = {
    wordCount,
    sentenceCount,
    avgSentenceLength,
    readingTimeMins,
    adverbDensity
  };

  const handleParagraphChange = (id, newText) => {
    setParagraphs(paragraphs.map(p => p.id === id ? { ...p, text: newText } : p));
  };

  const copyToClipboard = () => {
    audioEngine.playBlip();
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      onNotify?.("Copied to Clipboard", "Full manuscript text copied successfully.");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // --- Robotic Web Speech Read-Aloud ---
  const toggleReadAloud = () => {
    audioEngine.playBlip();
    if (!speechSynthRef.current) {
      alert("Web Speech API is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      stopReadAloud();
    } else {
      startReadAloud();
    }
  };

  const startReadAloud = () => {
    if (!fullText.trim()) return;
    const splitSentences = fullText.match(/[^.!?\n]+[.!?\n]+/g) || [fullText];
    sentencesRef.current = splitSentences.map(s => s.trim()).filter(s => s.length > 0);

    if (sentencesRef.current.length === 0) return;

    setIsSpeaking(true);
    onRecordToolUsage?.('readAloud');
    speakSentence(0);
  };

  const speakSentence = (idx) => {
    if (idx >= sentencesRef.current.length) {
      stopReadAloud();
      return;
    }

    setActiveSentenceIndex(idx);
    const sentenceText = sentencesRef.current[idx];
    const utterance = new SpeechSynthesisUtterance(sentenceText);

    const voices = speechSynthRef.current.getVoices();
    const roboticVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || !v.name.includes('Natural')));
    if (roboticVoice) utterance.voice = roboticVoice;

    utterance.rate = speechRate;
    utterance.pitch = 0.95;

    utterance.onend = () => {
      speakSentence(idx + 1);
    };

    utterance.onerror = () => {
      stopReadAloud();
    };

    speechSynthRef.current.speak(utterance);
  };

  const stopReadAloud = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
    setIsSpeaking(false);
    setActiveSentenceIndex(-1);
  };

  // --- Hemingway Mode Analyzer ---
  const toggleHemingway = () => {
    audioEngine.playBlip();
    setIsHemingway(!isHemingway);
    onRecordToolUsage?.('hemingway');
    if (tooltip) setTooltip(null);
  };

  const renderHemingwaySentence = (sentence) => {
    const rawWords = sentence.trim().split(/\s+/).filter(w => w.length > 0);
    const isLong = rawWords.length > 25;

    const tokens = sentence.split(/(\s+)/);

    const renderedTokens = tokens.map((token, i) => {
      const clean = token.toLowerCase().replace(/[^a-z]/g, '');

      // Adverb
      if (/^[a-zA-Z]+ly$/i.test(clean) && clean.length > 3) {
        return (
          <span 
            key={i} 
            className="hw-adverb"
            onMouseEnter={(e) => showHemingwayTooltip(e, "Adverb: Weakens verbs. Try replacing with a precise action verb.")}
            onMouseLeave={() => setTooltip(null)}
          >
            {token}
          </span>
        );
      }

      // Complex Word
      if (COMPLEX_WORDS.has(clean)) {
        return (
          <span 
            key={i} 
            className="hw-complex-word"
            onMouseEnter={(e) => showHemingwayTooltip(e, `Complex Word: "${clean}" — Consider a simpler alternative.`)}
            onMouseLeave={() => setTooltip(null)}
          >
            {token}
          </span>
        );
      }

      return token;
    });

    if (isLong) {
      return (
        <span 
          className="hw-long-sentence"
          onMouseEnter={(e) => showHemingwayTooltip(e, `Long Sentence (${rawWords.length} words): Consider splitting to sharpen cadence.`)}
          onMouseLeave={() => setTooltip(null)}
        >
          {renderedTokens}
        </span>
      );
    }

    return renderedTokens;
  };

  const showHemingwayTooltip = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text,
      x: Math.max(10, rect.left + window.scrollX + (rect.width / 2) - 140),
      y: rect.top + window.scrollY - 42
    });
  };

  return (
    <motion.section 
      id="room-sculptor" 
      className="room-container active-room"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="sculptor-toolbar">
        <div className="sculptor-tools-group">
          <button 
            className={`btn ${isSpeaking ? 'btn-primary' : 'btn-secondary'}`}
            onClick={toggleReadAloud}
            title="Read Aloud with Cadence Tracking (Ctrl+R)"
          >
            <Volume2 size={16} />
            <span>{isSpeaking ? "Stop Reading" : "Read Aloud"}</span>
          </button>

          {isSpeaking && (
            <select 
              className="speech-rate-select"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            >
              <option value="0.8">0.8×</option>
              <option value="1.0">1.0×</option>
              <option value="1.2">1.2×</option>
            </select>
          )}

          <button 
            className={`btn btn-secondary ${isHemingway ? 'active' : ''}`}
            onClick={toggleHemingway}
            title="Toggle Hemingway Analyzer (Ctrl+H)"
          >
            <Feather size={16} />
            <span>Hemingway Mode</span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={copyToClipboard}
            title="Copy Manuscript to Clipboard"
          >
            {copied ? <Check size={16} color="var(--accent-color)" /> : <Copy size={16} />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>

        <div className="sculptor-stats-bar">
          <span className="room-step-badge">Step 4 of 4</span>
          <span className="stat-pill">{stats.wordCount} words</span>
          <span className="stat-pill">{stats.readingTimeMins} min read</span>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => onFinalize(stats)}
        >
          <CheckCircle2 size={16} />
          <span>Finalize & Export</span>
        </button>
      </div>

      {/* Reassembled Continuous Manuscript */}
      <div className="sculptor-editor-wrapper" ref={editorRef}>
        <div className="sculptor-editor">
          {paragraphs.map((p, idx) => (
            <div key={p.id} className="sculptor-paragraph">
              <div className="sculptor-margin-label">{p.label}</div>

              {isHemingway ? (
                <div className="paragraph-content" style={{ minHeight: '1.8em', whiteSpace: 'pre-wrap' }}>
                  {p.text.split(/([.!?\n]+)/).map((segment, sIdx) => {
                    if (sIdx % 2 === 1 || !segment.trim()) return segment;
                    return <React.Fragment key={sIdx}>{renderHemingwaySentence(segment)}</React.Fragment>;
                  })}
                </div>
              ) : (
                <div 
                  className={`paragraph-content ${activeSentenceIndex >= 0 && sentencesRef.current[activeSentenceIndex]?.includes(p.text.slice(0, 20)) ? 'speech-active-sentence' : ''}`}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleParagraphChange(p.id, e.currentTarget.innerText)}
                >
                  {p.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Hemingway Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div 
            className="scripta-tooltip show"
            style={{ left: tooltip.x, top: tooltip.y }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            {tooltip.text}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
