// ============================================================
// NULL//TRACE — System Boot Scene (Hack the North Style)
// Opening sequence following Section 8 specification
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';

const BOOT_LINES = [
  { text: 'POLYNET SECURITY SYSTEM', type: 'system' },
  { text: 'INCIDENT #001', type: 'yellow' },
  { text: 'STATUS: COMPROMISED', type: 'coral' },
  { text: '', type: 'blank' },
  { text: 'UNKNOWN ACTOR DETECTED', type: 'coral' },
  { text: '3 NODES AFFECTED', type: 'yellow' },
  { text: 'NETWORK INTEGRITY: 72%', type: 'blue' },
  { text: '', type: 'blank' },
  { text: 'INITIALIZING INCIDENT TRACE...', type: 'lavender' },
  { text: 'NULL // TRACE PROTOCOL READY', type: 'mint' },
];

export default function SystemBoot({ onComplete, isActive }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const containerRef = useRef(null);
  const skipRef = useRef(false);

  const skipBoot = useCallback(() => {
    if (isDone) return;
    skipRef.current = true;
    setVisibleLines(BOOT_LINES.map(l => ({ ...l, revealed: l.text })));
    setIsDone(true);
    setTimeout(() => onComplete?.(), 250);
  }, [isDone, onComplete]);

  useEffect(() => {
    if (!isActive || isDone) return;
    const startTimeout = setTimeout(() => setIsTyping(true), 400);
    return () => clearTimeout(startTimeout);
  }, [isActive, isDone]);

  useEffect(() => {
    if (!isTyping || isDone || skipRef.current) return;
    if (currentLineIndex >= BOOT_LINES.length) {
      setIsDone(true);
      setTimeout(() => onComplete?.(), 600);
      return;
    }

    const currentLine = BOOT_LINES[currentLineIndex];

    if (currentLine.type === 'blank') {
      setVisibleLines(prev => [...prev, { text: '', type: 'blank', revealed: '' }]);
      setCurrentLineIndex(i => i + 1);
      return;
    }

    if (currentCharIndex < currentLine.text.length) {
      const charTimer = setTimeout(() => {
        setVisibleLines(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx]?.lineIndex === currentLineIndex) {
            updated[lastIdx] = {
              ...currentLine,
              lineIndex: currentLineIndex,
              revealed: currentLine.text.slice(0, currentCharIndex + 1),
            };
          } else {
            updated.push({
              ...currentLine,
              lineIndex: currentLineIndex,
              revealed: currentLine.text.slice(0, currentCharIndex + 1),
            });
          }
          return updated;
        });
        setCurrentCharIndex(c => c + 1);
      }, 16);

      return () => clearTimeout(charTimer);
    } else {
      const linePause = setTimeout(() => {
        setCurrentLineIndex(i => i + 1);
        setCurrentCharIndex(0);
      }, 240);

      return () => clearTimeout(linePause);
    }
  }, [isTyping, currentLineIndex, currentCharIndex, isDone, onComplete]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div
      className="system-boot"
      onClick={skipBoot}
      role="region"
      aria-label="System boot diagnostic"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') skipBoot(); }}
    >
      <div className="system-boot__card">
        <div className="system-boot__header">
          <div className="system-boot__dots" aria-hidden="true">
            <span className="dot dot--coral" />
            <span className="dot dot--yellow" />
            <span className="dot dot--mint" />
          </div>
          <span className="system-boot__title">POLYNET DISPATCH TELEMETRY</span>
        </div>

        <div className="system-boot__terminal" ref={containerRef}>
          {visibleLines.map((line, i) => (
            <div
              key={i}
              className={`system-boot__line system-boot__line--${line.type}`}
            >
              {line.revealed || '\u00A0'}
            </div>
          ))}
          {!isDone && <span className="system-boot__cursor" aria-hidden="true" />}
        </div>

        <div className="system-boot__footer">
          <span className="system-boot__skip">CLICK OR PRESS SPACE TO SKIP →</span>
        </div>
      </div>
    </div>
  );
}
