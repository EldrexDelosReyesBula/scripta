import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, X } from 'lucide-react';

export function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Enter', desc: 'Start drafting session (Threshold)' },
    { key: 'Ctrl + E', desc: 'Exit Sandbox to Cutting Room' },
    { key: 'Ctrl + S', desc: 'Trigger The Save Ritual' },
    { key: 'Ctrl + O', desc: 'Open .scripta project file' },
    { key: 'Ctrl + R', desc: 'Toggle robotic Read Aloud reader' },
    { key: 'Ctrl + H', desc: 'Toggle Hemingway Mode analyzer' },
    { key: 'Ctrl + L', desc: 'Focus card label in Cutting Room' },
    { key: 'Alt + M', desc: 'Mute / Unmute procedural audio' },
    { key: 'Alt + 1/2/3', desc: 'Switch spatial rooms directly' },
    { key: 'F11', desc: 'Toggle Fullscreen distraction-free mode' },
    { key: '?', desc: 'Show this keyboard guide' }
  ];

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div 
          className="modal-card modal-card-wide modal-bottom-sheet"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        >
          <div className="sheet-drag-handle mobile-only" />
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="modal-icon-header">
              <Command size={22} />
              <span>Cognitive Flow Keybindings</span>
            </div>
            <button 
              className="btn btn-icon" 
              onClick={onClose}
              style={{ border: 'none', background: 'transparent' }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            <div className="shortcuts-grid">
              {shortcuts.map((sc, i) => (
                <div className="shortcut-item" key={i}>
                  <span className="kbd-badge">{sc.key}</span>
                  <span className="shortcut-label">{sc.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
