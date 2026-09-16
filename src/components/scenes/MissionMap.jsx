// ============================================================
// NULL//TRACE — Mission Map Scene (Hack the North Style)
// Investigation pathway with playful connected pastel nodes
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../../animations/scrollManager';
import { useGameStore } from '../../state/gameStore';
import { useGameEngine } from '../../hooks/useGameEngine';
import Sparkle from '../ui/Sparkle';

const MISSION_COLORS = [
  'var(--htn-green)',
  'var(--htn-blue)',
  'var(--htn-purple)',
  'var(--htn-yellow)',
  'var(--htn-coral)',
];

export default function MissionMap({ onStartMission }) {
  const sectionRef = useRef(null);
  const { missionEngine } = useGameEngine();
  const unlockedMissions = useGameStore(s => s.progress.unlockedMissions);
  const completedMissions = useGameStore(s => s.progress.completedMissions);
  const [visibleNodes, setVisibleNodes] = useState(0);

  const missions = missionEngine.getAllMissions();

  const nodePositions = [
    { x: 12, y: 50 },
    { x: 30, y: 28 },
    { x: 50, y: 56 },
    { x: 70, y: 32 },
    { x: 88, y: 50 },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 70%',
      onEnter: () => {
        let count = 0;
        const interval = setInterval(() => {
          count++;
          setVisibleNodes(count);
          if (count >= missions.length) clearInterval(interval);
        }, 150);
      },
    });

    return () => trigger.kill();
  }, [missions.length]);

  return (
    <section className="mission-map scene" ref={sectionRef} aria-label="Investigation roadmap">
      <Sparkle color="var(--htn-purple)" size={26} style={{ top: '16%', right: '15%' }} />
      <Sparkle color="var(--htn-green)" size={24} style={{ bottom: '18%', left: '10%' }} />

      <div className="scene__inner" style={{ textAlign: 'center' }}>
        <div className="mission-map__header">
          <span className="tag tag--purple tag--pixel">[03] THE OPERATIONS</span>
          <h2 className="mission-map__title">
            INVESTIGATION ROADMAP
          </h2>
          <p className="mission-map__subtitle">
            5 progressive phases of incident response. Follow the attacker’s trail to the core.
          </p>
        </div>

        <div className="mission-map__canvas-wrap">
          <svg className="mission-map__svg" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
            {/* Connection path */}
            <path
              d="M 12 50 C 20 50, 22 28, 30 28 C 38 28, 42 56, 50 56 C 58 56, 62 32, 70 32 C 78 32, 80 50, 88 50"
              fill="none"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />

            {/* Active completed subpath */}
            <path
              d="M 12 50 C 20 50, 22 28, 30 28 C 38 28, 42 56, 50 56 C 58 56, 62 32, 70 32 C 78 32, 80 50, 88 50"
              fill="none"
              stroke="var(--htn-green)"
              strokeWidth="1.2"
              strokeDasharray="200"
              strokeDashoffset={200 - (completedMissions.length / 5) * 200}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />

            {/* Mission Nodes */}
            {missions.map((mission, i) => {
              const pos = nodePositions[i] || { x: 50, y: 50 };
              const isUnlocked = unlockedMissions.includes(mission.id);
              const isCompleted = completedMissions.includes(mission.id);
              const isVisible = i < visibleNodes;
              const color = MISSION_COLORS[i % MISSION_COLORS.length];

              return (
                <g
                  key={mission.id}
                  className={`mission-map__node ${isUnlocked ? 'mission-map__node--unlocked' : ''}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: `translate(${pos.x}px, ${pos.y}px) scale(${isVisible ? 1 : 0.6})`,
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  }}
                  onClick={() => isUnlocked && onStartMission(mission.id)}
                >
                  {/* Outer circle */}
                  <circle
                    r={isCompleted ? 6 : 5}
                    fill="var(--bg-surface-elevated)"
                    stroke={isCompleted ? 'var(--htn-green)' : isUnlocked ? color : 'var(--border-default)'}
                    strokeWidth={isCompleted ? 1.5 : 1}
                  />

                  {/* Inner check or number */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isCompleted ? 'var(--htn-green)' : isUnlocked ? color : 'var(--text-muted)'}
                    fontSize={isCompleted ? '3' : '2.4'}
                    fontWeight="bold"
                    fontFamily="var(--font-display)"
                  >
                    {isCompleted ? '✓' : !isUnlocked ? '🔒' : `0${mission.number}`}
                  </text>

                  {/* Label */}
                  <text
                    y={9}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize="2.2"
                    fontWeight="700"
                    fontFamily="var(--font-display)"
                  >
                    {mission.title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
