import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header.jsx';
import { LandingPage } from './components/LandingPage.jsx';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.jsx';
import { TermsPage } from './pages/TermsPage.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { ShortcutsModal } from './components/ShortcutsModal.jsx';
import { SaveModal, FutureNoteModal } from './components/SaveModal.jsx';
import { SandboxExitModal, CuttingExitModal, FinalizeModal } from './components/TransitionModal.jsx';
import { Toast } from './components/Toast.jsx';
import { ThresholdRoom } from './rooms/ThresholdRoom.jsx';
import { SandboxRoom } from './rooms/SandboxRoom.jsx';
import { CuttingRoom } from './rooms/CuttingRoom.jsx';
import { SculptorRoom } from './rooms/SculptorRoom.jsx';
import { storageEngine } from './storage/storageEngine.js';
import { audioEngine } from './audio/audioEngine.js';

export function App() {
  const [viewMode, setViewMode] = useState('landing');

  const [appState, setAppState] = useState(() => {
    const savedSettings = storageEngine?.loadSettings ? storageEngine.loadSettings() : null;
    return {
      workingQuestion: '',
      currentRoom: 'threshold',
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        futureNote: ''
      },
      sandbox: {
        rawText: '',
        sessionDuration: savedSettings?.timerDuration || 900,
        sessionCount: 1
      },
      cuttingRoom: {
        cards: []
      },
      sculptor: {
        finalText: '',
        hemingwayUsed: false,
        readAloudUsed: false
      },
      graveyard: [],
      settings: {
        fontSize: 18,
        soundEnabled: true,
        volume: 0.35,
        timerDuration: 900,
        highContrast: false,
        dyslexiaFont: false,
        ...savedSettings
      }
    };
  });

  const [unlockedRooms, setUnlockedRooms] = useState({
    sandbox: false,
    cutting: false,
    sculptor: false
  });

  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isSandboxExitOpen, setIsSandboxExitOpen] = useState(false);
  const [isCuttingExitOpen, setIsCuttingExitOpen] = useState(false);
  const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
  const [futureNoteNotice, setFutureNoteNotice] = useState(null);
  const [finalizeStats, setFinalizeStats] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((title, message) => {
    setToast({ title, message });
  }, []);

  // Initialize and load any existing auto-recovery data on boot
  useEffect(() => {
    const initApp = async () => {
      try {
        const recovered = storageEngine?.recoverDraft ? storageEngine.recoverDraft() : (storageEngine?.getAutoRecovery ? storageEngine.getAutoRecovery() : null);
        if (recovered) {
          setAppState(recovered);
          setUnlockedRooms({
            sandbox: !!(recovered.workingQuestion || recovered.sandbox?.rawText),
            cutting: !!(recovered.cuttingRoom?.cards?.length),
            sculptor: !!(recovered.sculptor?.finalText)
          });
        }

        if (recovered?.settings?.soundEnabled !== undefined && audioEngine?.setMuted) {
          audioEngine.setMuted(!recovered.settings.soundEnabled);
        }
        if (recovered?.settings?.volume !== undefined && audioEngine?.setVolume) {
          audioEngine.setVolume(recovered.settings.volume);
        }
      } catch (err) {
        console.warn("Initial draft recovery skipped:", err);
      }
    };

    initApp();
  }, []);

  // Sync settings changes to audioEngine and DOM classes
  useEffect(() => {
    if (appState.settings.soundEnabled !== undefined && audioEngine?.setMuted) {
      audioEngine.setMuted(!appState.settings.soundEnabled);
    }
    if (appState.settings.volume !== undefined && audioEngine?.setVolume) {
      audioEngine.setVolume(appState.settings.volume);
    }
    if (appState.settings.soundProfile && audioEngine?.setSoundProfile) {
      audioEngine.setSoundProfile(appState.settings.soundProfile);
    }

    if (appState.settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    if (appState.settings.dyslexiaFont) {
      document.body.classList.add('dyslexia-font');
    } else {
      document.body.classList.remove('dyslexia-font');
    }

    if (appState.settings.fontSize) {
      document.documentElement.style.setProperty('--font-size-base', `${appState.settings.fontSize}px`);
    }
  }, [appState.settings]);

  // Debounced auto-save state
  useEffect(() => {
    if (storageEngine?.saveDraft) {
      storageEngine.saveDraft(appState);
    } else if (storageEngine?.saveAutoRecovery) {
      storageEngine.saveAutoRecovery(appState);
    }
  }, [appState]);

  const switchRoom = useCallback((room) => {
    if (room === 'sandbox' && !unlockedRooms.sandbox) return;
    if (room === 'cutting' && !unlockedRooms.cutting) return;
    if (room === 'sculptor' && !unlockedRooms.sculptor) return;

    if (audioEngine?.playBlip) audioEngine.playBlip();
    setAppState((prev) => ({ ...prev, currentRoom: room }));
    window.scrollTo(0, 0);
  }, [unlockedRooms]);

  const updateSettings = (newSettings) => {
    setAppState((prev) => {
      const updated = { ...prev.settings, ...newSettings };
      if (storageEngine?.saveSettings) storageEngine.saveSettings(updated);
      return { ...prev, settings: updated };
    });
  };

  const handleStartSession = (question) => {
    setAppState((prev) => ({
      ...prev,
      workingQuestion: question,
      currentRoom: 'sandbox'
    }));
    setUnlockedRooms((prev) => ({ ...prev, sandbox: true }));
    setViewMode('app');
  };

  const handleSaveProject = async (note) => {
    const updatedState = {
      ...appState,
      metadata: {
        ...appState.metadata,
        modified: new Date().toISOString(),
        futureNote: note
      }
    };
    setAppState(updatedState);
    setIsSaveOpen(false);

    if (storageEngine?.saveProject) {
      const result = await storageEngine.saveProject(updatedState);
      if (result?.success) {
        if (audioEngine?.playChime) audioEngine.playChime();
        showToast("Project Saved", "Your work and Future Note have been safely archived.");
      }
    }
  };

  const getExportableText = useCallback(() => {
    if (appState.sculptor?.finalText?.trim()) {
      return appState.sculptor.finalText;
    }
    if (appState.cuttingRoom?.cards?.length) {
      return appState.cuttingRoom.cards.map(c => c.text).join('\n\n');
    }
    return appState.sandbox?.rawText || '';
  }, [appState]);

  const handleExport = useCallback((format, note) => {
    const text = getExportableText();
    const title = (appState.workingQuestion || 'manuscript').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 30);

    if (note && note !== appState.metadata?.futureNote) {
      setAppState(prev => ({
        ...prev,
        metadata: { ...prev.metadata, futureNote: note }
      }));
    }

    if (format === 'word' && storageEngine?.exportToWord) {
      storageEngine.exportToWord(title, text, appState.workingQuestion);
      showToast("Exported Word Document", "Downloaded .docx format.");
    } else if (format === 'pdf' && storageEngine?.exportToPDF) {
      storageEngine.exportToPDF();
    } else if (format === 'md' && storageEngine?.downloadBlob) {
      storageEngine.downloadBlob(text, `${title}.md`, 'text/markdown');
      showToast("Exported Markdown", "Downloaded .md format.");
    } else if (format === 'txt' && storageEngine?.downloadBlob) {
      storageEngine.downloadBlob(text, `${title}.txt`, 'text/plain');
      showToast("Exported Plain Text", "Downloaded .txt format.");
    } else if (format === 'html' && storageEngine?.downloadBlob) {
      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{max-width:720px;margin:40px auto;font-family:Georgia,serif;line-height:1.8;padding:0 20px;color:#222;}h1{font-size:1.6rem;margin-bottom:24px;}</style></head><body><h1>${appState.workingQuestion || 'Manuscript'}</h1><p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p></body></html>`;
      storageEngine.downloadBlob(htmlContent, `${title}.html`, 'text/html');
      showToast("Exported HTML", "Downloaded .html format.");
    }
  }, [appState, getExportableText, showToast]);

  const handleOpenProject = async () => {
    if (audioEngine?.playBlip) audioEngine.playBlip();
    if (storageEngine?.openProject) {
      const data = await storageEngine.openProject();
      if (data) {
        setAppState(data);
        setUnlockedRooms({
          sandbox: true,
          cutting: !!(data.cuttingRoom?.cards?.length),
          sculptor: !!(data.sculptor?.finalText)
        });
        setViewMode('app');

        if (data.metadata?.futureNote) {
          setFutureNoteNotice(data.metadata);
        } else {
          switchRoom(data.currentRoom || 'sandbox');
        }
        showToast("Project Loaded", "Welcome back to your desk.");
      }
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;

      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setIsSaveOpen(false);
        setIsSandboxExitOpen(false);
        setIsCuttingExitOpen(false);
        setIsFinalizeOpen(false);
        setFutureNoteNotice(null);
        return;
      }

      if (e.key === '?' && !isCtrl && !isAlt && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        if (audioEngine?.playBlip) audioEngine.playBlip();
        return;
      }

      if (isAlt && (e.key.toLowerCase() === 'm' || e.code === 'KeyM')) {
        e.preventDefault();
        const enabled = !appState.settings.soundEnabled;
        updateSettings({ soundEnabled: enabled });
        if (enabled && audioEngine?.playBlip) audioEngine.playBlip();
        return;
      }

      if (viewMode === 'app') {
        if (isAlt && e.key === '1') {
          e.preventDefault();
          switchRoom('sandbox');
        } else if (isAlt && e.key === '2' && unlockedRooms.cutting) {
          e.preventDefault();
          switchRoom('cutting');
        } else if (isAlt && e.key === '3' && unlockedRooms.sculptor) {
          e.preventDefault();
          switchRoom('sculptor');
        }

        if (isCtrl && e.key.toLowerCase() === 's') {
          e.preventDefault();
          setIsSaveOpen(true);
        }

        if (isCtrl && e.key.toLowerCase() === 'o') {
          e.preventDefault();
          handleOpenProject();
        }

        if (isCtrl && e.key.toLowerCase() === 'e' && appState.currentRoom === 'sandbox') {
          e.preventDefault();
          setIsSandboxExitOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState.currentRoom, unlockedRooms, switchRoom, viewMode]);

  const exportableText = getExportableText();
  const metricsWords = exportableText.trim() ? exportableText.trim().split(/\s+/).filter(w => w.length > 0) : [];
  const textMetrics = {
    wordCount: metricsWords.length,
    charCount: exportableText.length,
    readingTimeMins: Math.max(1, Math.ceil(metricsWords.length / 200))
  };

  const handleCycleCounterMode = () => {
    const modes = ['words', 'readingTime', 'characters', 'detailed'];
    const current = appState.settings.counterMode || 'words';
    const nextIdx = (modes.indexOf(current) + 1) % modes.length;
    updateSettings({ counterMode: modes[nextIdx] });
  };

  const updateMetadata = (newMeta) => {
    setAppState((prev) => ({
      ...prev,
      metadata: { 
        ...prev.metadata, 
        ...newMeta 
      }
    }));
  };

  return (
    <div className="scripta-app">
      {viewMode === 'landing' && (
        <LandingPage 
          onEnterApp={() => setViewMode('app')}
          onOpenPrivacy={() => setViewMode('privacy')}
          onOpenTerms={() => setViewMode('terms')}
        />
      )}

      {viewMode === 'privacy' && (
        <PrivacyPolicyPage 
          onBackToHome={() => setViewMode('landing')}
          onEnterDesk={() => setViewMode('app')}
        />
      )}

      {viewMode === 'terms' && (
        <TermsPage 
          onBackToHome={() => setViewMode('landing')}
          onEnterDesk={() => setViewMode('app')}
        />
      )}

      {viewMode === 'app' && (
        <>
          <Header 
            currentRoom={appState.currentRoom}
            onSwitchRoom={switchRoom}
            onOpenLanding={() => setViewMode('landing')}
            workingQuestion={appState.workingQuestion}
            soundEnabled={appState.settings.soundEnabled}
            onToggleSound={() => updateSettings({ soundEnabled: !appState.settings.soundEnabled })}
            onOpenProject={handleOpenProject}
            onSaveProject={() => setIsSaveOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            unlockedRooms={unlockedRooms}
            metrics={textMetrics}
            counterMode={appState.settings.counterMode || 'words'}
            onCycleCounterMode={handleCycleCounterMode}
          />

          <main>
            <AnimatePresence mode="wait">
              {appState.currentRoom === 'threshold' && (
                <ThresholdRoom 
                  key="threshold"
                  workingQuestion={appState.workingQuestion}
                  onStartSession={handleStartSession}
                  settings={appState.settings}
                />
              )}

              {appState.currentRoom === 'sandbox' && (
                <SandboxRoom 
                  key="sandbox"
                  rawText={appState.sandbox.rawText}
                  onUpdateText={(text) => setAppState((prev) => ({
                    ...prev,
                    sandbox: { ...prev.sandbox, rawText: text }
                  }))}
                  timerDuration={appState.settings.timerDuration || 900}
                  targetWordGoal={appState.settings.targetWordGoal || 500}
                  workingQuestion={appState.workingQuestion}
                  strictSandboxDiscipline={appState.settings.strictSandboxDiscipline !== false}
                  onLeaveSandbox={() => setIsSandboxExitOpen(true)}
                  onNotify={showToast}
                />
              )}

              {appState.currentRoom === 'cutting' && (
                <CuttingRoom 
                  key="cutting"
                  rawText={appState.sandbox.rawText}
                  cards={appState.cuttingRoom.cards}
                  onUpdateCards={(cards) => setAppState((prev) => ({
                    ...prev,
                    cuttingRoom: { ...prev.cuttingRoom, cards }
                  }))}
                  onProceedToSculptor={() => setIsCuttingExitOpen(true)}
                  onNotify={showToast}
                />
              )}

              {appState.currentRoom === 'sculptor' && (
                <SculptorRoom 
                  key="sculptor"
                  cards={appState.cuttingRoom.cards}
                  finalText={appState.sculptor.finalText}
                  graveyard={appState.graveyard || []}
                  onUpdateFinalText={(text) => setAppState((prev) => ({
                    ...prev,
                    sculptor: { ...prev.sculptor, finalText: text }
                  }))}
                  onUpdateGraveyard={(graveyard) => setAppState((prev) => ({
                    ...prev,
                    graveyard
                  }))}
                  onFinalize={(stats) => {
                    setFinalizeStats(stats);
                    setIsFinalizeOpen(true);
                  }}
                  onRecordToolUsage={(tool) => setAppState((prev) => ({
                    ...prev,
                    sculptor: { ...prev.sculptor, [`${tool}Used`]: true }
                  }))}
                  onNotify={showToast}
                />
              )}
            </AnimatePresence>
          </main>
        </>
      )}

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appState.settings}
        onUpdateSettings={updateSettings}
        onOpenPrivacy={() => { setIsSettingsOpen(false); setViewMode('privacy'); }}
        onOpenTerms={() => { setIsSettingsOpen(false); setViewMode('terms'); }}
      />

      <ShortcutsModal 
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <SaveModal 
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        onConfirm={handleSaveProject}
        onExport={handleExport}
        appState={appState}
        currentNote={appState.metadata.futureNote}
      />

      <FutureNoteModal 
        isOpen={!!futureNoteNotice}
        metadata={futureNoteNotice}
        onContinue={() => {
          setFutureNoteNotice(null);
          switchRoom(appState.currentRoom || 'sandbox');
        }}
      />

      <SandboxExitModal 
        isOpen={isSandboxExitOpen}
        onClose={() => setIsSandboxExitOpen(false)}
        wordCount={textMetrics.wordCount}
        onConfirm={() => {
          setIsSandboxExitOpen(false);
          setUnlockedRooms((prev) => ({ ...prev, cutting: true }));
          switchRoom('cutting');
        }}
      />

      <CuttingExitModal 
        isOpen={isCuttingExitOpen}
        onClose={() => setIsCuttingExitOpen(false)}
        cardCount={appState.cuttingRoom.cards?.length || 0}
        onConfirm={() => {
          setIsCuttingExitOpen(false);
          setUnlockedRooms((prev) => ({ ...prev, sculptor: true }));
          switchRoom('sculptor');
        }}
      />

      {finalizeStats && (
        <FinalizeModal 
          isOpen={isFinalizeOpen}
          onClose={() => setIsFinalizeOpen(false)}
          stats={finalizeStats}
          appState={appState}
          onUpdateMetadata={updateMetadata}
        />
      )}

      <Toast 
        toast={toast} 
        onClose={() => setToast(null)} 
      />
    </div>
  );
}
