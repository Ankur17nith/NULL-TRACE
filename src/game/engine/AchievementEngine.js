// ============================================================
// NULL//TRACE — Achievement Engine
// Achievement definitions and unlock logic
// ============================================================

import { GameEvents, eventEngine } from './EventEngine';

const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first-trace',
    title: 'First Trace',
    description: 'Complete your first mission',
    icon: '◇',
    condition: (state) => state.progress.completedMissions.length >= 1,
  },
  {
    id: 'packet-runner',
    title: 'Packet Runner',
    description: 'Complete a routing challenge without mistakes',
    icon: '◆',
    condition: (state, ctx) => ctx?.missionId === 'mission-02' && ctx?.mistakes === 0,
  },
  {
    id: 'zero-day',
    title: 'Zero Day',
    description: 'Complete a mission without using hints',
    icon: '▣',
    condition: (state, ctx) => ctx?.hintsUsed === 0 && ctx?.completed,
  },
  {
    id: 'ghost',
    title: 'Ghost',
    description: 'Finish a mission under the target time',
    icon: '★',
    condition: (state, ctx) => ctx?.timeRemaining > ctx?.totalTime * 0.5,
  },
  {
    id: 'root-access',
    title: 'Root Access',
    description: 'Complete all missions',
    icon: '✦',
    condition: (state) => state.progress.completedMissions.length >= 5,
  },
  {
    id: 'perfect-trace',
    title: 'Perfect Trace',
    description: 'Get 100% accuracy on any mission',
    icon: '◉',
    condition: (state, ctx) => ctx?.mistakes === 0 && ctx?.completed,
  },
  {
    id: 'codebreaker',
    title: 'Codebreaker',
    description: 'Solve the binary lock on your first attempt',
    icon: '⬡',
    condition: (state, ctx) => ctx?.missionId === 'mission-03' && ctx?.puzzleAttempts === 1,
  },
  {
    id: 'detective',
    title: 'Detective',
    description: 'Find all clues in a single mission',
    icon: '⬢',
    condition: (state, ctx) => ctx?.cluesFound >= ctx?.totalClues && ctx?.totalClues > 0,
  },
  {
    id: 'elite-operator',
    title: 'Elite Operator',
    description: 'Reach ELITE rank',
    icon: '✧',
    condition: (state) => {
      const totalScore = Object.values(state.progress.bestScores || {}).reduce((s, v) => s + v, 0);
      return totalScore >= 8500;
    },
  },
  {
    id: 'null-trace-rank',
    title: 'NULL//TRACE',
    description: 'Achieve the highest rank',
    icon: '◉',
    condition: (state) => {
      const totalScore = Object.values(state.progress.bestScores || {}).reduce((s, v) => s + v, 0);
      return totalScore >= 11000;
    },
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete any mission in under 2 minutes',
    icon: '⚡',
    condition: (state, ctx) => ctx?.duration && ctx.duration < 120000,
  },
  {
    id: 'incident-commander',
    title: 'Incident Commander',
    description: 'Successfully isolate the attacker in Mission 05',
    icon: '⊕',
    condition: (state, ctx) => ctx?.missionId === 'mission-05' && ctx?.isolated,
  },
];

class AchievementEngine {
  constructor(store) {
    this.store = store;
    this.definitions = ACHIEVEMENT_DEFINITIONS;
  }

  /**
   * Check all achievements against current state
   * @param {object} context - Additional context from the event
   * @returns {object[]} Newly unlocked achievements
   */
  checkAll(context = {}) {
    const state = this.store.getState();
    const unlocked = state.achievements.map(a => a.id);
    const newlyUnlocked = [];

    for (const def of this.definitions) {
      if (unlocked.includes(def.id)) continue;

      try {
        if (def.condition(state, context)) {
          const achievement = {
            id: def.id,
            title: def.title,
            description: def.description,
            icon: def.icon,
          };
          state.unlockAchievement(achievement);
          newlyUnlocked.push(achievement);
          eventEngine.emit(GameEvents.ACHIEVEMENT_UNLOCKED, achievement);
        }
      } catch (e) {
        // Silently skip failed checks
      }
    }

    return newlyUnlocked;
  }

  /**
   * Get all achievement definitions with unlock status
   * @returns {object[]}
   */
  getAll() {
    const unlocked = this.store.getState().achievements.map(a => a.id);
    return this.definitions.map(def => ({
      ...def,
      unlocked: unlocked.includes(def.id),
      unlockedAt: this.store.getState().achievements.find(a => a.id === def.id)?.unlockedAt,
    }));
  }

  /**
   * Get unlocked count
   * @returns {{ unlocked: number, total: number }}
   */
  getProgress() {
    const unlocked = this.store.getState().achievements.length;
    return { unlocked, total: this.definitions.length };
  }
}

export { ACHIEVEMENT_DEFINITIONS };
export default AchievementEngine;
