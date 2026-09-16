import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { soundEngine } from '../game/engine/SoundEngine';
import HTNButton from '../components/ui/HTNButton';
import Sparkle from '../components/ui/Sparkle';
import './PageShared.css';

export default function Settings() {
  const navigate = useNavigate();
  const settings = useGameStore(s => s.settings);
  const setDifficulty = useGameStore(s => s.setDifficulty);
  const setSoundEnabled = useGameStore(s => s.setSoundEnabled);
  const setMusicEnabled = useGameStore(s => s.setMusicEnabled);
  const setSfxVolume = useGameStore(s => s.setSfxVolume);
  const setMusicVolume = useGameStore(s => s.setMusicVolume);
  const setShowScanlines = useGameStore(s => s.setShowScanlines);
  const resetAllProgress = useGameStore(s => s.resetAllProgress);

  const handleSoundToggle = () => {
    setSoundEnabled(!settings.soundEnabled);
    soundEngine.setEnabled(!settings.soundEnabled);
  };

  const handleMusicToggle = () => {
    setMusicEnabled(!settings.musicEnabled);
    soundEngine.setMusicEnabled(!settings.musicEnabled);
  };

  const handleReset = () => {
    if (confirm('Reset ALL progress? This cannot be undone.')) {
      resetAllProgress();
    }
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <Sparkle size={18} color="var(--htn-yellow)" style={{ top: '60px', right: '10%' }} />
      <Sparkle size={14} color="var(--htn-mint)" style={{ bottom: '10%', left: '5%' }} />

      <div className="page-header">
        <HTNButton variant="secondary" size="sm" onClick={() => navigate('/')}>← SYSTEM HOME</HTNButton>
        <h1>SYSTEM SETTINGS</h1>
      </div>

      <div className="settings-groups stagger-children">
        <div className="settings-group">
          <h3>DIFFICULTY PREFERENCE</h3>
          <div className="settings-row" style={{ justifyContent: 'flex-start', gap: '10px' }}>
            {['EASY', 'NORMAL', 'HARD'].map(d => (
              <HTNButton
                key={d}
                variant={settings.difficulty === d ? 'mint' : 'secondary'}
                size="sm"
                onClick={() => setDifficulty(d)}
              >
                {d}
              </HTNButton>
            ))}
          </div>
        </div>

        <div className="settings-group">
          <h3>AUDIO CONFIGURATION</h3>
          <div className="settings-row">
            <label>Tactile Sound Effects</label>
            <button className={`toggle ${settings.soundEnabled ? 'toggle--on' : ''}`} onClick={handleSoundToggle}>
              {settings.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="settings-row">
            <label>Ambient Atmospheric Audio</label>
            <button className={`toggle ${settings.musicEnabled ? 'toggle--on' : ''}`} onClick={handleMusicToggle}>
              {settings.musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="settings-row">
            <label>SFX Volume</label>
            <input type="range" min="0" max="1" step="0.1" value={settings.sfxVolume}
              onChange={e => { setSfxVolume(+e.target.value); soundEngine.setSfxVolume(+e.target.value); }} />
          </div>
          <div className="settings-row">
            <label>Music Volume</label>
            <input type="range" min="0" max="1" step="0.1" value={settings.musicVolume}
              onChange={e => { setMusicVolume(+e.target.value); soundEngine.setMusicVolume(+e.target.value); }} />
          </div>
        </div>

        <div className="settings-group">
          <h3>VISUAL PRESENTATION</h3>
          <div className="settings-row">
            <label>Subtle CRT Scanlines</label>
            <button className={`toggle ${settings.showScanlines ? 'toggle--on' : ''}`} onClick={() => setShowScanlines(!settings.showScanlines)}>
              {settings.showScanlines ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="settings-group">
          <h3>PLAYER DATA</h3>
          <div className="settings-row">
            <label>Wipe local cache &amp; investigation progress</label>
            <HTNButton variant="coral" size="sm" onClick={handleReset}>RESET ALL PROGRESS</HTNButton>
          </div>
        </div>
      </div>
    </div>
  );
}
