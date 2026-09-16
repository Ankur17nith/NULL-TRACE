import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { formatScore } from '../utils/formatters';
import HTNButton from '../components/ui/HTNButton';
import Sparkle from '../components/ui/Sparkle';
import './PageShared.css';

export default function Leaderboard() {
  const navigate = useNavigate();
  const leaderboard = useGameStore(s => s.leaderboard);

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <Sparkle size={20} color="var(--htn-yellow)" style={{ top: '60px', right: '12%' }} />
      <Sparkle size={14} color="var(--htn-mint)" style={{ bottom: '8%', left: '8%' }} />

      <div className="page-header">
        <HTNButton variant="secondary" size="sm" onClick={() => navigate('/')}>← SYSTEM HOME</HTNButton>
        <h1>OPERATOR LEADERBOARD</h1>
      </div>

      {leaderboard.length === 0 ? (
        <div className="page-empty">
          <p>No operator scores logged yet. Complete investigative operations to claim your rank.</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-row leaderboard-row--header">
            <span className="leaderboard-rank">RANK</span>
            <span className="leaderboard-name">CALLSIGN</span>
            <span className="leaderboard-score">SECURITY SCORE</span>
          </div>
          {leaderboard.map((entry, i) => (
            <div key={i} className={`leaderboard-row ${i < 3 ? 'leaderboard-row--top' : ''}`}>
              <span className="leaderboard-rank">0{i + 1}</span>
              <span className="leaderboard-name">{entry.callsign}</span>
              <span className="leaderboard-score">{formatScore(entry.score)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
