// ============================================================
// NULL//TRACE — Mission 05: TRACE THE ATTACKER
// Combined mechanics, final climax
// ============================================================

const mission05 = {
  id: 'mission-05',
  number: 5,
  title: 'TRACE THE ATTACKER',
  subtitle: 'Stop the breach before core system falls',
  description: 'The attacker has reached the core server. Use everything you have learned — logs, packets, network analysis, and investigation — to trace the attacker, identify the compromised path, and isolate the threat before the core system is fully compromised.',
  difficulty: 'HARD',
  timeLimit: { EASY: 480, NORMAL: 300, HARD: 180 },
  maxScore: 3000,

  briefing: [
    'CRITICAL ALERT — CORE SYSTEM COMPROMISED',
    '',
    '████████████████████████████ THREAT LEVEL: CRITICAL',
    '',
    'The attacker has reached CORE-SRV.',
    'System integrity is degrading rapidly.',
    '',
    'You must determine:',
    '1. Which machine was initially compromised',
    '2. How the attacker entered the network',
    '3. Which route the attacker used',
    '4. Which system is currently at risk',
    '5. How to isolate the threat',
    '',
    'TIME IS CRITICAL. Act fast.',
  ],

  objectives: [
    { id: 'obj-05-1', text: 'Analyze network logs and authentication records', completed: false },
    { id: 'obj-05-2', text: 'Identify the initially compromised machine', completed: false },
    { id: 'obj-05-3', text: 'Determine the attacker\'s entry method', completed: false },
    { id: 'obj-05-4', text: 'Trace the attacker\'s route through the network', completed: false },
    { id: 'obj-05-5', text: 'Isolate the compromised node to stop the attack', completed: false },
  ],

  network: {
    nodes: [
      { id: 'EXT', label: 'EXTERNAL', type: 'external', status: 'DANGER', x: 400, y: 40, ip: '203.0.113.42' },
      { id: 'GW-01', label: 'GATEWAY-01', type: 'router', status: 'ONLINE', x: 400, y: 140, ip: '10.0.0.1' },
      { id: 'WS-03', label: 'WORKSTATION-03', type: 'workstation', status: 'ONLINE', x: 150, y: 240, ip: '10.0.0.15' },
      { id: 'WS-07', label: 'WORKSTATION-07', type: 'workstation', status: 'COMPROMISED', x: 650, y: 240, ip: '10.0.0.22' },
      { id: 'SRV-01', label: 'FILE-SERVER', type: 'server', status: 'ONLINE', x: 150, y: 370, ip: '10.0.0.30' },
      { id: 'DB-02', label: 'DATABASE-02', type: 'database', status: 'COMPROMISED', x: 650, y: 370, ip: '10.0.0.72' },
      { id: 'CORE', label: 'CORE-SRV', type: 'core', status: 'COMPROMISED', x: 400, y: 500, ip: '10.0.0.100' },
    ],
    connections: [
      { from: 'EXT', to: 'GW-01' },
      { from: 'GW-01', to: 'WS-03' },
      { from: 'GW-01', to: 'WS-07' },
      { from: 'WS-03', to: 'SRV-01' },
      { from: 'WS-07', to: 'DB-02' },
      { from: 'SRV-01', to: 'CORE' },
      { from: 'DB-02', to: 'CORE' },
    ],
    attackPath: ['EXT', 'GW-01', 'WS-07', 'DB-02', 'CORE'],
  },

  puzzle: {
    type: 'INVESTIGATION',
    config: {
      id: 'trace-attacker',
      clues: [
        {
          id: 'clue-05-1',
          title: 'Authentication Log Summary',
          description: 'Authentication events across all nodes',
          content: 'AUTH LOG SUMMARY\n\n03:14:02-03:14:17 — 5 failures, 1 success on WORKSTATION-07\n03:14:22 — WS-07 connects to DATABASE-02\n03:28:08 — SQL injection on DATABASE-02\n03:30:01 — DATABASE-02 connects to CORE-SRV\n03:30:15 — Privilege escalation on CORE-SRV',
          category: 'logs',
        },
        {
          id: 'clue-05-2',
          title: 'Network Flow Analysis',
          description: 'Network traffic flow reconstruction',
          content: 'TRAFFIC FLOW\n\n203.0.113.42 → GATEWAY → WORKSTATION-07\nWORKSTATION-07 → DATABASE-02\nDATABASE-02 → CORE-SRV\n\nAll connections used standard ports.\nNo lateral movement to FILE-SERVER or WS-03.',
          category: 'network',
        },
        {
          id: 'clue-05-3',
          title: 'External IP Report',
          description: 'Threat intelligence on the external IP',
          content: 'IP: 203.0.113.42\n\nGEO: Unknown (VPN/Proxy)\nREPUTATION: MALICIOUS\nPREVIOUS INCIDENTS: 12\nMETHOD: Credential stuffing, SQL injection\nFIRST SEEN: 48 hours ago',
          category: 'intelligence',
        },
        {
          id: 'clue-05-4',
          title: 'Vulnerability Chain',
          description: 'Attack chain analysis',
          content: 'ATTACK CHAIN\n\n1. Default credentials on WORKSTATION-07 (ENTRY)\n2. Lateral movement to DATABASE-02\n3. SQL injection vulnerability exploited\n4. Database credentials extracted\n5. Core server access via database credentials\n\nATTACK TYPE: Multi-stage compromise',
          category: 'analysis',
        },
        {
          id: 'clue-05-5',
          title: 'Core Server Status',
          description: 'Current status of the core server',
          content: 'CORE-SRV STATUS\n\nINTEGRITY: DEGRADING\nUNAUTHORIZED PROCESSES: 3\nDATA EXFILTRATION: IN PROGRESS\nTIME TO FULL COMPROMISE: ~5 minutes\n\nACTION REQUIRED: Isolate attack source immediately',
          category: 'system',
        },
        {
          id: 'clue-05-6',
          title: 'Timeline Reconstruction',
          description: 'Complete attack timeline',
          content: 'ATTACK TIMELINE\n\n03:14 — Brute force on WS-07 (default creds)\n03:14 — WS-07 compromised\n03:22 — Lateral move to DB-02\n03:28 — SQL injection on DB-02\n03:28 — Data exfiltration from DB-02\n03:30 — Core-SRV accessed\n03:30 — Privilege escalation\n03:31 — Present — Data exfiltration ongoing',
          category: 'timeline',
        },
      ],
      conclusions: [
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
      ],
      isolation: 'DB-02',
      correctSuspect: 'WS-07',
      correctMethod: 'Default credentials',
      correctRoute: ['WS-07', 'DB-02', 'CORE'],
      correctTarget: 'CORE',
      timeline: [
        { time: '03:14', event: 'Brute force attack on WORKSTATION-07', severity: 'warning' },
        { time: '03:14', event: 'WORKSTATION-07 compromised — default credentials', severity: 'danger' },
        { time: '03:22', event: 'Lateral movement to DATABASE-02', severity: 'warning' },
        { time: '03:28', event: 'SQL injection on DATABASE-02', severity: 'danger' },
        { time: '03:28', event: 'Data exfiltration — 2,847 records', severity: 'danger' },
        { time: '03:30', event: 'CORE-SRV accessed via database credentials', severity: 'danger' },
        { time: '03:31', event: 'Privilege escalation — root access', severity: 'danger' },
      ],
      suspects: [
        { id: 'WS-03', label: 'WORKSTATION-03', reason: 'Normal operations — no suspicious activity' },
        { id: 'WS-07', label: 'WORKSTATION-07', reason: 'Multiple auth failures, outbound connections to DB-02' },
        { id: 'SRV-01', label: 'FILE-SERVER', reason: 'Normal operations — backup routines only' },
        { id: 'DB-02', label: 'DATABASE-02', reason: 'SQL injection detected, data exfiltration, connected to CORE' },
      ],
      hints: [
        'Check the authentication logs — which workstation had multiple login failures?',
        'Follow the connections — the attacker moved from the entry point to the database, then to the core.',
        'To stop the attack, isolate the node that connects the attacker to the core server. That\'s DATABASE-02.',
      ],
      explanation: {
        title: 'INCIDENT RESPONSE',
        concept: 'Incident response involves detecting, investigating, and containing security breaches. Analysts trace the attack chain — from initial entry to current impact — to determine the fastest way to stop the attacker.',
        whyItMatters: 'Fast incident response limits damage. Understanding the attack chain helps identify all affected systems and prevent re-entry.',
        realWorld: 'Security Operations Centers (SOCs) use SIEM tools, network logs, and threat intelligence to investigate breaches in real time. The NIST Incident Response framework guides organizations through detection, analysis, containment, and recovery.',
        defense: 'Network segmentation • Log monitoring (SIEM) • Incident response plans • Regular security audits • Zero trust architecture',
      },
    },
  },

  logs: [
    { time: '03:14:02', category: 'AUTH', message: 'AUTH FAILURE — WORKSTATION-07 — user: admin', suspicious: true },
    { time: '03:14:17', category: 'AUTH', message: 'AUTH SUCCESS — WORKSTATION-07 — user: admin', suspicious: true },
    { time: '03:14:22', category: 'NETWORK', message: 'OUTBOUND CONNECTION — WS-07 → DATABASE-02', suspicious: true },
    { time: '03:22:30', category: 'NETWORK', message: 'DATA TRANSFER — WS-07 → DB-02 — credential scan', suspicious: true },
    { time: '03:28:08', category: 'SECURITY', message: 'SQL INJECTION DETECTED — DATABASE-02', suspicious: true },
    { time: '03:28:20', category: 'SECURITY', message: 'DATA EXFILTRATION — DB-02 → EXTERNAL — 4.2MB', suspicious: true },
    { time: '03:30:01', category: 'NETWORK', message: 'CONNECTION — DATABASE-02 → CORE-SRV', suspicious: true },
    { time: '03:30:15', category: 'SECURITY', message: 'PRIVILEGE ESCALATION — CORE-SRV — root access obtained', suspicious: true },
    { time: '03:31:00', category: 'SECURITY', message: 'CRITICAL — Core system integrity degrading', suspicious: true },
    { time: '03:15:01', category: 'SYSTEM', message: 'BACKUP COMPLETE — FILE-SERVER — routine', suspicious: false },
    { time: '03:16:02', category: 'AUTH', message: 'AUTH SUCCESS — WS-03 — user: j.chen — routine login', suspicious: false },
    { time: '03:20:00', category: 'SYSTEM', message: 'HEARTBEAT — GATEWAY-01 — normal', suspicious: false },
  ],

  nodeInspections: {
    'EXT': {
      title: 'EXTERNAL SOURCE',
      details: [
        'IP: 203.0.113.42',
        'STATUS: MALICIOUS',
        'TYPE: VPN/Proxy endpoint',
        'REPUTATION: Known threat actor',
        'INCIDENTS: 12 previous attacks',
      ],
    },
    'WS-07': {
      title: 'WORKSTATION-07',
      details: [
        'STATUS: COMPROMISED',
        'IP: 10.0.0.22',
        'ENTRY POINT — Default credentials used',
        'CONNECTIONS: DATABASE-02',
        'ALERT: Initial compromise vector',
      ],
    },
    'DB-02': {
      title: 'DATABASE-02',
      details: [
        'STATUS: COMPROMISED',
        'IP: 10.0.0.72',
        'VULNERABILITY: SQL injection (unpatched)',
        'CONNECTIONS: CORE-SRV',
        'ALERT: Active data exfiltration',
        'ACTION: ISOLATE to cut attacker from CORE',
      ],
    },
    'CORE': {
      title: 'CORE-SRV',
      details: [
        'STATUS: COMPROMISED',
        'IP: 10.0.0.100',
        'INTEGRITY: DEGRADING',
        'UNAUTHORIZED PROCESSES: 3',
        'TIME TO FULL COMPROMISE: ~5 minutes',
      ],
    },
  },

  successMessage: [
    'CONNECTION TERMINATED',
    '',
    'CORE SYSTEM RESTORED',
    'POLYNET SECURED',
    '',
    'Attack source: 203.0.113.42 (External)',
    'Entry point: WORKSTATION-07 (Default credentials)',
    'Pivot point: DATABASE-02 (SQL injection)',
    'Target: CORE-SRV (Isolated and restored)',
    '',
    'INCIDENT REPORT FILED',
    'TRACE COMPLETE.',
  ],

  rewards: {
    baseScore: 800,
    clueBonus: 80,
    objectiveBonus: 300,
  },
};

export default mission05;
