// ============================================================
// NULL//TRACE — Utility: Validators
// Input validation and sanitization
// ============================================================

/**
 * Sanitize user text input — strips anything dangerous
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')       // strip angle brackets
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')    // strip event handlers
    .trim()
    .slice(0, 500);             // max length
}

/**
 * Validate IP address format
 * @param {string} ip
 * @returns {boolean}
 */
export function isValidIP(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
  });
}

/**
 * Validate a node ID format
 * @param {string} nodeId
 * @returns {boolean}
 */
export function isValidNodeId(nodeId) {
  return /^[A-Z0-9][\w-]{0,30}$/i.test(nodeId);
}

/**
 * Validate callsign (player name)
 * @param {string} name
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateCallsign(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Callsign is required' };
  }
  const cleaned = name.trim();
  if (cleaned.length < 2) {
    return { valid: false, error: 'Callsign must be at least 2 characters' };
  }
  if (cleaned.length > 16) {
    return { valid: false, error: 'Callsign must be 16 characters or less' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) {
    return { valid: false, error: 'Callsign can only contain letters, numbers, hyphens, and underscores' };
  }
  return { valid: true };
}

/**
 * Check if a string could be a SQL injection attempt (for educational display)
 * @param {string} input
 * @returns {boolean}
 */
export function detectSQLPattern(input) {
  const patterns = [
    /'\s*or\s+/i,
    /'\s*;\s*/i,
    /--/,
    /union\s+select/i,
    /drop\s+table/i,
    /1\s*=\s*1/,
    /'\s*=\s*'/,
  ];
  return patterns.some(p => p.test(input));
}

/**
 * Validate terminal command input
 * @param {string} input
 * @returns {string}
 */
export function sanitizeCommand(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[^\w\s.<>:/-]/g, '')  // allow only safe chars
    .trim()
    .slice(0, 200);
}
