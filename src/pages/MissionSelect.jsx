// ============================================================
// NULL//TRACE — Mission Select Page v2.0
// Interactive investigation pathway with connected nodes
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import { soundEngine } from '../game/engine/SoundEngine';
import { formatScore } from '../utils/formatters';
import HTNButton from '../components/ui/HTNButton';
import Sparkle from '../components/ui/Sparkle';
import './MissionSelect.css';

const DIFFICULTY_STARS = { EASY: '★☆☆', NORMAL: '★★☆', HARD: '★★★' };

export default function MissionSelect() {
  const navigate = useNavigate();
  const { engine, missionEngine } = useGameEngine();
  const unlockedMissions = useGameStore(s => s.progress.unlockedMissions);
  const completedMissions = useGameStore(s => s.progress.completedMissions);
  const bestScores = useGameStore(s => s.progress.bestScores);
  const callsign = useGameStore(s => s.player.callsign);

  const missions = missionEngine.getAllMissions();

  // Selected mission for preview
  const defaultSelected = missions.find(m => unlockedMissions.includes(m.id) && !completedMissions.includes(m.id))?.id 
    || missions[0]?.id;
  const [selectedId, setSelectedId] = useState(defaultSelected);

  const selectedMission = missions.find(m => m.id === selectedId) || missions[0];
  const isSelectedUnlocked = unlockedMissions.includes(selectedMission?.id);
  const isSelectedCompleted = completedMissions.includes(selectedMission?.id);

  const handleStartMission = (missionId) => {
    soundEngine.init();
    soundEngine.resume();
    soundEngine.playSubmit();
    engine.startMission(missionId);
    navigate('/game');
  };

  return (
    <div className="mission-select-page">
      <Sparkle size={18} color="var(--htn-yellow)" style={{ top: '80px', right: '5%' }} />
      <Sparkle size={14} color="var(--htn-mint)" style={{ bottom: '10%', left: '3%' }} />

      {/* Top Bar */}
      <header className="mission-select-header">
        <div className="mission-select-header__inner">
          <HTNButton variant="secondary" size="sm" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/menu'))}>
            ← BACK
          </HTNButton>
          <div className="mission-select-header__title">
            <span className="label-accent">OPERATIONAL DISPATCH</span>
            <h1>INVESTIGATION PATH</h1>
          </div>
          <div className="mission-select-header__operator">
            <span className="operator-dot" />
            <span className="operator-id">OPERATOR: {callsign || 'ANON'}</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout: Pathway on Left, Dossier on Right */}
      <div className="mission-select-container">
        {/* Left: Investigation Pathway Graph */}
        <div className="mission-pathway">
          <div className="mission-pathway__title">
            <span>SECTOR MAP // PROGRESSION MATRIX</span>
            <span className="mission-progress-tag">
              {completedMissions.length}/5 CLEAR
            </span>
          </div>

          <div className="mission-nodes-track">
            {missions.map((m, index) => {
              const isUnlocked = unlockedMissions.includes(m.id);
              const isCompleted = completedMissions.includes(m.id);
              const isCurrent = selectedId === m.id;
              const best = bestScores[m.id];

              return (
                <div key={m.id} className="mission-track-step">
                  {index > 0 && (
                    <div className={`mission-track-connector ${
                      completedMissions.includes(missions[index - 1]?.id) ? 'mission-track-connector--active' : ''
                    }`} />
                  )}

                  <div
                    className={`mission-node-card ${isCurrent ? 'mission-node-card--selected' : ''} ${
                      isCompleted ? 'mission-node-card--completed' : ''
                    } ${!isUnlocked ? 'mission-node-card--locked' : ''}`}
                    onClick={() => {
                      soundEngine.playKeypress();
                      setSelectedId(m.id);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(m.id); }}
                  >
                    <div className="mission-node-indicator">
                      {isCompleted ? '✓' : !isUnlocked ? '🔒' : `0${m.number}`}
                    </div>
                    <div className="mission-node-info">
                      <div className="mission-node-header">
                        <span className="mission-node-num">PHASE 0{m.number}</span>
                        <span className="mission-node-diff">{DIFFICULTY_STARS[m.difficulty]}</span>
                      </div>
                      <h3 className="mission-node-title">{m.title}</h3>
                      <p className="mission-node-subtitle">{m.subtitle}</p>
                    </div>
                    {best != null && (
                      <div className="mission-node-score">
                        <span className="score-label">BEST</span>
                        <span className="score-val">{formatScore(best)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Mission Dossier & Launch */}
        <div className="mission-dossier">
          <div className="dossier-panel">
            <div className="dossier-header">
              <div className="dossier-tag-row">
                <span className="tag tag--accent">INCIDENT REPORT 0{selectedMission?.number}</span>
                <span className={`tag ${isSelectedCompleted ? 'tag--success' : isSelectedUnlocked ? 'tag--primary' : 'tag--default'}`}>
                  {isSelectedCompleted ? 'RESOLVED' : isSelectedUnlocked ? 'ACTION REQUIRED' : 'CLASSIFIED'}
                </span>
              </div>
              <h2 className="dossier-title">{selectedMission?.title}</h2>
              <p className="dossier-subtitle">{selectedMission?.subtitle}</p>
            </div>

            <div className="dossier-divider" />

            <div className="dossier-section">
              <h4>INCIDENT SUMMARY</h4>
              <p className="dossier-briefing-sample">
                {selectedMission?.briefing?.[0] || 'Awaiting initial telemetry scan.'}
              </p>
            </div>

            <div className="dossier-section">
              <h4>DIRECTIVES</h4>
              <ul className="dossier-objectives-list">
                {selectedMission?.objectives?.map(obj => (
                  <li key={obj.id} className="dossier-objective-item">
                    <span className="obj-bullet">◈</span>
                    <span>{obj.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dossier-meta-grid">
              <div className="dossier-meta-item">
                <span className="meta-label">DIFFICULTY</span>
                <span className="meta-val">{selectedMission?.difficulty}</span>
              </div>
              <div className="dossier-meta-item">
                <span className="meta-label">TRACE TIME</span>
                <span className="meta-val">{selectedMission?.timeLimit ? `${selectedMission.timeLimit}s` : '180s'}</span>
              </div>
              <div className="dossier-meta-item">
                <span className="meta-label">TARGET IP</span>
                <span className="meta-val">10.0.{selectedMission?.number}.1</span>
              </div>
            </div>

            <div className="dossier-actions">
              <HTNButton
                variant={isSelectedCompleted ? 'mint' : isSelectedUnlocked ? 'coral' : 'secondary'}
                size="lg"
                className="w-full"
                disabled={!isSelectedUnlocked}
                onClick={() => handleStartMission(selectedMission.id)}
              >
                {isSelectedCompleted ? '[ RE-RUN INVESTIGATION ]' : isSelectedUnlocked ? '[ DEPLOY AGENT TO SECTOR ]' : '[ ACCESS RESTRICTED ]'}
              </HTNButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
