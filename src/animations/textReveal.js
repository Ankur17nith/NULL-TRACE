// ============================================================
// NULL//TRACE — Text Reveal Animations
// Character/word-level text animation utilities
// ============================================================

import { gsap } from 'gsap';

/**
 * Split text into individually animatable characters
 * @param {HTMLElement} element
 * @returns {HTMLElement[]} Array of char span elements
 */
export function splitChars(element) {
  const text = element.textContent;
  element.textContent = '';
  element.setAttribute('aria-label', text);

  const chars = [];
  for (const char of text) {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    span.setAttribute('aria-hidden', 'true');
    element.appendChild(span);
    chars.push(span);
  }

  return chars;
}

/**
 * Split text into individually animatable words
 * @param {HTMLElement} element
 * @returns {HTMLElement[]} Array of word container elements
 */
export function splitWords(element) {
  const text = element.textContent;
  const wordTexts = text.split(/\s+/).filter(Boolean);
  element.textContent = '';
  element.setAttribute('aria-label', text);

  const words = [];
  wordTexts.forEach((word, i) => {
    const wrapper = document.createElement('span');
    wrapper.style.display = 'inline-block';
    wrapper.style.overflow = 'hidden';
    wrapper.style.verticalAlign = 'top';

    const inner = document.createElement('span');
    inner.textContent = word;
    inner.style.display = 'inline-block';
    inner.setAttribute('aria-hidden', 'true');

    wrapper.appendChild(inner);
    element.appendChild(wrapper);

    if (i < wordTexts.length - 1) {
      element.appendChild(document.createTextNode(' '));
    }

    words.push(inner);
  });

  return words;
}

/**
 * Animate chars staggering in from below
 */
export function animateCharsIn(element, options = {}) {
  const chars = splitChars(element);

  return gsap.from(chars, {
    y: options.y ?? '100%',
    opacity: 0,
    duration: options.duration || 0.6,
    stagger: options.stagger || 0.02,
    ease: options.ease || 'power3.out',
    delay: options.delay || 0,
  });
}

/**
 * Animate words sliding up from hidden overflow
 */
export function animateWordsIn(element, options = {}) {
  const words = splitWords(element);

  return gsap.from(words, {
    y: '110%',
    duration: options.duration || 0.8,
    stagger: options.stagger || 0.05,
    ease: options.ease || 'power3.out',
    delay: options.delay || 0,
  });
}

/**
 * Typewriter effect — reveals text character by character
 */
export function typewriterEffect(element, text, options = {}) {
  const speed = options.speed || 30; // ms per character
  let i = 0;
  element.textContent = '';

  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text[i];
        i++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

/**
 * Typewriter effect for multiple lines with delays
 */
export async function typewriterSequence(lines, options = {}) {
  const speed = options.speed || 25;
  const lineDelay = options.lineDelay || 200;
  const onLine = options.onLine; // callback(index, element)

  for (let i = 0; i < lines.length; i++) {
    const { element, text } = lines[i];
    if (onLine) onLine(i, element);

    await typewriterEffect(element, text, { speed });

    if (i < lines.length - 1) {
      await new Promise(r => setTimeout(r, lineDelay));
    }
  }
}
