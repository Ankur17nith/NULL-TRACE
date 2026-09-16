// ============================================================
// NULL//TRACE — Terminal Component v2.0
// Interactive simulated cybersecurity terminal
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameStore } from '../../state/gameStore';
import './Terminal.css';

const QUICK_COMMANDS = ['scan', 'help', 'status', 'logs', 'clear'];

export default function Terminal() {
  const [input, setInput] = useState('');
  const { terminalEngine, sound, engine } = useGameEngine();
  const [output, setOutput] = useState(terminalEngine.getOutput());
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const missionStatus = useGameStore(s => s.mission.status);
  const callsign = useGameStore(s => s.player.callsign);

  // Sync output from engine
  const refreshOutput = useCallback(() => {
    setOutput([...terminalEngine.getOutput()]);
  }, [terminalEngine]);

  useEffect(() => {
    refreshOutput();
  }, [refreshOutput]);

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input on container click
  const focusInput = () => {
    inputRef.current?.focus();
  };

  const executeCommand = (cmdText) => {
    if (!cmdText.trim()) return;
    if (missionStatus !== 'IN_PROGRESS' && missionStatus !== 'BRIEFING') return;

    sound.playSubmit();
    const result = terminalEngine.execute(cmdText);
    setInput('');
    refreshOutput();

    // Handle game events from command results
    if (result?.event) {
      handleCommandEvent(result);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeCommand(input);
  };

  const handleCommandEvent = (result) => {
    const { event, eventData } = result;
    const state = useGameStore.getState();
    const mission = engine.missionEngine.getCurrentMission();

    if (event === 'SCAN_COMPLETE' && mission) {
      engine.completeObjective(mission.objectives[0]?.id);
      if (mission.clues?.[0]) {
        engine.discoverClue(mission.clues[0].id);
      }
    }

    if (event === 'NODE_INSPECTED' && eventData?.nodeId) {
      const objId = mission?.objectives?.find(o =>
        o.text.toLowerCase().includes('inspect') && !o.completed
      )?.id;
      if (objId) engine.completeObjective(objId);

      // Discover relevant clues
      const nodeClues = (mission?.clues || []).filter(c =>
        !state.inventory.clues.find(ic => ic.id === c.id)
      );
      if (nodeClues.length > 0) {
        engine.discoverClue(nodeClues[0].id);
        sound.playClue();
      }
    }

    if (event === 'HINT_USED') {
      engine.handleHintUsed();
    }

    if (event === 'PUZZLE_SOLVED' && eventData?.success) {
      engine.handlePuzzleSolved(eventData);
      sound.playSuccess();
    }

    if (event === 'PUZZLE_FAILED') {
      engine.handleMistake();
      sound.playError();
    }

    if (event === 'ATTACK_STOPPED' && eventData?.success) {
      engine.handlePuzzleSolved(eventData);
      mission?.objectives?.forEach(o => {
        if (!o.completed) engine.completeObjective(o.id);
      });
      sound.playMissionComplete();
    }

    if (event === 'ISOLATION_FAILED') {
      engine.handleMistake();
      sound.playError();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setInput(terminalEngine.historyUp());
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setInput(terminalEngine.historyDown());
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const suggestions = terminalEngine.getSuggestions(input);
      if (suggestions.length === 1) {
        setInput(suggestions[0]);
      }
    }
    // Typing sound
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      sound.playKeypress();
    }
  };

  const handleQuickCommand = (cmd) => {
    sound.playKeypress();
    if (cmd === 'clear') {
      terminalEngine.clear();
      refreshOutput();
    } else {
      executeCommand(cmd);
    }
    focusInput();
  };

  return (
    <div className="terminal-container" onClick={focusInput}>
      <div className="terminal-header">
        <div className="terminal-header__left">
          <div className="terminal-header__dots" aria-hidden="true">
            <span className="terminal-header__dot terminal-header__dot--red" />
            <span className="terminal-header__dot terminal-header__dot--yellow" />
            <span className="terminal-header__dot terminal-header__dot--green" />
          </div>
          <span className="terminal-header__title">
            POLYNET_SEC_SHELL // {callsign || 'GUEST'}@10.0.0.1
          </span>
        </div>
        <div className="terminal-header__status">
          <span className="terminal-header__status-badge">SSH-2.0-POLYNET</span>
        </div>
      </div>

      {/* Terminal output stream */}
      <div
        className="terminal-output"
        ref={outputRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output stream"
      >
        {output.map((line, i) => (
          <div
            key={i}
            className={`terminal-line terminal-line--${line.type}`}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Quick command buttons bar */}
      <div className="terminal-quick-bar" aria-label="Terminal quick actions">
        <span className="terminal-quick-label">ACTIONS:</span>
        <div className="terminal-quick-pills">
          {QUICK_COMMANDS.map(cmd => (
            <button
              key={cmd}
              type="button"
              className="terminal-quick-pill"
              onClick={() => handleQuickCommand(cmd)}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Input Row */}
      <form className="terminal-input-row" onSubmit={handleSubmit}>
        <span className="terminal-prompt" aria-hidden="true">&gt;</span>
        <input
          ref={inputRef}
          className="terminal-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command... (try 'help' or 'scan')"
          aria-label="Terminal command prompt"
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
        <button type="submit" className="terminal-submit-btn" aria-label="Execute command">
          EXEC
        </button>
      </form>
    </div>
  );
}
