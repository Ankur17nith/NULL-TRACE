// ============================================================
// NULL//TRACE — Puzzle: Investigation Puzzle
// Multi-clue deduction — the final mission puzzle
// ============================================================

class InvestigationPuzzle {
  constructor(config) {
    this.id = config.id || 'investigation-puzzle';
    this.clues = config.clues || [];                // Array of clue objects
    this.discoveredClues = new Set();
    this.conclusions = config.conclusions || [];     // Array of required conclusions
    this.submittedConclusions = {};
    this.timeline = config.timeline || [];           // Timeline events
    this.suspects = config.suspects || [];           // Suspect nodes/IPs
    this.correctSuspect = config.correctSuspect;     // The answer
    this.correctMethod = config.correctMethod;       // How attacker entered
    this.correctRoute = config.correctRoute;         // Route used
    this.correctTarget = config.correctTarget;       // Current target
    this.isolation = config.isolation || null;        // Node to isolate
    this.hints = config.hints || [];
    this.hintsUsed = 0;
    this.mistakes = 0;
    this.solved = false;
    this.isolated = false;
    this.difficulty = config.difficulty || 'NORMAL';
    this.explanation = config.explanation || null;
    this.phases = ['INVESTIGATE', 'IDENTIFY', 'ISOLATE'];
    this.currentPhase = 0;
  }

  /**
   * Discover a clue
   * @param {string} clueId
   * @returns {object}
   */
  discoverClue(clueId) {
    const clue = this.clues.find(c => c.id === clueId);
    if (!clue) return { success: false, message: 'Unknown clue' };
    if (this.discoveredClues.has(clueId)) {
      return { success: true, message: 'Clue already discovered', clue, duplicate: true };
    }

    this.discoveredClues.add(clueId);
    return {
      success: true,
      message: `CLUE DISCOVERED: ${clue.title}`,
      clue,
      totalDiscovered: this.discoveredClues.size,
      totalClues: this.clues.length,
    };
  }

  /**
   * Submit a conclusion for one of the investigation questions
   * @param {string} questionId - e.g., 'compromised_machine', 'entry_method', 'route_used', 'current_target'
   * @param {string} answer
   * @returns {object}
   */
  submitConclusion(questionId, answer) {
    const conclusion = this.conclusions.find(c => c.id === questionId);
    if (!conclusion) return { success: false, message: 'Unknown question' };

    const isCorrect = conclusion.acceptedAnswers.some(
      a => a.toLowerCase().trim() === answer.toLowerCase().trim()
    );

    this.submittedConclusions[questionId] = { answer, correct: isCorrect };

    if (!isCorrect) {
      this.mistakes++;
      return {
        success: true,
        correct: false,
        message: 'ANALYSIS INCORRECT — Review the evidence',
        questionId,
      };
    }

    // Check if all conclusions are submitted and correct
    const allCorrect = this.conclusions.every(
      c => this.submittedConclusions[c.id]?.correct
    );

    if (allCorrect && this.currentPhase === 1) {
      this.currentPhase = 2; // Move to ISOLATE phase
    }

    return {
      success: true,
      correct: true,
      message: 'ANALYSIS CONFIRMED',
      questionId,
      allIdentified: allCorrect,
      phase: this.phases[this.currentPhase],
    };
  }

  /**
   * Advance to IDENTIFY phase
   */
  advanceToIdentify() {
    if (this.discoveredClues.size >= Math.ceil(this.clues.length * 0.6)) {
      this.currentPhase = 1;
      return { success: true, phase: 'IDENTIFY' };
    }
    return {
      success: false,
      message: 'Not enough evidence collected. Continue investigating.',
      discovered: this.discoveredClues.size,
      required: Math.ceil(this.clues.length * 0.6),
    };
  }

  /**
   * Isolate the compromised node
   * @param {string} nodeId
   * @returns {object}
   */
  isolateNode(nodeId) {
    if (this.currentPhase !== 2) {
      return { success: false, message: 'Must identify the attacker first' };
    }

    if (nodeId === this.isolation) {
      this.isolated = true;
      this.solved = true;
      return {
        success: true,
        message: 'CONNECTION TERMINATED — CORE SYSTEM RESTORED',
        solved: true,
      };
    }

    this.mistakes++;
    return {
      success: false,
      message: 'ISOLATION FAILED — Wrong node targeted',
    };
  }

  getTimeline() {
    return [...this.timeline];
  }

  getSuspects() {
    return [...this.suspects];
  }

  getDiscoveredClues() {
    return this.clues.filter(c => this.discoveredClues.has(c.id));
  }

  getUndiscoveredCount() {
    return this.clues.length - this.discoveredClues.size;
  }

  getCurrentPhase() {
    return this.phases[this.currentPhase];
  }

  getHint() {
    if (this.hintsUsed >= this.hints.length) {
      return { hint: 'No more hints available.', index: -1 };
    }
    const hint = this.hints[this.hintsUsed];
    this.hintsUsed++;
    return { hint, index: this.hintsUsed };
  }

  getState() {
    return {
      id: this.id,
      type: 'INVESTIGATION',
      solved: this.solved,
      isolated: this.isolated,
      mistakes: this.mistakes,
      hintsUsed: this.hintsUsed,
      hintsAvailable: this.hints.length - this.hintsUsed,
      phase: this.phases[this.currentPhase],
      phaseIndex: this.currentPhase,
      cluesDiscovered: this.discoveredClues.size,
      totalClues: this.clues.length,
      conclusionsSubmitted: Object.keys(this.submittedConclusions).length,
      totalConclusions: this.conclusions.length,
    };
  }

  getExplanation() {
    return this.explanation;
  }

  reset() {
    this.discoveredClues.clear();
    this.submittedConclusions = {};
    this.hintsUsed = 0;
    this.mistakes = 0;
    this.solved = false;
    this.isolated = false;
    this.currentPhase = 0;
  }
}

export default InvestigationPuzzle;
