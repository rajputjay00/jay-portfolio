'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import hooksData from '@/../content/hooks.json';
import { perfStore } from '@/store/perfStore';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const DEFAULT_BRAND = 'a chai brand';

const INITIAL_HOOKS = [
  (hooksData?.templates?.[0] || '').replace(/\{brand\}/g, () => DEFAULT_BRAND),
  (hooksData?.templates?.[1] || '').replace(/\{brand\}/g, () => DEFAULT_BRAND),
  (hooksData?.templates?.[2] || '').replace(/\{brand\}/g, () => DEFAULT_BRAND),
];

export default function HookMachineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [isGlassBlur, setIsGlassBlur] = useState(perfStore.getSettings().glassBlur);
  const [isDesktop, setIsDesktop] = useState(true);

  const [hooks, setHooks] = useState<string[]>(INITIAL_HOOKS);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const lastIndicesRef = useRef<number[]>([0, 1, 2]);

  useEffect(() => {
    const unsub = perfStore.subscribe((s) => setIsGlassBlur(s.glassBlur));
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && sectionRef.current) {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.from('.hooks-title-reveal', {
              y: '100%',
              duration: 0.7,
              ease: 'power3.out',
            });
            gsap.from('.hook-card-item', {
              y: 20,
              opacity: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power2.out',
            });
          },
        });
      }, sectionRef);

      return () => {
        unsub();
        window.removeEventListener('resize', checkDesktop);
        ctx.revert();
      };
    }

    return () => {
      unsub();
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  const handleMakeHooks = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawVal = inputRef.current?.value || '';
    const trimmed = rawVal.trim().slice(0, 40);
    const brand = trimmed.length > 0 ? trimmed : DEFAULT_BRAND;

    const templates = hooksData?.templates || [];
    const n = templates.length;
    if (n >= 3) {
      let chosenIndices: number[] = [];
      const prevKey = [...lastIndicesRef.current].sort().join(',');

      for (let attempts = 0; attempts < 50; attempts++) {
        const pool = Array.from({ length: n }, (_, i) => i);
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const candidate = pool.slice(0, 3);
        const candKey = [...candidate].sort().join(',');
        if (candKey !== prevKey || attempts === 49) {
          chosenIndices = candidate;
          break;
        }
      }

      lastIndicesRef.current = chosenIndices;
      const newHooks = chosenIndices.map((idx) => templates[idx].replace(/\{brand\}/g, () => brand));
      setHooks(newHooks);
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && cardsContainerRef.current) {
      gsap.fromTo(
        cardsContainerRef.current.querySelectorAll('.hook-card-item'),
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  };

  const handleCopy = (text: string, index: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex((curr) => (curr === index ? null : curr));
    }, 1500);
  };

  return (
    <section
      id="hooks"
      ref={sectionRef}
      className="hooks-section"
      style={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Glows */}
      <div
        className="ambient-glow drift-1"
        style={{
          top: '15%',
          right: '-5%',
          width: '550px',
          height: '550px',
        }}
      />
      <div
        className="ambient-glow drift-2"
        style={{
          bottom: '10%',
          left: '-10%',
          width: '500px',
          height: '500px',
        }}
      />

      <div className="section-container">
        <div className="hooks-grid">
          {/* Left Column: Title, Subtitle, Input Pill */}
          <div className="hooks-left-col">
            <div className="title-mask-wrapper">
              <h2 className="section-title hooks-title-reveal">Hook machine</h2>
            </div>
            <p className="hooks-subtitle">
              Type a brand. Get three reasons to stop scrolling.
            </p>

            <form onSubmit={handleMakeHooks} className="hooks-form">
              <div className={`hooks-input-pill ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}>
                <label htmlFor="brand-input" className="sr-only">
                  Brand or topic
                </label>
                <input
                  id="brand-input"
                  ref={inputRef}
                  type="text"
                  maxLength={40}
                  placeholder="a chai brand"
                  className="hooks-text-input"
                />
                <button type="submit" className="btn-accent hooks-submit-btn">
                  Make hooks
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: 3 Result Cards */}
          <div
            ref={cardsContainerRef}
            className="hooks-right-col"
            aria-live="polite"
          >
            {hooks.map((hookText, index) => {
              const isCopied = copiedIndex === index;
              return (
                <div
                  key={index}
                  className={`hook-card-item glass-fake card-indent-${index}`}
                >
                  <div className="hook-card-content">
                    <span className="hook-num">{index + 1}</span>
                    <span className="hook-text">{hookText}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(hookText, index)}
                    className="hook-copy-btn glass-fake"
                    aria-label="Copy hook"
                  >
                    {isCopied ? (
                      <span className="copied-text">Copied</span>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hooks-section {
          padding: 56px 96px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .section-container {
          max-width: 1248px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .hooks-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 56px;
          align-items: center;
        }
        .hooks-left-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .section-title {
          font-family: var(--font-main);
          font-size: 44px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          line-height: 1.1;
          margin: 0;
        }
        .hooks-subtitle {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 26px;
          color: var(--muted);
          line-height: 1.3;
          margin: 0 0 16px 0;
          letter-spacing: -0.01em;
        }
        .hooks-form {
          width: 100%;
          max-width: 460px;
        }
        .hooks-input-pill {
          display: flex;
          align-items: center;
          background: rgba(30, 28, 26, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          padding: 6px 6px 6px 20px;
          gap: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        }
        .hooks-text-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: var(--font-main);
          font-size: 16px;
          font-weight: 500;
          min-width: 0;
        }
        .hooks-text-input::placeholder {
          color: rgba(245, 239, 230, 0.4);
        }
        .hooks-submit-btn {
          height: 44px;
          padding: 0 22px;
          border-radius: 999px;
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .hooks-right-col {
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: 100%;
        }
        .hook-card-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 20px 24px;
          border-radius: 22px;
          background: rgba(30, 28, 26, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
          box-sizing: border-box;
          max-width: 100%;
        }
        .hook-card-item:hover {
          border-color: rgba(255, 255, 255, 0.22);
        }
        .card-indent-0 {
          transform: translateX(0);
        }
        .card-indent-1 {
          transform: translateX(36px);
        }
        .card-indent-2 {
          transform: translateX(72px);
        }
        .hook-card-content {
          display: flex;
          align-items: baseline;
          gap: 16px;
          min-width: 0;
          flex: 1;
        }
        .hook-num {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 32px;
          color: var(--accent);
          line-height: 1;
          flex-shrink: 0;
        }
        .hook-text {
          font-family: var(--font-main);
          font-size: 20px;
          font-weight: 500;
          color: var(--text);
          line-height: 1.35;
          letter-spacing: -0.01em;
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .hook-copy-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .hook-copy-btn:hover {
          background: rgba(255, 255, 255, 0.16);
          transform: scale(1.06);
        }
        .copied-text {
          font-family: var(--font-main);
          font-size: 11px;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 1024px) {
          .hooks-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .card-indent-1,
          .card-indent-2 {
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .hooks-section {
            padding: 64px 24px;
          }
          .section-title {
            font-size: 32px;
          }
          .hooks-subtitle {
            font-size: 20px;
          }
          .hooks-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .card-indent-1,
          .card-indent-2 {
            transform: translateX(0);
          }
          .hook-text {
            font-size: 17px;
          }
          .hook-card-item {
            padding: 16px 18px;
          }
        }
      `}</style>
    </section>
  );
}
