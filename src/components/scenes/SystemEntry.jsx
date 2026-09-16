// ============================================================
// NULL//TRACE — System Entry Scene (Hack the North Style)
// Callsign input with HTN pill form and tactile 3D button
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../state/gameStore';
import HTNButton from '../ui/HTNButton';
import Sparkle from '../ui/Sparkle';

export default function SystemEntry({ onEnterGame }) {
  const navigate = useNavigate();
  const callsign = useGameStore(s => s.player.callsign);
  const setCallsign = useGameStore(s => s.setCallsign);
  const [inputValue, setInputValue] = useState(callsign || '');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = inputValue.trim() || 'OPERATOR';
    setCallsign(name);
    setIsTransitioning(true);

    setTimeout(() => {
      onEnterGame?.(name);
    }, 600);
  };

  return (
    <section className={`system-entry scene ${isTransitioning ? 'system-entry--transitioning' : ''}`}>
      <Sparkle color="var(--htn-yellow)" size={32} style={{ top: '15%', left: '12%' }} />
      <Sparkle color="var(--htn-purple)" size={24} style={{ bottom: '20%', right: '14%' }} />

      <div className="scene__inner scene__inner--narrow" style={{ textAlign: 'center' }}>
        <div className="system-entry__badge-row">
          <span className="tag tag--yellow tag--pixel">[05] SYSTEM ACCESS</span>
          <span className="tag tag--accent">POLYNET DISPATCH</span>
        </div>

        <h2 className="system-entry__title">
          ENTER THE MAINFRAME
        </h2>

        <p className="system-entry__desc">
          Choose your operator callsign. Your telemetry and incident responses will be registered in the live trace log.
        </p>

        <form className="system-entry__form" onSubmit={handleSubmit}>
          <div className="system-entry__input-wrapper">
            <span className="system-entry__prompt">CALLSIGN://</span>
            <input
              type="text"
              className="system-entry__input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              placeholder="YOUR_CALLSIGN"
              maxLength={16}
              aria-label="Operator callsign"
            />
          </div>

          <div style={{ marginTop: 'var(--space-lg)' }}>
            <HTNButton
              variant="coral"
              size="lg"
              arrow={true}
              type="submit"
              className="w-full"
            >
              INITIALIZE SYSTEM ACCESS
            </HTNButton>
          </div>
        </form>

        <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate('/menu')}
          >
            OPERATOR MENU →
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate('/missions')}
          >
            MISSION SELECT →
          </button>
        </div>

        {callsign && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => onEnterGame?.(callsign), 600);
            }}
            style={{ marginTop: 'var(--space-sm)' }}
          >
            RESUME AS {callsign} →
          </button>
        )}
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="system-entry__transition">
          <div className="system-entry__transition-text">
            ESTABLISHING ENCRYPTED TRACE CHANNEL...
          </div>
        </div>
      )}
    </section>
  );
}
