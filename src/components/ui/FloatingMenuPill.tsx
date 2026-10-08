'use client';

import React, { useEffect, useRef, useState } from 'react';
import profileData from '@/../content/profile.json';
import { attentionStore } from '@/store/attentionStore';
import { scrollManager } from '@/store/scrollStore';
import { perfStore } from '@/store/perfStore';

export default function FloatingMenuPill() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [isDesktop, setIsDesktop] = useState(true);
  const [isGlassBlur, setIsGlassBlur] = useState(perfStore.getSettings().glassBlur);
  const timerTextRef = useRef<HTMLSpanElement>(null);

  const name = profileData.name || 'Jay Rajput';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    const unsubPerf = perfStore.subscribe((s) => setIsGlassBlur(s.glassBlur));

    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkSize();
    window.addEventListener('resize', checkSize);

    // 1. Hero Observer to show/hide pill
    const heroEl = document.getElementById('hero');
    let heroObserver: IntersectionObserver | null = null;
    if (heroEl) {
      heroObserver = new IntersectionObserver(
        ([entry]) => {
          // Visible when hero is mostly out of view
          setIsVisible(!entry.isIntersecting);
        },
        { threshold: 0.15 }
      );
      heroObserver.observe(heroEl);
    }

    // 2. Section in view detection
    const sections = ['work', 'range', 'about', 'message'];
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -55% 0px' }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    // 3. Attention Timer Subscription (Direct DOM update - NO React state)
    const unsubTimer = attentionStore.subscribeTick((sec, formatted) => {
      if (timerTextRef.current) {
        if (window.innerWidth >= 768) {
          timerTextRef.current.textContent = `${formatted} on this page`;
        } else {
          timerTextRef.current.textContent = formatted;
        }
      }
    });

    return () => {
      unsubPerf();
      window.removeEventListener('resize', checkSize);
      heroObserver?.disconnect();
      sectionObserver.disconnect();
      unsubTimer();
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (scrollManager.lenisInstance) {
      scrollManager.lenisInstance.scrollTo(`#${targetId}`);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      id="floating-menu-pill"
      aria-label="Main Navigation"
      className={`floating-pill-nav ${isDesktop ? (isGlassBlur ? 'glass-real' : 'glass-fake') : 'mobile-pill-bg'} ${
        isVisible ? 'pill-visible' : 'pill-hidden'
      }`}
    >
      {/* 1. Profile Initials Circle */}
      <a
        href="#hero"
        onClick={(e) => handleNavClick(e, 'hero')}
        className="initials-circle"
        title="Scroll to top"
        aria-label="Home"
      >
        {initials}
      </a>

      {/* 2. Desktop Section Links */}
      {isDesktop && (
        <div className="nav-links-group">
          <a
            href="#work"
            onClick={(e) => handleNavClick(e, 'work')}
            className={`nav-link ${activeSection === 'work' ? 'active' : ''}`}
          >
            Work
          </a>
          <a
            href="#range"
            onClick={(e) => handleNavClick(e, 'range')}
            className={`nav-link ${activeSection === 'range' ? 'active' : ''}`}
          >
            Range
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, 'about')}
            className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
          >
            About
          </a>
        </div>
      )}

      {/* 3. Attention Timer Chip */}
      <div className="attention-timer-chip" title="Time spent on this page">
        <span className="timer-accent-dot" />
        <span ref={timerTextRef} className="timer-text-display">
          0:00 on this page
        </span>
      </div>

      {/* 4. "Message me" Action Button */}
      <a
        href="#message"
        onClick={(e) => handleNavClick(e, 'message')}
        className="menu-msg-btn"
      >
        Message me
      </a>

      <style jsx>{`
        .floating-pill-nav {
          position: fixed;
          top: 24px;
          left: 50%;
          z-index: 90;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 6px 8px;
          border-radius: 999px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
          will-change: transform, opacity;
        }
        .pill-visible {
          opacity: 1;
          pointer-events: auto;
          transform: translate3d(-50%, 0, 0);
        }
        .pill-hidden {
          opacity: 0;
          pointer-events: none;
          transform: translate3d(-50%, -24px, 0);
        }
        .initials-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--text);
          color: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-main);
          font-weight: 700;
          font-size: 15px;
          letter-spacing: -0.02em;
          text-decoration: none;
          flex-shrink: 0;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .initials-circle:hover {
          transform: scale(1.05);
        }
        .nav-links-group {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 0 4px;
        }
        .nav-link {
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 500;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          height: 44px;
        }
        .nav-link:hover {
          color: var(--text);
        }
        .nav-link.active {
          color: var(--text);
          font-weight: 600;
        }
        .attention-timer-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          height: 44px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 999px;
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--muted);
          font-variant-numeric: tabular-nums;
          user-select: none;
        }
        .timer-accent-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          display: inline-block;
          animation: dotPulse 2s infinite ease-in-out;
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        .timer-text-display {
          font-weight: 500;
        }
        .menu-msg-btn {
          height: 44px;
          padding: 0 20px;
          border-radius: 999px;
          background: var(--accent);
          color: var(--bg);
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, opacity 0.2s ease;
          flex-shrink: 0;
        }
        .menu-msg-btn:hover {
          opacity: 0.92;
          transform: scale(1.02);
        }

        @media (max-width: 767px) {
          .floating-pill-nav {
            left: 24px;
            right: 24px;
            width: calc(100% - 48px);
            max-width: none;
            justify-content: space-between;
            gap: 8px;
            padding: 6px;
            transform: translate3d(0, 0, 0);
          }
          .mobile-pill-bg {
            background: rgba(30, 28, 26, 0.92) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border: 1px solid rgba(255, 255, 255, 0.12);
          }
          .pill-visible {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          .pill-hidden {
            opacity: 0;
            transform: translate3d(0, -24px, 0);
          }
          .attention-timer-chip {
            padding: 0 10px;
            font-size: 12px;
          }
          .menu-msg-btn {
            padding: 0 14px;
            font-size: 13px;
          }
        }
      `}</style>
    </nav>
  );
}
