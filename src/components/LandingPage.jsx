import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Volume2,
  FileText,
  HardDrive,
  Layers,
  Compass,
  PenTool,
  Grid,
  Scissors,
  BookmarkCheck,
  CheckCircle,
  Clock,
  CloudSun
} from 'lucide-react';
import {
  IconScriptaCompass,
  IconScriptaPen,
  IconScriptaGrid,
  IconScriptaChisel
} from './ScriptaIcons.jsx';
import { AtmosphericSky } from './AtmosphericSky.jsx';
import { audioEngine } from '../audio/audioEngine.js';
import { cairnToReact, UI, tokens } from '@eldrex/cairn';

export function LandingPage({
  onEnterApp,
  onOpenPrivacy,
  onOpenTerms
}) {
  const handleLaunch = () => {
    audioEngine.playSwell();
    onEnterApp();
  };

  const CairnFrameworkBadge = cairnToReact(() => {
    return UI.Badge({ variant: 'UI Framework: @eldrex/cairn' });
  });

  const CairnFAQSection = cairnToReact(() => {
    return UI.Container({ style: { maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' } },
      UI.Accordion({
        title: '🔒 How does Scripta guarantee 100% data privacy?',
        content: 'Scripta operates entirely on your hardware as a local-first application. Keystrokes, drafts, and preferences never leave your browser. There are no remote databases, no tracking cookies, and zero third-party telemetry.'
      }),
      UI.Accordion({
        title: '🧠 Why are drafting and editing divided into separate rooms?',
        content: 'Drafting requires generative flow without self-judgment, while editing requires analytical critique. Separating them into The Sandbox (no backspace) and The Sculptor (Hemingway cadence linter) protects original thinking from premature self-censorship.'
      }),
      UI.Accordion({
        title: '💾 How does the .scripta project format work?',
        content: 'The .scripta format is an open, portable JSON structure containing your complete thought cards, graveyard phrases, target word goals, and Future Notes to your future self.'
      })
    );
  });

  return (
    <div className="landing-container">
      {/* Top Editorial Header */}
      <header className="landing-nav">
        <div className="landing-brand">
          <img src="/assets/scripta-logo.svg" alt="Scripta Emblem" className="brand-logo-img" />
          <span>Scripta</span>
        </div>

        <nav className="landing-links desktop-only">
          <a href="#philosophy" className="landing-nav-link">Philosophy</a>
          <a href="#architecture" className="landing-nav-link">4-Stage Flow</a>
          <a href="#features" className="landing-nav-link">Features</a>
          <button
            type="button"
            className="landing-nav-link link-button"
            onClick={onOpenPrivacy}
          >
            Privacy
          </button>
          <button
            type="button"
            className="landing-nav-link link-button"
            onClick={onOpenTerms}
          >
            Terms
          </button>
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

      {/* Hero Section with Live Time-Based Dynamic Sky & Swaying Grass */}
      <section className="landing-hero">
        <AtmosphericSky weather="auto" enabled={true} />

        <div className="landing-hero-content"><br />

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Writing software designed for people who actually want to <em>think</em>.
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Most writing tools assume you already know what you want to say. Scripta is built for the messy, circular process of thinking: drafting without editing, structuring thoughts as movable cards, and polishing prose with Hemingway rhythm.
          </motion.p>

          <motion.div
            className="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              type="button"
              className="btn btn-primary btn-xl"
              onClick={handleLaunch}
            >
              <span>Enter Writing Desk</span>
              <ArrowRight size={18} />
            </button>
          </motion.div>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <strong>100%</strong>
              <span>Local & Offline</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat-item">
              <strong>0</strong>
              <span>Trackers or Logins</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat-item">
              <strong>4</strong>
              <span>Spatial Cognitive Rooms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto Philosophy Section */}
      <section className="landing-section" id="philosophy">
        <div className="section-header">
          <div className="section-tag">Philosophy</div>
          <h2 className="section-title">Attention is not a resource to be monetized</h2>
          <p className="section-desc">
            Traditional word processors bombard you with toolbars, spellcheck squiggles, AI suggestions, and formatting menus before you've even formed an original thought.
          </p>
        </div>

        <div className="philosophy-grid">
          <div className="philosophy-card">
            <div className="philosophy-icon"><Zap size={22} /></div>
            <h3>Separation of Mental Modes</h3>
            <p>
              Drafting and editing require conflicting psychological states. Scripta separates the process into distinct spatial rooms so you never prematurely edit a draft into oblivion.
            </p>
          </div>

          <div className="philosophy-card">
            <div className="philosophy-icon"><ShieldCheck size={22} /></div>
            <h3>Zero Cloud Telemetry</h3>
            <p>
              Your thoughts remain strictly on your hardware. No telemetry, no remote storage, no AI scrapers, and no subscription paywalls.
            </p>
          </div>

          <div className="philosophy-card">
            <div className="philosophy-icon"><Clock size={22} /></div>
            <h3>Reading Time & Cadence</h3>
            <p>
              Writing is an experience that occupies someone's attention. Scripta emphasizes reader pacing, word length goals, and sentence rhythm over arbitrary quotas.
            </p>
          </div>
        </div>
      </section>

      {/* The 4-Room Architecture Showcase */}
      <section className="landing-section landing-architecture-section" id="architecture">
        <div className="section-header">
          <div className="section-tag">Spatial Flow</div>
          <h2 className="section-title">The Four Cognitive Rooms</h2>
          <p className="section-desc">
            A linear progression designed to shepherd ideas from nascent inquiries into polished manuscripts.
          </p>
        </div>

        <div className="rooms-showcase-grid">
          {/* Room 1: The Threshold */}
          <div className="room-showcase-card">
            <div className="room-card-header">
              <div className="room-card-icon"><IconScriptaCompass size={22} /></div>
              <span className="room-card-step">Stage 1</span>
            </div>
            <h3>The Threshold</h3>
            <p className="room-card-tagline">"What are you trying to think about?"</p>
            <p className="room-card-body">
              Before typing a word, you must state your central inquiry. A living procedural sky shifts atmospheric moods to gently ground your focus.
            </p>
          </div>

          {/* Room 2: The Sandbox */}
          <div className="room-showcase-card">
            <div className="room-card-header">
              <div className="room-card-icon"><IconScriptaPen size={22} /></div>
              <span className="room-card-step">Stage 2</span>
            </div>
            <h3>The Sandbox</h3>
            <p className="room-card-tagline">Pure forward-flowing generation</p>
            <p className="room-card-body">
              Strict flow-state discipline disables backspacing, preventing second-guessing. Past paragraphs softly fade so you stay locked on the active line with mechanical typewriter acoustic feedback.
            </p>
          </div>

          {/* Room 3: The Cutting Room */}
          <div className="room-showcase-card">
            <div className="room-card-header">
              <div className="room-card-icon"><IconScriptaGrid size={22} /></div>
              <span className="room-card-step">Stage 3</span>
            </div>
            <h3>The Cutting Room</h3>
            <p className="room-card-tagline">Structural organization & architecture</p>
            <p className="room-card-body">
              Raw drafting is sliced into movable thought blocks. Label each paragraph's architectural purpose (Evidence, Counterargument, Conclusion, or custom tags) and reorder using spatial drag-and-drop.
            </p>
          </div>

          {/* Room 4: The Sculptor */}
          <div className="room-showcase-card">
            <div className="room-card-header">
              <div className="room-card-icon"><IconScriptaChisel size={22} /></div>
              <span className="room-card-step">Stage 4</span>
            </div>
            <h3>The Sculptor</h3>
            <p className="room-card-tagline">Sentence rhythm & precision polish</p>
            <p className="room-card-body">
              Refine your prose with Hemingway linter highlighting adverbs, passive voice, and complex terms. Monitor sentence length variance, with The Graveyard drawer preserving all discarded phrases.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="landing-section" id="features">
        <div className="section-header">
          <div className="section-tag">Craftsmanship</div>
          <h2 className="section-title">Built with intention for the craft of writing</h2>
        </div>

        <div className="features-grid">
          <div className="feature-item">
            <Volume2 className="feature-icon" size={20} />
            <div>
              <h4>Tactile Typewriter Acoustics</h4>
              <p>Procedurally synthesized mechanical switches with custom sound profiles (Typewriter, Cream Thock, Silent).</p>
            </div>
          </div>

          <div className="feature-item">
            <BookmarkCheck className="feature-icon" size={20} />
            <div>
              <h4>The Save Ritual & Future Notes</h4>
              <p>Never close a session without leaving a note to your future self explaining where your mind was and what comes next.</p>
            </div>
          </div>

          <div className="feature-item">
            <FileText className="feature-icon" size={20} />
            <div>
              <h4>Multi-Format Export Suite</h4>
              <p>Export in 1-click to Microsoft Word (.docx), PDF Document, Markdown (.md), Plain Text (.txt), HTML, and .scripta.</p>
            </div>
          </div>

          <div className="feature-item">
            <Layers className="feature-icon" size={20} />
            <div>
              <h4>The Graveyard Drawer</h4>
              <p>Deleted phrases are safely captured in a sliding drawer with 1-click restore, eliminating the anxiety of trimming prose.</p>
            </div>
          </div>

          <div className="feature-item">
            <HardDrive className="feature-icon" size={20} />
            <div>
              <h4>Debounced Local Recovery</h4>
              <p>Keystroke state is continuously preserved in browser memory without performance stutter or cloud reliance.</p>
            </div>
          </div>

          <div className="feature-item">
            <ShieldCheck className="feature-icon" size={20} />
            <div>
              <h4>Complete Data Sovereignty</h4>
              <p>No user accounts. No tracking cookies. Your intellectual property stays 100% on your machine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="landing-section" id="faq">
        <div className="section-header">
          <div className="section-tag">Common Inquiries</div>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">Everything you need to know about local-first cognitive drafting.</p>
        </div>

        <CairnFAQSection />
      </section>

      {/* Bottom CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-logo-glow">
          <img src="/assets/scripta-logo.svg" alt="Scripta" className="cta-logo-img" />
        </div>

        <h2>Ready to clear the noise and <em>think</em>?</h2>
        <p>No registration, no paywalls, zero cloud tracking. Open the desk and start thinking.</p>

        <button
          type="button"
          className="btn btn-primary btn-xl cta-action-btn"
          onClick={handleLaunch}
        >
          <span>Open Writing Desk</span>
          <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/assets/scripta-logo.svg" alt="Scripta" className="brand-logo-img" />
              <span>Scripta</span>
            </div>
            <p>The distraction-free writing desk for cognitive clarity.</p>
          </div>

          <div className="footer-links">
            <button type="button" onClick={onOpenPrivacy} className="footer-link">Privacy Policy</button>
            <button type="button" onClick={onOpenTerms} className="footer-link">Terms of Use</button>
            <button type="button" onClick={handleLaunch} className="footer-link">Launch Workspace</button>
          </div>
        </div>

        <div className="footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span>© {new Date().getFullYear()} Scripta · <a href="https://escripta.vercel.app" style={{ color: 'inherit', textDecoration: 'none' }}>escripta.vercel.app</a></span>
            <CairnFrameworkBadge />
          </div>
          <span>Crafted by Eldrex Delos Reyes Bula</span>
        </div>
      </footer>
    </div>
  );
};
