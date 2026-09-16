// ============================================================
// NULL//TRACE — Mission Engine
// Mission lifecycle, objective tracking, completion
// ============================================================

import mission01 from '../missions/mission01.js';
import mission02 from '../missions/mission02.js';
import mission03 from '../missions/mission03.js';
import mission04 from '../missions/mission04.js';
import mission05 from '../missions/mission05.js';
import { GameEvents, eventEngine } from './EventEngine.js';

const ALL_MISSIONS = [mission01, mission02, mission03, mission04, mission05];

class MissionEngine {
  constructor() {
    this.missions = ALL_MISSIONS;
    this.currentMission = null;
    this.currentObjectiveIndex = 0;
  }

  /**
   * Get all mission metadata
   * @returns {object[]}
   */
  getAllMissions() {
    return this.missions.map(m => ({
      id: m.id,
      number: m.number,
      title: m.title,
      subtitle: m.subtitle,
      difficulty: m.difficulty,
      maxScore: m.maxScore,
    }));
  }

  /**
   * Get a specific mission
   * @param {string} missionId
   * @returns {object|undefined}
   */
  getMission(missionId) {
    return this.missions.find(m => m.id === missionId);
  }

  /**
   * Get mission by number
   * @param {number} num
   * @returns {object|undefined}
   */
  getMissionByNumber(num) {
    return this.missions.find(m => m.number === num);
  }

  /**
   * Load and start a mission
   * @param {string} missionId
   * @returns {object}
   */
  startMission(missionId) {
    const mission = this.getMission(missionId);
    if (!mission) throw new Error(`Mission not found: ${missionId}`);

    this.currentMission = {
      ...mission,
      objectives: mission.objectives.map(o => ({ ...o, completed: false })),
      startTime: Date.now(),
      status: 'IN_PROGRESS',
      cluesFound: new Set(),
    };
    this.currentObjectiveIndex = 0;

    eventEngine.emit(GameEvents.MISSION_STARTED, {
      missionId: mission.id,
      title: mission.title,
    });

    return this.currentMission;
  }

  /**
   * Get the current mission
   * @returns {object|null}
   */
  getCurrentMission() {
    return this.currentMission;
  }

  /**
   * Get current objective
   * @returns {object|null}
   */
  getCurrentObjective() {
    if (!this.currentMission) return null;
    return this.currentMission.objectives[this.currentObjectiveIndex] || null;
  }

  /**
   * Complete an objective by ID
   * @param {string} objectiveId
   * @returns {object}
   */
  completeObjective(objectiveId) {
    if (!this.currentMission) return { success: false };

    const obj = this.currentMission.objectives.find(o => o.id === objectiveId);
    if (!obj) return { success: false, message: 'Unknown objective' };
    if (obj.completed) return { success: true, message: 'Already completed', duplicate: true };

    obj.completed = true;

    // Advance to next uncompleted objective
    const nextIndex = this.currentMission.objectives.findIndex(o => !o.completed);
    if (nextIndex >= 0) {
      this.currentObjectiveIndex = nextIndex;
    }

    eventEngine.emit(GameEvents.OBJECTIVE_COMPLETED, {
      objectiveId,
      text: obj.text,
      remaining: this.currentMission.objectives.filter(o => !o.completed).length,
    });

    return {
      success: true,
      objectiveId,
      allComplete: this.currentMission.objectives.every(o => o.completed),
    };
  }

  /**
   * Discover a clue
   * @param {string} clueId
   * @returns {object|null}
   */
  discoverClue(clueId) {
    if (!this.currentMission) return null;
    const clue = this.currentMission.clues?.find(c => c.id === clueId);
    if (!clue) return null;
    if (this.currentMission.cluesFound.has(clueId)) {
      return { ...clue, duplicate: true };
    }

    this.currentMission.cluesFound.add(clueId);
    eventEngine.emit(GameEvents.CLUE_DISCOVERED, { clueId, clue });
    return clue;
  }

  /**
   * Get all discovered clues
   * @returns {object[]}
   */
  getDiscoveredClues() {
    if (!this.currentMission) return [];
    return (this.currentMission.clues || []).filter(
      c => this.currentMission.cluesFound.has(c.id)
    );
  }

  /**
   * Get time limit for current mission and difficulty
   * @param {string} difficulty
   * @returns {number}
   */
  getTimeLimit(difficulty = 'NORMAL') {
    if (!this.currentMission) return 300;
    return this.currentMission.timeLimit[difficulty] || this.currentMission.timeLimit.NORMAL;
  }

  /**
   * Complete the current mission
   * @returns {object}
   */
  completeMission() {
    if (!this.currentMission) return null;

    this.currentMission.status = 'COMPLETED';
    this.currentMission.endTime = Date.now();

    const result = {
      missionId: this.currentMission.id,
      title: this.currentMission.title,
      number: this.currentMission.number,
      duration: this.currentMission.endTime - this.currentMission.startTime,
      objectives: this.currentMission.objectives,
      cluesFound: this.currentMission.cluesFound.size,
      totalClues: (this.currentMission.clues || []).length,
    };

    eventEngine.emit(GameEvents.MISSION_COMPLETED, result);
    return result;
  }

  /**
   * Fail the current mission
   * @param {string} reason
   * @returns {object}
   */
  failMission(reason = 'TIME_EXPIRED') {
    if (!this.currentMission) return null;

    this.currentMission.status = 'FAILED';
    this.currentMission.endTime = Date.now();

    const result = {
      missionId: this.currentMission.id,
      title: this.currentMission.title,
      reason,
    };

    eventEngine.emit(GameEvents.MISSION_FAILED, result);
    return result;
  }

  /**
   * Get the next mission after completion
   * @returns {object|null}
   */
  getNextMission() {
    if (!this.currentMission) return null;
    const nextNum = this.currentMission.number + 1;
    return this.getMissionByNumber(nextNum) || null;
  }

  /**
   * Get node inspection data for the current mission
   * @param {string} nodeId
   * @returns {object|null}
   */
  getNodeInspection(nodeId) {
    if (!this.currentMission?.nodeInspections) return null;
    return this.currentMission.nodeInspections[nodeId] || null;
  }

  /**
   * Get mission count
   * @returns {number}
   */
  getMissionCount() {
    return this.missions.length;
  }

  /**
   * Reset engine
   */
  reset() {
    this.currentMission = null;
    this.currentObjectiveIndex = 0;
  }
}

export { ALL_MISSIONS };
export default MissionEngine;
