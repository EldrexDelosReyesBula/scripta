import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.js';

export function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings 
}) {
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
          {/* Mobile Bottom-Sheet Drag Handle */}
          <div className="sheet-drag-handle mobile-only" />

          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="modal-icon-header">
              <Settings size={22} />
              <span>Preferences & Accessibility</span>
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
            <div className="settings-grid">
              {/* Session Target Duration */}
              <div className="setting-row">
                <div className="setting-info">
                  <label className="setting-title">Sandbox Target Timer</label>
                  <div className="setting-desc">Sets the visual target session countdown</div>
                </div>
                <div className="setting-control">
                  <select 
                    className="input-select"
                    value={settings.timerDuration || 900}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateSettings({ timerDuration: val });
                      audioEngine.playBlip();
                    }}
                  >
                    <option value={300}>5 Minutes</option>
                    <option value={600}>10 Minutes</option>
                    <option value={900}>15 Minutes (Default)</option>
                    <option value={1200}>20 Minutes</option>
                    <option value={1800}>30 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Strict Flow State Backspace Discipline Toggle */}
              <div className="setting-row">
                <div className="setting-info">
                  <label className="setting-title">Strict Flow State (No Backspace)</label>
                  <div className="setting-desc">Disables backspacing in Sandbox to keep you writing forward without premature editing</div>
                </div>
                <div className="setting-control">
                  <button 
                    type="button"
                    className={`toggle-switch ${settings.strictSandboxDiscipline !== false ? 'active' : ''}`}
                    onClick={() => {
                      onUpdateSettings({ strictSandboxDiscipline: settings.strictSandboxDiscipline === false });
                      audioEngine.playBlip();
                    }}
                    aria-label="Toggle Strict Flow State"
                  >
                    <span className="toggle-switch-thumb" />
                  </button>
                </div>
              </div>

              {/* Mechanical Typing Acoustic Profile */}
              <div className="setting-row">
                <div className="setting-info">
                  <label className="setting-title">Mechanical Typing Profile</label>
                  <div className="setting-desc">Selectable tactile acoustic sound signatures</div>
                </div>
                <div className="setting-control">
                  <select 
                    className="input-select"
                    value={settings.soundProfile || 'typewriter'}
                    onChange={(e) => {
                      const profile = e.target.value;
                      audioEngine.setSoundProfile(profile);
                      onUpdateSettings({ soundProfile: profile });
                      setTimeout(() => audioEngine.playThock(false), 20);
                    }}
                  >
                    <option value="typewriter">Vintage Typewriter</option>
                    <option value="creamy">Creamy Lubed Linear</option>
                    <option value="clicky">Clicky Blue Switch</option>
                    <option value="membrane">Quiet Membrane Tap</option>
                  </select>
                </div>
              </div>

              {/* Master Audio Volume */}
              <div className="setting-row">
                <div className="setting-info">
                  <label className="setting-title">Typewriter & Atmosphere Volume</label>
                  <div className="setting-desc">Mechanical clacks and transition harmonics</div>
                </div>
                <div className="setting-control">
                  <div className="range-control">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={settings.volume ?? 0.35}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        audioEngine.setVolume(val);
                        onUpdateSettings({ volume: val });
                      }}
                    />
                    <span>{Math.round((settings.volume ?? 0.35) * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Base Typography Size Slider */}
              <div className="setting-row">
                <div className="setting-info">
                  <label className="setting-title">Editor Typography Scaling</label>
                  <div className="setting-desc">Adjust drafting and manuscript font size in real time</div>
                </div>
                <div className="setting-control">
                  <div className="range-control">
                    <input 
                      type="range" 
                      min="14" 
                      max="26" 
                      step="1"
                      value={settings.fontSize || 18}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        onUpdateSettings({ fontSize: val });
                      }}
                    />
                    <span>{settings.fontSize || 18}px</span>
                  </div>
                </div>
              </div>

              {/* Sky & Weather Atmosphere */}
              <div className="setting-row">
                <div className="setting-info">
                  <label className="setting-title">Sky & Weather Atmosphere</label>
                  <div className="setting-desc">Procedural living background mood on The Threshold</div>
                </div>
                <div className="setting-control">
                  <select 
                    className="input-select"
                    value={settings.weather || 'auto'}
                    onChange={(e) => {
                      const w = e.target.value;
                      onUpdateSettings({ weather: w });
                      audioEngine.playBlip();
                    }}
                  >
                    <option value="auto">Time of Day (Automatic)</option>
                    <option value="stars">Starry Night (Constellations)</option>
                    <option value="rain">Gentle Rain & Mist</option>
                    <option value="thunder">Cozy Thunderstorm</option>
                    <option value="snow">Winter Snowfall</option>
                    <option value="off">Off (Minimalist Dark)</option>
                  </select>
                </div>
              </div>

              {/* Dyslexia-friendly Font Toggle */}
              <div className="setting-row">
                <div className="setting-info">
                  <label className="setting-title">Dyslexia-Friendly Typography</label>
                  <div className="setting-desc">Apply high-legibility weighted character forms</div>
                </div>
                <div className="setting-control">
                  <button 
                    type="button"
                    className={`toggle-switch ${settings.dyslexiaFont ? 'active' : ''}`}
                    onClick={() => {
                      onUpdateSettings({ dyslexiaFont: !settings.dyslexiaFont });
                      audioEngine.playBlip();
                    }}
                    aria-label="Toggle Dyslexia Font"
                  >
                    <span className="toggle-switch-thumb" />
                  </button>
                </div>
              </div>

              {/* High Contrast Mode Toggle */}
              <div className="setting-row">
                <div className="setting-info">
                  <label className="setting-title">High Contrast Mode</label>
                  <div className="setting-desc">Enhances text clarity and element contrast across rooms</div>
                </div>
                <div className="setting-control">
                  <button 
                    type="button"
                    className={`toggle-switch ${settings.highContrast ? 'active' : ''}`}
                    onClick={() => {
                      onUpdateSettings({ highContrast: !settings.highContrast });
                      audioEngine.playBlip();
                    }}
                    aria-label="Toggle High Contrast"
                  >
                    <span className="toggle-switch-thumb" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={onClose}>
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
