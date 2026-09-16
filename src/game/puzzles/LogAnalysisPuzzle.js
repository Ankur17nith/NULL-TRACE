// ============================================================
// NULL//TRACE — Puzzle: Log Analysis Puzzle
// Log pattern recognition and suspicious event detection
// ============================================================

class LogAnalysisPuzzle {
  constructor(config = {}) {
    this.id = config.id || 'log-puzzle';
    this.logs = config.logs || [];              // Array of log entries
    this.suspiciousEntries = config.suspiciousEntries || []; // Indices of suspicious logs
    this.questions = (config.questions && config.questions.length > 0) ? config.questions : [
      {
        id: 'q1',
        prompt: 'What attack vector was used against the database interface?',
        options: ['SQL Injection', 'Cross-Site Scripting (XSS)', 'Buffer Overflow', 'DNS Tunneling'],
        correctIndex: 0,
        correctAnswer: 'SQL Injection'
      },
      {
        id: 'q2',
        prompt: 'Which malicious payload was submitted in the user search parameter?',
        options: ["' OR 1=1 --", "<script>alert(1)</script>", "admin; cat /etc/passwd", "%00%00%00"],
        correctIndex: 0,
        correctAnswer: "' OR 1=1 --"
      },
      {
        id: 'q3',
        prompt: 'What is the primary mitigation to prevent this class of vulnerability?',
        options: ['Parameterized queries', 'Client-side input validation', 'Obfuscating database table names', 'Increasing password length'],
        correctIndex: 0,
        correctAnswer: 'Parameterized queries'
      }
    ];
    this.currentQuestion = 0;
    this.answers = {};
    this.hints = config.hints || [];
    this.hintsUsed = 0;
    this.attempts = 0;
    this.mistakes = 0;
    this.solved = false;
    this.difficulty = config.difficulty || 'NORMAL';
    this.explanation = config.explanation || null;
    this.type = 'LOG_ANALYSIS';
  }

  /**
   * Get all log entries
   * @param {string} [filter] - Optional category filter
   * @returns {object[]}
   */
  getLogs(filter = null) {
    if (!filter || filter === 'ALL') return [...this.logs];
    return this.logs.filter(l => l.category === filter);
  }

  /**
   * Get available log categories
   * @returns {string[]}
   */
  getCategories() {
    const cats = new Set(this.logs.map(l => l.category));
    return ['ALL', ...cats];
  }

  /**
   * Flag a log entry as suspicious
   * @param {number} logIndex
   * @returns {object}
   */
  flagEntry(logIndex) {
    if (logIndex < 0 || logIndex >= this.logs.length) {
      return { success: false, message: 'Invalid log entry' };
    }

    const isSuspicious = this.suspiciousEntries.includes(logIndex);
    this.logs[logIndex].flagged = true;

    if (isSuspicious) {
      return {
        success: true,
        correct: true,
        message: 'SUSPICIOUS ACTIVITY CONFIRMED',
        logIndex,
      };
    }

    this.mistakes++;
    return {
      success: true,
      correct: false,
      message: 'Entry appears normal — false positive',
      logIndex,
    };
  }

  /**
   * Answer a question about the logs
   * @param {number} questionIndex
   * @param {string} answer
   * @returns {object}
   */
  answerQuestion(questionIndex, answer) {
    if (questionIndex < 0 || questionIndex >= this.questions.length) {
      return { success: false, message: 'Invalid question' };
    }

    const q = this.questions[questionIndex];
    const targetAnswer = q.answer || q.correctAnswer || '';
    const cleanAnswer = (answer || '').toLowerCase().trim();
    const isCorrect = Boolean(
      (targetAnswer && cleanAnswer === targetAnswer.toLowerCase().trim()) ||
      (q.acceptedAnswers && q.acceptedAnswers.some(
        a => (a || '').toLowerCase().trim() === cleanAnswer
      ))
    );

    this.answers[questionIndex] = { answer, correct: isCorrect };

    if (!isCorrect) {
      this.mistakes++;
    }

    // Check if all questions answered correctly
    const allCorrect = this.questions.every(
      (_, i) => this.answers[i]?.correct
    );

    if (allCorrect) {
      this.solved = true;
    }

    return {
      success: isCorrect,
      correct: isCorrect,
      message: this.solved
        ? 'ALL QUESTIONS SOLVED — Database breach vector confirmed'
        : (isCorrect ? 'CORRECT — Analysis confirmed' : 'INCORRECT — Review the evidence'),
      questionIndex,
      allComplete: Object.keys(this.answers).length === this.questions.length,
      solved: this.solved,
    };
  }

  getCurrentQuestion() {
    if (this.currentQuestion >= this.questions.length) return null;
    return {
      index: this.currentQuestion,
      ...this.questions[this.currentQuestion],
    };
  }

  advanceQuestion() {
    if (this.currentQuestion < this.questions.length - 1) {
      this.currentQuestion++;
      return this.getCurrentQuestion();
    }
    return null;
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
      type: 'LOG_ANALYSIS',
      solved: this.solved,
      mistakes: this.mistakes,
      hintsUsed: this.hintsUsed,
      hintsAvailable: this.hints.length - this.hintsUsed,
      questionsTotal: this.questions.length,
      questionsAnswered: Object.keys(this.answers).length,
      correctAnswers: Object.values(this.answers).filter(a => a.correct).length,
      logCount: this.logs.length,
      flaggedCount: this.logs.filter(l => l.flagged).length,
    };
  }

  getExplanation() {
    return this.explanation;
  }

  reset() {
    this.currentQuestion = 0;
    this.answers = {};
    this.hintsUsed = 0;
    this.attempts = 0;
    this.mistakes = 0;
    this.solved = false;
    this.logs.forEach(l => { l.flagged = false; });
  }
}

export default LogAnalysisPuzzle;
