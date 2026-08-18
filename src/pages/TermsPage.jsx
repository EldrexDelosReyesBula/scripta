import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  BookOpen, 
  Scale, 
  HardDrive, 
  AlertCircle,
  FileCheck,
  Mail,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.js';

export function TermsPage({ onBackToHome, onEnterDesk }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLaunch = () => {
    audioEngine.playSwell();
    onEnterDesk();
  };

  return (
    <div className="landing-container legal-fullpage-container">
      {/* Top Editorial Nav — Identical to Landing Page */}
      <header className="landing-nav">
        <div className="landing-brand" onClick={onBackToHome} style={{ cursor: 'pointer' }}>
          <img src="/assets/scripta-logo.svg" alt="Scripta Emblem" className="brand-logo-img" />
          <span>Scripta</span>
        </div>

        <nav className="landing-links desktop-only">
          <button type="button" onClick={onBackToHome} className="landing-nav-link link-button">Home</button>
          <span className="landing-nav-link" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Terms of Use</span>
        </nav>

        <div className="landing-nav-actions">
          <button 
            type="button"
            className="btn btn-primary landing-launch-btn"
            onClick={handleLaunch}
          >
            <span>Open Desk</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="legal-document-layout">
        <motion.div 
          className="legal-doc-header"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="section-tag">Author Rights & Terms of Service</div>
          <h1 className="legal-doc-title">Terms of Use</h1>
          <p className="legal-doc-date">Effective Date: August 2026 · Official Public Document · escripta.vercel.app</p>
        </motion.div>

        <motion.div 
          className="legal-highlight-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Award size={32} className="legal-highlight-icon" />
          <div>
            <h3>100% Unconditional Author Sovereignty</h3>
            <p>
              Every thought, prompt, phrase, and manuscript created inside Scripta belongs exclusively and unconditionally to you. Scripta claims <strong>zero copyright, licensing rights, royalty claims, or ownership</strong> over your creative and intellectual property.
            </p>
          </div>
        </motion.div>

        <motion.article 
          className="legal-doc-body"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <section className="legal-doc-section">
            <h2>1. Author Intellectual Property Ownership</h2>
            <p>
              You retain all copyright, moral rights, and intellectual property rights in the manuscripts and text you author using Scripta. Scripta does not ingest, sub-license, index, or utilize your text to train machine learning models.
            </p>
          </section>

          <section className="legal-doc-section">
            <h2>2. Permitted Commercial & Creative Use</h2>
            <p>
              Scripta is provided freely for personal, professional, journalistic, literary, academic, and commercial purposes. You may freely publish, sell, distribute, or monetize manuscripts produced using Scripta without requiring attribution, license fees, or ongoing royalties.
            </p>
          </section>

          <section className="legal-doc-section">
            <h2>3. Local Storage Custodianship & Best Practices</h2>
            <p>
              Because Scripta operates as a local-first application without remote cloud servers, the writer acts as the primary custodian of their work:
            </p>
            <ul className="legal-doc-list">
              <li>Use <strong>The Save Ritual (Ctrl+S)</strong> regularly to download <code>.scripta</code> project backup archives.</li>
              <li>Export completed manuscripts to standard formats such as Microsoft Word (<code>.docx</code>), Adobe PDF (<code>.pdf</code>), or Markdown (<code>.md</code>).</li>
              <li>Ensure local backups are safely stored before performing broad browser cache or site data deletions.</li>
            </ul>
          </section>

          <section className="legal-doc-section">
            <h2>4. "As-Is" Software Warranty & Liability</h2>
            <p>
              Scripta is provided on an "as-is" and "as-available" basis. While we employ rigorous client-side state preservation mechanisms, the software is provided without express or implied warranties of any kind. The creator shall not be held liable for damages or data loss resulting from hardware failure, operating system crashes, or third-party browser extensions.
            </p>
          </section>

          <section className="legal-doc-section">
            <h2>5. Creator Attribution & Contact</h2>
            <p>
              Scripta is engineered by <strong>Eldrex Delos Reyes Bula</strong>. For inquiries regarding licensing, usage, or technical architecture, please contact:
            </p>
            <div className="legal-feature-item" style={{ marginTop: 12 }}>
              <Mail size={20} />
              <div>
                <strong>Creator Email</strong>
                <p><a href="mailto:eldrexdelosreyesbula@gmail.com" style={{ color: 'var(--accent-color)' }}>eldrexdelosreyesbula@gmail.com</a></p>
              </div>
            </div>
            <div className="legal-feature-item" style={{ marginTop: 8 }}>
              <Globe size={20} />
              <div>
                <strong>Official Web Deployment</strong>
                <p><a href="https://escripta.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>https://escripta.vercel.app</a></p>
              </div>
            </div>
          </section>
        </motion.article>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/assets/scripta-logo.svg" alt="Scripta" className="brand-logo-img" />
              <span>Scripta</span>
            </div>
            <p>The distraction-free writing desk for cognitive clarity.</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Created by <strong>Eldrex Delos Reyes Bula</strong> · <a href="mailto:eldrexdelosreyesbula@gmail.com" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>eldrexdelosreyesbula@gmail.com</a>
            </p>
          </div>

          <div className="footer-links">
            <button type="button" onClick={onBackToHome} className="footer-link">Home</button>
            <button type="button" onClick={handleLaunch} className="footer-link">Launch Desk</button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Scripta · <a href="https://escripta.vercel.app" style={{ color: 'inherit', textDecoration: 'none' }}>escripta.vercel.app</a></span>
          <span>Crafted by Eldrex Delos Reyes Bula for writers who value attention</span>
        </div>
      </footer>
    </div>
  );
}
