'use client';

import React, { useEffect, useState, useRef } from 'react';
import { attentionStore } from '@/store/attentionStore';
import { openingStore } from '@/store/openingStore';
import { scrollManager } from '@/store/scrollStore';

export default function ExitStopOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const msgBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    if (!isPointerFine) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        // Condition checks
        const hasSeenOpening = openingStore.isSeen() || openingStore.getStep() === 'completed';
        const hasStayed20s = attentionStore.getSeconds() >= 20;
        const noModal = !document.querySelector('.reader-modal-backdrop');
        const noMsgSent = !sessionStorage.getItem('attention_lab_message_sent');
        const notShownYet = !sessionStorage.getItem('attention_lab_exit_stop_shown');

        if (hasSeenOpening && hasStayed20s && noModal && noMsgSent && notShownYet) {
          sessionStorage.setItem('attention_lab_exit_stop_shown', 'true');
          setIsOpen(true);
        }
      }
    };

    const handleTrigger = () => setIsOpen(true);
    window.addEventListener('trigger-exit-stop', handleTrigger);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('trigger-exit-stop', handleTrigger);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Focus trap & Esc close handler
  useEffect(() => {
    if (!isOpen) return;

    // Lock scroll
    scrollManager.lenisInstance?.stop();
    document.body.style.overflow = 'hidden';

    // Focus first button
    setTimeout(() => {
      msgBtnRef.current?.focus({ preventScroll: true });
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'Tab') {
        const focusables = [msgBtnRef.current, closeBtnRef.current].filter(Boolean) as HTMLElement[];
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      scrollManager.lenisInstance?.start();
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMessageMe = () => {
    setIsOpen(false);
    setTimeout(() => {
      if (scrollManager.lenisInstance) {
        scrollManager.lenisInstance.scrollTo('#message');
      } else {
        document.getElementById('message')?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Exit Confirmation"
      className="exit-stop-overlay"
    >
      <div className="exit-stop-content">
        <h1 className="exit-stop-heading">
          STOP<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p className="exit-stop-subline">
          Leaving without a message? Someone else won't.
        </p>
        <div className="exit-stop-actions">
          <button
            ref={msgBtnRef}
            onClick={handleMessageMe}
            className="btn-accent exit-btn"
          >
            Message me
          </button>
          <button
            ref={closeBtnRef}
            onClick={() => setIsOpen(false)}
            className="btn-glass glass-fake exit-btn"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .exit-stop-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: exitFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          padding: 24px;
          box-sizing: border-box;
        }
        @keyframes exitFadeIn {
          from {
            opacity: 0;
            transform: scale(1.02);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .exit-stop-content {
          max-width: 680px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .exit-stop-heading {
          font-family: var(--font-main);
          font-size: clamp(64px, 12vw, 140px);
          font-weight: 800;
          letter-spacing: -0.05em;
          line-height: 0.95;
          color: var(--text);
          margin: 0;
        }
        .exit-stop-subline {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(20px, 3.5vw, 28px);
          color: var(--muted);
          line-height: 1.35;
          margin: 0;
        }
        .exit-stop-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
        }
        .exit-btn {
          min-width: 140px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 600;
          border-radius: 999px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
