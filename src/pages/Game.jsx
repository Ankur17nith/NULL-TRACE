// ============================================================
// NULL//TRACE — Game Page v2.0
// Primary gameplay container with cinematic briefings, transitions & results
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import MissionHUD from '../components/MissionHUD/MissionHUD';
import Terminal from '../components/Terminal/Terminal';
import NetworkMap from '../components/NetworkMap/NetworkMap';
import HTNButton from '../components/ui/HTNButton';
import Sparkle from '../components/ui/Sparkle';
import { formatTime, formatScore, formatPercent } from '../utils/formatters';
import ScoreEngine from '../game/engine/ScoreEngine';
import './Game.css';

export default function Game() {
  const navigate = useNavigate();
  const { engine, missionEngine, puzzleEngine, networkEngine, achievementEngine, sound, terminalEngine } = useGameEngine();
  const status = useGameStore(s => s.mission.status);
  const objectives = useGameStore(s => s.mission.objectives);
  const missionNumber = useGameStore(s => s.mission.currentMissionNumber);
  const missionId = useGameStore(s => s.mission.currentMissionId);
  const timeRemaining = useGameStore(s => s.mission.timeRemaining);
  const totalTime = useGameStore(s => s.mission.totalTime);
  const score = useGameStore(s => s.player.score);
  const hintsUsed = useGameStore(s => s.player.hintsUsed);
  const mistakes = useGameStore(s => s.player.mistakes);
  const cluesFound = useGameStore(s => s.player.cluesFound);
  const inventory = useGameStore(s => s.inventory);
  const showEducational = useGameStore(s => s.ui.showEducational);
  const setShowEducational = useGameStore(s => s.setShowEducational);

  const [activePanel, setActivePanel] = useState('terminal');
  const [showBriefing, setShowBriefing] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [missionResult, setMissionResult] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [resultStep, setResultStep] = useState(0);

  const mission = missionEngine.getCurrentMission();

  // Handle mission completion and trigger staged results sequence
  useEffect(() => {
    if (status === 'COMPLETED' && !showResults) {
      const result = engine.completeMission();
      if (result) {
        setMissionResult(result);
        setShowResults(true);
        setResultStep(1);

        // Staged reveal steps for cinematic completion feel
        const t1 = setTimeout(() => setResultStep(2), 500);
        const t2 = setTimeout(() => setResultStep(3), 1000);
        const t3 = setTimeout(() => setResultStep(4), 1600);

        achievementEngine.checkAll({
          missionId,
          completed: true,
          hintsUsed,
          mistakes,
          cluesFound,
          totalClues: mission?.clues?.length || 0,
          timeRemaining,
          totalTime,
          duration: (totalTime - timeRemaining) * 1000,
          puzzleAttempts: puzzleEngine.getCurrentPuzzle()?.attempts || 0,
          isolated: puzzleEngine.getCurrentPuzzle()?.isolated || false,
        });

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      }
    }
  }, [status]);

  // Redirect if no mission loaded
  useEffect(() => {
    if (!missionId && status === 'IDLE') {
      navigate('/');
    }
  }, [missionId, status, navigate]);

  const handleBeginMission = () => {
    sound.playSubmit();
    setShowBriefing(false);
    engine.beginGameplay();
    sound.startAmbient();
  };

  const handleNodeClick = useCallback((node) => {
    // Routing mode for mission 02
    if (missionNumber === 2) {
      const puzzle = puzzleEngine.getCurrentPuzzle();
      if (puzzle && !puzzle.solved) {
        const result = puzzle.addNodeToRoute(node.id);
        if (result.success) {
          setRoutePath([...puzzle.currentPath]);
          if (result.isComplete) {
            const submitResult = puzzle.submitRoute();
            if (submitResult.success) {
              sound.playSuccess();
              engine.handlePuzzleSolved(submitResult);
              mission?.objectives?.forEach(o => {
                if (!o.completed) engine.completeObjective(o.id);
              });
            }
          }
        } else {
          sound.playError();
          terminalEngine.addSystemMessage([result.message], 'error');
        }
      }
      return;
    }

    // Normal inspection
    terminalEngine.execute(`inspect ${node.id}`);

    if (node.status === 'SUSPICIOUS' || node.status === 'COMPROMISED') {
      const undiscovered = (mission?.clues || []).filter(
        c => !inventory.clues.find(ic => ic.id === c.id)
      );
      if (undiscovered.length > 0) {
        engine.discoverClue(undiscovered[0].id);
        sound.playClue();
      }
    }
  }, [missionNumber, puzzleEngine, engine, mission, inventory, sound, terminalEngine]);

  const handlePuzzleSubmit = useCallback((answer) => {
    const puzzle = puzzleEngine.getCurrentPuzzle();
    if (!puzzle) return;

    let result;
    if (typeof puzzle.attempt === 'function') {
      result = puzzle.attempt(...(Array.isArray(answer) ? answer : [answer]));
    } else if (typeof puzzle.answerQuestion === 'function') {
      const q = puzzle.getCurrentQuestion();
      if (q) {
        result = puzzle.answerQuestion(q.index, answer);
        if (result.correct && !result.solved) {
          puzzle.advanceQuestion();
        }
      }
    }

    if (result?.success || result?.correct) {
      sound.playSuccess();
      if (result.solved || result.success) {
        engine.handlePuzzleSolved(result);
        mission?.objectives?.forEach(o => {
          if (!o.completed) engine.completeObjective(o.id);
        });
      }
    } else {
      sound.playError();
      engine.handleMistake();
    }
    return result;
  }, [puzzleEngine, engine, mission, sound]);

  const handleHint = () => {
    const puzzle = puzzleEngine.getCurrentPuzzle();
    if (!puzzle) return;
    const result = puzzle.getHint();
    if (result.index > 0) {
      engine.handleHintUsed();
      sound.playAlert();
      terminalEngine.addSystemMessage([`HINT ${result.index}: ${result.hint}`, '', '(-50 points)'], 'system');
      setActivePanel('terminal');
    }
  };

  const handleRetry = () => {
    setShowResults(false);
    setMissionResult(null);
    setRoutePath([]);
    engine.startMission(missionId);
    setShowBriefing(true);
  };

  const handleNextMission = () => {
    const next = missionEngine.getNextMission();
    if (next) {
      setShowResults(false);
      setMissionResult(null);
      setRoutePath([]);
      engine.startMission(next.id);
      setShowBriefing(true);
    } else {
      navigate('/final-results');
    }
  };

  // ── Cinematic Briefing Screen ──────────────────────────────
  if (showBriefing && mission) {
    return (
      <div className="briefing-screen">
        <div className="briefing-container">
          <div className="briefing-top-banner">
            <span className="briefing-top-pulse" />
            <span>POLYNET INCIDENT RESPONSE // DISPATCH OP_{String(mission.number).padStart(2, '0')}</span>
            <span className="briefing-top-badge">EYES ONLY</span>
          </div>

          <div className="briefing-content">
            <div className="briefing-header">
              <div className="briefing-badge-row">
                <span className="tag tag--accent">MISSION 0{mission.number}</span>
                <span className="tag tag--default">{mission.difficulty || 'STANDARD'}</span>
              </div>
              <h1 className="briefing-title">{mission.title}</h1>
              <p className="briefing-subtitle">{mission.subtitle}</p>
            </div>

            <div className="briefing-text-box">
              <div className="briefing-terminal-bar">
                <span className="briefing-terminal-title">INCIDENT INTEL // LOG ARCHIVE</span>
              </div>
              <div className="briefing-text-body">
                {mission.briefing.map((line, i) => (
                  <div
                    key={i}
                    className={`briefing-line ${
                      line.includes('CRITICAL') || line.includes('██') ? 'briefing-line--danger' :
                      line.includes('TARGET') || line.includes('DETECTED') ? 'briefing-line--accent' : ''
                    }`}
                  >
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>

            <div className="briefing-objectives">
              <h4 className="briefing-obj-heading">PRIMARY DIRECTIVES</h4>
              <div className="briefing-obj-list">
                {mission.objectives.map((o, idx) => (
                  <div key={o.id} className="briefing-obj-card">
                    <span className="briefing-obj-num">0{idx + 1}</span>
                    <span className="briefing-obj-desc">{o.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="briefing-actions">
              <HTNButton variant="coral" size="lg" onClick={handleBeginMission}>
                [ INITIALIZE INVESTIGATION ]
              </HTNButton>
              <HTNButton variant="secondary" size="md" onClick={() => navigate('/')}>
                ABORT & RETURN
              </HTNButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Cinematic Staged Results Screen ────────────────────────
  if (showResults && missionResult) {
    const breakdown = missionResult.breakdown;
    const rank = missionResult.rank;
    const accuracy = Math.max(0, 100 - (mistakes * 10));

    return (
      <div className="results-screen">
        <Sparkle size={18} color="var(--htn-yellow)" style={{ top: '15%', left: '15%' }} />
        <Sparkle size={24} color="var(--htn-mint)" style={{ top: '20%', right: '18%' }} />
        <Sparkle size={14} color="var(--htn-lavender)" style={{ bottom: '20%', left: '20%' }} />

        <div className="results-container">
          <div className="results-badge-header">
            <span className="results-status-tag">TRACE COMPLETED</span>
            <h1 className="results-title">THREAT NEUTRALIZED</h1>
            <p className="results-subtitle">{mission?.title} — {mission?.subtitle}</p>
          </div>

          <div className="results-divider" />

          {/* Step 2: Stats Breakdown */}
          {resultStep >= 2 && (
            <div className="results-stats-grid stagger-children">
              <div className="results-stat-box">
                <span className="results-stat-label">INVESTIGATION TIME</span>
                <span className="results-stat-val">{formatTime(totalTime - timeRemaining)}</span>
              </div>
              <div className="results-stat-box">
                <span className="results-stat-label">ACCURACY RATING</span>
                <span className="results-stat-val">{formatPercent(accuracy)}</span>
              </div>
              <div className="results-stat-box">
                <span className="results-stat-label">EVIDENCE RECOVERED</span>
                <span className="results-stat-val">{cluesFound}/{mission?.clues?.length || 0}</span>
              </div>
              <div className="results-stat-box">
                <span className="results-stat-label">HINTS CONSUMED</span>
                <span className="results-stat-val">{hintsUsed}</span>
              </div>
            </div>
          )}

          {/* Step 3: Score & Rank */}
          {resultStep >= 3 && (
            <div className="results-score-section">
              <div className="results-score-display">
                <span className="results-score-label">TOTAL MISSION SCORE</span>
                <span className="results-score-number">{formatScore(breakdown.total)}</span>
              </div>

              <div className="results-rank-badge">
                <div className="results-rank-icon">{rank.icon}</div>
                <div className="results-rank-info">
                  <span className="results-rank-label">ASSIGNED OPERATOR RANK</span>
                  <span className="results-rank-title">{rank.label}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Actions */}
          {resultStep >= 4 && (
            <div className="results-action-row">
              {status === 'COMPLETED' && missionEngine.getNextMission() && (
                <HTNButton variant="mint" size="lg" onClick={handleNextMission}>
                  NEXT DIRECTIVE →
                </HTNButton>
              )}
              {status === 'COMPLETED' && !missionEngine.getNextMission() && (
                <HTNButton variant="mint" size="lg" onClick={() => navigate('/final-results')}>
                  VIEW FINAL EVALUATION →
                </HTNButton>
              )}
              <HTNButton variant="secondary" size="md" onClick={handleRetry}>
                RETRY MISSION
              </HTNButton>
              <HTNButton variant="secondary" size="md" onClick={() => navigate('/')}>
                MAIN MENU
              </HTNButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Mission Failed Screen ──────────────────────────────────
  if (status === 'FAILED') {
    return (
      <div className="results-screen results-screen--failed">
        <div className="results-container">
          <div className="results-badge-header">
            <span className="results-status-tag" style={{ color: 'var(--htn-coral)', borderColor: 'var(--htn-coral)', background: 'rgba(243, 103, 90, 0.1)' }}>
              BREACH DETECTED
            </span>
            <h1 className="results-title results-title--failed">SYSTEM COMPROMISED</h1>
            <p className="results-subtitle">The trace window expired. Attacker exfiltrated critical data.</p>
          </div>

          <div className="results-action-row" style={{ marginTop: 'var(--space-xl)' }}>
            <HTNButton variant="coral" size="lg" onClick={handleRetry}>
              RETRY INVESTIGATION
            </HTNButton>
            <HTNButton variant="secondary" size="md" onClick={() => navigate('/')}>
              RETURN TO SYSTEM MENU
            </HTNButton>
          </div>
        </div>
      </div>
    );
  }

  // ── Tactical Educational Debriefing Overlay ────────────────
  const educationalOverlay = showEducational ? (
    <div className="educational-overlay" role="dialog" aria-label="Tactical debriefing">
      <div className="educational-panel">
        <div className="educational-header">
          <div className="educational-banner">
            <span className="educational-tag">TACTICAL INTEL DISCOVERY</span>
            <span className="educational-id">REF_SEC_{missionNumber}</span>
          </div>
          <h2 className="educational-title">{showEducational.title}</h2>
        </div>

        <div className="educational-body">
          <div className="educational-concept-box">
            <h4 className="educational-section-title">CORE CONCEPT</h4>
            <p className="educational-text">{showEducational.concept}</p>
          </div>

          <div className="educational-grid">
            <div className="educational-card">
              <h5 className="educational-card-title">WHY IT MATTERS</h5>
              <p>{showEducational.whyItMatters}</p>
            </div>
            <div className="educational-card">
              <h5 className="educational-card-title">REAL WORLD EXPLOITATION</h5>
              <p>{showEducational.realWorld}</p>
            </div>
          </div>

          {showEducational.defense && (
            <div className="educational-defense-box">
              <h5 className="educational-defense-title">PROACTIVE COUNTERMEASURE</h5>
              <p>{showEducational.defense}</p>
            </div>
          )}
        </div>

        <div className="educational-footer">
          <HTNButton variant="mint" size="md" className="w-full" onClick={() => setShowEducational(false)}>
            ACKNOWLEDGE & RESUME INVESTIGATION
          </HTNButton>
        </div>
      </div>
    </div>
  ) : null;

  // ── Puzzle Interaction Panel ──────────────────────────────
  const puzzle = puzzleEngine.getCurrentPuzzle();
  const renderPuzzlePanel = () => {
    if (!puzzle || puzzle.solved) return null;

    if (puzzle.constructor.name === 'AuthenticationPuzzle') {
      return <AuthPanel puzzle={puzzle} onSubmit={handlePuzzleSubmit} />;
    }
    if (puzzle.constructor.name === 'BinaryPuzzle') {
      return <BinaryPanel puzzle={puzzle} onSubmit={handlePuzzleSubmit} />;
    }
    if (puzzle.constructor.name === 'LogAnalysisPuzzle') {
      return <LogAnalysisPanel puzzle={puzzle} onSubmit={handlePuzzleSubmit} />;
    }
    if (puzzle.constructor.name === 'InvestigationPuzzle') {
      return <InvestigationPanel puzzle={puzzle} onSubmit={handlePuzzleSubmit} engine={engine} sound={sound} />;
    }
    return null;
  };

  // ── Main Gameplay Layout ──────────────────────────────────
  return (
    <div className="game-layout">
      <MissionHUD onAbort={() => navigate('/')} />

      <div className="game-content">
        {/* Left: Terminal or Active Panel */}
        <div className="game-panel game-panel--left">
          {activePanel === 'terminal' && <Terminal />}
          {activePanel === 'puzzle' && renderPuzzlePanel()}
          {activePanel === 'logs' && <LogsPanel mission={mission} />}
          {activePanel === 'inventory' && <InventoryPanel inventory={inventory} />}
        </div>

        {/* Right: Network Map */}
        <div className="game-panel game-panel--right">
          <NetworkMap
            onNodeClick={handleNodeClick}
            routingMode={missionNumber === 2}
            selectedPath={routePath}
          />
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="game-toolbar" role="toolbar" aria-label="Game workspaces">
        <button
          className={`game-toolbar__btn ${activePanel === 'terminal' ? 'game-toolbar__btn--active' : ''}`}
          onClick={() => setActivePanel('terminal')}
        >
          <span className="toolbar-icon">_&gt;</span> TERMINAL
        </button>
        <button
          className={`game-toolbar__btn ${activePanel === 'puzzle' ? 'game-toolbar__btn--active' : ''}`}
          onClick={() => setActivePanel('puzzle')}
          disabled={!puzzle || puzzle.solved}
        >
          <span className="toolbar-icon">⬡</span> PUZZLE
        </button>
        <button
          className={`game-toolbar__btn ${activePanel === 'logs' ? 'game-toolbar__btn--active' : ''}`}
          onClick={() => setActivePanel('logs')}
        >
          <span className="toolbar-icon">◈</span> LOGS
        </button>
        <button
          className={`game-toolbar__btn ${activePanel === 'inventory' ? 'game-toolbar__btn--active' : ''}`}
          onClick={() => setActivePanel('inventory')}
        >
          <span className="toolbar-icon">▣</span> CLUES ({inventory.clues.length})
        </button>
        <button className="game-toolbar__btn game-toolbar__btn--hint" onClick={handleHint}>
          <span className="toolbar-icon">💡</span> HINT
        </button>
      </div>

      {educationalOverlay}
    </div>
  );
}

// ── Inline Sub-components (Auth, Binary, LogAnalysis, Investigation, Logs, Inventory) ──

function AuthPanel({ puzzle, onSubmit }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const state = puzzle.getState();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = puzzle.attempt(username, password);
    setMessage(result.message);
    if (result.success) {
      onSubmit([username, password]);
    }
  };

  return (
    <div className="puzzle-panel">
      <div className="panel__header">POLYNET GATEWAY // AUTHENTICATION LOCK</div>
      <div className="panel__body">
        <p className="puzzle-help-text">
          Inspect workstations or check system logs to recover employee credentials.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">IDENTIFIER / USERNAME</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. admin or employee name" autoFocus />
          </div>
          <div className="auth-field">
            <label className="auth-label">ACCESS KEY / PASSWORD</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <HTNButton variant="mint" size="md" className="w-full" type="submit" disabled={state.solved || state.failed}>
            TRANSMIT CREDENTIALS
          </HTNButton>
          {message && <div className={`auth-message ${message.includes('GRANTED') ? 'auth-message--success' : 'auth-message--error'}`}>{message}</div>}
          <div className="auth-attempts">LOCKOUT COUNTER: {state.attempts}/{state.maxAttempts} ATTEMPTS</div>
        </form>
      </div>
    </div>
  );
}

function BinaryPanel({ puzzle, onSubmit }) {
  const [answer, setAnswer] = useState('');
  const [toolResult, setToolResult] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [selectedTool, setSelectedTool] = useState('bin-to-ascii');
  const [message, setMessage] = useState('');

  const encoded = puzzle.getEncodedValues();

  const handleUseTool = () => {
    const result = puzzle.useTool(toolInput, selectedTool);
    if (result.error) {
      setToolResult(`ERROR: ${result.error}`);
    } else {
      setToolResult(`${result.from} → ${result.to}: ${result.result}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = puzzle.attempt(answer);
    setMessage(result.message);
    if (result.success) onSubmit(answer);
  };

  return (
    <div className="puzzle-panel">
      <div className="panel__header">SECURITY NODE // BINARY DECODER</div>
      <div className="panel__body">
        <p className="puzzle-help-text">Intercepted encrypted stream fragments:</p>
        <div className="binary-values">
          {encoded.map((v, i) => (
            <div key={i} className="binary-byte">{v}</div>
          ))}
        </div>
        <div className="binary-tools">
          <label className="auth-label">SIGNAL CONVERSION UTILITY</label>
          <div className="binary-tool-row">
            <select className="input" value={selectedTool} onChange={e => setSelectedTool(e.target.value)} style={{flex: '0 0 auto', width: 'auto'}}>
              <option value="bin-to-ascii">BIN → ASCII</option>
              <option value="hex-to-ascii">HEX → ASCII</option>
              <option value="bin-to-dec">BIN → DEC</option>
              <option value="dec-to-bin">DEC → BIN</option>
            </select>
            <input className="input" value={toolInput} onChange={e => setToolInput(e.target.value)} placeholder="Paste encoded bytes" />
            <HTNButton variant="blue" size="sm" onClick={handleUseTool}>DECODE</HTNButton>
          </div>
          {toolResult && <div className="binary-result">{toolResult}</div>}
        </div>
        <form onSubmit={handleSubmit} className="binary-submit">
          <label className="auth-label">DECRYPTED PASSPHRASE</label>
          <div className="auth-field" style={{flexDirection: 'row', gap: '0.5rem'}}>
            <input className="input" value={answer} onChange={e => setAnswer(e.target.value.toUpperCase())} placeholder="DECODED TEXT" />
            <HTNButton variant="mint" size="md" type="submit">UNLOCK</HTNButton>
          </div>
          {message && <div className={`auth-message ${message.includes('ACCEPTED') ? 'auth-message--success' : 'auth-message--error'}`}>{message}</div>}
        </form>
      </div>
    </div>
  );
}

function LogAnalysisPanel({ puzzle, onSubmit }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [message, setMessage] = useState('');
  const question = puzzle.getCurrentQuestion();
  const state = puzzle.getState();

  const handleSubmit = () => {
    if (!selectedOption) return;
    const result = onSubmit(selectedOption);
    setMessage(result?.correct ? 'CORRECT — Incident footprint confirmed' : 'INCORRECT — Re-examine the network anomalies');
    if (result?.correct && !result?.solved) {
      setSelectedOption('');
      setMessage('');
    }
  };

  if (!question || state.solved) {
    return (
      <div className="puzzle-panel">
        <div className="panel__header">DATABASE FORENSICS</div>
        <div className="panel__body"><p style={{color: 'var(--accent)'}}>ANALYSIS VERIFIED — Attack vector completely mapped.</p></div>
      </div>
    );
  }

  return (
    <div className="puzzle-panel">
      <div className="panel__header">FORENSIC LOG ANALYSIS // Q{question.index + 1} OF {state.questionsTotal}</div>
      <div className="panel__body">
        <p className="puzzle-question">{question.question}</p>
        <div className="puzzle-options">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={`puzzle-option ${selectedOption === opt ? 'puzzle-option--selected' : ''}`}
              onClick={() => setSelectedOption(opt)}
            >{opt}</button>
          ))}
        </div>
        <HTNButton variant="mint" size="md" className="w-full" onClick={handleSubmit} disabled={!selectedOption}>
          SUBMIT FINDINGS
        </HTNButton>
        {message && <div className={`auth-message ${message.includes('CORRECT') ? 'auth-message--success' : 'auth-message--error'}`}>{message}</div>}
      </div>
    </div>
  );
}

function InvestigationPanel({ puzzle, onSubmit, engine, sound }) {
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const state = puzzle.getState();
  const phase = puzzle.getCurrentPhase();
  const conclusions = puzzle.conclusions || [];
  const answered = puzzle.submittedConclusions || {};

  const currentConclusion = conclusions.find(c => !answered[c.id]?.correct);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentConclusion) return;
    const result = puzzle.submitConclusion(currentConclusion.id, answer);
    setMessage(result.message);
    if (result.correct) {
      sound.playSuccess();
      setAnswer('');
      setMessage('');
      if (result.allIdentified) {
        setMessage('ALL BREACH VECTORS IDENTIFIED — Proceeding to node containment');
      }
    } else {
      sound.playError();
      engine.handleMistake();
    }
  };

  const handleIsolate = () => {
    const result = puzzle.isolateNode(answer.toUpperCase());
    setMessage(result.message);
    if (result.success) {
      sound.playMissionComplete();
      onSubmit(answer);
    } else {
      sound.playError();
      engine.handleMistake();
    }
  };

  if (phase === 'INVESTIGATE') {
    return (
      <div className="puzzle-panel">
        <div className="panel__header">CRITICAL INCIDENT // EVIDENCE GATHERING</div>
        <div className="panel__body">
          <p className="puzzle-help-text">
            The adversary has penetrated POLYNET infrastructure. Use the terminal commands (<strong>scan</strong>, <strong>inspect [NODE]</strong>, <strong>logs</strong>) to trace their exact movements.
          </p>
          <div className="investigation-evidence-counter">
            CLUES DISCOVERED: {state.cluesDiscovered} / {state.totalClues}
          </div>
          <HTNButton variant="yellow" size="md" className="w-full" onClick={() => {
            const result = puzzle.advanceToIdentify();
            if (result.success) {
              setMessage('');
            } else {
              setMessage(result.message);
            }
          }}>
            COMPILE DOSSIER & IDENTIFY ACTOR
          </HTNButton>
          {message && <div className="auth-message auth-message--error">{message}</div>}
        </div>
      </div>
    );
  }

  if (phase === 'IDENTIFY' && currentConclusion) {
    return (
      <div className="puzzle-panel">
        <div className="panel__header">THREAT ATTRIBUTION // QUESTION DEBRIEF</div>
        <div className="panel__body">
          <form onSubmit={handleSubmit}>
            <p className="puzzle-question">{currentConclusion.question}</p>
            <input className="input" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type finding or node ID..." autoFocus />
            <HTNButton variant="mint" size="md" className="w-full" type="submit" style={{marginTop: '0.75rem'}}>
              CONFIRM ATTRIBUTION
            </HTNButton>
            {message && <div className={`auth-message ${message.includes('CONFIRMED') ? 'auth-message--success' : 'auth-message--error'}`}>{message}</div>}
          </form>
        </div>
      </div>
    );
  }

  if (phase === 'ISOLATE') {
    return (
      <div className="puzzle-panel">
        <div className="panel__header" style={{ color: 'var(--status-danger)' }}>EMERGENCY LOCKDOWN // ISOLATE BREACH</div>
        <div className="panel__body">
          <p className="puzzle-question" style={{color: 'var(--status-danger)'}}>
            CORE MAINFRAME IN IMMEDIATE JEOPARDY!
          </p>
          <p className="puzzle-help-text">
            Enter the exact Node ID of the pivot bridge that connects the infiltrator to the core server:
          </p>
          <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
            <input className="input" value={answer} onChange={e => setAnswer(e.target.value.toUpperCase())} placeholder="e.g. WS-01" />
            <HTNButton variant="coral" size="md" onClick={handleIsolate}>SEVER LINK</HTNButton>
          </div>
          {message && <div className={`auth-message ${message.includes('TERMINATED') ? 'auth-message--success' : 'auth-message--error'}`}>{message}</div>}
        </div>
      </div>
    );
  }

  return null;
}

function LogsPanel({ mission }) {
  const [filter, setFilter] = useState('ALL');
  const logs = mission?.logs || [];
  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.category === filter);
  const categories = ['ALL', ...new Set(logs.map(l => l.category))];

  return (
    <div className="puzzle-panel">
      <div className="panel__header">
        <span>SECURITY AUDIT TRAIL</span>
        <div className="log-filters">
          {categories.map(c => (
            <button key={c} className={`log-filter ${filter === c ? 'log-filter--active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="panel__body log-body">
        {filtered.map((l, i) => (
          <div key={i} className={`log-entry ${l.suspicious ? 'log-entry--suspicious' : ''}`}>
            <span className="log-time">[{l.time}]</span>
            <span className="log-cat">{l.category}</span>
            <span className="log-msg">{l.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryPanel({ inventory }) {
  return (
    <div className="puzzle-panel">
      <div className="panel__header">EVIDENCE INVENTORY // CLUES RECOVERED</div>
      <div className="panel__body">
        {inventory.clues.length === 0 ? (
          <p className="text-muted" style={{ padding: 'var(--space-md)' }}>
            No artifacts recovered yet. Inspect suspicious nodes and query logs in the terminal.
          </p>
        ) : (
          inventory.clues.map(clue => (
            <div key={clue.id} className="inventory-clue">
              <div className="inventory-clue__title">{clue.title}</div>
              <div className="inventory-clue__desc">{clue.description}</div>
              <pre className="inventory-clue__content">{clue.content}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
