import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header.jsx';
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
  const [appState, setAppState] = useState(() => {
    const savedSettings = storageEngine.loadSettings();
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
    sandbox: true,
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
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Sync settings to DOM and audio engine
  useEffect(() => {
    const s = appState.settings;
    document.body.setAttribute('data-room', appState.currentRoom);
    document.body.classList.toggle('high-contrast', !!s.highContrast);
    document.body.classList.toggle('dyslexia-font', !!s.dyslexiaFont);
    document.documentElement.style.setProperty('--font-size-base', `${s.fontSize || 18}px`);
    audioEngine.setVolume(s.volume ?? 0.35);
    audioEngine.setSoundProfile(s.soundProfile ?? 'typewriter');
    audioEngine.setMuted(!s.soundEnabled);
  }, [appState.currentRoom, appState.settings]);

  // Auto-recovery snapshot on state changes
  useEffect(() => {
    storageEngine.saveAutoRecovery(appState);
  }, [appState]);

  // Check auto-recovery on mount
  useEffect(() => {
    const recovered = storageEngine.getAutoRecovery();
    if (recovered && recovered.sandbox?.rawText) {
      if (window.confirm("Scripta detected a previous un-saved drafting session. Would you like to recover your work?")) {
        setAppState(recovered);
        setUnlockedRooms({
          sandbox: true,
          cutting: !!(recovered.cuttingRoom?.cards?.length),
          sculptor: !!(recovered.sculptor?.finalText)
        });
      } else {
        storageEngine.clearAutoRecovery();
      }
    }
  }, []);

  const switchRoom = useCallback((targetRoom) => {
    if (appState.currentRoom === targetRoom) return;
    audioEngine.playSwell();
    setAppState((prev) => ({ ...prev, currentRoom: targetRoom }));
  }, [appState.currentRoom]);

  const updateSettings = (newSettings) => {
    setAppState((prev) => {
      const updated = { ...prev.settings, ...newSettings };
      storageEngine.saveSettings(updated);
      return { ...prev, settings: updated };
    });
  };

  const handleStartSession = (question) => {
    setAppState((prev) => ({
      ...prev,
      workingQuestion: question,
      currentRoom: 'sandbox'
    }));
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

    const result = await storageEngine.saveProject(updatedState);
    if (result?.success) {
      audioEngine.playChime();
      showToast("Project Saved", "Your work and Future Note have been safely archived.");
    }
  };

  const handleOpenProject = async () => {
    audioEngine.playBlip();
    const data = await storageEngine.openProject();
    if (data) {
      setAppState(data);
      setUnlockedRooms({
        sandbox: true,
        cutting: !!(data.cuttingRoom?.cards?.length),
        sculptor: !!(data.sculptor?.finalText)
      });

      if (data.metadata?.futureNote) {
        setFutureNoteNotice(data.metadata);
      } else {
        switchRoom(data.currentRoom || 'sandbox');
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
        return;
      }

      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        audioEngine.playBlip();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (isAlt && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const enabled = audioEngine.toggleMute();
        updateSettings({ soundEnabled: enabled });
        if (enabled) audioEngine.playBlip();
        return;
      }

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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState.currentRoom, unlockedRooms, switchRoom]);

  const rawWordCount = (appState.sandbox.rawText || '').trim()
    ? appState.sandbox.rawText.trim().split(/\s+/).filter(w => w.length > 0).length
    : 0;

  // Active Session Time Tracker
  useEffect(() => {
    const timeTracker = setInterval(() => {
      setAppState((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          totalTimeSpentSec: (prev.metadata?.totalTimeSpentSec || 0) + 1
        }
      }));
    }, 1000);
    return () => clearInterval(timeTracker);
  }, []);

  const updateMetadata = (newMeta) => {
    setAppState((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, ...newMeta }
    }));
  };

  return (
    <div className="scripta-app">
      <Header 
        currentRoom={appState.currentRoom}
        onSwitchRoom={switchRoom}
        workingQuestion={appState.workingQuestion}
        soundEnabled={appState.settings.soundEnabled}
        onToggleSound={() => updateSettings({ soundEnabled: !appState.settings.soundEnabled })}
        onOpenProject={handleOpenProject}
        onSaveProject={() => setIsSaveOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        unlockedRooms={unlockedRooms}
        wordCount={rawWordCount}
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
              onUpdateFinalText={(text) => setAppState((prev) => ({
                ...prev,
                sculptor: { ...prev.sculptor, finalText: text }
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

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appState.settings}
        onUpdateSettings={updateSettings}
      />

      <ShortcutsModal 
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <SaveModal 
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        onConfirm={handleSaveProject}
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
        wordCount={rawWordCount}
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
