// ============================================================
// NULL//TRACE — Main Menu Page
// Premium game-style main menu
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import { soundEngine } from '../game/engine/SoundEngine';
import { validateCallsign } from '../utils/validators';
import './MainMenu.css';

export default function MainMenu() {
  const navigate = useNavigate();
  const { engine } = useGameEngine();
  const callsign = useGameStore(s => s.player.callsign);
  const rank = useGameStore(s => s.player.rank);
  const completedMissions = useGameStore(s => s.progress.completedMissions);
  const setCallsign = useGameStore(s => s.setCallsign);
  const showIntro = useGameStore(s => s.ui.showIntro);
  const setShowIntro = useGameStore(s => s.setShowIntro);

  const [introPhase, setIntroPhase] = useState(0);
  const [inputCallsign, setInputCallsign] = useState(callsign || '');
  const [showCallsignInput, setShowCallsignInput] = useState(!callsign);
  const [callsignError, setCallsignError] = useState('');

  useEffect(() => {
    if (callsign) {
      setShowCallsignInput(false);
    }
  }, [callsign]);

  // Intro sequence
  useEffect(() => {
    if (!showIntro) return;
    const timers = [
      setTimeout(() => setIntroPhase(1), 500),
      setTimeout(() => setIntroPhase(2), 1800),
      setTimeout(() => setIntroPhase(3), 3200),
      setTimeout(() => setIntroPhase(4), 4500),
      setTimeout(() => { setIntroPhase(5); setShowIntro(false); }, 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showIntro, setShowIntro]);

  // Init sound on first interaction
  const initSound = () => {
    soundEngine.init();
    soundEngine.resume();
  };

  const handleStartMission = () => {
    initSound();
    if (!callsign) {
      setShowCallsignInput(true);
      return;
    }
    soundEngine.playSubmit();
    // Start mission 01 or first unlocked
    const firstMission = 'mission-01';
    engine.startMission(firstMission);
    navigate('/game');
  };

  const handleCallsignSubmit = (e) => {
    e.preventDefault();
    const result = validateCallsign(inputCallsign);
    if (!result.valid) {
      setCallsignError(result.error);
      return;
    }
    setCallsign(inputCallsign.trim().toUpperCase());
    setCallsignError('');
    setShowCallsignInput(false);
    soundEngine.playSuccess();
  };

  const handleDemo = () => {
    initSound();
    if (!callsign) {
      setCallsign('OPERATOR');
    }
    soundEngine.playSubmit();
    engine.startMission('mission-05');
    navigate('/game');
  };

  const skipIntro = () => {
    setIntroPhase(5);
    setShowIntro(false);
  };

  // Intro screen
  if (showIntro && introPhase < 5) {
    return (
      <div className="intro-screen" onClick={skipIntro} role="button" tabIndex={0} aria-label="Skip intro" onKeyDown={e => e.key === 'Enter' && skipIntro()}>
        <div className="intro-content">
          {introPhase >= 1 && <div className="intro-line intro-line--1">POLYNET // SECURITY OPERATIONS</div>}
          {introPhase >= 2 && <div className="intro-line intro-line--2">03:17 AM — UNAUTHORIZED ACCESS DETECTED</div>}
          {introPhase >= 3 && <div className="intro-line intro-line--3 intro-line--danger">SYSTEMS FAILING</div>}
          {introPhase >= 4 && (
            <div className="intro-title">
              <span className="intro-title__null">NULL</span>
              <span className="intro-title__sep">//</span>
              <span className="intro-title__trace">TRACE</span>
            </div>
          )}
        </div>
        <div className="intro-skip">CLICK TO SKIP</div>
      </div>
    );
  }

  return (
    <div className="main-menu">
      {/* Background grid effect */}
      <div className="main-menu__bg" />

      <div className="main-menu__content">
        {/* Logo */}
        <div className="main-menu__logo">
          <h1 className="main-menu__title">
            <span className="main-menu__null">NULL</span>
            <span className="main-menu__sep">//</span>
            <span className="main-menu__trace">TRACE</span>
          </h1>
          <p className="main-menu__tagline">TRACE THE BREACH. OUTSMART THE SYSTEM.</p>
        </div>

        {/* Callsign input */}
        {showCallsignInput && (
          <form className="callsign-form" onSubmit={handleCallsignSubmit}>
            <label className="callsign-form__label">ENTER YOUR CALLSIGN</label>
            <div className="callsign-form__row">
              <input
                className="input callsign-form__input"
                type="text"
                value={inputCallsign}
                onChange={e => setInputCallsign(e.target.value.toUpperCase())}
                placeholder="CALLSIGN"
                maxLength={16}
                autoFocus
                aria-label="Callsign"
              />
              <button className="btn btn--primary" type="submit">CONFIRM</button>
            </div>
            {callsignError && <div className="callsign-form__error">{callsignError}</div>}
          </form>
        )}

        {/* Menu buttons */}
        {!showCallsignInput && (
          <nav className="main-menu__nav stagger-children" aria-label="Main menu">
            <button className="btn btn--lg btn--primary w-full" onClick={handleStartMission} id="btn-start">
              {completedMissions.length > 0 ? 'CONTINUE MISSION' : 'START MISSION'}
            </button>
            <button className="btn btn--lg w-full" onClick={() => { initSound(); navigate('/missions'); }} id="btn-missions">
              MISSION SELECT
            </button>
            <button className="btn btn--lg w-full" onClick={() => { initSound(); navigate('/leaderboard'); }} id="btn-leaderboard">
              LEADERBOARD
            </button>
            <button className="btn btn--lg w-full" onClick={() => { initSound(); navigate('/achievements'); }} id="btn-achievements">
              ACHIEVEMENTS
            </button>
            <button className="btn btn--lg w-full" onClick={() => { initSound(); navigate('/archive'); }} id="btn-archive">
              ARCHIVE
            </button>
            <button className="btn btn--lg w-full" onClick={() => { initSound(); navigate('/settings'); }} id="btn-settings">
              SETTINGS
            </button>
            <button className="btn btn--lg btn--ghost w-full" onClick={handleDemo} id="btn-demo">
              ▶ START DEMO
            </button>
            <button className="btn btn--sm btn--ghost w-full" onClick={() => { initSound(); navigate('/'); }} id="btn-home" style={{ marginTop: '8px' }}>
              ← SYSTEM HOME
            </button>
          </nav>
        )}

        {/* Player info */}
        {callsign && !showCallsignInput && (
          <div className="main-menu__player">
            <span className="main-menu__callsign">{callsign}</span>
            <span className="main-menu__rank">{rank}</span>
            {completedMissions.length > 0 && (
              <span className="main-menu__progress">{completedMissions.length}/5 MISSIONS</span>
            )}
          </div>
        )}
      </div>

      <footer className="main-menu__footer">
        <span>NULL//TRACE v1.0</span>
        <span>A CYBERSECURITY SIMULATION</span>
      </footer>
    </div>
  );
}
