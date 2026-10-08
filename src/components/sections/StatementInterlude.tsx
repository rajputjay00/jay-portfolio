'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface StatementInterludeProps {
  text: string;
  id?: string;
}

export default function StatementInterlude({ text, id }: StatementInterludeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textContainerRef = useRef<HTMLParagraphElement>(null);

  // Split text into words and identify the last 3 words
  const rawWords = text.trim().split(/\s+/);
  const totalWords = rawWords.length;

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (textContainerRef.current) {
        const spans = textContainerRef.current.querySelectorAll('.interlude-word');
        spans.forEach((s) => ((s as HTMLElement).style.opacity = '1'));
      }
      return;
    }

    const ctx = gsap.context(() => {
      if (sectionRef.current && textContainerRef.current) {
        const spans = textContainerRef.current.querySelectorAll('.interlude-word');

        gsap.set(spans, { opacity: 0.15 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=100%',
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        tl.to(spans, {
          opacity: 1,
          stagger: 0.15,
          ease: 'none',
        });

        // Soft ambient glow breathing / scaling with scroll
        tl.fromTo(
          '.interlude-ambient-glow',
          { scale: 0.85, opacity: 0.4 },
          { scale: 1.15, opacity: 0.75, ease: 'none' },
          0
        );
      }
    }, sectionRef);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="statement-interlude-section"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '0 32px',
      }}
    >
      {/* Soft Ambient Accent Glow behind text */}
      <div
        className="interlude-ambient-glow"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(750px, 80vw)',
          height: 'min(500px, 60vh)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(235, 94, 40, 0.18) 0%, rgba(235, 94, 40, 0.04) 50%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="interlude-container" style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', width: '100%', textAlign: 'center' }}>
        {/* Accessible screen reader full text */}
        <p className="sr-only">{text}</p>

        {/* Animated Spans for Scroll Scrub Lighting */}
        <p ref={textContainerRef} className="interlude-text" aria-hidden="true">
          {rawWords.map((word, index) => {
            const isLastThree = index >= totalWords - 3;
            const isLastWord = index === totalWords - 1;

            // Check if last word ends with punctuation like '.'
            let displayWord = word;
            let hasPeriod = false;
            if (isLastWord && displayWord.endsWith('.')) {
              displayWord = displayWord.slice(0, -1);
              hasPeriod = true;
            }

            return (
              <React.Fragment key={index}>
                <span
                  className={`interlude-word ${isLastThree ? 'interlude-serif' : 'interlude-main'}`}
                >
                  {displayWord}
                  {hasPeriod && <span style={{ color: 'var(--accent)' }}>.</span>}
                </span>
                {index < totalWords - 1 && ' '}
              </React.Fragment>
            );
          })}
        </p>
      </div>

      <style jsx>{`
        .statement-interlude-section {
          user-select: none;
        }
        .interlude-text {
          font-size: clamp(40px, 6vw, 96px);
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin: 0;
          color: var(--text);
        }
        .interlude-main {
          font-family: var(--font-main);
          font-weight: 600;
          display: inline;
          transition: opacity 0.1s ease;
        }
        .interlude-serif {
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
          display: inline;
          transition: opacity 0.1s ease;
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

        @media (max-width: 768px) {
          .interlude-text {
            font-size: clamp(32px, 8vw, 52px);
            line-height: 1.25;
          }
        }
      `}</style>
    </section>
  );
}
