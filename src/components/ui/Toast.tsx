'use client';

import React, { useEffect, useState } from 'react';
import { toastStore } from '@/store/toastStore';

export default function Toast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = toastStore.subscribe((msg) => {
      setMessage(msg);
    });
    const handleCustomToast = (e: any) => {
      if (e?.detail) toastStore.show(e.detail);
    };
    window.addEventListener('show-toast', handleCustomToast);
    return () => {
      unsub();
      window.removeEventListener('show-toast', handleCustomToast);
    };
  }, []);

  return (
    <div
      id="toast-container"
      role="status"
      aria-live="polite"
      className={`global-toast ${message ? 'toast-visible' : 'toast-hidden'}`}
    >
      <span className="toast-dot" />
      <span className="toast-text">{message || ''}</span>
      <button
        type="button"
        onClick={() => toastStore.hide()}
        className="toast-dismiss-btn"
        aria-label="Dismiss"
      >
        ✕
      </button>

      <style jsx>{`
        .global-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          z-index: 99999;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: rgba(30, 28, 26, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
          max-width: calc(100vw - 32px);
          width: max-content;
          box-sizing: border-box;
          will-change: transform, opacity;
        }
        .toast-visible {
          opacity: 1;
          pointer-events: auto;
          transform: translate(-50%, 0);
        }
        .toast-hidden {
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%, 20px);
        }
        .toast-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }
        .toast-text {
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 500;
          color: var(--text);
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .toast-dismiss-btn {
          background: transparent;
          border: none;
          color: var(--muted);
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: color 0.2s ease;
          line-height: 1;
        }
        .toast-dismiss-btn:hover {
          color: var(--text);
        }

        @media (max-width: 600px) {
          .global-toast {
            padding: 10px 16px;
            gap: 10px;
          }
          .toast-text {
            font-size: 13px;
            white-space: normal;
          }
        }
      `}</style>
    </div>
  );
}
