// ============================================================
// NULL//TRACE — HTNButton Component
// Reusable 3D tactile button derived from Hack the North design system
// ============================================================

import { soundEngine } from '../../game/engine/SoundEngine';
import './HTNButton.css';

export default function HTNButton({
  children,
  variant = 'coral', // coral | mint | lavender | blue | yellow | secondary | ghost
  size = 'md',        // sm | md | lg
  arrow = false,      // boolean or 'right' | 'left'
  pill = false,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  ...props
}) {
  const handleClick = (e) => {
    if (disabled) return;
    soundEngine.playKeypress();
    onClick?.(e);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`htn-btn htn-btn--${variant} htn-btn--${size} ${pill ? 'htn-btn--pill' : ''} ${className}`}
      {...props}
    >
      <span className="htn-btn__label">{children}</span>
      {arrow && (
        <span className="htn-btn__arrow" aria-hidden="true">
          →
        </span>
      )}
    </button>
  );
}
