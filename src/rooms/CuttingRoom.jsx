import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { GripVertical, Split, Merge, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.js';

export function CuttingRoom({ 
  rawText, 
  cards: initialCards, 
  onUpdateCards, 
  onProceedSculptor 
}) {
  const [cards, setCards] = useState(() => {
    if (initialCards && initialCards.length > 0) return initialCards;

    const paragraphs = (rawText || '')
      .split(/\n\s*\n|\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (paragraphs.length === 0) {
      paragraphs.push("Initial raw thought block. Click label above to describe this paragraph.");
    }

    return paragraphs.map((text, idx) => ({
      id: `card-${Date.now()}-${idx}`,
      text: text,
      label: '',
      tag: 'unclear'
    }));
  });

  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    onUpdateCards(cards);
  }, [cards]);

  const handleLabelChange = (id, newLabel) => {
    setCards(cards.map(c => c.id === id ? { ...c, label: newLabel } : c));
  };

  const handleTagChange = (id, newTag) => {
    audioEngine.playBlip();
    setCards(cards.map(c => c.id === id ? { ...c, tag: newTag } : c));
  };

  const handleSplit = (index) => {
    const card = cards[index];
    const words = card.text.split(' ');
    if (words.length < 4) {
      alert("This block is too short to split further.");
      return;
    }

    const mid = Math.floor(words.length / 2);
    const firstHalf = words.slice(0, mid).join(' ');
    const secondHalf = words.slice(mid).join(' ');

    const updatedCard = { ...card, text: firstHalf };
    const newCard = {
      id: `card-${Date.now()}-split`,
      text: secondHalf,
      label: '',
      tag: card.tag
    };

    const newCards = [...cards];
    newCards.splice(index, 1, updatedCard, newCard);
    audioEngine.playClick();
    setCards(newCards);
  };

  const handleMergeUp = (index) => {
    if (index <= 0) return;
    const prevCard = cards[index - 1];
    const currentCard = cards[index];

    const mergedCard = {
      ...prevCard,
      text: `${prevCard.text} ${currentCard.text}`
    };

    const newCards = [...cards];
    newCards.splice(index - 1, 2, mergedCard);
    audioEngine.playClick();
    setCards(newCards);
  };

  const handleMove = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= cards.length) return;
    const newCards = [...cards];
    const [moved] = newCards.splice(fromIndex, 1);
    newCards.splice(toIndex, 0, moved);
    audioEngine.playClick();
    setCards(newCards);
  };

  const showLockedTooltip = (e) => {
    audioEngine.playBlip();
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      x: Math.max(10, rect.left + window.scrollX + (rect.width / 2) - 140),
      y: rect.top + window.scrollY - 45
    });

    setTimeout(() => setTooltip(null), 2800);
  };

  const labeledCount = cards.filter(c => c.label && c.label.trim().length > 0).length;
  const totalCount = cards.length;
  const allLabeled = totalCount > 0 && labeledCount === totalCount;
  const progressPercent = totalCount > 0 ? (labeledCount / totalCount) * 100 : 0;

  return (
    <motion.section 
      id="room-cutting" 
      className="room-container active-room"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="cutting-room-toolbar">
        <div>
          <span className="room-step-badge">Step 3 of 4</span>
          <h2 className="room-heading">The Cutting Room</h2>
          <p className="room-subtext">Label each block to understand its purpose. Drag or use arrows to rearrange.</p>
        </div>

        <div className="cutting-toolbar-actions">
          <div className="label-progress-wrapper" title={`${labeledCount} of ${totalCount} labeled`}>
            <div className="label-progress-badge">
              <span>{labeledCount} / {totalCount} labeled</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button 
            className={`btn btn-primary ${!allLabeled ? 'btn-disabled' : ''}`}
            onClick={onProceedSculptor}
            disabled={!allLabeled}
          >
            <span>Proceed to Sculptor</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Framer Motion Reorderable Drag & Drop List */}
      <Reorder.Group 
        axis="y" 
        values={cards} 
        onReorder={(newCards) => {
          audioEngine.playClick();
          setCards(newCards);
        }}
        className="cards-container"
      >
        {cards.map((card, index) => (
          <Reorder.Item 
            key={card.id} 
            value={card}
            className={`cutting-card tag-theme-${card.tag}`}
            whileDrag={{ scale: 1.015, boxShadow: "0 18px 42px rgba(0,0,0,0.22)", zIndex: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          >
            <div className="cutting-card-header">
              <div className="card-label-wrapper">
                <span className="card-drag-handle" title="Drag to reorder">
                  <GripVertical size={16} />
                </span>
                <span className="card-index-num">#{index + 1}</span>
                <input 
                  type="text" 
                  className="card-label-input"
                  placeholder="What is this block about? (Required, max 60 chars)"
                  maxLength={60}
                  value={card.label}
                  onChange={(e) => handleLabelChange(card.id, e.target.value)}
                />
              </div>

              <select 
                className={`card-tag-select tag-${card.tag}`}
                value={card.tag}
                onChange={(e) => handleTagChange(card.id, e.target.value)}
              >
                <option value="unclear">⚪ Unclear</option>
                <option value="introduction">🟣 Introduction</option>
                <option value="evidence">🟢 Evidence</option>
                <option value="counterargument">🟠 Counterargument</option>
                <option value="conclusion">🔵 Conclusion</option>
              </select>

              <div className="card-actions">
                {/* Touch/Mobile Reorder Buttons */}
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMove(index, index - 1)}
                  disabled={index === 0}
                  style={{ opacity: index === 0 ? 0.3 : 1 }}
                  title="Move Up (Alt+Up)"
                >
                  <ChevronUp size={14} />
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMove(index, index + 1)}
                  disabled={index === cards.length - 1}
                  style={{ opacity: index === cards.length - 1 ? 0.3 : 1 }}
                  title="Move Down (Alt+Down)"
                >
                  <ChevronDown size={14} />
                </button>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSplit(index)}
                  title="Split into two cards"
                >
                  <Split size={14} />
                  <span>Split</span>
                </button>

                {index > 0 && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMergeUp(index)}
                    title="Merge into card above"
                  >
                    <Merge size={14} />
                    <span>Merge</span>
                  </button>
                )}
              </div>
            </div>

            <div 
              className="card-body-text" 
              onClick={showLockedTooltip}
              title="Text locked in Cutting Room"
            >
              {card.text}
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Floating Locked Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div 
            className="scripta-tooltip show"
            style={{ left: tooltip.x, top: tooltip.y }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            Not yet. First, understand what you have. Label this block. Then decide where it belongs.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
