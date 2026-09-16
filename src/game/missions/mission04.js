// ============================================================
// NULL//TRACE — Mission 04: THE DATABASE
// SQL injection awareness, parameterized queries
// ============================================================

const mission04 = {
  id: 'mission-04',
  number: 4,
  title: 'THE DATABASE',
  subtitle: 'Secure the vulnerable database',
  description: 'The attacker has reached the database layer. The database terminal has a critical vulnerability — unsafe input handling. Identify the vulnerability, understand how it works, and apply the correct defense.',
  difficulty: 'HARD',
  timeLimit: { EASY: 540, NORMAL: 360, HARD: 240 },
  maxScore: 2600,

  briefing: [
    'MISSION BRIEF — THE DATABASE',
    '',
    'The attacker has gained access to the data layer.',
    'Our database terminal has a critical vulnerability.',
    '',
    'You must:',
    '1. Log into the database terminal',
    '2. Identify the input vulnerability',
    '3. Understand how the attack works',
    '4. Apply the correct defense',
    '',
    'WARNING: Do NOT enter actual attack payloads.',
    'This is a simulation. Analyze the vulnerability safely.',
  ],

  objectives: [
    { id: 'obj-04-1', text: 'Access the database terminal', completed: false },
    { id: 'obj-04-2', text: 'Test the login form with normal input', completed: false },
    { id: 'obj-04-3', text: 'Identify the unsafe input handling pattern', completed: false },
    { id: 'obj-04-4', text: 'Analyze how the vulnerability works', completed: false },
    { id: 'obj-04-5', text: 'Select the correct defense mechanism', completed: false },
  ],

  network: {
    nodes: [
      { id: 'SEC-NODE', label: 'SECURITY-NODE', type: 'firewall', status: 'ONLINE', x: 400, y: 60, ip: '10.0.0.60' },
      { id: 'DB-LAYER', label: 'DATA-LAYER', type: 'server', status: 'COMPROMISED', x: 400, y: 200, ip: '10.0.0.70' },
      { id: 'DB-01', label: 'DATABASE-01', type: 'database', status: 'ONLINE', x: 200, y: 340, ip: '10.0.0.71' },
      { id: 'DB-02', label: 'DATABASE-02', type: 'database', status: 'SUSPICIOUS', x: 600, y: 340, ip: '10.0.0.72' },
      { id: 'CORE', label: 'CORE-SRV', type: 'core', status: 'LOCKED', x: 400, y: 480, ip: '10.0.0.100' },
    ],
    connections: [
      { from: 'SEC-NODE', to: 'DB-LAYER' },
      { from: 'DB-LAYER', to: 'DB-01' },
      { from: 'DB-LAYER', to: 'DB-02' },
      { from: 'DB-01', to: 'CORE' },
      { from: 'DB-02', to: 'CORE' },
    ],
  },

  puzzle: {
    type: 'LOG_ANALYSIS',
    config: {
      id: 'sql-analysis',
      logs: [
        { time: '03:28:01', category: 'AUTH', message: "DB LOGIN — user: 'analyst' — password: '****' — STANDARD QUERY", flagged: false },
        { time: '03:28:04', category: 'AUTH', message: "DB LOGIN — user: 'admin' — password: '****' — STANDARD QUERY", flagged: false },
        { time: '03:28:08', category: 'AUTH', message: "DB LOGIN — user: '' OR 1=1 --' — password: '' — MODIFIED QUERY", flagged: false },
        { time: '03:28:10', category: 'SECURITY', message: "QUERY ALTERED — WHERE clause bypassed — Full table returned", flagged: false },
        { time: '03:28:12', category: 'SECURITY', message: "DATA EXFILTRATION — 2,847 records accessed in single query", flagged: false },
        { time: '03:28:15', category: 'AUTH', message: "DB LOGIN — user: 'admin'; DROP TABLE users; --' — DANGEROUS QUERY", flagged: false },
        { time: '03:28:18', category: 'SYSTEM', message: "DATABASE-02 — TABLE STRUCTURE MODIFIED — Unauthorized", flagged: false },
        { time: '03:28:20', category: 'NETWORK', message: "OUTBOUND TRANSFER — DATABASE-02 → EXTERNAL — 4.2MB", flagged: false },
      ],
      suspiciousEntries: [2, 3, 4, 5, 6, 7],
      questions: [
        {
          id: 'q1',
          question: 'What type of vulnerability is being exploited?',
          options: ['Cross-Site Scripting (XSS)', 'SQL Injection', 'Buffer Overflow', 'DNS Spoofing'],
          answer: 'SQL Injection',
          acceptedAnswers: ['SQL Injection', 'sql injection', 'SQLi', 'sqli'],
        },
        {
          id: 'q2',
          question: 'Which input pattern indicates the attack?',
          options: ["' OR 1=1 --", '<script>alert(1)</script>', '../../../../etc/passwd', 'AAAA...overflow'],
          answer: "' OR 1=1 --",
          acceptedAnswers: ["' OR 1=1 --", "or 1=1", "' OR 1=1"],
        },
        {
          id: 'q3',
          question: 'What is the correct defense against this vulnerability?',
          options: ['Stronger passwords', 'Parameterized queries', 'Faster server', 'More firewalls'],
          answer: 'Parameterized queries',
          acceptedAnswers: ['Parameterized queries', 'parameterized queries', 'prepared statements', 'Prepared statements'],
        },
      ],
      hints: [
        'Look for log entries where the input contains SQL syntax characters like quotes and dashes.',
        'The pattern OR 1=1 is a classic technique to bypass WHERE clauses in SQL queries.',
        'The defense involves separating data from query structure — look for "parameterized" in the options.',
      ],
      explanation: {
        title: 'SQL INJECTION',
        concept: 'SQL injection occurs when user input is inserted directly into a database query without sanitization. An attacker can modify the query structure to bypass authentication, extract data, or damage the database.',
        whyItMatters: 'SQL injection has been the #1 web application vulnerability for over a decade. It can lead to complete database compromise and data theft.',
        realWorld: 'Major breaches at companies like Sony, LinkedIn, and Yahoo involved SQL injection. The OWASP Top 10 consistently lists injection as a critical risk.',
        defense: 'Parameterized queries (prepared statements) • Input validation • Least privilege database accounts • Web Application Firewalls',
      },
    },
  },

  // Simulated query visualization
  queryVisualization: {
    safe: {
      label: 'SAFE QUERY (Parameterized)',
      query: "SELECT * FROM users WHERE name = ? AND pass = ?",
      params: ['admin', '****'],
      result: 'Parameters treated as DATA, not SQL code.',
    },
    unsafe: {
      label: 'UNSAFE QUERY (String Concatenation)',
      query: "SELECT * FROM users WHERE name = '' OR 1=1 --' AND pass = ''",
      result: 'Input becomes part of the SQL STRUCTURE. WHERE clause bypassed.',
    },
  },

  logs: [
    { time: '03:26:01', category: 'SYSTEM', message: 'DATA-LAYER — Connection established from SECURITY-NODE', suspicious: false },
    { time: '03:26:05', category: 'SYSTEM', message: 'DATABASE-02 — Running legacy authentication module v1.2', suspicious: true },
    { time: '03:26:08', category: 'SECURITY', message: 'WARNING — DATABASE-02 uses unparameterized queries', suspicious: true },
    { time: '03:27:01', category: 'AUTH', message: 'DATABASE-01 — Standard login: analyst — SUCCESS', suspicious: false },
    { time: '03:28:01', category: 'SECURITY', message: 'DATABASE-02 — Unusual query pattern detected', suspicious: true },
    { time: '03:28:30', category: 'SECURITY', message: 'ALERT — Data exfiltration in progress on DATABASE-02', suspicious: true },
  ],

  clues: [
    {
      id: 'clue-04-1',
      title: 'Query Log Comparison',
      description: 'Comparison of safe vs unsafe query patterns',
      content: 'SAFE:\nSELECT * FROM users WHERE name = ? AND pass = ?\n[Parameters bound separately]\n\nUNSAFE:\nSELECT * FROM users WHERE name = \'' + 'input' + '\'\n[Input concatenated directly into query]',
      category: 'technical',
    },
    {
      id: 'clue-04-2',
      title: 'Vulnerability Report',
      description: 'Security audit findings for DATABASE-02',
      content: 'SECURITY AUDIT — DATABASE-02\n\nFINDING: CRITICAL\nModule: Authentication (v1.2)\nIssue: User input concatenated directly into SQL queries\nRisk: Complete database compromise\nRemediation: Use parameterized queries / prepared statements',
      category: 'security',
    },
    {
      id: 'clue-04-3',
      title: 'Attack Timeline',
      description: 'Reconstructed attack timeline',
      content: 'ATTACK TIMELINE\n\n03:28:08 — Attacker sends crafted input\n03:28:10 — Query structure modified\n03:28:12 — 2,847 records accessed\n03:28:15 — Destructive query attempted\n03:28:20 — Data exfiltrated externally',
      category: 'analysis',
    },
  ],

  nodeInspections: {
    'DB-LAYER': {
      title: 'DATA-LAYER',
      details: [
        'STATUS: COMPROMISED',
        'IP: 10.0.0.70',
        'ALERT: Unauthorized access detected',
        'SERVICES: Database Gateway',
      ],
    },
    'DB-02': {
      title: 'DATABASE-02',
      details: [
        'STATUS: SUSPICIOUS',
        'IP: 10.0.0.72',
        'SERVICE: PostgreSQL (Legacy Auth v1.2)',
        'WARNING: Unparameterized query module active',
        'ALERT: Unusual query patterns detected',
        'ALERT: Data exfiltration in progress',
      ],
    },
  },

  successMessage: [
    'VULNERABILITY IDENTIFIED',
    '',
    'CATEGORY: UNSAFE INPUT HANDLING',
    'TYPE: SQL INJECTION',
    'DEFENSE: PARAMETERIZED QUERIES',
    '',
    'Database authentication module has been patched.',
    'Data exfiltration channel blocked.',
    '',
    'But the attacker has already moved to the core server...',
  ],

  rewards: {
    baseScore: 600,
    clueBonus: 60,
    objectiveBonus: 250,
  },
};

export default mission04;
