// ============================================================
// NULL//TRACE — Mission 02: PACKET RUNNER
// IP addresses, routers, packets, network paths, routing
// ============================================================

const mission02 = {
  id: 'mission-02',
  number: 2,
  title: 'PACKET RUNNER',
  subtitle: 'Route the intercepted packet to the server',
  description: 'An intercepted packet must reach the secure server, but the network has been disrupted. Configure the correct route through the network while avoiding congested and compromised paths.',
  difficulty: 'NORMAL',
  timeLimit: { EASY: 540, NORMAL: 420, HARD: 240 },
  maxScore: 2200,

  briefing: [
    'MISSION BRIEF — PACKET RUNNER',
    '',
    'We intercepted a critical data packet from the attacker.',
    'To analyze it, we need to route it to our secure analysis server.',
    '',
    'The network is partially disrupted.',
    'Some connections are congested or offline.',
    '',
    'Route the packet through the network. Choose your path carefully.',
  ],

  objectives: [
    { id: 'obj-02-1', text: 'Survey the network topology', completed: false },
    { id: 'obj-02-2', text: 'Identify available routes to the server', completed: false },
    { id: 'obj-02-3', text: 'Avoid congested connections', completed: false },
    { id: 'obj-02-4', text: 'Route the packet to ANALYSIS-SRV', completed: false },
    { id: 'obj-02-5', text: 'Inspect the delivered packet', completed: false },
  ],

  network: {
    nodes: [
      { id: 'PLAYER', label: 'ORIGIN', type: 'workstation', status: 'ONLINE', x: 400, y: 40, ip: '10.0.0.12' },
      { id: 'RTR-A', label: 'ROUTER-A', type: 'router', status: 'ONLINE', x: 400, y: 160, ip: '10.0.1.1' },
      { id: 'RTR-B', label: 'ROUTER-B', type: 'router', status: 'ONLINE', x: 200, y: 280, ip: '10.0.2.1' },
      { id: 'RTR-C', label: 'ROUTER-C', type: 'router', status: 'ONLINE', x: 600, y: 280, ip: '10.0.3.1' },
      { id: 'RTR-D', label: 'ROUTER-D', type: 'router', status: 'SUSPICIOUS', x: 100, y: 400, ip: '10.0.4.1' },
      { id: 'RTR-E', label: 'ROUTER-E', type: 'router', status: 'ONLINE', x: 400, y: 400, ip: '10.0.5.1' },
      { id: 'RTR-F', label: 'ROUTER-F', type: 'router', status: 'ONLINE', x: 700, y: 400, ip: '10.0.6.1' },
      { id: 'ANALYSIS', label: 'ANALYSIS-SRV', type: 'server', status: 'ONLINE', x: 400, y: 540, ip: '10.0.0.50' },
    ],
    connections: [
      { from: 'PLAYER', to: 'RTR-A', weight: 1 },
      { from: 'RTR-A', to: 'RTR-B', weight: 1 },
      { from: 'RTR-A', to: 'RTR-C', weight: 1 },
      { from: 'RTR-B', to: 'RTR-D', weight: 2, congested: true },
      { from: 'RTR-B', to: 'RTR-E', weight: 1 },
      { from: 'RTR-C', to: 'RTR-E', weight: 1 },
      { from: 'RTR-C', to: 'RTR-F', weight: 1 },
      { from: 'RTR-D', to: 'ANALYSIS', weight: 3 },
      { from: 'RTR-E', to: 'ANALYSIS', weight: 1 },
      { from: 'RTR-F', to: 'ANALYSIS', weight: 2 },
    ],
  },

  puzzle: {
    type: 'ROUTING',
    config: {
      id: 'route-packet',
      sourceNode: 'PLAYER',
      targetNode: 'ANALYSIS',
      validPaths: [
        ['PLAYER', 'RTR-A', 'RTR-B', 'RTR-E', 'ANALYSIS'],
        ['PLAYER', 'RTR-A', 'RTR-C', 'RTR-E', 'ANALYSIS'],
        ['PLAYER', 'RTR-A', 'RTR-C', 'RTR-F', 'ANALYSIS'],
      ],
      optimalPath: ['PLAYER', 'RTR-A', 'RTR-C', 'RTR-E', 'ANALYSIS'],
      maxHops: 6,
      hints: [
        'Check which connections are congested — avoid those routes.',
        'ROUTER-D has a congested upstream link. Try other paths.',
        'The optimal path goes through ROUTER-C and ROUTER-E.',
      ],
      explanation: {
        title: 'PACKET ROUTING',
        concept: 'Routers determine the best path for network packets based on available routes, hop counts, and link conditions. Each step a packet takes between routers is called a "hop."',
        whyItMatters: 'Understanding routing helps network defenders trace attack paths and identify where malicious traffic flows through the network.',
        realWorld: 'Internet traffic passes through many routers (typically 10-20 hops). Tools like traceroute reveal the exact path packets take.',
        defense: 'Network segmentation • Route monitoring • Traffic analysis • Anomaly detection',
      },
    },
  },

  logs: [
    { time: '03:18:01', category: 'NETWORK', message: 'PACKET INTERCEPTED — Source: EXTERNAL — Protocol: TCP', suspicious: true },
    { time: '03:18:03', category: 'NETWORK', message: 'ROUTE TABLE UPDATED — RTR-A', suspicious: false },
    { time: '03:18:05', category: 'NETWORK', message: 'CONGESTION DETECTED — RTR-B → RTR-D — 94% capacity', suspicious: true },
    { time: '03:18:07', category: 'SYSTEM', message: 'ANALYSIS-SRV — Ready for packet inspection', suspicious: false },
    { time: '03:18:10', category: 'NETWORK', message: 'RTR-D — SUSPICIOUS TRAFFIC — Multiple unknown connections', suspicious: true },
    { time: '03:18:15', category: 'NETWORK', message: 'RTR-E — STATUS: HEALTHY — Low latency', suspicious: false },
    { time: '03:18:20', category: 'NETWORK', message: 'RTR-F — STATUS: HEALTHY — Moderate load', suspicious: false },
  ],

  clues: [
    {
      id: 'clue-02-1',
      title: 'Network Congestion Report',
      description: 'Current network congestion analysis',
      content: 'CONGESTION REPORT\n\nRTR-B → RTR-D: 94% capacity (CONGESTED)\nAll other links: < 40% capacity\n\nRecommendation: Avoid RTR-D path',
      category: 'analysis',
    },
    {
      id: 'clue-02-2',
      title: 'Packet Details',
      description: 'Details of the intercepted packet',
      content: 'PACKET #042\n\nSource: 10.0.0.12\nDestination: 10.0.0.50\nProtocol: TCP\nSize: 1,480 bytes\nTTL: 64\nFlags: SYN',
      category: 'technical',
    },
    {
      id: 'clue-02-3',
      title: 'RTR-D Anomaly',
      description: 'Suspicious activity on ROUTER-D',
      content: 'ROUTER-D is processing an unusual number of connections.\nTraffic analysis suggests possible man-in-the-middle position.\nAvoid routing sensitive packets through this node.',
      category: 'security',
    },
  ],

  nodeInspections: {
    'PLAYER': {
      title: 'ORIGIN POINT',
      details: ['IP: 10.0.0.12', 'Your analysis workstation', 'Packet ready to route'],
    },
    'RTR-A': {
      title: 'ROUTER-A',
      details: ['IP: 10.0.1.1', 'STATUS: ONLINE', 'CONNECTIONS: RTR-B, RTR-C', 'THROUGHPUT: NORMAL'],
    },
    'RTR-B': {
      title: 'ROUTER-B',
      details: ['IP: 10.0.2.1', 'STATUS: ONLINE', 'CONNECTIONS: RTR-D (CONGESTED), RTR-E', 'NOTE: Upstream link to RTR-D at high capacity'],
    },
    'RTR-C': {
      title: 'ROUTER-C',
      details: ['IP: 10.0.3.1', 'STATUS: ONLINE', 'CONNECTIONS: RTR-E, RTR-F', 'THROUGHPUT: NORMAL'],
    },
    'RTR-D': {
      title: 'ROUTER-D',
      details: ['IP: 10.0.4.1', 'STATUS: SUSPICIOUS', 'WARNING: Unusual traffic patterns', 'CONNECTIONS: ANALYSIS (high latency)'],
    },
    'RTR-E': {
      title: 'ROUTER-E',
      details: ['IP: 10.0.5.1', 'STATUS: ONLINE', 'CONNECTIONS: ANALYSIS', 'THROUGHPUT: OPTIMAL — Low latency'],
    },
    'ANALYSIS': {
      title: 'ANALYSIS-SRV',
      details: ['IP: 10.0.0.50', 'STATUS: ONLINE', 'SERVICE: Packet Analysis Engine', 'READY: Awaiting packet delivery'],
    },
  },

  successMessage: [
    'PACKET DELIVERED',
    '',
    'Route: optimal path confirmed',
    'Hops: 3',
    'Latency: 12ms',
    '',
    'Analysis server is processing the packet...',
    'Encrypted data fragments detected.',
    '',
    'Proceeding to decrypt the data...',
  ],

  rewards: {
    baseScore: 500,
    clueBonus: 50,
    objectiveBonus: 200,
  },
};

export default mission02;
