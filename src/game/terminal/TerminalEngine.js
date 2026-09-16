// ============================================================
// NULL//TRACE — Terminal Engine
// Terminal state, history, command execution pipeline
// ============================================================

import CommandParser from './CommandParser';
import CommandRegistry from './CommandRegistry';
import { GameEvents, eventEngine } from '../engine/EventEngine';

class TerminalEngine {
  constructor(gameContext) {
    this.registry = new CommandRegistry(gameContext);
    this.history = [];        // Command history (for up/down arrow)
    this.output = [];         // Terminal output lines
    this.historyIndex = -1;
    this.maxOutput = 500;
    this.maxHistory = 50;
    this.prompt = '>';

    // Welcome message
    this.output.push(
      { text: 'POLYNET TERMINAL v4.2', type: 'system' },
      { text: 'Type "help" for available commands.', type: 'system' },
      { text: '', type: 'blank' },
    );
  }

  /**
   * Execute a command string
   * @param {string} input
   * @returns {object} Result with output lines
   */
  execute(input) {
    if (!input || !input.trim()) return null;

    // Add to output as user input
    this.output.push({ text: `${this.prompt} ${input}`, type: 'input' });

    // Add to history
    this.history.push(input);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.historyIndex = this.history.length;

    // Parse
    const { command, args } = CommandParser.parse(input);
    if (!command) return null;

    // Handle clear specially
    if (command === 'clear') {
      this.output = [];
      return { type: 'CLEAR' };
    }

    // Execute
    const result = this.registry.execute(command, args);

    // Add output
    if (result.lines) {
      result.lines.forEach(line => {
        this.output.push({ text: line, type: result.type === 'ERROR' ? 'error' : 'output' });
      });
    }
    this.output.push({ text: '', type: 'blank' });

    // Trim output
    if (this.output.length > this.maxOutput) {
      this.output = this.output.slice(-this.maxOutput);
    }

    // Emit event if command produced one
    if (result.event) {
      eventEngine.emit(GameEvents.COMMAND_EXECUTED, {
        command,
        args,
        event: result.event,
        data: result.eventData,
      });
    }

    return result;
  }

  /**
   * Get previous command from history
   * @returns {string}
   */
  historyUp() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.history[this.historyIndex] || '';
    }
    return this.history[0] || '';
  }

  /**
   * Get next command from history
   * @returns {string}
   */
  historyDown() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      return this.history[this.historyIndex] || '';
    }
    this.historyIndex = this.history.length;
    return '';
  }

  /**
   * Get autocomplete suggestions
   * @param {string} partial
   * @returns {string[]}
   */
  getSuggestions(partial) {
    return CommandParser.getSuggestions(partial, this.registry.getCommandNames());
  }

  /**
   * Add system message to output
   * @param {string|string[]} messages
   * @param {string} type
   */
  addSystemMessage(messages, type = 'system') {
    const msgs = Array.isArray(messages) ? messages : [messages];
    msgs.forEach(text => {
      this.output.push({ text, type });
    });
    this.output.push({ text: '', type: 'blank' });
  }

  /**
   * Get all output
   * @returns {object[]}
   */
  getOutput() {
    return [...this.output];
  }

  /**
   * Reset terminal
   */
  reset() {
    this.output = [
      { text: 'POLYNET TERMINAL v4.2', type: 'system' },
      { text: 'Type "help" for available commands.', type: 'system' },
      { text: '', type: 'blank' },
    ];
    this.history = [];
    this.historyIndex = -1;
  }
}

export default TerminalEngine;
