// ============================================================
// NULL//TRACE — Command Parser
// Tokenize and validate terminal input
// ============================================================

import { sanitizeCommand } from '../../utils/validators.js';

class CommandParser {
  /**
   * Parse a command string into command + arguments
   * @param {string} input - Raw user input
   * @returns {object} { command, args, raw }
   */
  static parse(input) {
    const raw = sanitizeCommand(input);
    if (!raw) return { command: '', args: [], raw: '' };

    const parts = raw.split(/\s+/).filter(Boolean);
    const command = (parts[0] || '').toLowerCase();
    const args = parts.slice(1);

    return { command, args, raw };
  }

  /**
   * Check if a command is valid
   * @param {string} command
   * @param {string[]} validCommands
   * @returns {boolean}
   */
  static isValid(command, validCommands) {
    return validCommands.includes(command);
  }

  /**
   * Get command suggestions for partial input
   * @param {string} partial
   * @param {string[]} validCommands
   * @returns {string[]}
   */
  static getSuggestions(partial, validCommands) {
    if (!partial) return [];
    const lower = partial.toLowerCase();
    return validCommands.filter(c => c.startsWith(lower));
  }
}

export default CommandParser;
