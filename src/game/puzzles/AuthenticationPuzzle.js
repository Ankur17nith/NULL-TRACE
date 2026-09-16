// ============================================================
// NULL//TRACE — Puzzle: Authentication Puzzle
// Credential investigation from clues
// ============================================================

class AuthenticationPuzzle {
  constructor(config = {}) {
    this.id = config.id || 'auth-puzzle';
    this.username = config.username || 'admin';
    this.password = config.password || 'admin123';
    this.clues = config.clues || [];
    this.hints = config.hints || [];
    this.maxAttempts = config.maxAttempts || 5;
    this.attempts = 0;
    this.mistakes = 0;
    this.hintsUsed = 0;
    this.solved = false;
    this.failed = false;
    this.difficulty = config.difficulty || 'NORMAL';
    this.explanation = config.explanation || null;
    this.type = 'AUTHENTICATION';
  }

  attempt(username, password) {
    if (this.solved || this.failed) {
      return { success: false, message: 'Puzzle already completed.' };
    }

    if (typeof username === 'object' && username !== null) {
      password = username.password;
      username = username.username;
    }

    this.attempts++;

    const userMatch = (username || '').toLowerCase().trim() === (this.username || '').toLowerCase().trim();
    const passMatch = (password || '').trim() === (this.password || '').trim();

    if (userMatch && passMatch) {
      this.solved = true;
      return {
        success: true,
        message: 'ACCESS GRANTED',
        attempts: this.attempts,
        hintsUsed: this.hintsUsed,
      };
    }

    this.mistakes++;

    if (this.attempts >= this.maxAttempts) {
      this.failed = true;
      return {
        success: false,
        message: 'ACCESS DENIED — Maximum attempts reached',
        locked: true,
        attempts: this.attempts,
        mistakes: this.mistakes,
      };
    }

    // Provide feedback
    let feedback = 'ACCESS DENIED';
    if (userMatch && !passMatch) {
      feedback = 'ACCESS DENIED — Password incorrect';
    } else if (!userMatch) {
      feedback = 'ACCESS DENIED — Unknown user';
    }

    return {
      success: false,
      message: feedback,
      attemptsRemaining: this.maxAttempts - this.attempts,
      attempts: this.attempts,
    };
  }

  getHint() {
    if (this.hintsUsed >= this.hints.length) {
      return { hint: 'No more hints available.', index: -1 };
    }
    const hint = this.hints[this.hintsUsed];
    this.hintsUsed++;
    return { hint, index: this.hintsUsed };
  }

  getClues() {
    return [...this.clues];
  }

  getState() {
    return {
      id: this.id,
      type: 'AUTHENTICATION',
      solved: this.solved,
      failed: this.failed,
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      attemptsRemaining: this.maxAttempts - this.attempts,
      hintsUsed: this.hintsUsed,
      hintsAvailable: this.hints.length - this.hintsUsed,
      clueCount: this.clues.length,
    };
  }

  getExplanation() {
    return this.explanation;
  }

  reset() {
    this.attempts = 0;
    this.hintsUsed = 0;
    this.solved = false;
    this.failed = false;
  }
}

export default AuthenticationPuzzle;
