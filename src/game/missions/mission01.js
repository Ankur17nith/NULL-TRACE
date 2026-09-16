// ============================================================
// NULL//TRACE — Mission 01: THE ENTRY POINT
// Password security, authentication, brute-force concepts
// ============================================================

const mission01 = {
  id: 'mission-01',
  number: 1,
  title: 'THE ENTRY POINT',
  subtitle: 'Investigate the compromised workstation',
  description: 'A workstation has been compromised through weak credentials. Investigate the authentication logs, discover clues about the account, and gain access to the compromised system.',
  difficulty: 'EASY',
  timeLimit: { EASY: 600, NORMAL: 480, HARD: 300 }, // seconds
  maxScore: 2000,

  briefing: [
    'INCIDENT REPORT — 03:17 AM',
    '',
    'Multiple authentication failures detected on WORKSTATION-07.',
    'An unauthorized user has gained access using compromised credentials.',
    '',
    'Your task: Investigate the breach and identify the vulnerability.',
    '',
    'Start by scanning the network and inspecting the compromised node.',
  ],

  objectives: [
    { id: 'obj-01-1', text: 'Scan the network for anomalies', completed: false },
    { id: 'obj-01-2', text: 'Inspect WORKSTATION-07', completed: false },
    { id: 'obj-01-3', text: 'Analyze authentication logs', completed: false },
    { id: 'obj-01-4', text: 'Gather clues about the compromised account', completed: false },
    { id: 'obj-01-5', text: 'Access the workstation using discovered credentials', completed: false },
  ],

  network: {
    nodes: [
      { id: 'GW-01', label: 'GATEWAY-01', type: 'router', status: 'ONLINE', x: 400, y: 60, ip: '10.0.0.1' },
      { id: 'WS-03', label: 'WORKSTATION-03', type: 'workstation', status: 'ONLINE', x: 180, y: 180, ip: '10.0.0.15' },
      { id: 'WS-07', label: 'WORKSTATION-07', type: 'workstation', status: 'SUSPICIOUS', x: 620, y: 180, ip: '10.0.0.22' },
      { id: 'SRV-01', label: 'FILE-SERVER', type: 'server', status: 'ONLINE', x: 180, y: 340, ip: '10.0.0.30' },
      { id: 'SRV-DB', label: 'DB-SERVER', type: 'server', status: 'ONLINE', x: 620, y: 340, ip: '10.0.0.40' },
      { id: 'CORE', label: 'CORE-SRV', type: 'core', status: 'LOCKED', x: 400, y: 460, ip: '10.0.0.100' },
    ],
    connections: [
      { from: 'GW-01', to: 'WS-03' },
      { from: 'GW-01', to: 'WS-07' },
      { from: 'WS-03', to: 'SRV-01' },
      { from: 'WS-07', to: 'SRV-DB' },
      { from: 'SRV-01', to: 'CORE' },
      { from: 'SRV-DB', to: 'CORE' },
    ],
  },

  logs: [
    { time: '03:14:02', category: 'AUTH', message: 'AUTH ATTEMPT — WORKSTATION-07 — user: guest — FAILED', suspicious: false },
    { time: '03:14:05', category: 'AUTH', message: 'AUTH ATTEMPT — WORKSTATION-07 — user: admin — FAILED', suspicious: false },
    { time: '03:14:08', category: 'AUTH', message: 'AUTH ATTEMPT — WORKSTATION-07 — user: admin — FAILED', suspicious: true },
    { time: '03:14:11', category: 'AUTH', message: 'AUTH ATTEMPT — WORKSTATION-07 — user: admin — FAILED', suspicious: true },
    { time: '03:14:14', category: 'AUTH', message: 'AUTH ATTEMPT — WORKSTATION-07 — user: admin — FAILED', suspicious: true },
    { time: '03:14:17', category: 'AUTH', message: 'AUTH ATTEMPT — WORKSTATION-07 — user: admin — SUCCESS', suspicious: true },
    { time: '03:14:19', category: 'SYSTEM', message: 'SESSION STARTED — WORKSTATION-07 — user: admin', suspicious: true },
    { time: '03:14:22', category: 'NETWORK', message: 'OUTBOUND CONNECTION — WORKSTATION-07 → 10.0.0.40', suspicious: true },
    { time: '03:14:25', category: 'SECURITY', message: 'PRIVILEGE ESCALATION ATTEMPT — WORKSTATION-07', suspicious: true },
    { time: '03:15:01', category: 'SYSTEM', message: 'SCHEDULED TASK — BACKUP COMPLETE — SRV-01', suspicious: false },
    { time: '03:15:30', category: 'NETWORK', message: 'HEARTBEAT — GW-01 — STATUS: NORMAL', suspicious: false },
    { time: '03:16:02', category: 'AUTH', message: 'AUTH SUCCESS — WORKSTATION-03 — user: j.chen — ROUTINE', suspicious: false },
  ],

  clues: [
    {
      id: 'clue-01-1',
      title: 'Sticky Note',
      description: 'A sticky note found on the monitor of WORKSTATION-07',
      content: 'WiFi: PolyNet-Guest\nPrinter: 3rd floor\nLogin: see IT handbook pg.12',
      category: 'physical',
    },
    {
      id: 'clue-01-2',
      title: 'IT Handbook Page 12',
      description: 'Default credentials section from the IT handbook',
      content: 'DEFAULT CREDENTIALS\n\nAll new workstations ship with:\nUsername: admin\nPassword: admin123\n\nIMPORTANT: Change on first login!',
      category: 'document',
    },
    {
      id: 'clue-01-3',
      title: 'Auth Failure Pattern',
      description: 'Pattern analysis of authentication failures',
      content: '5 consecutive failures followed by 1 success in 15 seconds.\nPattern indicates automated brute-force with dictionary attack.\nThe password was likely a common default credential.',
      category: 'analysis',
    },
    {
      id: 'clue-01-4',
      title: 'Employee Record',
      description: 'WORKSTATION-07 assignment record',
      content: 'WORKSTATION-07\nAssigned to: New hire (onboarding)\nSetup date: 2 days ago\nPassword changed: NO\nMFA enabled: NO',
      category: 'document',
    },
  ],

  puzzle: {
    type: 'AUTHENTICATION',
    config: {
      id: 'auth-ws07',
      username: 'admin',
      password: 'admin123',
      maxAttempts: 5,
      clues: [
        'The workstation uses default credentials',
        'Check the IT handbook for default login information',
        'The account was never configured after initial setup',
      ],
      hints: [
        'Look at the clues — one mentions an IT handbook with default credentials.',
        'The username is the most common administrative account name.',
        'The password follows the pattern: [username][numbers]',
      ],
      explanation: {
        title: 'PASSWORD SECURITY',
        concept: 'Default and weak passwords are the most common entry point for attackers. In this case, a workstation was left with factory credentials that were never changed.',
        whyItMatters: 'Over 80% of breaches involve compromised credentials. Default passwords are the first thing attackers try.',
        realWorld: 'Many IoT devices, routers, and enterprise systems ship with well-known default credentials. Changing them immediately is a critical security practice.',
        defense: 'Strong, unique passwords • Multi-factor authentication • Forced password change on first login • Password complexity requirements',
      },
    },
  },

  nodeInspections: {
    'WS-07': {
      title: 'WORKSTATION-07',
      details: [
        'STATUS: SUSPICIOUS',
        'IP: 10.0.0.22',
        'OS: POLYNET-OS 4.2',
        'LAST LOGIN: admin (03:14:17)',
        'UPTIME: 48h 22m',
        'SERVICES: SSH, RDP, HTTP',
        'ALERT: Multiple auth failures detected',
        'ALERT: Outbound connection to DB-SERVER',
      ],
    },
    'GW-01': {
      title: 'GATEWAY-01',
      details: [
        'STATUS: ONLINE',
        'IP: 10.0.0.1',
        'TYPE: BORDER ROUTER',
        'CONNECTIONS: 2 active',
        'THROUGHPUT: NORMAL',
      ],
    },
    'SRV-DB': {
      title: 'DB-SERVER',
      details: [
        'STATUS: ONLINE',
        'IP: 10.0.0.40',
        'SERVICES: PostgreSQL, SSH',
        'CONNECTIONS: 1 active (from 10.0.0.22)',
        'NOTE: Connection from WORKSTATION-07 is unusual',
      ],
    },
    'CORE': {
      title: 'CORE-SRV',
      details: [
        'STATUS: LOCKED',
        'ACCESS: RESTRICTED',
        'Requires elevated clearance.',
      ],
    },
  },

  successMessage: [
    'ACCESS GRANTED',
    '',
    'SYSTEM NODE: WORKSTATION-07',
    'THREAT LEVEL: ELEVATED',
    '',
    'The attacker used default credentials to access this workstation.',
    'The password was never changed after initial setup.',
    '',
    'Proceeding to network investigation...',
  ],

  rewards: {
    baseScore: 500,
    clueBonus: 50,
    objectiveBonus: 200,
  },
};

export default mission01;
