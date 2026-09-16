// ============================================================
// NULL//TRACE — Command Registry
// All terminal commands and their handlers
// ============================================================

class CommandRegistry {
  constructor(gameContext) {
    this.ctx = gameContext; // { gameStore, missionEngine, networkEngine, puzzleEngine, scoreEngine }
    this.commands = this.buildCommands();
  }

  buildCommands() {
    return {
      help: {
        description: 'Display available commands',
        usage: 'help',
        handler: () => this.cmdHelp(),
      },
      scan: {
        description: 'Scan the network for active nodes',
        usage: 'scan',
        handler: () => this.cmdScan(),
      },
      inspect: {
        description: 'Inspect a specific node',
        usage: 'inspect <node-id>',
        handler: (args) => this.cmdInspect(args),
      },
      status: {
        description: 'Display current mission status',
        usage: 'status',
        handler: () => this.cmdStatus(),
      },
      logs: {
        description: 'View system logs',
        usage: 'logs [category]',
        handler: (args) => this.cmdLogs(args),
      },
      trace: {
        description: 'Trace connections from a node',
        usage: 'trace <node-id>',
        handler: (args) => this.cmdTrace(args),
      },
      connect: {
        description: 'Connect to a node',
        usage: 'connect <node-id>',
        handler: (args) => this.cmdConnect(args),
      },
      decode: {
        description: 'Decode a value (binary/hex)',
        usage: 'decode <value>',
        handler: (args) => this.cmdDecode(args),
      },
      route: {
        description: 'Display or configure packet route',
        usage: 'route [add <node>|clear|submit]',
        handler: (args) => this.cmdRoute(args),
      },
      clear: {
        description: 'Clear terminal output',
        usage: 'clear',
        handler: () => ({ type: 'CLEAR' }),
      },
      hint: {
        description: 'Request a hint (costs points)',
        usage: 'hint',
        handler: () => this.cmdHint(),
      },
      objectives: {
        description: 'Show current objectives',
        usage: 'objectives',
        handler: () => this.cmdObjectives(),
      },
      clues: {
        description: 'Review discovered clues',
        usage: 'clues',
        handler: () => this.cmdClues(),
      },
      isolate: {
        description: 'Isolate a compromised node',
        usage: 'isolate <node-id>',
        handler: (args) => this.cmdIsolate(args),
      },
    };
  }

  getCommandNames() {
    return Object.keys(this.commands);
  }

  getCommand(name) {
    return this.commands[name] || null;
  }

  execute(command, args) {
    const cmd = this.commands[command];
    if (!cmd) {
      return {
        type: 'ERROR',
        lines: [
          `Unknown command: ${command}`,
          'Type "help" for available commands.',
        ],
      };
    }
    try {
      return cmd.handler(args);
    } catch (err) {
      return {
        type: 'ERROR',
        lines: ['Command execution error.', 'Please try again.'],
      };
    }
  }

  // ── Command Implementations ────────────────────────────────

  cmdHelp() {
    const lines = [
      'POLYNET TERMINAL — AVAILABLE COMMANDS',
      '─'.repeat(44),
    ];
    for (const [name, cmd] of Object.entries(this.commands)) {
      lines.push(`  ${name.padEnd(14)} ${cmd.description}`);
    }
    lines.push('', 'Use "help" for this list.');
    return { type: 'OUTPUT', lines };
  }

  cmdScan() {
    const network = this.ctx.networkEngine;
    if (!network) return { type: 'ERROR', lines: ['Network not available.'] };

    const nodes = network.getNodes();
    const lines = [
      'SCANNING POLYNET...',
      '',
    ];
    nodes.forEach(n => {
      const statusColor = n.status === 'COMPROMISED' ? '!!' :
                           n.status === 'SUSPICIOUS' ? '??' :
                           n.status === 'LOCKED' ? '##' :
                           n.status === 'OFFLINE' ? '--' : '  ';
      lines.push(`${statusColor} ${n.id.padEnd(18)} ${n.status.padEnd(14)} ${n.ip || ''}`);
    });
    lines.push('', `${nodes.length} nodes discovered.`);

    return {
      type: 'OUTPUT',
      lines,
      event: 'SCAN_COMPLETE',
    };
  }

  cmdInspect(args) {
    if (!args || args.length === 0) {
      return { type: 'ERROR', lines: ['Usage: inspect <node-id>'] };
    }

    const nodeId = args[0].toUpperCase();
    const mission = this.ctx.missionEngine?.getCurrentMission();
    const inspection = this.ctx.missionEngine?.getNodeInspection(nodeId);
    const node = this.ctx.networkEngine?.getNode(nodeId);

    if (!node && !inspection) {
      return { type: 'ERROR', lines: [`Node "${nodeId}" not found.`] };
    }

    const lines = [];
    if (inspection) {
      lines.push(`┌─ ${inspection.title} ─────────────────`);
      inspection.details.forEach(d => lines.push(`│ ${d}`));
      lines.push('└' + '─'.repeat(40));
    } else if (node) {
      lines.push(`┌─ ${node.label} ─────────────────`);
      lines.push(`│ ID: ${node.id}`);
      lines.push(`│ STATUS: ${node.status}`);
      if (node.ip) lines.push(`│ IP: ${node.ip}`);
      lines.push('└' + '─'.repeat(40));
    }

    return {
      type: 'OUTPUT',
      lines,
      event: 'NODE_INSPECTED',
      eventData: { nodeId },
    };
  }

  cmdStatus() {
    const mission = this.ctx.missionEngine?.getCurrentMission();
    if (!mission) return { type: 'OUTPUT', lines: ['No active mission.'] };

    const objectives = mission.objectives;
    const completed = objectives.filter(o => o.completed).length;

    const lines = [
      `MISSION ${String(mission.number).padStart(2, '0')} — ${mission.title}`,
      `STATUS: ${mission.status}`,
      `OBJECTIVES: ${completed}/${objectives.length}`,
      '',
    ];

    objectives.forEach(o => {
      const check = o.completed ? '✓' : '○';
      lines.push(`  ${check} ${o.text}`);
    });

    return { type: 'OUTPUT', lines };
  }

  cmdLogs(args) {
    const mission = this.ctx.missionEngine?.getCurrentMission();
    if (!mission?.logs) return { type: 'OUTPUT', lines: ['No logs available.'] };

    const filter = args?.[0]?.toUpperCase() || 'ALL';
    let logs = mission.logs;
    if (filter !== 'ALL') {
      logs = logs.filter(l => l.category === filter);
    }

    const lines = [`SYSTEM LOGS — ${filter}`, ''];
    logs.forEach(l => {
      const marker = l.suspicious ? ' !' : '  ';
      lines.push(`[${l.time}]${marker} ${l.message}`);
    });

    if (logs.length === 0) {
      lines.push('No entries found for this filter.');
    }

    lines.push('', 'Filters: ALL | AUTH | NETWORK | SYSTEM | SECURITY');

    return { type: 'OUTPUT', lines };
  }

  cmdTrace(args) {
    if (!args || args.length === 0) {
      return { type: 'ERROR', lines: ['Usage: trace <node-id>'] };
    }

    const nodeId = args[0].toUpperCase();
    const network = this.ctx.networkEngine;
    if (!network) return { type: 'ERROR', lines: ['Network not available.'] };

    const node = network.getNode(nodeId);
    if (!node) return { type: 'ERROR', lines: [`Node "${nodeId}" not found.`] };

    const adjacent = network.getAdjacentNodes(nodeId);
    const conns = network.getNodeConnections(nodeId);

    const lines = [
      `TRACING ${nodeId}...`,
      '',
      `Connected nodes:`,
    ];
    conns.forEach(c => {
      const other = c.from === nodeId ? c.to : c.from;
      const otherNode = network.getNode(other);
      const info = otherNode ? `${otherNode.status}` : '';
      const congestion = c.congested ? ' [CONGESTED]' : '';
      lines.push(`  → ${other.padEnd(18)} ${info}${congestion}`);
    });

    return { type: 'OUTPUT', lines };
  }

  cmdConnect(args) {
    if (!args || args.length === 0) {
      return { type: 'ERROR', lines: ['Usage: connect <node-id>'] };
    }

    const nodeId = args[0].toUpperCase();
    const node = this.ctx.networkEngine?.getNode(nodeId);
    if (!node) return { type: 'ERROR', lines: [`Node "${nodeId}" not found.`] };

    if (node.status === 'LOCKED') {
      return { type: 'OUTPUT', lines: [`ACCESS DENIED — ${nodeId} is locked.`, 'Security clearance required.'] };
    }
    if (node.status === 'OFFLINE') {
      return { type: 'OUTPUT', lines: [`CONNECTION FAILED — ${nodeId} is offline.`] };
    }

    return {
      type: 'OUTPUT',
      lines: [`Connected to ${nodeId} (${node.ip || 'N/A'})`, `Status: ${node.status}`],
      event: 'NODE_CONNECTED',
      eventData: { nodeId },
    };
  }

  cmdDecode(args) {
    if (!args || args.length === 0) {
      return { type: 'ERROR', lines: ['Usage: decode <binary|hex value>'] };
    }

    const value = args.join(' ');
    const lines = [`DECODING: ${value}`, ''];

    // Try binary
    if (/^[01\s]+$/.test(value)) {
      const cleaned = value.replace(/\s/g, '');
      const bytes = cleaned.match(/.{1,8}/g) || [];
      bytes.forEach(b => {
        const dec = parseInt(b, 2);
        const ascii = dec >= 32 && dec <= 126 ? String.fromCharCode(dec) : '?';
        lines.push(`  ${b} → DEC: ${dec} → ASCII: "${ascii}"`);
      });
    }
    // Try hex
    else if (/^(0x)?[0-9a-fA-F\s]+$/.test(value)) {
      const cleaned = value.replace(/^0x/i, '').replace(/\s/g, '');
      const bytes = cleaned.match(/.{1,2}/g) || [];
      bytes.forEach(b => {
        const dec = parseInt(b, 16);
        const ascii = dec >= 32 && dec <= 126 ? String.fromCharCode(dec) : '?';
        lines.push(`  0x${b} → DEC: ${dec} → ASCII: "${ascii}"`);
      });
    } else {
      lines.push('Unable to determine encoding. Provide binary (0s and 1s) or hex.');
    }

    return { type: 'OUTPUT', lines };
  }

  cmdRoute(args) {
    const puzzle = this.ctx.puzzleEngine?.getCurrentPuzzle();
    if (!puzzle || puzzle.constructor.name !== 'RoutingPuzzle') {
      return { type: 'OUTPUT', lines: ['No routing puzzle active.'] };
    }

    if (!args || args.length === 0) {
      const path = puzzle.currentPath;
      if (path.length === 0) {
        return { type: 'OUTPUT', lines: ['No route configured. Use: route add <node-id>'] };
      }
      return { type: 'OUTPUT', lines: ['Current route:', path.join(' → ')] };
    }

    const sub = args[0].toLowerCase();
    if (sub === 'add' && args[1]) {
      const result = puzzle.addNodeToRoute(args[1].toUpperCase());
      return { type: 'OUTPUT', lines: [result.message], event: result.isComplete ? 'ROUTE_COMPLETE' : null };
    }
    if (sub === 'clear') {
      puzzle.clearRoute();
      return { type: 'OUTPUT', lines: ['Route cleared.'] };
    }
    if (sub === 'submit') {
      const result = puzzle.submitRoute();
      return {
        type: 'OUTPUT',
        lines: [result.message, result.path ? `Path: ${result.path.join(' → ')}` : ''],
        event: result.success ? 'PUZZLE_SOLVED' : 'PUZZLE_FAILED',
        eventData: result,
      };
    }
    if (sub === 'undo') {
      const result = puzzle.removeLastNode();
      return { type: 'OUTPUT', lines: [result.message] };
    }

    return { type: 'ERROR', lines: ['Usage: route [add <node>|clear|submit|undo]'] };
  }

  cmdHint() {
    const puzzle = this.ctx.puzzleEngine?.getCurrentPuzzle();
    if (!puzzle) return { type: 'OUTPUT', lines: ['No active puzzle.'] };

    const result = puzzle.getHint();
    if (result.index < 0) {
      return { type: 'OUTPUT', lines: ['No more hints available.'] };
    }

    return {
      type: 'OUTPUT',
      lines: [`HINT ${result.index}:`, result.hint, '', '(-50 points)'],
      event: 'HINT_USED',
    };
  }

  cmdObjectives() {
    return this.cmdStatus();
  }

  cmdClues() {
    const clues = this.ctx.missionEngine?.getDiscoveredClues() || [];
    if (clues.length === 0) {
      return { type: 'OUTPUT', lines: ['No clues discovered yet.'] };
    }

    const lines = ['DISCOVERED CLUES', ''];
    clues.forEach((c, i) => {
      lines.push(`${i + 1}. ${c.title}`);
      lines.push(`   ${c.description}`);
      lines.push('');
    });

    return { type: 'OUTPUT', lines };
  }

  cmdIsolate(args) {
    if (!args || args.length === 0) {
      return { type: 'ERROR', lines: ['Usage: isolate <node-id>'] };
    }

    const nodeId = args[0].toUpperCase();
    const puzzle = this.ctx.puzzleEngine?.getCurrentPuzzle();

    if (puzzle && typeof puzzle.isolateNode === 'function') {
      const result = puzzle.isolateNode(nodeId);
      return {
        type: 'OUTPUT',
        lines: [result.message],
        event: result.success ? 'ATTACK_STOPPED' : 'ISOLATION_FAILED',
        eventData: result,
      };
    }

    return { type: 'OUTPUT', lines: ['Isolation not available in this mission.'] };
  }
}

export default CommandRegistry;
