'use client';

import React, { useEffect, useState, useRef } from 'react';
import { openingStore, OpeningStep } from '@/store/openingStore';
import profileData from '@/../content/profile.json';

export default function OpeningOverlay() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<OpeningStep>('idle');
  const [showSkip, setShowSkip] = useState(false);
  const [isBlackout, setIsBlackout] = useState(false);
  const [stopTextState, setStopTextState] = useState<'none' | 'stop' | 'youdid' | 'tagline'>('none');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const jumpToHero = () => {
    clearAllTimeouts();
    setIsBlackout(false);
    setStopTextState('none');
    setShowSkip(false);
    setIsComplete(true);
    openingStore.setStep('completed');
  };

  const startSequence = () => {
    clearAllTimeouts();
    setIsBlackout(false);
    setStopTextState('none');
    setIsComplete(false);
    setShowSkip(true);
    openingStore.setStep('screen_1');

    // 1. First screen is revealed immediately
    // 2. Second screen at 1.4s
    const t1 = setTimeout(() => {
      openingStore.setStep('screen_2');
    }, 1400);

    // 3. Third screen at 2.6s
    const t2 = setTimeout(() => {
      openingStore.setStep('screen_3');
    }, 2600);

    // 4. Abrupt freeze at 3.8s
    const t3 = setTimeout(() => {
      openingStore.setStep('frozen');
    }, 3800);

    // 5. Large type "STOP." at 4.2s
    const t4 = setTimeout(() => {
      openingStore.setStep('stop_text');
      setStopTextState('stop');
    }, 4200);

    // 6. "YOU DID." at 5.4s
    const t5 = setTimeout(() => {
      openingStore.setStep('you_did_text');
      setStopTextState('youdid');
    }, 5400);

    // 7. "That's the job." at 6.6s
    const t6 = setTimeout(() => {
      setStopTextState('tagline');
    }, 6600);

    // 8. Pullback camera and reveal Hero at 8.2s
    const t7 = setTimeout(() => {
      jumpToHero();
    }, 8200);

    timeoutsRef.current = [t1, t2, t3, t4, t5, t6, t7];
  };

  useEffect(() => {
    setMounted(true);
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isIntroRequested = typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('intro') === '1' || openingStore.isIntro())
      : false;

    if (!isIntroRequested || prefersReducedMotion || openingStore.isSeen()) {
      jumpToHero();
    } else {
      startSequence();
    }

    const unsub = openingStore.subscribe((s) => {
      setStep(s);
      if (s === 'completed') {
        setIsComplete(true);
        setShowSkip(false);
        setIsBlackout(false);
        setStopTextState('none');
      } else if (s === 'screen_1') {
        startSequence();
      }
    });

    return () => {
      clearAllTimeouts();
      unsub();
    };
  }, []);

  const { openingSequence } = profileData;
  const stopText = openingSequence?.stop || 'STOP.';
  const youDidText = openingSequence?.youDid || 'YOU DID.';
  const taglineText = openingSequence?.tagline || "That's the job.";

  if (!mounted || isComplete || step === 'completed' || !openingStore.isIntro()) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        pointerEvents: showSkip || isBlackout ? 'auto' : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'var(--font-main)',
      }}
    >
      {/* Blackout Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0B0A09',
          opacity: isBlackout ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: isBlackout ? 'auto' : 'none',
          zIndex: 60,
        }}
      />

      {/* Skip Button (Visible during opening) */}
      {showSkip && (
        <button
          onClick={jumpToHero}
          style={{
            position: 'fixed',
            top: '2rem',
            right: '2.5rem',
            zIndex: 100,
            pointerEvents: 'auto',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            color: '#F5EFE6',
            padding: '0.45rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 90, 43, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(255, 90, 43, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
          }}
        >
          Skip Intro →
        </button>
      )}

      {/* Large Editorial Text: "STOP." "YOU DID." "That's the job." */}
      {stopTextState !== 'none' && (
        <div
          style={{
            textAlign: 'center',
            zIndex: 80,
            maxWidth: '90vw',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 8.5rem)',
              fontWeight: 600,
              fontFamily: 'var(--font-main)',
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              color: '#F5EFE6',
              textTransform: 'uppercase',
              textShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(255,90,43,0.3)',
              transform: 'scale(1)',
              animation: 'textPop 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {stopTextState === 'stop' && stopText}
            {(stopTextState === 'youdid' || stopTextState === 'tagline') && (
              <>
                <span style={{ color: '#FF5A2B' }}>{stopText} </span>
                <span>{youDidText}</span>
              </>
            )}
          </div>

          {stopTextState === 'tagline' && (
            <div
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                color: '#938C82',
                marginTop: '1.25rem',
                letterSpacing: '-0.01em',
                fontStyle: 'italic',
                animation: 'fadeIn 0.3s ease forwards',
              }}
            >
              {taglineText}
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes textPop {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
