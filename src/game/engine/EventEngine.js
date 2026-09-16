// ============================================================
// NULL//TRACE — Event Engine
// Pub/sub event bus for game events
// ============================================================

class EventEngine {
  constructor() {
    this.listeners = new Map();
    this.history = [];
    this.maxHistory = 200;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data = {}) {
    const entry = {
      event,
      data,
      timestamp: Date.now(),
    };
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[EventEngine] Error in handler for ${event}:`, err);
        }
      });
    }

    // Wildcard listeners
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(cb => {
        try {
          cb(entry);
        } catch (err) {
          console.error(`[EventEngine] Error in wildcard handler:`, err);
        }
      });
    }
  }

  getHistory(filter = null) {
    if (!filter) return [...this.history];
    return this.history.filter(e => e.event === filter);
  }

  clear() {
    this.listeners.clear();
    this.history = [];
  }
}

// Game event constants
export const GameEvents = {
  // Mission
  MISSION_STARTED: 'MISSION_STARTED',
  MISSION_COMPLETED: 'MISSION_COMPLETED',
  MISSION_FAILED: 'MISSION_FAILED',
  OBJECTIVE_COMPLETED: 'OBJECTIVE_COMPLETED',
  OBJECTIVE_UPDATED: 'OBJECTIVE_UPDATED',

  // Interaction
  NODE_INSPECTED: 'NODE_INSPECTED',
  NODE_CONNECTED: 'NODE_CONNECTED',
  PACKET_ROUTED: 'PACKET_ROUTED',
  PACKET_FAILED: 'PACKET_FAILED',
  CLUE_DISCOVERED: 'CLUE_DISCOVERED',
  TOOL_ACQUIRED: 'TOOL_ACQUIRED',

  // Puzzle
  PUZZLE_STARTED: 'PUZZLE_STARTED',
  PUZZLE_SOLVED: 'PUZZLE_SOLVED',
  PUZZLE_FAILED: 'PUZZLE_FAILED',
  HINT_USED: 'HINT_USED',
  MISTAKE_MADE: 'MISTAKE_MADE',

  // Threat
  THREAT_DETECTED: 'THREAT_DETECTED',
  THREAT_ESCALATED: 'THREAT_ESCALATED',
  NODE_COMPROMISED: 'NODE_COMPROMISED',
  ATTACK_STOPPED: 'ATTACK_STOPPED',

  // System
  SCORE_CHANGED: 'SCORE_CHANGED',
  RANK_CHANGED: 'RANK_CHANGED',
  ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
  TIMER_WARNING: 'TIMER_WARNING',
  TIMER_EXPIRED: 'TIMER_EXPIRED',
  GAME_SAVED: 'GAME_SAVED',
  GAME_LOADED: 'GAME_LOADED',

  // Terminal
  COMMAND_EXECUTED: 'COMMAND_EXECUTED',
  TERMINAL_OUTPUT: 'TERMINAL_OUTPUT',

  // Education
  CONCEPT_DISCOVERED: 'CONCEPT_DISCOVERED',
};

// Singleton instance
export const eventEngine = new EventEngine();
export default EventEngine;
