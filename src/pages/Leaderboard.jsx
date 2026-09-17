import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { formatScore } from '../utils/formatters';
import { fetchRemoteLeaderboard } from '../utils/api';
import HTNButton from '../components/ui/HTNButton';
import Sparkle from '../components/ui/Sparkle';
import './PageShared.css';

export default function Leaderboard() {
  const navigate = useNavigate();
  const localLeaderboard = useGameStore(s => s.leaderboard);
  const [remoteEntries, setRemoteEntries] = useState([]);

  useEffect(() => {
    let isMounted = true;
    fetchRemoteLeaderboard().then(entries => {
      if (isMounted && Array.isArray(entries) && entries.length > 0) {
        setRemoteEntries(entries);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge local and remote entries, keeping best score per callsign
  const combinedMap = new Map();
  remoteEntries.forEach(entry => {
    if (entry?.callsign) {
      combinedMap.set(entry.callsign, { callsign: entry.callsign, score: entry.score });
    }
  });
  localLeaderboard.forEach(entry => {
    if (entry?.callsign) {
      const existing = combinedMap.get(entry.callsign);
      if (!existing || entry.score > existing.score) {
        combinedMap.set(entry.callsign, { callsign: entry.callsign, score: entry.score });
      }
    }
  });

  const leaderboard = Array.from(combinedMap.values()).sort((a, b) => b.score - a.score);

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <Sparkle size={20} color="var(--htn-yellow)" style={{ top: '60px', right: '12%' }} />
      <Sparkle size={14} color="var(--htn-mint)" style={{ bottom: '8%', left: '8%' }} />

      <div className="page-header">
        <HTNButton variant="secondary" size="sm" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/menu'))}>← BACK</HTNButton>
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
