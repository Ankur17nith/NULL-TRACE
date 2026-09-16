// ============================================================
// NULL//TRACE — Title Reveal Scene (Hack the North Style)
// Bold rounded typography + pastel particle canvas + sparkles
// ============================================================

import { useEffect, useRef, useState } from 'react';
import HTNButton from '../ui/HTNButton';
import Sparkle from '../ui/Sparkle';

function ParticleCanvas({ className }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Warm pastel particle palette (Mint, Lavender, Yellow, Sky Blue)
    const colors = ['rgba(191, 239, 222, ', 'rgba(230, 181, 249, ', 'rgba(251, 228, 150, ', 'rgba(156, 177, 252, '];
    const count = Math.min(70, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 14000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2 + 1,
        colorBase: colors[i % colors.length],
        alpha: Math.random() * 0.4 + 0.15,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw subtle connecting links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorBase}${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw();
    } else {
      draw();
      cancelAnimationFrame(animRef.current);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}

export default function TitleReveal({ isVisible, onEnterSystem }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => setShowContent(true), 150);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  return (
    <div className="title-reveal" aria-label="NULL TRACE title screen">
      <ParticleCanvas className="title-reveal__particles" />

      {/* Playful Floating Sparkles */}
      <Sparkle color="var(--htn-yellow)" size={28} style={{ top: '22%', left: '15%' }} />
      <Sparkle color="var(--htn-purple)" size={22} style={{ top: '35%', right: '18%' }} />
      <Sparkle color="var(--htn-green)" size={32} style={{ bottom: '26%', left: '22%' }} />
      <Sparkle color="var(--htn-pink)" size={20} style={{ bottom: '38%', right: '14%' }} />

      <div className={`title-reveal__content ${showContent ? 'title-reveal__content--visible' : ''}`}>
        <div className="title-reveal__badge-row">
          <span className="tag tag--yellow tag--pixel">INCIDENT #001</span>
          <span className="tag tag--accent">POLYNET THREAT DISPATCH</span>
        </div>

        <h1 className="title-reveal__title">
          <span style={{ color: 'var(--htn-blue)' }}>NULL</span>
          <span style={{ color: 'var(--htn-coral)' }}>//</span>
          <span style={{ color: 'var(--htn-green)' }}>TRACE</span>
        </h1>

        <p className="title-reveal__tagline">
          TRACE THE BREACH. OUTSMART THE SYSTEM.
        </p>

        <div className="title-reveal__cta-wrap">
          <HTNButton variant="coral" size="lg" arrow={true} onClick={onEnterSystem}>
            START INVESTIGATION
          </HTNButton>
        </div>
      </div>

      <div className={`title-reveal__scroll-hint ${showContent ? 'title-reveal__scroll-hint--visible' : ''}`}>
        <span className="title-reveal__scroll-text">SCROLL TO INVESTIGATE INCIDENT</span>
        <span className="title-reveal__scroll-arrow" aria-hidden="true">↓</span>
      </div>
    </div>
  );
}
