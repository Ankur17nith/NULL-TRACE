// ============================================================
// NULL//TRACE — Immersive Navigation (Hack the North Style)
// Numbered pill navigation that transforms on scroll
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HTNButton from '../ui/HTNButton';
import './Nav.css';

const NAV_ITEMS = [
  { num: '01', label: 'INCIDENT', href: '#incident' },
  { num: '02', label: 'NETWORK', href: '#network' },
  { num: '03', label: 'MISSIONS', href: '#missions' },
  { num: '04', label: 'ARCHIVE', href: '/archive', isRoute: true },
  { num: '05', label: 'ACCESS', href: '#system-entry' },
];

export default function Nav({ onEnterSystem, isCompact }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = useCallback((e, item) => {
    e.preventDefault();
    if (item.isRoute) {
      navigate(item.href);
      setMobileOpen(false);
      return;
    }
    const el = document.querySelector(item.href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  }, [navigate]);

  return (
    <>
      <nav
        className={`nav ${scrolled || isCompact ? 'nav--scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="nav__inner">
          {/* Brand / Logo */}
          <a href="#" className="nav__logo" aria-label="NULL TRACE home">
            <span className="nav__logo-null">NULL</span>
            <span className="nav__logo-slash">//</span>
            <span className="nav__logo-trace">TRACE</span>
          </a>

          {/* Desktop Links */}
          <div className="nav__links hide-mobile">
            {NAV_ITEMS.map(item => (
              <a
                key={item.num}
                href={item.href}
                className="nav__link"
                onClick={(e) => handleNavClick(e, item)}
              >
                <span className="nav__link-num">{item.num}</span>
                <span className="nav__link-label">{item.label}</span>
              </a>
            ))}
          </div>

          {/* Enter CTA — Signature HTN 3D Button */}
          <div className="hide-mobile">
            <HTNButton variant="coral" size="sm" arrow={true} onClick={onEnterSystem}>
              ENTER SYSTEM
            </HTNButton>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="nav__hamburger hide-desktop"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span className={`nav__hamburger-line ${mobileOpen ? 'nav__hamburger-line--open' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Fullscreen Takeover Menu */}
      {mobileOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Navigation menu">
          <div className="mobile-menu__content">
            <div className="mobile-menu__logo">
              <span className="nav__logo-null">NULL</span>
              <span className="nav__logo-slash">//</span>
              <span className="nav__logo-trace">TRACE</span>
            </div>

            {NAV_ITEMS.map((item, i) => (
              <a
                key={item.num}
                href={item.href}
                className="mobile-menu__link"
                onClick={(e) => handleNavClick(e, item)}
                style={{ animationDelay: `${0.05 + i * 0.05}s` }}
              >
                <span className="mobile-menu__num">{item.num}</span>
                <span className="mobile-menu__label">{item.label}</span>
              </a>
            ))}

            <div style={{ marginTop: 'var(--space-xl)' }}>
              <HTNButton
                variant="coral"
                size="lg"
                arrow={true}
                onClick={() => {
                  setMobileOpen(false);
                  onEnterSystem?.();
                }}
              >
                ENTER SYSTEM
              </HTNButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
