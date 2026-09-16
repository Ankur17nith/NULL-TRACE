// ============================================================
// NULL//TRACE — Score Engine
// Score calculation, rank determination, difficulty multipliers
// ============================================================

import { GameEvents, eventEngine } from './EventEngine';

// Rank thresholds (cumulative score across all missions)
const RANKS = [
  { id: 'ROOKIE', label: 'ROOKIE', minScore: 0, icon: '◇' },
  { id: 'ANALYST', label: 'ANALYST', minScore: 1500, icon: '◆' },
  { id: 'OPERATOR', label: 'OPERATOR', minScore: 3500, icon: '▣' },
  { id: 'SPECIALIST', label: 'SPECIALIST', minScore: 6000, icon: '★' },
  { id: 'ELITE', label: 'ELITE', minScore: 8500, icon: '✦' },
  { id: 'NULL_TRACE', label: 'NULL//TRACE', minScore: 11000, icon: '◉' },
];

const DIFFICULTY_MULTIPLIERS = {
  EASY: 0.75,
  NORMAL: 1.0,
  HARD: 1.5,
};

const SCORING = {
  PUZZLE_BASE: 500,
  CLUE_FOUND: 50,
  OBJECTIVE_COMPLETE: 200,
  MISSION_COMPLETE: 300,

  // Bonuses
  TIME_BONUS_MAX: 400,
  ACCURACY_BONUS_MAX: 300,
  NO_HINTS_BONUS: 200,
  PERFECT_BONUS: 500,

  // Penalties
  HINT_PENALTY: 50,
  MISTAKE_PENALTY: 25,
};

class ScoreEngine {
  constructor() {
    this.currentScore = 0;
    this.missionScores = {};
    this.breakdown = this.createBreakdown();
  }

  createBreakdown() {
    return {
      puzzleBase: 0,
      cluesFound: 0,
      objectivesCompleted: 0,
      missionComplete: 0,
      timeBonus: 0,
      accuracyBonus: 0,
      noHintsBonus: 0,
      perfectBonus: 0,
      hintPenalty: 0,
      mistakePenalty: 0,
      difficultyMultiplier: 1,
      total: 0,
    };
  }

  resetMissionScore() {
    this.breakdown = this.createBreakdown();
  }

  addPuzzleScore() {
    this.breakdown.puzzleBase += SCORING.PUZZLE_BASE;
    this.recalculate();
  }

  addClueScore() {
    this.breakdown.cluesFound += SCORING.CLUE_FOUND;
    this.recalculate();
  }

  addObjectiveScore() {
    this.breakdown.objectivesCompleted += SCORING.OBJECTIVE_COMPLETE;
    this.recalculate();
  }

  addMissionCompleteScore() {
    this.breakdown.missionComplete += SCORING.MISSION_COMPLETE;
    this.recalculate();
  }

  addHintPenalty() {
    this.breakdown.hintPenalty += SCORING.HINT_PENALTY;
    this.recalculate();
  }

  addMistakePenalty() {
    this.breakdown.mistakePenalty += SCORING.MISTAKE_PENALTY;
    this.recalculate();
  }

  /**
   * Calculate time bonus based on remaining time
   * @param {number} timeRemaining - seconds remaining
   * @param {number} totalTime - total seconds allocated
   */
  calculateTimeBonus(timeRemaining, totalTime) {
    if (totalTime <= 0) return;
    const ratio = Math.max(0, timeRemaining / totalTime);
    this.breakdown.timeBonus = Math.round(SCORING.TIME_BONUS_MAX * ratio);
    this.recalculate();
  }

  /**
   * Calculate accuracy bonus
   * @param {number} correct - number of correct answers
   * @param {number} total - total attempts
   */
  calculateAccuracyBonus(correct, total) {
    if (total <= 0) return;
    const accuracy = correct / total;
    this.breakdown.accuracyBonus = Math.round(SCORING.ACCURACY_BONUS_MAX * accuracy);
    if (accuracy === 1) {
      this.breakdown.perfectBonus = SCORING.PERFECT_BONUS;
    }
    this.recalculate();
  }

  checkNoHintsBonus(hintsUsed) {
    if (hintsUsed === 0) {
      this.breakdown.noHintsBonus = SCORING.NO_HINTS_BONUS;
    } else {
      this.breakdown.noHintsBonus = 0;
    }
    this.recalculate();
  }

  setDifficulty(difficulty) {
    this.breakdown.difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1;
    this.recalculate();
  }

  recalculate() {
    const raw =
      this.breakdown.puzzleBase +
      this.breakdown.cluesFound +
      this.breakdown.objectivesCompleted +
      this.breakdown.missionComplete +
      this.breakdown.timeBonus +
      this.breakdown.accuracyBonus +
      this.breakdown.noHintsBonus +
      this.breakdown.perfectBonus -
      this.breakdown.hintPenalty -
      this.breakdown.mistakePenalty;

    this.breakdown.total = Math.max(0, Math.round(raw * this.breakdown.difficultyMultiplier));
    this.currentScore = this.breakdown.total;

    eventEngine.emit(GameEvents.SCORE_CHANGED, {
      score: this.currentScore,
      breakdown: { ...this.breakdown },
    });
  }

  finalizeMission(missionId) {
    this.missionScores[missionId] = {
      score: this.breakdown.total,
      breakdown: { ...this.breakdown },
      timestamp: Date.now(),
    };
    return this.getBreakdown();
  }

  getBreakdown() {
    return { ...this.breakdown };
  }

  getTotalScore() {
    return Object.values(this.missionScores).reduce((sum, m) => sum + m.score, 0);
  }

  getMissionScore(missionId) {
    return this.missionScores[missionId] || null;
  }

  getBestMissionScore(missionId) {
    return this.missionScores[missionId]?.score || 0;
  }

  getAccuracyPercent(correct, total) {
    if (total <= 0) return 100;
    return Math.round((correct / total) * 100);
  }

  static getRank(totalScore) {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (totalScore >= r.minScore) {
        rank = r;
      }
    }
    return rank;
  }

  static getRanks() {
    return [...RANKS];
  }

  static getDifficultyMultiplier(difficulty) {
    return DIFFICULTY_MULTIPLIERS[difficulty] || 1;
  }
}

export { RANKS, DIFFICULTY_MULTIPLIERS, SCORING };
export default ScoreEngine;
