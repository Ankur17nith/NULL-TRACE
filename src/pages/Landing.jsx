// ============================================================
// NULL//TRACE — Landing Page
// Cinematic scroll-driven narrative experience
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import { soundEngine } from '../game/engine/SoundEngine';
import { initScrollManager, destroyScrollManager } from '../animations/scrollManager';

import Nav from '../components/navigation/Nav';
import SystemBoot from '../components/scenes/SystemBoot';
import TitleReveal from '../components/scenes/TitleReveal';
import IncidentReport from '../components/scenes/IncidentReport';
import NetworkShowcase from '../components/scenes/NetworkShowcase';
import MissionMap from '../components/scenes/MissionMap';
import SystemEntry from '../components/scenes/SystemEntry';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { engine } = useGameEngine();
  const [bootComplete, setBootComplete] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const mainRef = useRef(null);

  // Skip boot for returning players
  const hasCallsign = useGameStore(s => !!s.player.callsign);
  const [skipBoot] = useState(() =>
    hasCallsign && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    initScrollManager();
    return () => destroyScrollManager();
  }, []);

  useEffect(() => {
    if (bootComplete || skipBoot) {
      setShowNav(true);
    }
  }, [bootComplete, skipBoot]);

  const handleEnterSystem = useCallback(() => {
    const section = document.getElementById('system-entry');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleStartMission = useCallback((missionId) => {
    soundEngine.init();
    soundEngine.resume();
    engine.startMission(missionId);
    navigate('/game');
  }, [engine, navigate]);

  const handleEnterGame = useCallback((callsign) => {
    soundEngine.init();
    soundEngine.resume();
    soundEngine.playSubmit();
    // Start mission 01 by default, or last uncompleted
    const unlockedMissions = useGameStore.getState().progress.unlockedMissions;
    const completedMissions = useGameStore.getState().progress.completedMissions;
    const nextMission = unlockedMissions.find(m => !completedMissions.includes(m)) || 'mission-01';
    engine.startMission(nextMission);
    navigate('/game');
  }, [engine, navigate]);

  return (
    <div className="landing" ref={mainRef}>
      {/* Navigation — appears after boot */}
      {showNav && <Nav onEnterSystem={handleEnterSystem} />}

      {/* Skip button for returning players */}
      {hasCallsign && !bootComplete && !skipBoot && (
        <button
          className="landing__skip-btn btn btn--ghost"
          onClick={() => setBootComplete(true)}
        >
          SKIP TO SYSTEM →
        </button>
      )}

      {/* ─── Scene 01: System Boot ──────────────────────── */}
      {!bootComplete && !skipBoot ? (
        <section className="scene scene--pinned" id="boot">
          <SystemBoot
            isActive={true}
            onComplete={() => setBootComplete(true)}
          />
        </section>
      ) : null}

      {/* ─── Scene 02: Title Reveal ─────────────────────── */}
      <section className="scene scene--pinned" id="title">
        <TitleReveal
          isVisible={bootComplete || skipBoot}
          onEnterSystem={handleEnterSystem}
        />
      </section>

      {/* ─── Scene 03: The Incident ─────────────────────── */}
      <div id="incident">
        <IncidentReport />
      </div>

      {/* ─── Scene 04: The Network ──────────────────────── */}
      <div id="network">
        <NetworkShowcase />
      </div>

      {/* ─── Scene 05: The Missions ─────────────────────── */}
      <div id="missions">
        <MissionMap onStartMission={handleStartMission} />
      </div>

      {/* ─── About Section ──────────────────────────────── */}
      <section className="about-section scene" id="about">
        <div className="scene__inner scene__inner--narrow" style={{ textAlign: 'center' }}>
          <span className="label-accent">
            <span className="section-label__number">[04]</span> WHY NULL//TRACE?
          </span>
          <h2 className="display-lg" style={{ marginTop: 'var(--space-md)' }}>
            LEARN BY DOING
          </h2>
          <div className="about-section__grid">
            <div className="about-card">
              <div className="about-card__icon">◈</div>
              <h4>SAFE SIMULATION</h4>
              <p>Every system, network, and attack is fictional. No real infrastructure is ever touched.</p>
            </div>
            <div className="about-card">
              <div className="about-card__icon">⬡</div>
              <h4>REAL CONCEPTS</h4>
              <p>Authentication, routing, log analysis, encryption — translated into interactive puzzles.</p>
            </div>
            <div className="about-card">
              <div className="about-card__icon">▣</div>
              <h4>CURIOSITY DRIVEN</h4>
              <p>No lectures. No quizzes. Explore, discover, and learn through investigation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Scene 06: System Entry ─────────────────────── */}
      <div id="system-entry">
        <SystemEntry onEnterGame={handleEnterGame} />
      </div>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <span className="nav__logo" aria-hidden="true">
            <span className="nav__logo-null">NULL</span>
            <span className="nav__logo-slash">//</span>
            <span className="nav__logo-trace">TRACE</span>
          </span>
          <span className="label-mono">
            A CYBERSECURITY INVESTIGATION EXPERIENCE
          </span>
          <span className="label-mono" style={{ color: 'var(--text-dim)' }}>
            ALL SYSTEMS FICTIONAL · ALL DATA SIMULATED
          </span>
        </div>
      </footer>
    </div>
  );
}
