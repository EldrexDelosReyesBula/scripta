import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Sparkles, CheckCircle2, ArrowRight, X, FileText, Printer, Download } from 'lucide-react';
import { storageEngine } from '../storage/storageEngine.js';
import { audioEngine } from '../audio/audioEngine.js';

export function SandboxExitModal({ isOpen, onClose, onConfirm, wordCount }) {
  if (!isOpen) return null;

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
          <div className="modal-header">
            <div className="modal-icon-header">
              <LayoutGrid size={22} />
              <span>Step 2 Complete: Ready to Organize?</span>
            </div>
          </div>
          <div className="modal-body">
            <p>You have written <strong>{wordCount} words</strong> of pure unedited thought.</p>
            <p style={{ marginTop: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              In The Cutting Room, your raw paragraphs become movable index cards. Direct editing is temporarily paused so you can focus entirely on structure and labeling.
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Keep Writing in Sandbox
            </button>
            <button className="btn btn-primary" onClick={onConfirm}>
              <span>Go to Cutting Room</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function CuttingExitModal({ isOpen, onClose, onConfirm, cardCount }) {
  if (!isOpen) return null;

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
          <div className="modal-header">
            <div className="modal-icon-header">
              <Sparkles size={22} />
              <span>Step 3 Complete: Ready to Polish?</span>
            </div>
          </div>
          <div className="modal-body">
            <p>You have organized and labeled <strong>{cardCount} structural blocks</strong>.</p>
            <p style={{ marginTop: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              In The Sculptor, your blocks are reassembled into a complete manuscript. You will now be able to polish individual sentences, listen to voice read-aloud, and export to Word, PDF, or Markdown.
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Return to Cutting Room
            </button>
            <button className="btn btn-primary" onClick={onConfirm}>
              <span>Enter The Sculptor</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function FinalizeModal({ isOpen, onClose, stats, appState, onUpdateMetadata }) {
  const [includeColophon, setIncludeColophon] = useState(true);
  const [customNote, setCustomNote] = useState(appState.metadata?.customNote || '');
  const [checklist, setChecklist] = useState({
    readAloud: appState.sculptor?.readAloudUsed || false,
    hemingway: appState.sculptor?.hemingwayUsed || false,
    intentCheck: false
  });

  if (!isOpen) return null;

  const text = appState.sculptor?.finalText || '';
  const title = (appState.workingQuestion || 'manuscript').replace(/[^a-z0-9]/gi, '-').toLowerCase();

  // Document Analytics calculation
  const totalSeconds = appState.metadata?.totalTimeSpentSec || 60;
  const mins = Math.max(1, Math.round(totalSeconds / 60));
  const timeSpentFormatted = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min(s)`;
  const sessionDays = appState.metadata?.sessionDays || 1;
  const revisionsCount = (appState.cuttingRoom?.cards?.length || 0) + (appState.sculptor?.revisionsCount || 0);
  const deletionsCount = appState.metadata?.deletionsCount || 0;

  const colophonData = {
    timeSpentFormatted,
    sessionDays,
    revisionsCount,
    deletionsCount,
    customNote: customNote.trim()
  };

  const getColophonMarkdown = () => {
    if (!includeColophon) return '';
    return `\n\n---\n### Manuscript Provenance & Writing Receipt\n- **Active Writing Time:** ${timeSpentFormatted}\n- **Session Days:** ${sessionDays} day(s)\n- **Structural Blocks & Revisions:** ${revisionsCount} edits\n- **Deletions:** ${deletionsCount} deletions\n${customNote ? `- **Writer Note:** ${customNote}\n` : ''}- **Drafted in:** Scripta — Cognitive Spatial Writing Space\n`;
  };

  const handleExport = (format) => {
    audioEngine.playBlip();
    if (customNote !== appState.metadata?.customNote) {
      onUpdateMetadata?.({ customNote: customNote.trim() });
    }

    const exportedContent = text + (includeColophon ? getColophonMarkdown() : '');

    if (format === 'word') {
      storageEngine.exportToWord(title, text, appState.workingQuestion, includeColophon ? colophonData : null);
    } else if (format === 'pdf') {
      storageEngine.exportToPDF();
    } else if (format === 'md') {
      storageEngine.downloadBlob(exportedContent, `${title}.md`, 'text/markdown');
    } else if (format === 'txt') {
      storageEngine.downloadBlob(exportedContent, `${title}.txt`, 'text/plain');
    } else if (format === 'html') {
      const colophonHtml = includeColophon ? `<div style="margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:0.85rem;color:#666;"><h3>Manuscript Provenance</h3><p>Active Writing Time: ${timeSpentFormatted} | Session Days: ${sessionDays} | Revisions: ${revisionsCount}</p>${customNote ? `<p>Note: ${customNote}</p>` : ''}</div>` : '';
      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{max-width:720px;margin:40px auto;font-family:Georgia,serif;line-height:1.8;padding:0 20px;color:#222;}h1{font-size:1.6rem;margin-bottom:24px;}</style></head><body><h1>${appState.workingQuestion || 'Manuscript'}</h1><p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>${colophonHtml}</body></html>`;
      storageEngine.downloadBlob(htmlContent, `${title}.html`, 'text/html');
    } else if (format === 'scripta') {
      storageEngine.saveProject(appState);
    }
  };

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
              <CheckCircle2 size={22} />
              <span>Step 4: Finalize & Document Analytics</span>
            </div>
            <button className="btn btn-icon" onClick={onClose} style={{ border: 'none', background: 'transparent' }}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            {/* Writing Analytics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
              marginBottom: 20,
              background: 'var(--bg-input)',
              padding: 14,
              borderRadius: 12,
              textAlign: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-sandbox)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                  {timeSpentFormatted}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>
                  Time Spent
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-sandbox)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                  {sessionDays} {sessionDays === 1 ? 'Day' : 'Days'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>
                  Active Days
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-sandbox)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                  {revisionsCount}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>
                  Revisions
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-sandbox)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                  {deletionsCount}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>
                  Deletions
                </div>
              </div>
            </div>

            {/* Optional Writer Custom Note */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>
                Optional Writer's Note & Context:
              </label>
              <input 
                type="text" 
                className="input-text"
                placeholder="e.g., Drafted for Chapter 3 thesis, morning writing sprint..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                style={{ fontSize: '0.86rem', padding: '8px 12px' }}
              />
            </div>

            {/* Colophon & Self-Editing Checklist */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-color)', cursor: 'pointer', marginBottom: 10 }}>
                <input 
                  type="checkbox" 
                  checked={includeColophon}
                  onChange={(e) => setIncludeColophon(e.target.checked)}
                />
                Append Document Provenance & Writing Receipt to Exports
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', marginBottom: 6, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={checklist.readAloud}
                  onChange={(e) => setChecklist({ ...checklist, readAloud: e.target.checked })}
                />
                Read aloud with synthesizer to check sentence rhythm
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={checklist.intentCheck}
                  onChange={(e) => setChecklist({ ...checklist, intentCheck: e.target.checked })}
                />
                Verified manuscript answers the initial inquiry question
              </label>
            </div>

            <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 10, color: 'var(--accent-color)' }}>
              Export Formats:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              <button className="btn btn-primary" onClick={() => handleExport('word')} title="Export formatted Word Document">
                <FileText size={16} />
                <span>Word (.docx)</span>
              </button>
              <button className="btn btn-primary" onClick={() => handleExport('pdf')} title="Print or Save as PDF Document">
                <Printer size={16} />
                <span>PDF Document</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('md')} title="Export Markdown text">
                <span>Markdown (.md)</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('txt')} title="Export Plain Text">
                <span>Plain Text (.txt)</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('html')} title="Export Web HTML">
                <span>HTML Page</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('scripta')} title="Save Full Project File">
                <Download size={16} />
                <span>Scripta Project</span>
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

