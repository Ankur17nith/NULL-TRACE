// ============================================================
// NULL//TRACE — Scroll Manager
// GSAP ScrollTrigger orchestration layer
// ============================================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Check for reduced motion preference
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Initialize ScrollTrigger defaults
 */
export function initScrollManager() {
  ScrollTrigger.defaults({
    toggleActions: 'play none none reverse',
  });

  // Refresh on resize
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
}

/**
 * Create a pinned scene section
 */
export function createPinnedScene(trigger, options = {}) {
  if (prefersReducedMotion()) return null;

  return ScrollTrigger.create({
    trigger,
    start: options.start || 'top top',
    end: options.end || '+=100%',
    pin: true,
    pinSpacing: options.pinSpacing !== false,
    scrub: options.scrub || false,
    onEnter: options.onEnter,
    onLeave: options.onLeave,
    onEnterBack: options.onEnterBack,
    onLeaveBack: options.onLeaveBack,
  });
}

/**
 * Create a scroll-linked timeline
 */
export function createScrollTimeline(trigger, options = {}) {
  if (prefersReducedMotion()) return gsap.timeline();

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: options.start || 'top 80%',
      end: options.end || 'bottom 20%',
      scrub: options.scrub ?? true,
      toggleActions: options.toggleActions || 'play none none reverse',
      ...options.scrollTrigger,
    },
  });

  return tl;
}

/**
 * Fade-in elements on scroll
 */
export function scrollFadeIn(elements, options = {}) {
  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return;
  }

  gsap.from(elements, {
    y: options.y ?? 40,
    opacity: 0,
    duration: options.duration || 0.8,
    stagger: options.stagger || 0.1,
    ease: options.ease || 'power3.out',
    scrollTrigger: {
      trigger: options.trigger || elements,
      start: options.start || 'top 85%',
      toggleActions: 'play none none reverse',
    },
  });
}

/**
 * Stagger reveal children
 */
export function scrollStaggerReveal(container, childSelector, options = {}) {
  if (prefersReducedMotion()) {
    gsap.set(container.querySelectorAll(childSelector), { opacity: 1, y: 0 });
    return;
  }

  gsap.from(container.querySelectorAll(childSelector), {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: options.stagger || 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: container,
      start: 'top 80%',
    },
  });
}

/**
 * Create a text reveal animation
 */
export function scrollTextReveal(element, options = {}) {
  if (prefersReducedMotion()) {
    element.style.opacity = '1';
    element.style.transform = 'none';
    return;
  }

  gsap.from(element, {
    y: 60,
    opacity: 0,
    duration: options.duration || 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: options.start || 'top 85%',
    },
  });
}

/**
 * Cleanup all ScrollTriggers
 */
export function destroyScrollManager() {
  ScrollTrigger.getAll().forEach(st => st.kill());
}

export { gsap, ScrollTrigger };
