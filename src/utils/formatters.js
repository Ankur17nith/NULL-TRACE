// ============================================================
// NULL//TRACE — Utility: Formatters
// Display formatting utilities
// ============================================================

/**
 * Format time in MM:SS
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.floor(Math.max(0, seconds) % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Format score with commas
 * @param {number} score
 * @returns {string}
 */
export function formatScore(score) {
  return Math.round(score).toLocaleString('en-US');
}

/**
 * Format IP address from components
 * @param {number[]} octets
 * @returns {string}
 */
export function formatIP(octets) {
  return octets.join('.');
}

/**
 * Format percentage
 * @param {number} value - 0-100
 * @returns {string}
 */
export function formatPercent(value) {
  return `${Math.round(value)}%`;
}

/**
 * Format a log timestamp
 * @param {Date|number} date
 * @returns {string}
 */
export function formatLogTimestamp(date) {
  const d = date instanceof Date ? date : new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Pad string with character
 * @param {string} str
 * @param {number} length
 * @param {string} char
 * @returns {string}
 */
export function padRight(str, length, char = ' ') {
  return str.padEnd(length, char);
}

/**
 * Create a text-based progress bar
 * @param {number} filled - blocks filled
 * @param {number} total - total blocks
 * @returns {string}
 */
export function textProgressBar(filled, total = 10) {
  const f = Math.min(filled, total);
  return '█'.repeat(f) + '░'.repeat(total - f);
}

/**
 * Generate ordinal suffix
 * @param {number} n
 * @returns {string}
 */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
