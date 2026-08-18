import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, X, Lock, CheckCircle2, Award, HardDrive, EyeOff } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.js';

export function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div 
          className="modal-card modal-card-wide modal-bottom-sheet legal-modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        >
          <div className="sheet-drag-handle mobile-only" />

          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="legal-tab-triggers">
              <button 
                type="button"
                className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => {
                  audioEngine.playBlip();
                  setActiveTab('privacy');
                }}
              >
                <Shield size={18} />
                <span>Privacy Policy</span>
              </button>
              <button 
                type="button"
                className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
                onClick={() => {
                  audioEngine.playBlip();
                  setActiveTab('terms');
                }}
              >
                <FileText size={18} />
                <span>Terms of Use</span>
              </button>
            </div>

            <button 
              className="btn btn-icon" 
              onClick={onClose} 
              style={{ border: 'none', background: 'transparent' }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body legal-modal-body">
            {activeTab === 'privacy' ? (
              <div className="legal-content">
                <div className="legal-banner">
                  <Lock size={20} className="legal-banner-icon" />
                  <div>
                    <h4 className="legal-banner-title">Zero-Cloud, 100% Local-First Architecture</h4>
                    <p className="legal-banner-desc">
                      Scripta runs entirely in your local browser sandbox. No accounts, no cookies, and zero remote data storage.
                    </p>
                  </div>
                </div>

                <section className="legal-section">
                  <h3>1. Our Core Privacy Guarantee</h3>
                  <p>
                    Scripta was engineered under a strict privacy-first doctrine. We believe your thoughts, drafts, and manuscripts are deeply private cognitive spaces. Scripta does not collect, transmit, analyze, scrape, or monetize any of your written content.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>2. What Data We Store</h3>
                  <div className="legal-features-list">
                    <div className="legal-feature-item">
                      <HardDrive size={18} />
                      <div>
                        <strong>Local Browser Storage (LocalStorage)</strong>
                        <p>Your active draft, settings, and room state are saved strictly in your browser's private storage for auto-recovery.</p>
                      </div>
                    </div>
                    <div className="legal-feature-item">
                      <EyeOff size={18} />
                      <div>
                        <strong>Zero Third-Party Telemetry</strong>
                        <p>We do not use tracking scripts, ad pixels, third-party analytics (e.g. Google Analytics), or behavioral profiling tools.</p>
                      </div>
                    </div>
                    <div className="legal-feature-item">
                      <Lock size={18} />
                      <div>
                        <strong>No Server Communication</strong>
                        <p>All exports (Word, PDF, Markdown, Plain Text, HTML, .scripta) are compiled directly on your device via client-side libraries.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="legal-section">
                  <h3>3. Local Storage Control & Erasure</h3>
                  <p>
                    You maintain complete sovereignty over your data. Clearing your browser cache or site storage permanently removes all locally stored drafts. You can also back up or transfer your projects at any time using <strong>.scripta</strong> project files.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>4. Offline Capability</h3>
                  <p>
                    Scripta operates entirely offline. Once loaded, you can disconnect your internet connection and draft with 100% functionality.
                  </p>
                </section>
              </div>
            ) : (
              <div className="legal-content">
                <div className="legal-banner">
                  <Award size={20} className="legal-banner-icon" />
                  <div>
                    <h4 className="legal-banner-title">100% Author Ownership</h4>
                    <p className="legal-banner-desc">
                      You retain full, unconditional copyright and ownership over everything you create in Scripta.
                    </p>
                  </div>
                </div>

                <section className="legal-section">
                  <h3>1. Intellectual Property & Ownership</h3>
                  <p>
                    All text, concepts, notes, cards, and manuscripts created or imported into Scripta belong exclusively to you. Scripta claims zero intellectual property, licensing, or distribution rights over your writing.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>2. Permitted Use</h3>
                  <p>
                    Scripta is provided as a distraction-free writing environment for personal, academic, creative, journalistic, and commercial authors. You are free to export and publish your work anywhere without attribution requirements.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>3. Data Responsibility & Backups</h3>
                  <p>
                    Because Scripta operates as a local-first application without a remote cloud database, you are responsible for maintaining backups of your work. We strongly recommend regularly saving <strong>.scripta</strong> project files or exporting your work to Word/Markdown before clearing browser history or resetting devices.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>4. Disclaimer & "As-Is" Provision</h3>
                  <p>
                    Scripta is provided "as is", without warranty of any kind, express or implied. While we employ resilient local debouncing and recovery systems, Scripta is not liable for data loss caused by hardware failure, browser crashes, or accidental cache clearance.
                  </p>
                </section>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
