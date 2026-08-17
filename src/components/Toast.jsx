import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--accent-color)',
          padding: '14px 20px',
          borderRadius: 10,
          boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
          zIndex: 2000,
          fontSize: '0.9rem',
          maxWidth: 320
        }}
      >
        <strong>{toast.title}</strong>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
          {toast.message}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
