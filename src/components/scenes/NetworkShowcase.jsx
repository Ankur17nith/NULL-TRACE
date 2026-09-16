// ============================================================
// NULL//TRACE — Network Showcase Scene (Hack the North Style)
// Full-viewport interactive network in HTN pastel palette
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap, ScrollTrigger } from '../../animations/scrollManager';
import Sparkle from '../ui/Sparkle';

const NODES = [
  { id: 'fw-01', label: 'FIREWALL-01', x: 50, y: 25, type: 'firewall', status: 'online', color: 'var(--htn-green)' },
  { id: 'rtr-01', label: 'GATEWAY-RTR', x: 30, y: 46, type: 'router', status: 'online', color: 'var(--htn-blue)' },
  { id: 'rtr-02', label: 'BACKBONE-RTR', x: 70, y: 46, type: 'router', status: 'online', color: 'var(--htn-blue)' },
  { id: 'wks-01', label: 'WKS-ENGINEER', x: 18, y: 70, type: 'workstation', status: 'online', color: 'var(--htn-cream)' },
  { id: 'wks-03', label: 'WKS-03-PIVOT', x: 38, y: 74, type: 'workstation', status: 'suspicious', color: 'var(--htn-yellow)' },
  { id: 'auth-svr', label: 'AUTH-VAULT', x: 55, y: 68, type: 'server', status: 'online', color: 'var(--htn-purple)' },
  { id: 'db-main', label: 'DB-MAIN-EXFIL', x: 76, y: 74, type: 'database', status: 'compromised', color: 'var(--htn-coral)' },
  { id: 'core-svr', label: 'CORE-MATRIX', x: 86, y: 52, type: 'server', status: 'online', color: 'var(--htn-purple)' },
];

const CONNECTIONS = [
  ['fw-01', 'rtr-01'], ['fw-01', 'rtr-02'],
  ['rtr-01', 'wks-01'], ['rtr-01', 'wks-03'], ['rtr-01', 'auth-svr'],
  ['rtr-02', 'auth-svr'], ['rtr-02', 'core-svr'], ['rtr-02', 'db-main'],
  ['wks-03', 'db-main'],
];

const TYPE_SHAPES = {
  firewall: '⬡',
  router: '◈',
  workstation: '▣',
  server: '◆',
  database: '⬢',
};

export default function NetworkShowcase() {
  const sectionRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [nodesVisible, setNodesVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 8,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 8,
    });
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 70%',
      onEnter: () => setNodesVisible(true),
    });

    return () => st.kill();
  }, []);

  return (
    <section
      className="network-showcase scene"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      aria-label="Interactive network topology showcase"
    >
      <Sparkle color="var(--htn-blue)" size={24} style={{ top: '14%', left: '10%' }} />
      <Sparkle color="var(--htn-yellow)" size={28} style={{ top: '20%', right: '8%' }} />

      <div className="scene__inner" style={{ textAlign: 'center' }}>
        <div className="network-showcase__header">
          <span className="tag tag--blue tag--pixel">[02] NETWORK TOPOLOGY</span>
          <h2 className="network-showcase__title">
            THE POLYNET INFRASTRUCTURE
          </h2>
          <p className="network-showcase__subtitle">
            Hover any node to inspect telemetry. One compromised machine threatens the entire cluster.
          </p>
        </div>

        {/* SVG Network Map */}
        <div className="network-showcase__map-wrap">
          <svg
            className="network-showcase__svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Connection Lines */}
            <g className="network-showcase__conns">
              {CONNECTIONS.map(([fromId, toId], i) => {
                const from = NODES.find(n => n.id === fromId);
                const to = NODES.find(n => n.id === toId);
                if (!from || !to) return null;
                const isThreatLine = from.status === 'compromised' || to.status === 'compromised';

                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isThreatLine ? 'var(--htn-coral)' : 'rgba(255, 255, 255, 0.14)'}
                    strokeWidth={isThreatLine ? 0.8 : 0.5}
                    strokeDasharray={isThreatLine ? '2, 1' : 'none'}
                    className={isThreatLine ? 'threat-line-pulse' : ''}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g className="network-showcase__nodes">
              {NODES.map((node, i) => {
                const isHovered = hoveredNode?.id === node.id;
                const isCompromised = node.status === 'compromised';
                const isSuspicious = node.status === 'suspicious';

                return (
                  <g
                    key={node.id}
                    className="network-showcase__node"
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{
                      opacity: nodesVisible ? 1 : 0,
                      transition: `opacity 0.4s ease ${i * 0.06}s`,
                      cursor: 'pointer',
                    }}
                  >
                    {/* Pulsing Aura for compromised nodes */}
                    {(isCompromised || isSuspicious) && (
                      <circle
                        r={isCompromised ? 6.5 : 5.5}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={0.6}
                        opacity={0.5}
                      >
                        <animate
                          attributeName="r"
                          values="4;7;4"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.6;0.1;0.6"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Node Shape Body */}
                    <circle
                      r={isHovered ? 4.5 : 3.8}
                      fill="var(--bg-surface-elevated)"
                      stroke={node.color}
                      strokeWidth={1.2}
                      style={{ transition: 'all 0.15s ease' }}
                    />

                    {/* Type glyph */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={node.color}
                      fontSize="2.2"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {TYPE_SHAPES[node.type]}
                    </text>

                    {/* Label */}
                    <text
                      y={6.5}
                      textAnchor="middle"
                      fill="var(--text-secondary)"
                      fontSize="2"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                      pointerEvents="none"
                    >
                      {node.id.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredNode && (
            <div className="network-showcase__tooltip">
              <div className="tooltip-badge-row">
                <span className="tooltip-title">{hoveredNode.label}</span>
                <span
                  className="tag"
                  style={{
                    borderColor: hoveredNode.color,
                    color: hoveredNode.color,
                    background: `color-mix(in srgb, ${hoveredNode.color} 12%, transparent)`
                  }}
                >
                  {hoveredNode.status.toUpperCase()}
                </span>
              </div>
              <div className="tooltip-details">
                <div>TYPE: {hoveredNode.type.toUpperCase()}</div>
                <div>ID: {hoveredNode.id}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
