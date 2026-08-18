import React, { useEffect, useRef } from 'react';
import { state, computed, effect, cairnToReact, UI } from '@eldrex/cairn';
import { Zap, Activity } from 'lucide-react';

/**
 * CairnTypingVelocity - Fine-Grained Reactive Typing Speed & Cadence Indicator
 * Built using @eldrex/cairn reactive state signals.
 * Updates high-frequency metrics directly with zero React component tree re-rendering.
 */
export function createCairnCadenceEngine() {
  const charCount = state(0);
  const wordCount = computed(() => Math.floor(charCount.value / 5));
  const wpm = state(0);
  const flowScore = computed(() => Math.min(100, Math.round((wpm.value / 60) * 100)));

  let lastKeyTime = Date.now();
  let keyTimes = [];

  const recordKeystroke = () => {
    const now = Date.now();
    charCount.value += 1;
    keyTimes.push(now);

    // Keep keystrokes from the last 5 seconds
    keyTimes = keyTimes.filter(t => now - t <= 5000);

    if (keyTimes.length >= 2) {
      const durationMins = (now - keyTimes[0]) / 60000;
      const wordsInWindow = (keyTimes.length / 5);
      wpm.value = durationMins > 0 ? Math.round(wordsInWindow / durationMins) : 0;
    }
    lastKeyTime = now;
  };

  return {
    charCount,
    wordCount,
    wpm,
    flowScore,
    recordKeystroke
  };
}

export const CairnVelocityBadge = cairnToReact((props) => {
  const engine = props.engine || createCairnCadenceEngine();

  return UI.Card({
    style: {
      background: 'rgba(21, 24, 41, 0.95)',
      border: '1px solid rgba(226, 75, 75, 0.3)',
      padding: '8px 14px',
      borderRadius: '10px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '0.82rem',
      color: '#eef2ff'
    }
  }, 
    UI.Badge({
      variant: '⚡ Cairn Signals',
      style: {
        background: 'rgba(226, 75, 75, 0.15)',
        color: '#e24b4b',
        border: '1px solid rgba(226, 75, 75, 0.3)',
        borderRadius: '999px',
        padding: '2px 8px',
        fontSize: '0.72rem',
        fontWeight: '700'
      }
    }),
    () => `Velocity: ${engine.wpm.value} WPM · Flow: ${engine.flowScore.value}%`
  );
});
