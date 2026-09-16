// ============================================================
// NULL//TRACE — Network Engine
// Network graph, pathfinding, node states
// ============================================================

import { GameEvents, eventEngine } from './EventEngine.js';

class NetworkEngine {
  constructor() {
    this.nodes = [];
    this.connections = [];
    this.packets = [];
    this.attackPath = [];
  }

  /**
   * Load network from mission data
   * @param {object} networkData - { nodes, connections, attackPath }
   */
  loadNetwork(networkData) {
    this.nodes = networkData.nodes.map(n => ({
      ...n,
      originalStatus: n.status,
    }));
    this.connections = [...networkData.connections];
    this.attackPath = networkData.attackPath || [];
    this.packets = [];
  }

  /**
   * Get all nodes
   * @returns {object[]}
   */
  getNodes() {
    return [...this.nodes];
  }

  /**
   * Get a specific node
   * @param {string} nodeId
   * @returns {object|undefined}
   */
  getNode(nodeId) {
    return this.nodes.find(n => n.id === nodeId);
  }

  /**
   * Get all connections
   * @returns {object[]}
   */
  getConnections() {
    return [...this.connections];
  }

  /**
   * Get connections for a specific node
   * @param {string} nodeId
   * @returns {object[]}
   */
  getNodeConnections(nodeId) {
    return this.connections.filter(
      c => c.from === nodeId || c.to === nodeId
    );
  }

  /**
   * Get adjacent node IDs
   * @param {string} nodeId
   * @returns {string[]}
   */
  getAdjacentNodes(nodeId) {
    return this.connections
      .filter(c => c.from === nodeId || c.to === nodeId)
      .map(c => c.from === nodeId ? c.to : c.from);
  }

  /**
   * Update node status
   * @param {string} nodeId
   * @param {string} status
   */
  setNodeStatus(nodeId, status) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.status = status;
      if (status === 'COMPROMISED') {
        eventEngine.emit(GameEvents.NODE_COMPROMISED, { nodeId, node });
      }
    }
  }

  /**
   * Find shortest path using BFS
   * @param {string} start
   * @param {string} end
   * @returns {string[]|null}
   */
  findShortestPath(start, end) {
    const visited = new Set();
    const queue = [[start]];
    visited.add(start);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === end) return path;

      const neighbors = this.getAdjacentNodes(current);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const conn = this.connections.find(
            c => (c.from === current && c.to === neighbor) ||
                 (c.to === current && c.from === neighbor)
          );
          if (conn && !conn.congested) {
            queue.push([...path, neighbor]);
          }
        }
      }
    }
    return null;
  }

  /**
   * Create a packet for animation
   * @param {object} config
   * @returns {object}
   */
  createPacket(config) {
    const packet = {
      id: `PKT-${String(this.packets.length + 1).padStart(3, '0')}`,
      source: config.source,
      destination: config.destination,
      protocol: config.protocol || 'TCP',
      path: config.path || [],
      currentHop: 0,
      status: 'ROUTING',
      timestamp: Date.now(),
    };
    this.packets.push(packet);
    return packet;
  }

  /**
   * Advance a packet to the next hop
   * @param {string} packetId
   * @returns {object}
   */
  advancePacket(packetId) {
    const packet = this.packets.find(p => p.id === packetId);
    if (!packet) return null;

    if (packet.currentHop < packet.path.length - 1) {
      packet.currentHop++;
      if (packet.currentHop === packet.path.length - 1) {
        packet.status = 'DELIVERED';
        eventEngine.emit(GameEvents.PACKET_ROUTED, { packet });
      }
    }
    return packet;
  }

  /**
   * Get nodes with a specific status
   * @param {string} status
   * @returns {object[]}
   */
  getNodesByStatus(status) {
    return this.nodes.filter(n => n.status === status);
  }

  /**
   * Check if a path exists between two nodes
   * @param {string} start
   * @param {string} end
   * @returns {boolean}
   */
  hasPath(start, end) {
    return this.findShortestPath(start, end) !== null;
  }

  /**
   * Get network summary for terminal output
   * @returns {string[]}
   */
  getNetworkSummary() {
    return this.nodes.map(n => {
      const status = n.status.padEnd(12);
      return `${n.id.padEnd(16)} ${status} ${n.ip || ''}`;
    });
  }

  /**
   * Reset network to original state
   */
  reset() {
    this.nodes.forEach(n => { n.status = n.originalStatus; });
    this.packets = [];
  }
}

export default NetworkEngine;
