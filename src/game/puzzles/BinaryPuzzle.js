// ============================================================
// NULL//TRACE — Puzzle: Binary Puzzle
// Binary/hex/ASCII encoding/decoding with real conversion
// ============================================================

import {
  binaryToDecimal,
  binaryToAscii,
  hexToAscii,
  binaryArrayToAscii,
  isValidBinary,
  isValidHex,
} from '../../utils/converters.js';

class BinaryPuzzle {
  constructor(config = {}) {
    this.id = config.id || 'binary-puzzle';
    this.encodedValues = config.encodedValues || ['01000001', '01000011', '01000011', '01000101', '01010011', '01010011'];
    this.encoding = config.encoding || 'binary';      // 'binary' | 'hex'
    this.expectedAnswer = config.expectedAnswer || 'ACCESS';       // The decoded answer
    this.hints = config.hints || [];
    this.hintsUsed = 0;
    this.attempts = 0;
    this.mistakes = 0;
    this.solved = false;
    this.difficulty = config.difficulty || 'NORMAL';
    this.explanation = config.explanation || null;
    this.tools = config.tools || ['bin-to-dec', 'bin-to-ascii', 'hex-to-ascii', 'dec-to-bin'];
    this.type = 'BINARY';
    this.answer = this.expectedAnswer;
  }

  /**
   * Decode the encoded values based on the encoding type
   * @returns {string} The decoded string
   */
  decode() {
    if (this.encoding === 'binary') {
      return binaryArrayToAscii(this.encodedValues);
    }
    if (this.encoding === 'hex') {
      return this.encodedValues.map(h => hexToAscii(h)).join('');
    }
    return '';
  }

  /**
   * Attempt to solve the puzzle with decoded text
   * @param {string} answer - The player's decoded answer
   * @returns {object} { success, message, attempts, hintsUsed }
   */
  attempt(answer) {
    if (this.solved) {
      return { success: false, message: 'Puzzle already completed.' };
    }

    this.attempts++;
    const cleaned = (answer || '').trim();

    if (cleaned.toLowerCase() === this.expectedAnswer.toLowerCase()) {
      this.solved = true;
      return {
        success: true,
        message: 'SECURITY KEY ACCEPTED',
        decoded: this.expectedAnswer,
        attempts: this.attempts,
        hintsUsed: this.hintsUsed,
      };
    }

    this.mistakes++;
    return {
      success: false,
      message: 'INVALID KEY — Decoding error detected',
      attempts: this.attempts,
      mistakes: this.mistakes,
    };
  }

  /**
   * Convert a single value using a specific tool
   * @param {string} value - The value to convert
   * @param {string} tool - The conversion tool to use
   * @returns {object}
   */
  useTool(value, tool) {
    switch (tool) {
      case 'bin-to-dec': {
        if (!isValidBinary(value)) return { error: 'Invalid binary input' };
        return { result: String(binaryToDecimal(value)), from: 'Binary', to: 'Decimal' };
      }
      case 'bin-to-ascii': {
        if (!isValidBinary(value)) return { error: 'Invalid binary input' };
        const char = binaryToAscii(value);
        if (!char) return { error: 'Value out of ASCII range' };
        return { result: char, from: 'Binary', to: 'ASCII' };
      }
      case 'hex-to-ascii': {
        if (!isValidHex(value)) return { error: 'Invalid hex input' };
        const ascii = hexToAscii(value);
        if (!ascii) return { error: 'Invalid hex sequence' };
        return { result: ascii, from: 'Hex', to: 'ASCII' };
      }
      case 'dec-to-bin': {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0) return { error: 'Invalid decimal input' };
        return { result: num.toString(2).padStart(8, '0'), from: 'Decimal', to: 'Binary' };
      }
      default:
        return { error: 'Unknown tool' };
    }
  }

  getHint() {
    if (this.hintsUsed >= this.hints.length) {
      return { hint: 'No more hints available.', index: -1 };
    }
    const hint = this.hints[this.hintsUsed];
    this.hintsUsed++;
    return { hint, index: this.hintsUsed };
  }

  getEncodedValues() {
    return [...this.encodedValues];
  }

  getAvailableTools() {
    return [...this.tools];
  }

  getState() {
    return {
      id: this.id,
      type: 'BINARY',
      solved: this.solved,
      attempts: this.attempts,
      hintsUsed: this.hintsUsed,
      hintsAvailable: this.hints.length - this.hintsUsed,
      encoding: this.encoding,
      valueCount: this.encodedValues.length,
      tools: this.tools,
    };
  }

  getExplanation() {
    return this.explanation;
  }

  reset() {
    this.attempts = 0;
    this.hintsUsed = 0;
    this.solved = false;
  }
}

export default BinaryPuzzle;
