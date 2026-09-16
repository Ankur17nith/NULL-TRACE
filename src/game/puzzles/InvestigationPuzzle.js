// ============================================================
// NULL//TRACE — Puzzle: Investigation Puzzle
// Multi-clue deduction — the final mission puzzle
// ============================================================

class InvestigationPuzzle {
  constructor(config = {}) {
    this.id = config.id || 'investigation-puzzle';
    this.clues = config.clues || [];                // Array of clue objects
    this.discoveredClues = new Set();
    this.conclusions = (config.conclusions && config.conclusions.length > 0) ? config.conclusions : [
      {
        id: 'compromised_machine',
        question: 'Which machine was initially compromised?',
        acceptedAnswers: ['WORKSTATION-07', 'WS-07', 'workstation-07', 'ws-07'],
      },
      {
        id: 'entry_method',
        question: 'How did the attacker enter the network?',
        acceptedAnswers: ['Default credentials', 'default credentials', 'default password', 'brute force', 'weak password', 'admin123'],
      },
      {
        id: 'attack_route',
        question: 'What route did the attacker use? (Entry → Target)',
        acceptedAnswers: ['WS-07 → DB-02 → CORE', 'WS-07, DB-02, CORE', 'WORKSTATION-07 → DATABASE-02 → CORE-SRV', 'ws-07 db-02 core'],
      },
      {
        id: 'current_target',
        question: 'Which system is currently being compromised?',
        acceptedAnswers: ['CORE-SRV', 'CORE', 'core-srv', 'core server', 'Core Server'],
      },
    ];
    this.submittedConclusions = {};
    this.timeline = config.timeline || [];           // Timeline events
    this.suspects = config.suspects || [];           // Suspect nodes/IPs
    this.correctSuspect = config.correctSuspect || 'WS-07';     // The answer
    this.correctMethod = config.correctMethod || 'Default credentials';       // How attacker entered
    this.correctRoute = config.correctRoute || 'WS-07 → DB-02 → CORE';         // Route used
    this.correctTarget = config.correctTarget || 'CORE-SRV';       // Current target
    this.isolation = config.isolation || 'DB-02';        // Node to isolate
    this.hints = config.hints || [];
    this.hintsUsed = 0;
    this.attempts = 0;
    this.mistakes = 0;
    this.solved = false;
    this.isolated = false;
    this.difficulty = config.difficulty || 'NORMAL';
    this.explanation = config.explanation || null;
    this.phases = ['INVESTIGATE', 'IDENTIFY', 'ISOLATE'];
    this.currentPhase = 0;
    this.type = 'INVESTIGATION';
  }

  get phase() {
    return this.phases[this.currentPhase];
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
   * @param {string|object} questionId - e.g., 'compromised_machine', or object of findings
   * @param {string} [answer]
   * @returns {object}
   */
  submitConclusion(questionId, answer) {
    if (typeof questionId === 'object' && questionId !== null) {
      const mapping = {
        initialCompromised: 'compromised_machine',
        entryMethod: 'entry_method',
        attackRoute: 'attack_route',
        currentTarget: 'current_target',
      };
      let anyFailed = false;
      for (const [key, val] of Object.entries(questionId)) {
        const actualId = mapping[key] || key;
        const res = this.submitConclusion(actualId, val);
        if (!res.correct) {
          anyFailed = true;
        }
      }
      return {
        success: !anyFailed,
        allIdentified: this.conclusions.every(c => this.submittedConclusions[c.id]?.correct),
        phase: this.phases[this.currentPhase],
      };
    }

    const conclusion = this.conclusions.find(c => c.id === questionId);
    if (!conclusion) return { success: false, message: 'Unknown question' };

    const cleanInput = (answer || '').toLowerCase().trim();
    const isCorrect = conclusion.acceptedAnswers.some(
      a => (a || '').toLowerCase().trim() === cleanInput
    );

    this.submittedConclusions[questionId] = { answer, correct: isCorrect };

    if (!isCorrect) {
      this.mistakes++;
      return {
        success: false,
        correct: false,
        message: 'ANALYSIS INCORRECT — Review the evidence',
        questionId,
      };
    }

    // Check if all conclusions are submitted and correct
    const allCorrect = this.conclusions.every(
      c => this.submittedConclusions[c.id]?.correct
    );

    if (allCorrect) {
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
    if (this.solved || this.isolated) {
      return { success: false, message: 'Target already isolated.' };
    }

    if (this.currentPhase !== 2) {
      return { success: false, message: 'Must identify the attacker first' };
    }

    const target = (typeof this.isolation === 'string' ? this.isolation : this.isolation?.target) || 'DB-02';
    const cleanId = (nodeId || '').toUpperCase().trim();
    if (cleanId === target.toUpperCase().trim()) {
      this.isolated = true;
      this.solved = true;
      return {
        success: true,
        message: 'CONNECTION TERMINATED\nCORE SYSTEM RESTORED\nTRACE COMPLETE',
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
    this.attempts = 0;
    this.mistakes = 0;
    this.solved = false;
    this.isolated = false;
    this.currentPhase = 0;
  }
}

export default InvestigationPuzzle;
