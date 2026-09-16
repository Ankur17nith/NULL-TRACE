// ============================================================
// NULL//TRACE — Puzzle Engine
// Puzzle lifecycle manager
// ============================================================

import AuthenticationPuzzle from '../puzzles/AuthenticationPuzzle';
import BinaryPuzzle from '../puzzles/BinaryPuzzle';
import RoutingPuzzle from '../puzzles/RoutingPuzzle';
import LogAnalysisPuzzle from '../puzzles/LogAnalysisPuzzle';
import InvestigationPuzzle from '../puzzles/InvestigationPuzzle';
import { GameEvents, eventEngine } from './EventEngine';

const PUZZLE_TYPES = {
  AUTHENTICATION: AuthenticationPuzzle,
  BINARY: BinaryPuzzle,
  ROUTING: RoutingPuzzle,
  LOG_ANALYSIS: LogAnalysisPuzzle,
  INVESTIGATION: InvestigationPuzzle,
};

class PuzzleEngine {
  constructor() {
    this.currentPuzzle = null;
    this.completedPuzzles = new Map();
  }

  /**
   * Create and load a puzzle from mission config
   * @param {object} puzzleConfig - { type, config }
   * @returns {object} The created puzzle instance
   */
  loadPuzzle(puzzleConfig) {
    const PuzzleClass = PUZZLE_TYPES[puzzleConfig.type];
    if (!PuzzleClass) {
      throw new Error(`Unknown puzzle type: ${puzzleConfig.type}`);
    }

    // Merge node/connection data if it's a routing puzzle
    const config = { ...puzzleConfig.config };
    if (puzzleConfig.type === 'ROUTING' && puzzleConfig.networkOverride) {
      config.nodes = puzzleConfig.networkOverride.nodes;
      config.connections = puzzleConfig.networkOverride.connections;
    }

    this.currentPuzzle = new PuzzleClass(config);
    eventEngine.emit(GameEvents.PUZZLE_STARTED, {
      puzzleId: config.id,
      type: puzzleConfig.type,
    });

    return this.currentPuzzle;
  }

  /**
   * Get the current active puzzle
   * @returns {object|null}
   */
  getCurrentPuzzle() {
    return this.currentPuzzle;
  }

  /**
   * Mark current puzzle as complete
   * @param {object} result
   */
  completePuzzle(result) {
    if (!this.currentPuzzle) return;

    this.completedPuzzles.set(this.currentPuzzle.id, {
      type: this.currentPuzzle.constructor.name,
      result,
      timestamp: Date.now(),
    });

    eventEngine.emit(GameEvents.PUZZLE_SOLVED, {
      puzzleId: this.currentPuzzle.id,
      ...result,
    });
  }

  /**
   * Record a hint usage
   */
  useHint() {
    if (!this.currentPuzzle) return null;
    const hintResult = this.currentPuzzle.getHint();
    if (hintResult.index > 0) {
      eventEngine.emit(GameEvents.HINT_USED, {
        puzzleId: this.currentPuzzle.id,
        hintIndex: hintResult.index,
      });
    }
    return hintResult;
  }

  /**
   * Record a mistake
   */
  recordMistake() {
    eventEngine.emit(GameEvents.MISTAKE_MADE, {
      puzzleId: this.currentPuzzle?.id,
    });
  }

  /**
   * Get puzzle state
   * @returns {object|null}
   */
  getState() {
    if (!this.currentPuzzle) return null;
    return this.currentPuzzle.getState();
  }

  /**
   * Get completed puzzle count
   * @returns {number}
   */
  getCompletedCount() {
    return this.completedPuzzles.size;
  }

  /**
   * Reset the engine
   */
  reset() {
    this.currentPuzzle = null;
    this.completedPuzzles.clear();
  }
}

export default PuzzleEngine;
