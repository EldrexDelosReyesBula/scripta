import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  FolderOpen, 
  Save, 
  Settings, 
  HelpCircle, 
  Menu, 
  X, 
  ArrowRight,
  Clock,
  FileText
} from 'lucide-react';
import { 
  IconScriptaPen, 
  IconScriptaGrid, 
  IconScriptaChisel, 
  IconScriptaCompass 
} from './ScriptaIcons.jsx';
import { audioEngine } from '../audio/audioEngine.js';

export function Header({ 
  currentRoom, 
  onSwitchRoom, 
  onOpenLanding,
  workingQuestion, 
  soundEnabled, 
  onToggleSound, 
  onOpenProject, 
  onSaveProject, 
  onOpenSettings, 
  onOpenShortcuts, 
  unlockedRooms,
  metrics = { wordCount: 0, charCount: 0, readingTimeMins: 1 },
  counterMode = 'words',
  onCycleCounterMode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRoomSelect = (room) => {
    audioEngine.playBlip();
    onSwitchRoom(room);
    setIsMobileMenuOpen(false);
  };

  const getRoomName = (room) => {
    switch (room) {
      case 'threshold': return 'Threshold';
      case 'sandbox': return 'Sandbox';
      case 'cutting': return 'Cutting Room';
      case 'sculptor': return 'Sculptor';
      default: return 'Draft';
    }
  };

  const renderCounterLabel = () => {
    if (counterMode === 'readingTime') {
      return (
        <>
          <Clock size={13} className="counter-icon" />
          <span>{metrics.readingTimeMins} min read</span>
        </>
      );
    }
    if (counterMode === 'characters') {
      return (
        <>
          <FileText size={13} className="counter-icon" />
          <span>{metrics.charCount.toLocaleString()} chars</span>
        </>
      );
    }
    if (counterMode === 'detailed') {
      return (
        <>
          <span>{metrics.wordCount.toLocaleString()} words · {metrics.readingTimeMins}m read</span>
        </>
      );
    }
    // Default words
    return (
      <>
        <span>{metrics.wordCount.toLocaleString()} words</span>
      </>
    );
  };

  return (
    <>
      <header className="scripta-header">
        <div className="brand-container">
          <div 
            className="brand-title" 
            onClick={() => onOpenLanding ? onOpenLanding() : handleRoomSelect('threshold')}
            title="Scripta — Home & Manifesto"
          >
            <img 
              src="/assets/scripta-logo.svg" 
              alt="Scripta Logo" 
              className="brand-logo-img" 
            />
            <span>Scripta</span>
          </div>
        </div>

        {/* Desktop Room Navigation & Actions */}
        <div className="header-actions desktop-only">
          <nav className="room-indicators" aria-label="Room Navigation">
            <button 
              className={`room-tab ${currentRoom === 'threshold' ? 'active' : ''}`}
              onClick={() => handleRoomSelect('threshold')}
              title="The Threshold (Inquiry)"
            >
              <IconScriptaCompass size={14} />
              <span>Threshold</span>
            </button>

            <button 
              className={`room-tab ${currentRoom === 'sandbox' ? 'active' : ''}`}
              onClick={() => handleRoomSelect('sandbox')}
              title="Drafting Room (Alt+1)"
            >
              <IconScriptaPen size={14} />
              <span>Sandbox</span>
            </button>

            <button 
              className={`room-tab ${currentRoom === 'cutting' ? 'active' : ''}`}
              onClick={() => handleRoomSelect('cutting')}
              title="Organization Room (Alt+2)"
            >
              <IconScriptaGrid size={14} />
              <span>Cutting Room</span>
            </button>

            <button 
              className={`room-tab ${currentRoom === 'sculptor' ? 'active' : ''}`}
              onClick={() => handleRoomSelect('sculptor')}
              title="Refinement Room (Alt+3)"
            >
              <IconScriptaChisel size={14} />
              <span>Sculptor</span>
            </button>
          </nav>

          <div className="header-tool-buttons">
            <button 
              className="btn btn-icon" 
              onClick={() => {
                onToggleSound();
                if (!soundEnabled) audioEngine.playBlip();
              }}
              title={soundEnabled ? "Mute Audio (Alt+M)" : "Unmute Audio (Alt+M)"}
              aria-label="Toggle Audio"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button 
              className="btn btn-icon" 
              onClick={onOpenProject} 
              title="Open .scripta Project (Ctrl+O)"
              aria-label="Open Project"
            >
              <FolderOpen size={18} />
            </button>

            <button 
              className="btn btn-icon" 
              onClick={onSaveProject} 
              title="Save Ritual (Ctrl+S)"
              aria-label="Save Project"
            >
              <Save size={18} />
            </button>

            <button 
              className="btn btn-icon" 
              onClick={onOpenSettings} 
              title="Preferences & Accessibility"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>

            <button 
              className="btn btn-icon" 
              onClick={onOpenShortcuts} 
              title="Keyboard Shortcuts (?)"
              aria-label="Help"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="mobile-menu-toggle mobile-only">
          <button 
            className="btn btn-icon mobile-menu-btn"
            onClick={() => {
              audioEngine.playBlip();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              className="mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside 
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            >
              <div className="mobile-drawer-header">
                <div className="brand-title">
                  <img src="/assets/scripta-logo.svg" alt="Scripta" className="brand-logo-img" />
                  <span>Scripta Menu</span>
                </div>
                <button 
                  className="btn btn-icon" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ border: 'none', background: 'transparent' }}
                >
                  <X size={20} />
                </button>
              </div>

              {workingQuestion && (
                <div className="mobile-drawer-question">
                  <span className="mobile-drawer-question-label">Active Inquiry</span>
                  <div className="mobile-drawer-question-text">"{workingQuestion}"</div>
                </div>
              )}

              {/* Mobile Text Counter */}
              {counterMode !== 'off' && currentRoom !== 'threshold' && (
                <div 
                  className="mobile-drawer-counter-row"
                  onClick={() => {
                    audioEngine.playBlip();
                    onCycleCounterMode?.();
                  }}
                >
                  <span className="counter-row-label">Manuscript Metrics</span>
                  <div className="mobile-counter-pill">
                    {renderCounterLabel()}
                  </div>
                </div>
              )}

              {/* Room Navigation */}
              <div className="mobile-drawer-section">
                <div className="mobile-drawer-section-title">Spatial Rooms</div>
                <div className="mobile-drawer-nav-list">
                  <button 
                    className={`mobile-nav-item ${currentRoom === 'threshold' ? 'active' : ''}`}
                    onClick={() => handleRoomSelect('threshold')}
                  >
                    <div className="mobile-nav-icon"><IconScriptaCompass size={18} /></div>
                    <div className="mobile-nav-info">
                      <span className="mobile-nav-name">The Threshold</span>
                      <span className="mobile-nav-desc">Inquiry & warm-up prompt</span>
                    </div>
                    {currentRoom === 'threshold' && <ArrowRight size={16} />}
                  </button>

                  <button 
                    className={`mobile-nav-item ${currentRoom === 'sandbox' ? 'active' : ''}`}
                    onClick={() => handleRoomSelect('sandbox')}
                  >
                    <div className="mobile-nav-icon"><IconScriptaPen size={18} /></div>
                    <div className="mobile-nav-info">
                      <span className="mobile-nav-name">The Sandbox</span>
                      <span className="mobile-nav-desc">Pure generative drafting</span>
                    </div>
                    {currentRoom === 'sandbox' && <ArrowRight size={16} />}
                  </button>

                  <button 
                    className={`mobile-nav-item ${currentRoom === 'cutting' ? 'active' : ''}`}
                    onClick={() => handleRoomSelect('cutting')}
                  >
                    <div className="mobile-nav-icon"><IconScriptaGrid size={18} /></div>
                    <div className="mobile-nav-info">
                      <span className="mobile-nav-name">The Cutting Room</span>
                      <span className="mobile-nav-desc">Structure & card labeling</span>
                    </div>
                    {currentRoom === 'cutting' && <ArrowRight size={16} />}
                  </button>

                  <button 
                    className={`mobile-nav-item ${currentRoom === 'sculptor' ? 'active' : ''}`}
                    onClick={() => handleRoomSelect('sculptor')}
                  >
                    <div className="mobile-nav-icon"><IconScriptaChisel size={18} /></div>
                    <div className="mobile-nav-info">
                      <span className="mobile-nav-name">The Sculptor</span>
                      <span className="mobile-nav-desc">Sentence rhythm & polish</span>
                    </div>
                    {currentRoom === 'sculptor' && <ArrowRight size={16} />}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mobile-drawer-section">
                <div className="mobile-drawer-section-title">Session Tools</div>
                <div className="mobile-actions-grid">
                  <button 
                    className="mobile-action-btn"
                    onClick={() => {
                      onToggleSound();
                      audioEngine.playBlip();
                    }}
                  >
                    {soundEnabled ? <Volume2 size={18} color="var(--accent-color)" /> : <VolumeX size={18} />}
                    <span>{soundEnabled ? "Audio On" : "Audio Muted"}</span>
                  </button>

                  <button 
                    className="mobile-action-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenProject();
                    }}
                  >
                    <FolderOpen size={18} />
                    <span>Open Project</span>
                  </button>

                  <button 
                    className="mobile-action-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSaveProject();
                    }}
                  >
                    <Save size={18} />
                    <span>Save Ritual</span>
                  </button>

                  <button 
                    className="mobile-action-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenSettings();
                    }}
                  >
                    <Settings size={18} />
                    <span>Preferences</span>
                  </button>

                  <button 
                    className="mobile-action-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenShortcuts();
                    }}
                  >
                    <HelpCircle size={18} />
                    <span>Shortcuts</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
