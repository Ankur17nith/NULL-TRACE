// ============================================================
// NULL//TRACE — Transition Presets
// Page and scene transition animations
// ============================================================

import { gsap } from 'gsap';

/**
 * System boot sequence — types lines onto screen
 * @param {HTMLElement[]} lineElements
 * @param {Object} options
 */
export function bootSequence(lineElements, options = {}) {
  const tl = gsap.timeline({ delay: options.delay || 0.5 });

  lineElements.forEach((el, i) => {
    tl.fromTo(el,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.15, ease: 'power2.out' },
      i * 0.12
    );
  });

  return tl;
}

/**
 * Title reveal — dramatic scale-in with character stagger
 * @param {HTMLElement} titleEl
 * @param {HTMLElement} subtitleEl
 */
export function titleReveal(titleEl, subtitleEl, options = {}) {
  const tl = gsap.timeline({ delay: options.delay || 0 });

  // Title: scale from slightly larger, fade in
  tl.from(titleEl, {
    scale: 1.1,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
  });

  // Subtitle: slide up
  if (subtitleEl) {
    tl.from(subtitleEl, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.4');
  }

  return tl;
}

/**
 * System access transition — zoom into the game
 * @param {HTMLElement} container - the landing container to zoom out of
 * @param {Function} onComplete
 */
export function systemAccessTransition(container, onComplete) {
  const tl = gsap.timeline({
    onComplete,
  });

  // Flash
  tl.to(container, {
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    duration: 0.1,
  });

  // Zoom & fade
  tl.to(container, {
    scale: 1.05,
    opacity: 0,
    filter: 'blur(4px)',
    duration: 0.6,
    ease: 'power2.in',
  });

  return tl;
}

/**
 * Network node entrance — nodes pop in from center
 * @param {SVGElement[]} nodes
 */
export function networkReveal(nodes, options = {}) {
  return gsap.from(nodes, {
    scale: 0,
    opacity: 0,
    duration: 0.5,
    stagger: {
      each: 0.06,
      from: 'center',
    },
    ease: 'back.out(1.7)',
    delay: options.delay || 0,
  });
}

/**
 * Results reveal sequence — step by step with dramatic pauses
 * @param {Object[]} steps - [{element, animation}]
 */
export function resultsReveal(steps, options = {}) {
  const tl = gsap.timeline({ delay: options.delay || 0.3 });

  steps.forEach((step, i) => {
    tl.from(step.element, {
      y: 20,
      opacity: 0,
      scale: step.scale || 1,
      duration: step.duration || 0.6,
      ease: 'power3.out',
    }, i === 0 ? 0 : `+=${step.pause || 0.4}`);
  });

  return tl;
}

/**
 * Glitch flash effect on an element
 */
export function glitchFlash(element, options = {}) {
  const tl = gsap.timeline();

  tl.to(element, {
    x: -3,
    skewX: 2,
    duration: 0.05,
  })
  .to(element, {
    x: 3,
    skewX: -2,
    duration: 0.05,
  })
  .to(element, {
    x: -1,
    skewX: 1,
    duration: 0.05,
  })
  .to(element, {
    x: 0,
    skewX: 0,
    duration: 0.1,
  });

  return tl;
}
