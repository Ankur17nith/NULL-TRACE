// ============================================================
// NULL//TRACE — Mission 03: BINARY LOCK
// Binary, hexadecimal, ASCII, encoding
// ============================================================

const mission03 = {
  id: 'mission-03',
  number: 3,
  title: 'BINARY LOCK',
  subtitle: 'Decode the encrypted security key',
  description: 'The intercepted packet contains an encrypted security key. The key is encoded in binary. Use your decoding tools to unlock the next layer of the network.',
  difficulty: 'NORMAL',
  timeLimit: { EASY: 600, NORMAL: 420, HARD: 240 },
  maxScore: 2400,

  briefing: [
    'MISSION BRIEF — BINARY LOCK',
    '',
    'The packet from the previous mission contained encrypted data.',
    'Our analysis reveals a binary-encoded security key.',
    '',
    'A security node blocks access to the next network layer.',
    'The access key is hidden in the binary sequence.',
    '',
    'Decode the binary data to unlock the security node.',
  ],

  objectives: [
    { id: 'obj-03-1', text: 'Access the security node terminal', completed: false },
    { id: 'obj-03-2', text: 'Examine the binary-encoded data', completed: false },
    { id: 'obj-03-3', text: 'Use decoding tools to convert binary to ASCII', completed: false },
    { id: 'obj-03-4', text: 'Enter the decoded security key', completed: false },
    { id: 'obj-03-5', text: 'Unlock the security node', completed: false },
  ],

  network: {
    nodes: [
      { id: 'ORIGIN', label: 'ANALYSIS-SRV', type: 'server', status: 'ONLINE', x: 400, y: 60, ip: '10.0.0.50' },
      { id: 'SEC-NODE', label: 'SECURITY-NODE', type: 'firewall', status: 'LOCKED', x: 400, y: 220, ip: '10.0.0.60' },
      { id: 'ENC-01', label: 'ENCRYPT-01', type: 'server', status: 'ONLINE', x: 200, y: 220, ip: '10.0.0.61' },
      { id: 'ENC-02', label: 'ENCRYPT-02', type: 'server', status: 'ONLINE', x: 600, y: 220, ip: '10.0.0.62' },
      { id: 'DB-LAYER', label: 'DATA-LAYER', type: 'server', status: 'LOCKED', x: 400, y: 400, ip: '10.0.0.70' },
      { id: 'CORE', label: 'CORE-SRV', type: 'core', status: 'LOCKED', x: 400, y: 540, ip: '10.0.0.100' },
    ],
    connections: [
      { from: 'ORIGIN', to: 'SEC-NODE' },
      { from: 'ORIGIN', to: 'ENC-01' },
      { from: 'ORIGIN', to: 'ENC-02' },
      { from: 'ENC-01', to: 'SEC-NODE' },
      { from: 'ENC-02', to: 'SEC-NODE' },
      { from: 'SEC-NODE', to: 'DB-LAYER' },
      { from: 'DB-LAYER', to: 'CORE' },
    ],
  },

  puzzle: {
    type: 'BINARY',
    config: {
      id: 'binary-lock-01',
      encoding: 'binary',
      encodedValues: [
        '01000001', // A
        '01000011', // C
        '01000011', // C
        '01000101', // E
        '01010011', // S
        '01010011', // S
      ],
      expectedAnswer: 'ACCESS',
      tools: ['bin-to-dec', 'bin-to-ascii', 'hex-to-ascii', 'dec-to-bin'],
      hints: [
        'Each 8-bit binary value represents one ASCII character.',
        'Convert each binary value to decimal first, then look up the ASCII table.',
        'The first byte 01000001 = 65 in decimal = "A" in ASCII.',
      ],
      explanation: {
        title: 'BINARY & ENCODING',
        concept: 'Computers store all data as binary (0s and 1s). Text is represented using encoding systems like ASCII, where each character maps to a number. "A" = 65 = 01000001 in binary.',
        whyItMatters: 'Understanding encoding is essential for analyzing network packets, reading file headers, and decoding obfuscated malicious payloads.',
        realWorld: 'Attackers often encode malicious commands in Base64, hex, or binary to evade detection systems. Security analysts must decode these to understand the attack.',
        defense: 'Deep packet inspection • Content encoding analysis • Payload deobfuscation tools',
      },
    },
  },

  // Additional hex puzzle for harder difficulties
  bonusPuzzle: {
    type: 'BINARY',
    config: {
      id: 'hex-lock-01',
      encoding: 'hex',
      encodedValues: ['52', '4F', '4F', '54'],
      expectedAnswer: 'ROOT',
      tools: ['hex-to-ascii', 'bin-to-ascii'],
      hints: [
        'These are hexadecimal values. Convert them to ASCII.',
        'Hex 52 = decimal 82 = ASCII "R".',
        'The answer is a common administrative access level.',
      ],
    },
  },

  logs: [
    { time: '03:22:01', category: 'SECURITY', message: 'SECURITY-NODE — Access attempt blocked — Key required', suspicious: false },
    { time: '03:22:03', category: 'SYSTEM', message: 'ENCRYPT-01 — Binary encoder active', suspicious: false },
    { time: '03:22:05', category: 'SYSTEM', message: 'ENCRYPT-02 — Hex encoder active', suspicious: false },
    { time: '03:22:08', category: 'SECURITY', message: 'SECURITY-NODE — Binary-encoded key detected in packet payload', suspicious: false },
    { time: '03:22:15', category: 'NETWORK', message: 'DATA-LAYER — Awaiting security clearance from SECURITY-NODE', suspicious: false },
    { time: '03:22:30', category: 'SECURITY', message: 'ALERT — Unauthorized decryption attempts detected from external IP', suspicious: true },
  ],

  clues: [
    {
      id: 'clue-03-1',
      title: 'Binary Reference',
      description: 'ASCII reference chart found in the system',
      content: 'ASCII REFERENCE (partial)\n\nA = 65 = 01000001\nB = 66 = 01000010\nC = 67 = 01000011\n...\nS = 83 = 01010011\n...\nZ = 90 = 01011010',
      category: 'reference',
    },
    {
      id: 'clue-03-2',
      title: 'Packet Payload',
      description: 'Extracted binary data from the intercepted packet',
      content: 'PAYLOAD DATA\n\n01000001 01000011 01000011\n01000101 01010011 01010011\n\nFormat: 8-bit ASCII encoding\nLength: 6 characters',
      category: 'technical',
    },
    {
      id: 'clue-03-3',
      title: 'Security Node Manual',
      description: 'Instructions for the security node',
      content: 'SECURITY NODE ACCESS\n\nThe security key is a 6-letter word.\nIt is encoded in standard 8-bit ASCII binary.\nDecode each byte to reveal the key.\nEnter the key in UPPERCASE.',
      category: 'document',
    },
  ],

  nodeInspections: {
    'SEC-NODE': {
      title: 'SECURITY-NODE',
      details: [
        'STATUS: LOCKED',
        'TYPE: Access Control Node',
        'REQUIRES: Decoded binary key',
        'FORMAT: 6-character ASCII string',
        'ENCODING: 8-bit binary',
      ],
    },
    'ENC-01': {
      title: 'ENCRYPT-01',
      details: [
        'STATUS: ONLINE',
        'SERVICE: Binary Encoding Engine',
        'TOOL: Binary ↔ Decimal converter available',
      ],
    },
    'ENC-02': {
      title: 'ENCRYPT-02',
      details: [
        'STATUS: ONLINE',
        'SERVICE: Hex Encoding Engine',
        'TOOL: Hex ↔ ASCII converter available',
      ],
    },
  },

  successMessage: [
    'SECURITY KEY ACCEPTED',
    '',
    'SECURITY-NODE: UNLOCKED',
    'Access to DATA-LAYER: GRANTED',
    '',
    'The decoded key reveals the next attack vector.',
    'The attacker is targeting the database layer.',
    '',
    'Proceeding to database investigation...',
  ],

  rewards: {
    baseScore: 500,
    clueBonus: 50,
    objectiveBonus: 200,
  },
};

export default mission03;
