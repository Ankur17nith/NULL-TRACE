import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import ScoreEngine from '../game/engine/ScoreEngine';
import { formatScore } from '../utils/formatters';
import { soundEngine } from '../game/engine/SoundEngine';
import HTNButton from '../components/ui/HTNButton';
import Sparkle from '../components/ui/Sparkle';
import './PageShared.css';

export default function FinalResults() {
  const navigate = useNavigate();
  const { achievementEngine } = useGameEngine();
  const callsign = useGameStore(s => s.player.callsign);
  const bestScores = useGameStore(s => s.progress.bestScores);
  const completedMissions = useGameStore(s => s.progress.completedMissions);
  const addLeaderboardEntry = useGameStore(s => s.addLeaderboardEntry);

  const totalScore = Object.values(bestScores).reduce((sum, v) => sum + v, 0);
  const rank = ScoreEngine.getRank(totalScore);

  // Animated score count-up
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    soundEngine.playSuccess();
    let startTime;
    const duration = 1200;
    const animateCount = (now) => {
      if (!startTime) startTime = now;
      const progress = Math.min(1, (now - startTime) / duration);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayScore(Math.round(totalScore * ease));
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };
    const req = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(req);
  }, [totalScore]);

  const handleSubmitScore = () => {
    soundEngine.playSubmit();
    addLeaderboardEntry({
      callsign: callsign || 'ANON',
      score: totalScore,
      rank: rank.id,
      timestamp: Date.now(),
    });
    navigate('/leaderboard');
  };

  return (
    <div className="page-container" style={{ alignItems: 'center', textAlign: 'center', maxWidth: '780px', position: 'relative' }}>
      <Sparkle size={22} color="var(--htn-yellow)" style={{ top: '60px', left: '10%' }} />
      <Sparkle size={26} color="var(--htn-mint)" style={{ top: '100px', right: '12%' }} />
      <Sparkle size={16} color="var(--htn-lavender)" style={{ bottom: '15%', left: '8%' }} />

      <div className="final-debrief-badge">
        <span className="label-accent" style={{ letterSpacing: '0.1em' }}>
          INVESTIGATION CONCLUSION // DOSSIER CLOSED
        </span>
        <div className="final-badge__icon" style={{ marginTop: 'var(--space-md)' }}>{rank.icon}</div>
        <h1 className="final-badge__rank" style={{ marginTop: 'var(--space-xs)' }}>{rank.label}</h1>
        <span className="label-mono" style={{ color: 'var(--text-muted)' }}>
          OPERATOR ID: {callsign || 'CLASSIFIED'}
        </span>
      </div>

      <div className="final-score" style={{ marginTop: 'var(--space-md)' }}>
        <span className="final-score__label">CUMULATIVE SYSTEM SCORE</span>
        <span className="final-score__number" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '4.5rem',
          fontWeight: '900',
          color: 'var(--htn-mint)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: '1',
          textShadow: '0 4px 20px rgba(191, 239, 222, 0.4)'
        }}>
          {formatScore(displayScore)}
        </span>
      </div>

      <div className="final-stats" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="final-stat">
          <span className="label-mono" style={{ fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '700' }}>SECTORS RESTORED</span>
          <span className="final-stat__value">{completedMissions.length}/5</span>
        </div>
        <div className="final-stat">
          <span className="label-mono" style={{ fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '700' }}>ACHIEVEMENTS</span>
          <span className="final-stat__value">{achievementEngine.getProgress().unlocked}/{achievementEngine.getProgress().total}</span>
        </div>
        <div className="final-stat">
          <span className="label-mono" style={{ fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: '700' }}>THREAT STATE</span>
          <span className="final-stat__value" style={{ color: 'var(--htn-mint)' }}>NEUTRALIZED</span>
        </div>
      </div>

      <div className="final-message" style={{ margin: 'var(--space-lg) 0' }}>
        <p>
          {rank.id === 'null-trace' ? 'Ghost in the machine. You tracked every packet, outmaneuvered the adversary, and secured PolyNet with zero trace.' :
           rank.id === 'elite' ? 'Exceptional cyber investigative prowess. The breach is severed, the network is contained, and the compromised infrastructure is restored.' :
           rank.id === 'specialist' ? 'Formidable operational security. You stopped the critical attack vector and identified the malicious pivot.' :
           'Solid foundation established, Trainee. PolyNet incident response stands stronger with your investigation.'}
        </p>
      </div>

      <div className="results-actions" style={{ maxWidth: '380px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <HTNButton variant="mint" size="lg" className="w-full" onClick={handleSubmitScore}>
          [ SUBMIT TO LEADERBOARD ]
        </HTNButton>
        <HTNButton variant="secondary" size="md" className="w-full" onClick={() => navigate('/missions')}>
          REVIEW MISSION PATH
        </HTNButton>
        <HTNButton variant="secondary" size="md" className="w-full" onClick={() => navigate('/archive')}>
          EXPLORE TRACE ARCHIVE
        </HTNButton>
        <HTNButton variant="secondary" size="sm" className="w-full" onClick={() => navigate('/')}>
          RETURN TO MAIN TERMINAL
        </HTNButton>
      </div>
    </div>
  );
}
