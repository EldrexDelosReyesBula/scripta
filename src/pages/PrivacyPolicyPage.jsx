import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  HardDrive, 
  EyeOff, 
  Lock, 
  WifiOff, 
  Trash2,
  Mail,
  Globe,
  UserCheck,
  CheckCircle2,
  DatabaseZap
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.js';

export function PrivacyPolicyPage({ onBackToHome, onEnterDesk }) {
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
          <span className="landing-nav-link" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Privacy Policy</span>
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
          <div className="section-tag">Data Sovereignty & Privacy Doctrine</div>
          <h1 className="legal-doc-title">Privacy Policy</h1>
          <p className="legal-doc-date">Effective Date: August 2026 · Official Public Document · escripta.vercel.app</p>
        </motion.div>

        <motion.div 
          className="legal-highlight-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <ShieldCheck size={32} className="legal-highlight-icon" />
          <div>
            <h3>The Absolute Privacy Guarantee</h3>
            <p>
              Scripta is engineered from the ground up as a <strong>100% client-side, local-first writing environment</strong>. We hold a strict architectural belief that your thoughts, notes, and manuscripts are inherently private. Scripta collects zero personal data, operates without remote database storage, and transmits no analytics or keystroke telemetry.
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
            <h2>1. Zero-Cloud Architectural Foundation</h2>
            <p>
              Traditional web applications send your inputs to remote servers for processing and cloud persistence. Scripta operates under an inverted local-first model:
            </p>
            <p>
              The entire application code, procedural Web Audio synthesizer, Hemingway sentence-structure linter, and document compilation pipelines execute completely within your device's local web browser runtime. No text entered into Scripta is ever transmitted to or stored on any external server.
            </p>
          </section>

          <section className="legal-doc-section">
            <h2>2. What We Store Locally on Your Machine</h2>
            <p>
              To ensure uninterrupted workflow and auto-recovery across browser refreshes, Scripta utilizes the browser's native <code>localStorage</code> API. This data remains physically stored on your computer or mobile device:
            </p>

            <div className="legal-features-list">
              <div className="legal-feature-item">
                <HardDrive size={20} />
                <div>
                  <strong>Session State & Draft Recovery</strong>
                  <p>Your current inquiry, drafting room text, organized thought cards, and graveyard items are stored in your browser's private storage for instantaneous session recovery.</p>
                </div>
              </div>

              <div className="legal-feature-item">
                <Lock size={20} />
                <div>
                  <strong>User Preferences</strong>
                  <p>Your audio volume, switch sound profile (Typewriter / Creamy / Clicky), word length goals, high contrast modes, and font size configurations are saved locally.</p>
                </div>
              </div>

              <div className="legal-feature-item">
                <EyeOff size={20} />
                <div>
                  <strong>No Tracking, Cookies, or Third-Party Telemetry</strong>
                  <p>We do not use tracking cookies, advertising pixels, session recorders (e.g. Hotjar), or analytics services (e.g. Google Analytics). Your user behavior is never measured or tracked.</p>
                </div>
              </div>

              <div className="legal-feature-item">
                <WifiOff size={20} />
                <div>
                  <strong>100% Offline Capability (PWA)</strong>
                  <p>Scripta functions as a Progressive Web App. You can write in remote cabins, aboard airplanes, or on the subway without internet access.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="legal-doc-section">
            <h2>3. Client-Side Multi-Format Compilations</h2>
            <p>
              When you export manuscripts to Microsoft Word (<code>.docx</code>), Adobe PDF (<code>.pdf</code>), Markdown (<code>.md</code>), Plain Text (<code>.txt</code>), HTML, or <code>.scripta</code>, files are assembled using client-side JavaScript Blob generation. At no stage is your work uploaded to an online conversion API.
            </p>
          </section>

          <section className="legal-doc-section">
            <h2>4. Data Erasure & Total Portability</h2>
            <p>
              You maintain total dominion over your data. You may erase all locally cached manuscripts at any moment by clearing your browser's site data or invoking the Reset Session button in the Error Boundary. Furthermore, the <code>.scripta</code> format is open JSON, granting you complete data portability.
            </p>
          </section>

          <section className="legal-doc-section">
            <h2>5. Creator Attribution & Legal Contact</h2>
            <p>
              Scripta is created and maintained by <strong>Eldrex Delos Reyes Bula</strong>. For inquiries regarding architecture, data privacy, or verification, please contact:
            </p>
            <div className="legal-feature-item" style={{ marginTop: 12 }}>
              <Mail size={20} />
              <div>
                <strong>Official Contact Email</strong>
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
