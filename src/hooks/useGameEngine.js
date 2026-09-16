// ============================================================
// NULL//TRACE — useGameEngine hook
// Provides game engine instance to React components
// ============================================================

import GameEngine from '../game/engine/GameEngine';
import TerminalEngine from '../game/terminal/TerminalEngine';
import AchievementEngine from '../game/engine/AchievementEngine';
import { useGameStore } from '../state/gameStore';
import { soundEngine } from '../game/engine/SoundEngine';

let globalEngine = null;
let globalAchievementEngine = null;

export function useGameEngine() {
  const store = useGameStore;

  if (!globalEngine) {
    globalEngine = new GameEngine(store);
    const terminalEngine = new TerminalEngine(globalEngine.getContext());
    globalEngine.setTerminalEngine(terminalEngine);
    globalEngine.init();
    globalAchievementEngine = new AchievementEngine(store);
  }

  return {
    engine: globalEngine,
    missionEngine: globalEngine.missionEngine,
    puzzleEngine: globalEngine.puzzleEngine,
    scoreEngine: globalEngine.scoreEngine,
    networkEngine: globalEngine.networkEngine,
    terminalEngine: globalEngine.terminalEngine,
    achievementEngine: globalAchievementEngine,
    sound: soundEngine,
  };
}

export function resetGameEngine() {
  if (globalEngine) {
    globalEngine.destroy();
    globalEngine = null;
    globalAchievementEngine = null;
  }
}

export default useGameEngine;
