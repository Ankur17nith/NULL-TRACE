// ============================================================
// NULL//TRACE — MissionHUD Component
// Top HUD bar during gameplay with animated score counter
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../state/gameStore';
import { useTimer } from '../../hooks/useTimer';
import { formatScore } from '../../utils/formatters';
import { soundEngine } from '../../game/engine/SoundEngine';
import './MissionHUD.css';

export default function MissionHUD({ onAbort }) {
  const navigate = useNavigate();
  const missionNumber = useGameStore(s => s.mission.currentMissionNumber);
  const objectives = useGameStore(s => s.mission.objectives);
  const targetScore = useGameStore(s => s.player.score);
  const status = useGameStore(s => s.mission.status);
  const callsign = useGameStore(s => s.player.callsign);
  const { formatted, isWarning, isCritical } = useTimer();

  // Animated score counter
  const [displayScore, setDisplayScore] = useState(targetScore);
  const animRef = useRef(null);

  useEffect(() => {
    if (displayScore === targetScore) return;

    const start = displayScore;
    const diff = targetScore - start;
    const duration = 600; // ms
    const startTime = performance.now();

    const updateScore = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + diff * ease);
      setDisplayScore(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(updateScore);
      }
    };

    animRef.current = requestAnimationFrame(updateScore);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetScore]);

  const currentObj = objectives.find(o => !o.completed);
  const completedCount = objectives.filter(o => o.completed).length;

  if (status === 'IDLE') return null;

  const handleExit = () => {
    soundEngine.playKeypress();
    if (window.confirm('Abort current investigation and return to mission control?')) {
      if (onAbort) {
        onAbort();
      } else {
        navigate('/');
      }
    }
  };

  return (
    <header className="mission-hud" role="banner" aria-label="Mission Heads-Up Display">
      <div className="mission-hud__left">
        <button 
          className="mission-hud__exit-btn"
          onClick={handleExit}
          title="Return to Menu"
          aria-label="Abort mission"
        >
          <span className="mission-hud__exit-icon">◀</span>
          <span className="mission-hud__exit-text">ABORT</span>
        </button>
        <div className="mission-hud__badge">
          <span className="mission-hud__badge-dot" />
          <span className="mission-hud__label">
            OP_{String(missionNumber).padStart(2, '0')} // {callsign || 'OPERATOR'}
          </span>
        </div>
      </div>

      <div className="mission-hud__center">
        {currentObj ? (
          <div className="mission-hud__objective">
            <div className="mission-hud__obj-header">
              <span className="mission-hud__obj-label">ACTIVE OBJECTIVE</span>
              <span className="mission-hud__obj-progress">[{completedCount}/{objectives.length}]</span>
            </div>
            <span className="mission-hud__obj-text">{currentObj.text}</span>
          </div>
        ) : (
          <div className="mission-hud__objective">
            <span className="mission-hud__obj-label" style={{ color: 'var(--accent)' }}>STATUS</span>
            <span className="mission-hud__obj-text" style={{ color: 'var(--accent)' }}>ALL PRIMARY OBJECTIVES SECURED</span>
          </div>
        )}
      </div>

      <div className="mission-hud__right">
        <div className={`mission-hud__timer ${isWarning ? 'mission-hud__timer--warning' : ''} ${isCritical ? 'mission-hud__timer--critical' : ''}`}>
          <span className="mission-hud__timer-label">TRACE WINDOW</span>
          <div className="mission-hud__timer-box">
            <span className="mission-hud__timer-value">{formatted}</span>
          </div>
        </div>

        <div className="mission-hud__score">
          <span className="mission-hud__score-label">SEC_SCORE</span>
          <div className="mission-hud__score-box">
            <span className="mission-hud__score-value">{formatScore(displayScore)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
