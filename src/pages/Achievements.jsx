import { useNavigate } from 'react-router-dom';
import { useGameEngine } from '../hooks/useGameEngine';
import HTNButton from '../components/ui/HTNButton';
import Sparkle from '../components/ui/Sparkle';
import './PageShared.css';

export default function Achievements() {
  const navigate = useNavigate();
  const { achievementEngine } = useGameEngine();
  const all = achievementEngine.getAll();
  const { unlocked, total } = achievementEngine.getProgress();

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <Sparkle size={18} color="var(--htn-yellow)" style={{ top: '60px', right: '10%' }} />
      <Sparkle size={14} color="var(--htn-mint)" style={{ bottom: '10%', left: '5%' }} />

      <div className="page-header">
        <HTNButton variant="secondary" size="sm" onClick={() => navigate('/')}>← SYSTEM HOME</HTNButton>
        <h1>ACHIEVEMENTS</h1>
        <span className="page-counter">{unlocked}/{total} UNLOCKED</span>
      </div>

      <div className="achievements-grid stagger-children">
        {all.map(a => (
          <div key={a.id} className={`achievement-card ${a.unlocked ? 'achievement-card--unlocked' : ''}`}>
            <div className="achievement-card__icon">{a.icon}</div>
            <div className="achievement-card__info">
              <div className="achievement-card__title">{a.title}</div>
              <div className="achievement-card__desc">{a.description}</div>
            </div>
            {a.unlocked && <div className="achievement-card__check">✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
