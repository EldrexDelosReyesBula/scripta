import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  Split,
  Merge,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Plus,
  Check,
  X,
  Tag
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.js';

const DEFAULT_TAGS = [
  { value: 'unclear', label: '⚪ Unclear' },
  { value: 'introduction', label: '🟣 Introduction' },
  { value: 'evidence', label: '🟢 Evidence' },
  { value: 'counterargument', label: '🟠 Counterargument' },
  { value: 'conclusion', label: '🔵 Conclusion' },
  { value: 'context', label: '🟡 Context' },
  { value: 'critique', label: '🔴 Critique' }
];

export function CuttingRoom({
  rawText,
  cards: initialCards,
  onUpdateCards,
  onProceedToSculptor,
  onProceedSculptor,
  onNotify
}) {
  const proceedHandler = onProceedToSculptor || onProceedSculptor;

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

  const [customTags, setCustomTags] = useState([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [activeTargetCardId, setActiveTargetCardId] = useState(null);
  const [customTagInput, setCustomTagInput] = useState('');
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    onUpdateCards(cards);
  }, [cards]);

  const handleLabelChange = (id, newLabel) => {
    setCards(cards.map(c => c.id === id ? { ...c, label: newLabel } : c));
  };

  const handleTagSelect = (id, selectedValue) => {
    if (selectedValue === '+custom') {
      setActiveTargetCardId(id);
      setCustomTagInput('');
      setIsCustomModalOpen(true);
      return;
    }

    audioEngine.playBlip();
    setCards(cards.map(c => {
      if (c.id === id) {
        const found = DEFAULT_TAGS.find(t => t.value === selectedValue) || customTags.find(t => t.value === selectedValue);
        const tagLabel = found ? found.label.replace(/^[^\s]+\s*/, '') : selectedValue;
        const defaultLabel = !c.label ? tagLabel : c.label;
        return { ...c, tag: selectedValue, label: defaultLabel };
      }
      return c;
    }));
  };

  const handleCreateCustomTag = (e) => {
    e?.preventDefault();
    const clean = customTagInput.trim();
    if (!clean) return;

    const tagVal = clean.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = customTags.find(t => t.value === tagVal);

    if (!existing) {
      const newTagObj = { value: tagVal, label: clean };
      setCustomTags(prev => [...prev, newTagObj]);
    }

    if (activeTargetCardId) {
      audioEngine.playBlip();
      setCards(cards.map(c => {
        if (c.id === activeTargetCardId) {
          const defaultLabel = !c.label ? clean : c.label;
          return { ...c, tag: tagVal, label: defaultLabel };
        }
        return c;
      }));
    }

    setIsCustomModalOpen(false);
    setActiveTargetCardId(null);
    setCustomTagInput('');
    onNotify?.(`Custom tag "${clean}" created!`);
  };

  const handleAutoLabel = () => {
    audioEngine.playBlip();
    setCards(cards.map((c, idx) => ({
      ...c,
      label: c.label && c.label.trim() ? c.label : (c.tag !== 'unclear' ? c.tag.charAt(0).toUpperCase() + c.tag.slice(1) : `Block #${idx + 1}`)
    })));
    onNotify?.("All thought blocks labeled! Sculptor is unlocked.");
  };

  const handleProceed = () => {
    if (!allLabeled) {
      handleAutoLabel();
    }
    audioEngine.playSwell();
    proceedHandler?.();
  };

  const handleSplit = (index) => {
    const card = cards[index];
    const words = card.text.split(' ');
    if (words.length < 4) {
      onNotify?.("This block is too short to split further.");
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

  const labeledCount = cards.filter(c => c.label && c.label.trim().length > 0).length;
  const allLabeled = labeledCount === cards.length && cards.length > 0;

  const showLockedTooltip = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setTimeout(() => setTooltip(null), 2500);
  };

  return (
    <div className="room-container cutting-room-wrapper" id="room-cutting">
      <div className="cutting-header-bar">
        <div className="cutting-intro">
          <div className="room-step-badge">Step 3 of 4</div>
          <h2 className="cutting-title">Structural Organization</h2>
          <p className="cutting-subtitle">
            Label each thought block to understand its architectural purpose. Drag or use controls to reorder.
          </p>
        </div>

        <div className="cutting-actions-bar">
          <div className={`progress-badge ${allLabeled ? 'completed' : ''}`}>
            <span>{labeledCount}/{cards.length} labeled</span>
          </div>

          <button
            className={`btn ${allLabeled ? 'btn-primary' : 'btn-secondary'} proceed-sculptor-btn`}
            onClick={handleProceed}
            title={allLabeled ? "Proceed to Refinement (The Sculptor)" : "Auto-label remaining & proceed"}
          >
            <span>{allLabeled ? "Proceed to Sculptor" : "Auto-Label & Proceed"}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Reorderable Drag & Drop Card List */}
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
            whileDrag={{ scale: 1.01, boxShadow: "0 20px 45px rgba(0,0,0,0.18)", zIndex: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          >
            <div className="cutting-card-header">
              {/* Top Row: Identifier & Full-Width Descriptive Label */}
              <div className="card-header-top">
                <div className="card-meta-left">
                  <span className="card-drag-handle" title="Drag to reorder card">
                    <GripVertical size={16} />
                  </span>
                  <span className="card-index-num">#{index + 1}</span>
                </div>
                <input
                  type="text"
                  className="card-label-input"
                  placeholder="What is this block about? (e.g. Core hypothesis, key evidence, question...)"
                  maxLength={80}
                  value={card.label}
                  onChange={(e) => handleLabelChange(card.id, e.target.value)}
                />
              </div>

              {/* Bottom Row: Tag Selector Badge & Action Controls */}
              <div className="card-header-controls">
                <div className="card-tag-wrapper">
                  <select
                    className={`card-tag-select tag-${card.tag}`}
                    value={card.tag}
                    onChange={(e) => handleTagSelect(card.id, e.target.value)}
                  >
                    <optgroup label="Standard Structural Tags">
                      {DEFAULT_TAGS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </optgroup>
                    {customTags.length > 0 && (
                      <optgroup label="Custom Tags">
                        {customTags.map(ct => (
                          <option key={ct.value} value={ct.value}>🏷️ {ct.label}</option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Options">
                      <option value="+custom">➕ + Add Custom / Other Tag...</option>
                    </optgroup>
                  </select>
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMove(index, index - 1)}
                    disabled={index === 0}
                    style={{ opacity: index === 0 ? 0.3 : 1 }}
                    title="Move Up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMove(index, index + 1)}
                    disabled={index === cards.length - 1}
                    style={{ opacity: index === cards.length - 1 ? 0.3 : 1 }}
                    title="Move Down"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSplit(index)}
                    title="Split into two cards"
                  >
                    <Split size={14} />
                    <span>Split</span>
                  </button>
                  {index > 0 && (
                    <button
                      type="button"
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
            </div>

            {/* Read-Only Whitepage Card Body */}
            <div
              className="card-body-text"
              onClick={showLockedTooltip}
              title="Text locked during Structural Organization"
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
            className="cutting-locked-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            🔒 Text editing is locked here. Focus purely on structure & arrangement. Edit sentences in Step 4 (The Sculptor).
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Tag Modal */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsCustomModalOpen(false)}>
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="modal-icon-header">
                  <Tag size={20} />
                  <span>Create Custom Category Tag</span>
                </div>
                <button
                  className="btn btn-icon"
                  onClick={() => setIsCustomModalOpen(false)}
                  style={{ border: 'none', background: 'transparent' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCustomTag}>
                <div className="modal-body">
                  <p className="modal-prompt-text" style={{ marginBottom: 12 }}>
                    Enter a custom structural or thematic tag (e.g., <em>Thesis</em>, <em>Case Study</em>, <em>Methodology</em>, <em>Anecdote</em>):
                  </p>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. Case Study, Thesis Statement..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    autoFocus
                    maxLength={30}
                    style={{ width: '100%', fontSize: '1rem', padding: '10px 14px' }}
                  />
                </div>
                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsCustomModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!customTagInput.trim()}
                  >
                    Add Tag
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
