// ============================================================
// NULL//TRACE — Puzzle: Routing Puzzle
// Network graph pathfinding and route validation
// ============================================================

class RoutingPuzzle {
  constructor(config = {}) {
    this.id = config.id || 'routing-puzzle';
    this.nodes = config.nodes || [];           // { id, label, x, y, type }
    this.connections = config.connections || []; // { from, to, weight, congested }
    this.sourceNode = config.sourceNode || 'PLAYER';
    this.targetNode = config.targetNode || 'ANALYSIS';
    this.validPaths = config.validPaths || [['PLAYER', 'RTR-A', 'RTR-C', 'RTR-E', 'ANALYSIS']];  // Array of valid path arrays
    this.optimalPath = config.optimalPath || null;
    this.currentPath = [];
    this.hints = config.hints || [];
    this.hintsUsed = 0;
    this.attempts = 0;
    this.mistakes = 0;
    this.solved = false;
    this.difficulty = config.difficulty || 'NORMAL';
    this.maxHops = config.maxHops || 10;
    this.explanation = config.explanation || null;
    this.packets = [];
    this.type = 'ROUTING';
    this.source = this.sourceNode;
    this.destination = this.targetNode;
  }

  /**
   * Add a node to the current route
   * @param {string} nodeId
   * @returns {object}
   */
  addNodeToRoute(nodeId) {
    // First node must be source
    if (this.currentPath.length === 0 && nodeId !== this.sourceNode) {
      return { success: false, message: 'Route must start at source node' };
    }

    // Check if node exists
    if (!this.nodes.find(n => n.id === nodeId)) {
      return { success: false, message: 'Unknown node' };
    }

    // Check for duplicate
    if (this.currentPath.includes(nodeId)) {
      return { success: false, message: 'Node already in route — loop detected' };
    }

    // Check if connection exists from last node
    if (this.currentPath.length > 0) {
      const lastNode = this.currentPath[this.currentPath.length - 1];
      const conn = this.connections.find(
        c => (c.from === lastNode && c.to === nodeId) ||
             (c.to === lastNode && c.from === nodeId)
      );
      if (!conn) {
        return { success: false, message: 'No connection between nodes' };
      }
      if (conn.congested) {
        return { success: false, message: 'Connection congested — packet dropped' };
      }
    }

    // Check max hops
    if (this.currentPath.length >= this.maxHops) {
      return { success: false, message: 'Maximum hops exceeded — TTL expired' };
    }

    this.currentPath.push(nodeId);

    return {
      success: true,
      message: `Node ${nodeId} added to route`,
      path: [...this.currentPath],
      hops: this.currentPath.length - 1,
      isComplete: nodeId === this.targetNode,
    };
  }

  /**
   * Remove the last node from the route
   * @returns {object}
   */
  removeLastNode() {
    if (this.currentPath.length <= 1) {
      return { success: false, message: 'Cannot remove source node' };
    }
    const removed = this.currentPath.pop();
    return {
      success: true,
      message: `Node ${removed} removed from route`,
      path: [...this.currentPath],
    };
  }

  /**
   * Clear the current route
   */
  clearRoute() {
    this.currentPath = [];
  }

  /**
   * Submit the current route
   * @returns {object}
   */
  submitRoute() {
    if (this.solved) {
      return {
        success: false,
        message: 'Route already established.',
        attempts: this.attempts,
      };
    }

    this.attempts++;

    // Check if route reaches target
    if (this.currentPath.length === 0 || this.currentPath[this.currentPath.length - 1] !== this.targetNode) {
      this.mistakes++;
      return {
        success: false,
        message: 'ROUTE INCOMPLETE — Packet did not reach destination',
        attempts: this.attempts,
      };
    }

    // Check if route is valid
    const pathStr = this.currentPath.join('→');
    const isValid = this.validPaths.some(
      vp => vp.join('→') === pathStr
    );

    if (!isValid) {
      this.mistakes++;
      return {
        success: false,
        message: 'ROUTE INVALID — Path contains errors',
        attempts: this.attempts,
        path: [...this.currentPath],
      };
    }

    // Check if it's the optimal route
    const isOptimal = this.optimalPath && this.optimalPath.join('→') === pathStr;

    this.solved = true;
    return {
      success: true,
      message: isOptimal ? 'OPTIMAL ROUTE — Packet delivered!' : 'ROUTE VALID — Packet delivered!',
      optimal: isOptimal,
      hops: this.currentPath.length - 1,
      path: [...this.currentPath],
      attempts: this.attempts,
      hintsUsed: this.hintsUsed,
    };
  }

  /**
   * Attempt the routing puzzle with a provided path or currentPath
   * @param {string[]} [path]
   * @returns {object}
   */
  attempt(path) {
    if (this.solved) {
      return {
        success: false,
        message: 'Route already established.',
        attempts: this.attempts,
      };
    }

    if (Array.isArray(path)) {
      this.currentPath = [...path];
    }
    return this.submitRoute();
  }

  /**
   * Create a packet for animation
   * @returns {object}
   */
  createPacket() {
    const packet = {
      id: `PKT-${String(this.packets.length + 1).padStart(3, '0')}`,
      source: this.nodes.find(n => n.id === this.sourceNode)?.ip || '10.0.0.1',
      destination: this.nodes.find(n => n.id === this.targetNode)?.ip || '10.0.0.50',
      protocol: 'TCP',
      hops: this.currentPath.length - 1,
      path: [...this.currentPath],
      status: this.solved ? 'DELIVERED' : 'ROUTING',
    };
    this.packets.push(packet);
    return packet;
  }

  /**
   * Get adjacent nodes for a given node
   * @param {string} nodeId
   * @returns {string[]}
   */
  getAdjacentNodes(nodeId) {
    return this.connections
      .filter(c => c.from === nodeId || c.to === nodeId)
      .map(c => c.from === nodeId ? c.to : c.from)
      .filter(id => !this.currentPath.includes(id));
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
      type: 'ROUTING',
      solved: this.solved,
      attempts: this.attempts,
      hintsUsed: this.hintsUsed,
      hintsAvailable: this.hints.length - this.hintsUsed,
      currentPath: [...this.currentPath],
      hops: Math.max(0, this.currentPath.length - 1),
      sourceNode: this.sourceNode,
      targetNode: this.targetNode,
      nodeCount: this.nodes.length,
    };
  }

  getExplanation() {
    return this.explanation;
  }

  reset() {
    this.currentPath = [];
    this.attempts = 0;
    this.hintsUsed = 0;
    this.solved = false;
    this.packets = [];
  }
}

export default RoutingPuzzle;
