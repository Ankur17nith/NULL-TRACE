// ============================================================
// NULL//TRACE — Sparkle Component
// Playful animated SVG star sparkles inspired by Hack the North
// ============================================================

import './Sparkle.css';

export default function Sparkle({
  color = '#FBE496', // yellow, lavender, mint, pink
  size = 24,
  style = {},
  className = '',
}) {
  return (
    <div
      className={`htn-sparkle ${className}`}
      style={{
        width: size,
        height: size,
        color,
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="htn-sparkle__svg"
      >
        <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
      </svg>
    </div>
  );
}
