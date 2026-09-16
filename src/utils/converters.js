// ============================================================
// NULL//TRACE — Utility: Converters
// Binary, hex, decimal, ASCII conversion functions
// ============================================================

/**
 * Convert binary string to decimal
 * @param {string} bin - Binary string (e.g., "01001000")
 * @returns {number}
 */
export function binaryToDecimal(bin) {
  const cleaned = bin.replace(/\s/g, '');
  if (!/^[01]+$/.test(cleaned)) return NaN;
  return parseInt(cleaned, 2);
}

/**
 * Convert decimal to binary string
 * @param {number} dec - Decimal number
 * @param {number} [pad=8] - Pad to this many bits
 * @returns {string}
 */
export function decimalToBinary(dec, pad = 8) {
  if (!Number.isInteger(dec) || dec < 0) return '';
  return dec.toString(2).padStart(pad, '0');
}

/**
 * Convert binary string to ASCII character
 * @param {string} bin - 8-bit binary string
 * @returns {string}
 */
export function binaryToAscii(bin) {
  const dec = binaryToDecimal(bin);
  if (isNaN(dec) || dec < 0 || dec > 127) return '';
  return String.fromCharCode(dec);
}

/**
 * Convert ASCII character to binary string
 * @param {string} char - Single ASCII character
 * @returns {string}
 */
export function asciiToBinary(char) {
  if (!char || char.length !== 1) return '';
  return decimalToBinary(char.charCodeAt(0));
}

/**
 * Convert hex string to decimal
 * @param {string} hex - Hex string (e.g., "4F" or "0x4F")
 * @returns {number}
 */
export function hexToDecimal(hex) {
  const cleaned = hex.replace(/^0x/i, '').replace(/\s/g, '');
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return NaN;
  return parseInt(cleaned, 16);
}

/**
 * Convert decimal to hex string
 * @param {number} dec - Decimal number
 * @param {number} [pad=2] - Pad to this many hex digits
 * @returns {string}
 */
export function decimalToHex(dec, pad = 2) {
  if (!Number.isInteger(dec) || dec < 0) return '';
  return dec.toString(16).toUpperCase().padStart(pad, '0');
}

/**
 * Convert hex string to ASCII
 * @param {string} hex - Hex string (pairs of hex digits)
 * @returns {string}
 */
export function hexToAscii(hex) {
  const cleaned = hex.replace(/^0x/i, '').replace(/\s/g, '');
  if (!/^[0-9a-fA-F]+$/.test(cleaned) || cleaned.length % 2 !== 0) return '';
  let result = '';
  for (let i = 0; i < cleaned.length; i += 2) {
    const code = parseInt(cleaned.substr(i, 2), 16);
    if (code < 0 || code > 127) return '';
    result += String.fromCharCode(code);
  }
  return result;
}

/**
 * Convert ASCII string to hex
 * @param {string} str - ASCII string
 * @returns {string}
 */
export function asciiToHex(str) {
  return [...str].map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

/**
 * Convert binary array (multiple 8-bit strings) to ASCII string
 * @param {string[]} binArray - Array of 8-bit binary strings
 * @returns {string}
 */
export function binaryArrayToAscii(binArray) {
  return binArray.map(b => binaryToAscii(b)).join('');
}

/**
 * Convert ASCII string to binary array
 * @param {string} str - ASCII string
 * @returns {string[]}
 */
export function asciiToBinaryArray(str) {
  return [...str].map(c => asciiToBinary(c));
}

/**
 * Validate if a string is valid binary
 * @param {string} str
 * @returns {boolean}
 */
export function isValidBinary(str) {
  return /^[01\s]+$/.test(str) && str.replace(/\s/g, '').length > 0;
}

/**
 * Validate if a string is valid hex
 * @param {string} str
 * @returns {boolean}
 */
export function isValidHex(str) {
  const cleaned = str.replace(/^0x/i, '').replace(/\s/g, '');
  return /^[0-9a-fA-F]+$/.test(cleaned);
}
