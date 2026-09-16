// ============================================================
// NULL//TRACE — App Component v2.0
// Root router: Landing experience → Game
// ============================================================

import { HashRouter, Routes, Route } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import Landing from '../pages/Landing';
import Game from '../pages/Game';
import MissionSelect from '../pages/MissionSelect';
import Achievements from '../pages/Achievements';
import Leaderboard from '../pages/Leaderboard';
import Settings from '../pages/Settings';
import Archive from '../pages/Archive';
import FinalResults from '../pages/FinalResults';
import './App.css';

export default function App() {
  const showScanlines = useGameStore(s => s.settings.showScanlines);

  return (
    <HashRouter>
      <div className="app-root" id="null-trace-app">
        {/* Scanline overlay — only in game mode */}
        {showScanlines && <div className="scanline-overlay" aria-hidden="true" />}

        <Routes>
          {/* Landing — cinematic scroll experience */}
          <Route path="/" element={<Landing />} />

          {/* Game — full gameplay mode */}
          <Route path="/game" element={<Game />} />

          {/* Sub-pages */}
          <Route path="/missions" element={<MissionSelect />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/final-results" element={<FinalResults />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
