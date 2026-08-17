import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkCheck, ArrowRight, X } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.js';

export function SaveModal({ isOpen, onClose, onConfirm, currentNote }) {
  const [note, setNote] = useState(currentNote || '');

  useEffect(() => {
    if (isOpen) {
      setNote(currentNote || '');
    }
  }, [isOpen, currentNote]);

  if (!isOpen) return null;

  const handleSave = () => {
    onConfirm(note);
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div 
          className="modal-card modal-bottom-sheet"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        >
          <div className="sheet-drag-handle mobile-only" />
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="modal-icon-header">
              <BookmarkCheck size={22} />
              <span>The Save Ritual</span>
            </div>
            <button className="btn btn-icon" onClick={onClose} style={{ border: 'none', background: 'transparent' }}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            <p className="modal-prompt-text">
              Before you archive, write a note to your future self explaining where your mind is and what comes next:
            </p>
            <textarea 
              className="input-textarea"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Where are you in this thought? What is the very next thing you need to explore?"
              autoFocus
            />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <span>Save Project (.scripta)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function FutureNoteModal({ isOpen, metadata, onContinue }) {
  if (!isOpen) return null;

  const formattedDate = new Date(metadata?.modified || Date.now()).toLocaleDateString(undefined, {
    weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <AnimatePresence>
      <div className="modal-backdrop">
        <motion.div 
          className="modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        >
          <div className="modal-header">
            <div className="modal-icon-header">
              <BookmarkCheck size={22} />
              <span>Welcome Back to Your Thinking</span>
            </div>
          </div>
          <div className="modal-body">
            <p style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              On <strong>{formattedDate}</strong>, you left this message for your future self:
            </p>
            <div style={{
              padding: 16,
              background: 'var(--bg-input)',
              borderLeft: '3px solid var(--accent-color)',
              borderRadius: 8,
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              lineHeight: 1.6
            }}>
              "{metadata?.futureNote || 'No specific future note provided.'}"
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onContinue}>
              <span>Resume Work</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
