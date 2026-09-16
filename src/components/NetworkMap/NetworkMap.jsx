// ============================================================
// NULL//TRACE — NetworkMap Component (Hack the North Design System)
// Playful, interactive SVG network topology with pastel nodes & friendly telemetry
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { useGameEngine } from '../../hooks/useGameEngine';
import './NetworkMap.css';

const STATUS_COLORS = {
  ONLINE: '#BFEFDE',      // HTN Mint
  OFFLINE: '#626282',     // Muted Navy
  LOCKED: '#E6B5F9',      // HTN Lavender
  COMPROMISED: '#F3675A', // HTN Coral
  SUSPICIOUS: '#FBE496',  // HTN Yellow
  TARGET: '#9CB1FC',      // HTN Blue
  DANGER: '#F3675A',      // HTN Coral
};

const STATUS_LABELS = {
  ONLINE: 'Active',
  OFFLINE: 'Dormant',
  LOCKED: 'Encrypted',
  COMPROMISED: 'Breached',
  SUSPICIOUS: 'Anomaly',
  TARGET: 'Objective',
  DANGER: 'Alert',
};

const NODE_SHAPES = {
  workstation: { size: 18, shape: 'rect', label: 'WS' },
  router: { size: 17, shape: 'diamond', label: 'RTR' },
  server: { size: 20, shape: 'rect', label: 'SRV' },
  core: { size: 24, shape: 'circle', label: 'CORE' },
  firewall: { size: 18, shape: 'hexagon', label: 'FW' },
  database: { size: 19, shape: 'cylinder', label: 'DB' },
  external: { size: 16, shape: 'triangle', label: 'EXT' },
};

export default function NetworkMap({ onNodeClick, routingMode = false, selectedPath = [] }) {
  const { networkEngine, sound } = useGameEngine();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [pingNode, setPingNode] = useState(null);

  const nodes = networkEngine.getNodes();
  const connections = networkEngine.getConnections();

  const svgWidth = 800;
  const svgHeight = 600;

  const handleNodeClick = useCallback((node) => {
    sound.playPacket();
    setPingNode(node.id);
    setTimeout(() => setPingNode(null), 800);
    onNodeClick?.(node);
  }, [onNodeClick, sound]);

  const handleNodeHover = useCallback((node, e) => {
    setHoveredNode(node);
    if (e) {
      const rect = e.currentTarget.closest('.network-map').getBoundingClientRect();
      setTooltipPos({
        x: Math.min(rect.width - 210, Math.max(10, e.clientX - rect.left + 15)),
        y: Math.min(rect.height - 140, Math.max(10, e.clientY - rect.top - 20)),
      });
    }
  }, []);

  const isOnPath = useCallback((nodeId) => {
    return selectedPath.includes(nodeId);
  }, [selectedPath]);

  const isConnectionOnPath = useCallback((from, to) => {
    for (let i = 0; i < selectedPath.length - 1; i++) {
      if ((selectedPath[i] === from && selectedPath[i + 1] === to) ||
          (selectedPath[i] === to && selectedPath[i + 1] === from)) {
        return true;
      }
    }
    return false;
  }, [selectedPath]);

  // Traffic packets along connections
  const packetConnections = useMemo(() => {
    return connections.slice(0, 10).map((conn, i) => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return null;
      return {
        id: `pkt-${i}`,
        path: `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`,
        dur: `${2.8 + (i % 3) * 0.8}s`,
        isDanger: conn.congested || fromNode.status === 'COMPROMISED' || toNode.status === 'COMPROMISED'
      };
    }).filter(Boolean);
  }, [connections, nodes]);

  const renderNode = (node) => {
    const color = STATUS_COLORS[node.status] || STATUS_COLORS.ONLINE;
    const config = NODE_SHAPES[node.type] || NODE_SHAPES.workstation;
    const s = config.size;
    const highlighted = isOnPath(node.id);
    const isPinged = pingNode === node.id;
    const isThreat = node.status === 'COMPROMISED' || node.status === 'SUSPICIOUS';

    return (
      <g
        key={node.id}
        className={`network-node ${isThreat ? 'network-node--threat' : ''} ${highlighted ? 'network-node--selected' : ''}`}
        transform={`translate(${node.x}, ${node.y})`}
        onClick={() => handleNodeClick(node)}
        onMouseEnter={(e) => handleNodeHover(node, e)}
        onMouseLeave={() => setHoveredNode(null)}
        onFocus={(e) => handleNodeHover(node, e)}
        onBlur={() => setHoveredNode(null)}
        role="button"
        tabIndex={0}
        aria-label={`${node.label || node.id} — Status: ${STATUS_LABELS[node.status] || node.status}`}
        onKeyDown={(e) => { if (e.key === 'Enter') handleNodeClick(node); }}
      >
        {/* Soft threat beacon */}
        {isThreat && (
          <circle
            r={s + 12}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="10s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Click tactile ping effect */}
        {isPinged && (
          <circle r={s} fill="none" stroke={color} strokeWidth="2.5" opacity="0.9">
            <animate attributeName="r" values={`${s};${s * 2.5}`} dur="0.5s" fill="freeze" />
            <animate attributeName="opacity" values="0.9;0" dur="0.5s" fill="freeze" />
          </circle>
        )}

        {/* Node shapes with playful rounded geometry */}
        {config.shape === 'rect' && (
          <rect
            className="node-body"
            x={-s} y={-s * 0.75}
            width={s * 2} height={s * 1.5}
            rx={6}
            fill={highlighted ? 'rgba(156, 177, 252, 0.3)' : 'var(--bg-surface-elevated)'}
            stroke={color}
            strokeWidth={highlighted ? 3 : 2}
            opacity={node.status === 'OFFLINE' ? 0.4 : 1}
          />
        )}
        {config.shape === 'circle' && (
          <circle
            className="node-body"
            r={s}
            fill={highlighted ? 'rgba(191, 239, 222, 0.3)' : 'var(--bg-surface-elevated)'}
            stroke={color}
            strokeWidth={highlighted ? 3.5 : 2.5}
          />
        )}
        {config.shape === 'diamond' && (
          <polygon
            className="node-body"
            points={`0,${-s} ${s},0 0,${s} ${-s},0`}
            fill={highlighted ? 'rgba(251, 228, 150, 0.3)' : 'var(--bg-surface-elevated)'}
            stroke={color}
            strokeWidth={highlighted ? 3 : 2}
          />
        )}
        {config.shape === 'hexagon' && (
          <polygon
            className="node-body"
            points={`${-s},0 ${-s/2},${-s*0.86} ${s/2},${-s*0.86} ${s},0 ${s/2},${s*0.86} ${-s/2},${s*0.86}`}
            fill={highlighted ? 'rgba(230, 181, 249, 0.3)' : 'var(--bg-surface-elevated)'}
            stroke={color}
            strokeWidth={highlighted ? 3 : 2}
          />
        )}
        {config.shape === 'triangle' && (
          <polygon
            className="node-body"
            points={`0,${-s} ${s},${s*0.7} ${-s},${s*0.7}`}
            fill={highlighted ? 'rgba(156, 177, 252, 0.3)' : 'var(--bg-surface-elevated)'}
            stroke={color}
            strokeWidth={highlighted ? 3 : 2}
          />
        )}
        {config.shape === 'cylinder' && (
          <g>
            <rect
              className="node-body"
              x={-s} y={-s * 0.6}
              width={s * 2} height={s * 1.3}
              rx={5}
              fill={highlighted ? 'rgba(191, 239, 222, 0.3)' : 'var(--bg-surface-elevated)'}
              stroke={color}
              strokeWidth={highlighted ? 3 : 2}
            />
            <ellipse
              cx={0} cy={-s * 0.6}
              rx={s} ry={4}
              fill="var(--bg-surface)"
              stroke={color}
              strokeWidth={1.5}
            />
          </g>
        )}

        {/* Node role indicator */}
        <text
          className="node-icon-text"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="9"
          fontWeight="800"
          pointerEvents="none"
        >
          {config.label}
        </text>

        {/* Status dot pill */}
        <circle
          cx={s - 2} cy={-s * 0.5 - 2}
          r={3.5}
          fill={color}
        />

        {/* Node Label */}
        <text className="node-label" dy={s + 16}>{node.id}</text>
      </g>
    );
  };

  const renderConnection = (conn, i) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return null;

    const onPath = isConnectionOnPath(conn.from, conn.to);
    const isThreatConn = fromNode.status === 'COMPROMISED' || toNode.status === 'COMPROMISED';

    const className = `network-connection ${
      onPath ? 'network-connection--active' :
      isThreatConn ? 'network-connection--threat' :
      conn.congested ? 'network-connection--congested' : ''
    }`;

    return (
      <line
        key={`conn-${i}`}
        className={className}
        x1={fromNode.x} y1={fromNode.y}
        x2={toNode.x} y2={toNode.y}
      />
    );
  };

  return (
    <div className="network-map">
      <div className="network-map__header">
        <div className="network-map__header-title">
          <span className="network-map__pulse-dot" />
          <span>TOPOLOGY MAP // POLYNET MESH</span>
        </div>
        <div className="network-map__header-stats">
          <span className="htn-mesh-stat">{nodes.length} NODES</span>
          <span className="htn-mesh-dot">·</span>
          <span className="htn-mesh-stat">{connections.length} PATHS</span>
          {routingMode && <span className="network-map__mode-badge">ROUTING ACTIVE</span>}
        </div>
      </div>

      <svg
        className="network-map__svg"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="htn-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.5" fill="rgba(230, 181, 249, 0.15)" />
          </pattern>
        </defs>

        {/* Soft Grid Background */}
        <rect width="100%" height="100%" fill="url(#htn-grid-pattern)" />

        {/* Connections */}
        <g className="network-connections">{connections.map(renderConnection)}</g>

        {/* Animated Traffic Packets along connections */}
        <g className="network-packets" pointerEvents="none">
          {packetConnections.map(pkt => (
            <g key={pkt.id}>
              <path id={pkt.id} d={pkt.path} fill="none" stroke="none" />
              <circle r="3" fill={pkt.isDanger ? '#F3675A' : '#BFEFDE'} opacity="0.9">
                <animateMotion
                  dur={pkt.dur}
                  repeatCount="indefinite"
                  path={pkt.path}
                />
              </circle>
            </g>
          ))}
        </g>

        {/* Route path overlay (e.g. Mission 02 Routing) */}
        {selectedPath.length > 1 && (
          <polyline
            className="route-path"
            points={selectedPath.map(id => {
              const n = nodes.find(nd => nd.id === id);
              return n ? `${n.x},${n.y}` : '';
            }).join(' ')}
          />
        )}

        {/* Nodes */}
        <g className="network-nodes">{nodes.map(renderNode)}</g>
      </svg>

      {/* Interactive Hack-the-North Style Tooltip */}
      {hoveredNode && (
        <div
          className="node-tooltip"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="node-tooltip__header">
            <span className="node-tooltip__title">{hoveredNode.label || hoveredNode.id}</span>
            <span
              className="node-tooltip__badge"
              style={{
                borderColor: STATUS_COLORS[hoveredNode.status],
                color: STATUS_COLORS[hoveredNode.status],
                backgroundColor: `${STATUS_COLORS[hoveredNode.status]}18`
              }}
            >
              {STATUS_LABELS[hoveredNode.status] || hoveredNode.status}
            </span>
          </div>
          <div className="node-tooltip__details">
            <div><span className="node-tooltip__key">IP ADDR</span> {hoveredNode.ip || '10.0.X.X'}</div>
            <div><span className="node-tooltip__key">TYPE</span> {hoveredNode.type?.toUpperCase()}</div>
            <div><span className="node-tooltip__key">ROLE</span> {hoveredNode.description || 'Infrastructure node'}</div>
          </div>
          <div className="node-tooltip__action">
            {routingMode ? 'TAP TO ROUTE →' : 'TAP TO INSPECT →'}
          </div>
        </div>
      )}
    </div>
  );
}
