'use client';

import React, { useEffect, useRef } from 'react';
import { CaseStudyData } from '@/data/caseStudiesData';
import { scrollManager } from '@/store/scrollStore';

interface CaseStudyReaderModalProps {
  study: CaseStudyData | null;
  onClose: () => void;
}

export default function CaseStudyReaderModal({
  study,
  onClose,
}: CaseStudyReaderModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!study) return;

    // Lock page scroll in Lenis and body
    scrollManager.lenisInstance?.stop();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Focus Trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl?.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      scrollManager.lenisInstance?.start();
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [study, onClose]);

  if (!study) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-reader-title"
      className="reader-overlay"
    >
      {/* Sticky top bar with kicker & close button */}
      <div className="reader-header">
        <div className="reader-kicker">{study.kicker}</div>
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="reader-close-btn glass-fake"
          aria-label="Close reader overlay"
        >
          <span>✕ Close</span>
          <span className="esc-hint">[Esc]</span>
        </button>
      </div>

      {/* Reader Content Body */}
      <div className="reader-container">
        <div className="reader-hero-block">
          <h1 id="case-reader-title" className="reader-main-title">
            {study.title}
          </h1>
          <div className="reader-meta">
            <span className="reader-role">{study.role}</span>
            <span className="reader-dot">·</span>
            <span className="reader-client">{study.client}</span>
          </div>
        </div>

        {/* Hero Image if available */}
        {study.heroImage && (
          <div className="reader-media-frame glass-fake">
            <img
              src={study.heroImage}
              alt={study.title}
              className="reader-image"
            />
          </div>
        )}

        {/* 5 Parts */}
        <div className="reader-sections-list">
          {/* Part 1: Headline result */}
          <div className="reader-section-item">
            <h3 className="reader-part-heading">Headline result</h3>
            <p className="reader-part-text">{study.sections.headlineResult}</p>
          </div>

          {/* Part 2: Brief & baseline */}
          <div className="reader-section-item">
            <h3 className="reader-part-heading">Brief & baseline</h3>
            <div className="reader-part-text-multi">
              {study.sections.brief.split('\n\n').map((para, i) => (
                <p key={i} className="reader-part-text">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Part 3: Insight & idea */}
          <div className="reader-section-item">
            <h3 className="reader-part-heading">Insight & idea</h3>
            <p className="reader-part-text">{study.sections.insight}</p>
          </div>

          {/* Part 4: Execution & distribution */}
          <div className="reader-section-item">
            <h3 className="reader-part-heading">Execution & distribution</h3>
            <p className="reader-part-text">{study.sections.execution}</p>
          </div>

          {/* Part 5: Results & learning */}
          <div className="reader-section-item">
            <h3 className="reader-part-heading">Results & learning</h3>
            <div className="reader-part-text-multi">
              {study.sections.results.split('\n\n').map((block, i) => (
                <div key={i} className="reader-part-text">
                  {block.split('\n').map((line, j) => (
                    <div key={j} style={{ margin: '0.35rem 0' }}>
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .reader-overlay {
          position: fixed;
          inset: 0;
          z-index: 100000;
          background-color: var(--bg);
          color: var(--text);
          overflow-y: auto;
          overflow-x: hidden;
          padding: 2rem 1.5rem 6rem;
          box-sizing: border-box;
          animation: modalFadeIn 0.25s ease-out;
        }
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .reader-header {
          position: sticky;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 960px;
          margin: 0 auto 2.5rem;
          padding: 1rem 0;
          background: var(--bg);
          z-index: 10;
        }
        .reader-kicker {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .reader-close-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: var(--text);
          padding: 0.5rem 1.1rem;
          border-radius: 9999px;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .reader-close-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
        .esc-hint {
          font-size: 11px;
          color: var(--muted);
        }
        .reader-container {
          max-width: 860px;
          margin: 0 auto;
        }
        .reader-hero-block {
          margin-bottom: 2.5rem;
        }
        .reader-main-title {
          font-family: var(--font-main);
          font-size: clamp(32px, 4.5vw, 48px);
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: var(--text);
          margin-bottom: 1rem;
        }
        .reader-meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-main);
          font-size: 16px;
          color: var(--muted);
          flex-wrap: wrap;
        }
        .reader-dot {
          color: rgba(255, 255, 255, 0.2);
        }
        .reader-media-frame {
          width: 100%;
          height: 380px;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 3.5rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .reader-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .reader-sections-list {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }
        .reader-section-item {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 2rem;
        }
        .reader-part-heading {
          font-family: var(--font-main);
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--text);
        }
        .reader-part-text {
          font-family: var(--font-main);
          font-size: 17px;
          line-height: 1.65;
          color: #c4beb4;
          font-weight: 400;
        }
        .reader-part-text-multi {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .reader-overlay {
            padding: 1.5rem 1.25rem 5rem;
          }
          .reader-media-frame {
            height: 240px;
            margin-bottom: 2.5rem;
          }
          .reader-part-heading {
            font-size: 19px;
          }
          .reader-part-text {
            font-size: 15.5px;
          }
        }
      `}</style>
    </div>
  );
}
