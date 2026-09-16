// ============================================================
// NULL//TRACE — Game Engine
// Central controller: mission lifecycle, timer, game loop
// ============================================================

import MissionEngine from './MissionEngine';
import PuzzleEngine from './PuzzleEngine';
import ScoreEngine from './ScoreEngine';
import NetworkEngine from './NetworkEngine';
import { GameEvents, eventEngine } from './EventEngine';

class GameEngine {
  constructor(store) {
    this.store = store;
    this.missionEngine = new MissionEngine();
    this.puzzleEngine = new PuzzleEngine();
    this.scoreEngine = new ScoreEngine();
    this.networkEngine = new NetworkEngine();
    this.terminalEngine = null; // Set after initialization
    this.timerInterval = null;
    this.isRunning = false;
  }

  /**
   * Initialize the game engine
   */
  init() {
    this.store.getState().setGameInitialized(true);
  }

  /**
   * Start a mission by ID
   * @param {string} missionId
   */
  startMission(missionId) {
    const state = this.store.getState();
    const difficulty = state.settings.difficulty;

    // Reset scores for new mission
    this.scoreEngine.resetMissionScore();
    this.scoreEngine.setDifficulty(difficulty);
    state.resetPlayerMissionStats();
    state.clearInventory();

    // Load mission
    const mission = this.missionEngine.startMission(missionId);

    // Load network
    if (mission.network) {
      this.networkEngine.loadNetwork(mission.network);
    }

    // Load puzzle
    if (mission.puzzle) {
      const puzzleConfig = { ...mission.puzzle };
      if (puzzleConfig.type === 'ROUTING') {
        puzzleConfig.config.nodes = mission.network.nodes;
        puzzleConfig.config.connections = mission.network.connections;
      }
      this.puzzleEngine.loadPuzzle(puzzleConfig);
    }

    // Update store
    const timeLimit = this.missionEngine.getTimeLimit(difficulty);
    state.setMission({
      currentMissionId: missionId,
      currentMissionNumber: mission.number,
      status: 'BRIEFING',
      objectives: mission.objectives.map(o => ({ ...o })),
      timeRemaining: timeLimit,
      totalTime: timeLimit,
    });

    // Setup terminal
    if (this.terminalEngine) {
      this.terminalEngine.reset();
      this.terminalEngine.addSystemMessage(mission.briefing, 'system');
    }

    this.isRunning = false;
  }

  /**
   * Begin gameplay (after briefing)
   */
  beginGameplay() {
    const state = this.store.getState();
    state.setMissionStatus('IN_PROGRESS');
    state.setCurrentView('game');
    this.isRunning = true;
    this.startTimer();
  }

  /**
   * Start the mission timer
   */
  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      const state = this.store.getState();
      if (state.ui.isPaused) return;

      const remaining = state.mission.timeRemaining - 1;
      state.setTimeRemaining(remaining);

      if (remaining <= 60 && remaining > 0 && remaining % 30 === 0) {
        eventEngine.emit(GameEvents.TIMER_WARNING, { remaining });
      }

      if (remaining <= 0) {
        this.failMission('TIME_EXPIRED');
      }
    }, 1000);
  }

  /**
   * Stop the timer
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Pause/unpause
   */
  togglePause() {
    const state = this.store.getState();
    state.setPaused(!state.ui.isPaused);
  }

  /**
   * Complete an objective
   * @param {string} objectiveId
   */
  completeObjective(objectiveId) {
    const result = this.missionEngine.completeObjective(objectiveId);
    if (result.success && !result.duplicate) {
      this.store.getState().completeObjective(objectiveId);
      this.scoreEngine.addObjectiveScore();

      if (result.allComplete) {
        this.completeMission();
      }
    }
    return result;
  }

  /**
   * Handle puzzle solved
   */
  handlePuzzleSolved(result) {
    this.scoreEngine.addPuzzleScore();
    this.puzzleEngine.completePuzzle(result);

    // Show educational content
    const puzzle = this.puzzleEngine.getCurrentPuzzle();
    if (puzzle?.getExplanation) {
      const explanation = puzzle.getExplanation();
      if (explanation) {
        this.store.getState().setShowEducational(explanation);
      }
    }
  }

  /**
   * Handle hint used
   */
  handleHintUsed() {
    this.store.getState().incrementHints();
    this.scoreEngine.addHintPenalty();
  }

  /**
   * Handle mistake
   */
  handleMistake() {
    this.store.getState().incrementMistakes();
    this.scoreEngine.addMistakePenalty();
  }

  /**
   * Discover a clue
   * @param {string} clueId
   */
  discoverClue(clueId) {
    const clue = this.missionEngine.discoverClue(clueId);
    if (clue && !clue.duplicate) {
      this.store.getState().addClue(clue);
      this.store.getState().incrementCluesFound();
      this.scoreEngine.addClueScore();
    }
    return clue;
  }

  /**
   * Complete the current mission
   */
  completeMission() {
    this.stopTimer();
    this.isRunning = false;

    const state = this.store.getState();
    const mission = this.missionEngine.getCurrentMission();
    if (!mission) return;

    // Calculate final scores
    const timeRemaining = state.mission.timeRemaining;
    const totalTime = state.mission.totalTime;
    this.scoreEngine.calculateTimeBonus(timeRemaining, totalTime);

    const correct = mission.objectives.filter(o => o.completed).length;
    const total = mission.objectives.length;
    this.scoreEngine.calculateAccuracyBonus(
      correct - state.player.mistakes,
      Math.max(correct, 1)
    );
    this.scoreEngine.checkNoHintsBonus(state.player.hintsUsed);
    this.scoreEngine.addMissionCompleteScore();

    const breakdown = this.scoreEngine.finalizeMission(mission.id);
    const totalScore = this.scoreEngine.getTotalScore();
    const rank = ScoreEngine.getRank(totalScore);

    // Update store
    state.setScore(breakdown.total);
    state.setTotalScore(totalScore);
    state.setRank(rank.id);
    state.completeMission(mission.id, breakdown.total);
    state.setMissionStatus('COMPLETED');
    state.setShowResults(true);

    // Complete in mission engine
    this.missionEngine.completeMission();

    return {
      breakdown,
      totalScore,
      rank,
      mission: {
        id: mission.id,
        title: mission.title,
        number: mission.number,
      },
    };
  }

  /**
   * Fail the current mission
   * @param {string} reason
   */
  failMission(reason = 'TIME_EXPIRED') {
    this.stopTimer();
    this.isRunning = false;

    const state = this.store.getState();
    state.setMissionStatus('FAILED');

    this.missionEngine.failMission(reason);

    eventEngine.emit(GameEvents.MISSION_FAILED, { reason });
  }

  /**
   * Get engine context for terminal/commands
   * @returns {object}
   */
  getContext() {
    return {
      gameStore: this.store,
      missionEngine: this.missionEngine,
      networkEngine: this.networkEngine,
      puzzleEngine: this.puzzleEngine,
      scoreEngine: this.scoreEngine,
    };
  }

  /**
   * Set terminal engine reference
   * @param {TerminalEngine} terminal
   */
  setTerminalEngine(terminal) {
    this.terminalEngine = terminal;
  }

  /**
   * Clean up
   */
  destroy() {
    this.stopTimer();
    this.isRunning = false;
    eventEngine.clear();
  }
}

export default GameEngine;
