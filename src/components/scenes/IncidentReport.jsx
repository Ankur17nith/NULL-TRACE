// ============================================================
// NULL//TRACE — Incident Report Scene (Hack the North Style)
// Editorial incident timeline with pastel cards & tag pills
// ============================================================

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../animations/scrollManager';
import Sparkle from '../ui/Sparkle';

const INCIDENT_DATA = {
  id: 'INC-2026-0317',
  timestamp: '03:17:42 AM',
  severity: 'CRITICAL ESCALATION',
  timeline: [
    { time: '03:12:01', event: 'Unusual login attempt from external IP 203.0.113.42', tag: 'ANOMALY', color: 'var(--htn-yellow)' },
    { time: '03:12:18', event: 'Failed authentication — admin@polynet.internal', tag: 'AUTH FAIL', color: 'var(--htn-yellow)' },
    { time: '03:13:04', event: 'Brute-force credential spray detected on AUTH-SVR', tag: 'BRUTE FORCE', color: 'var(--htn-coral)' },
    { time: '03:14:22', event: '7 failed attempts in 2 minutes — threshold breached', tag: 'THRESHOLD', color: 'var(--htn-coral)' },
    { time: '03:15:09', event: 'Unauthorized session established on Workstation WS-01', tag: 'COMPROMISED', color: 'var(--htn-coral)' },
    { time: '03:15:41', event: 'Lateral routing hop: WS-01 → Core Switch Matrix', tag: 'LATERAL MOVE', color: 'var(--htn-blue)' },
    { time: '03:16:18', event: 'Privilege escalation payload targeting DB-MAIN', tag: 'EXPLOIT', color: 'var(--htn-purple)' },
    { time: '03:17:42', event: 'Data exfiltration initiated — TRACE PROTOCOL ACTIVATED', tag: 'DISPATCH', color: 'var(--htn-green)' },
  ],
};

export default function IncidentReport() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current || !timelineRef.current) return;
    const items = timelineRef.current.querySelectorAll('.incident__card');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(items, { opacity: 0, y: 24 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'bottom 40%',
        scrub: 0.6,
      },
    });

    items.forEach((item, i) => {
      tl.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'power2.out',
      }, i * 0.08);
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === sectionRef.current) st.kill();
      });
    };
  }, []);

  return (
    <section className="incident scene" ref={sectionRef}>
      <Sparkle color="var(--htn-pink)" size={26} style={{ top: '10%', right: '12%' }} />
      <Sparkle color="var(--htn-green)" size={22} style={{ bottom: '15%', left: '8%' }} />

      <div className="scene__inner scene__inner--narrow">
        <div className="incident__header">
          <div className="incident__badge-row">
            <span className="tag tag--yellow tag--pixel">[01] INCIDENT RECORD</span>
            <span className="tag tag--coral">{INCIDENT_DATA.severity}</span>
          </div>

          <h2 className="incident__title">
            THE ANOMALY UNFOLDS
          </h2>

          <p className="incident__subtitle">
            Case ID {INCIDENT_DATA.id} · Intercepted at {INCIDENT_DATA.timestamp}
          </p>
        </div>

        <div className="incident__timeline" ref={timelineRef}>
          {INCIDENT_DATA.timeline.map((entry, i) => (
            <div key={i} className="incident__card">
              <div className="incident__card-top">
                <span className="incident__card-time">{entry.time}</span>
                <span
                  className="incident__card-chip"
                  style={{
                    borderColor: entry.color,
                    color: entry.color,
                    background: `color-mix(in srgb, ${entry.color} 12%, transparent)`,
                  }}
                >
                  {entry.tag}
                </span>
              </div>
              <p className="incident__card-event">{entry.event}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
