'use client';

import React, { useEffect, useState, useRef } from 'react';
import { openingStore, OpeningStep } from '@/store/openingStore';
import { scrollManager } from '@/store/scrollStore';
import profileData from '@/../content/profile.json';

export default function OpeningOverlay() {
  const [step, setStep] = useState<OpeningStep>('idle');
  const [showSkip, setShowSkip] = useState(false);
  const [isBlackout, setIsBlackout] = useState(true);
  const [stopTextState, setStopTextState] = useState<'none' | 'stop' | 'youdid' | 'tagline'>('none');
  const [showIdentity, setShowIdentity] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const jumpToIdentity = () => {
    clearAllTimeouts();
    setIsBlackout(false);
    setStopTextState('none');
    openingStore.setStep('identity');
    setShowIdentity(true);
    setShowSkip(false);
  };

  const startSequence = () => {
    clearAllTimeouts();
    setIsBlackout(true);
    setStopTextState('none');
    setShowIdentity(false);
    setShowSkip(true);
    openingStore.setStep('screen_1');

    // 1. Initial black screen for 0.6s then reveal first screen
    const t0 = setTimeout(() => {
      setIsBlackout(false);
    }, 600);

    // 2. Second screen at 1.8s
    const t1 = setTimeout(() => {
      openingStore.setStep('screen_2');
    }, 1800);

    // 3. Third screen at 3.0s
    const t2 = setTimeout(() => {
      openingStore.setStep('screen_3');
    }, 3000);

    // 4. Abrupt freeze at 4.4s
    const t3 = setTimeout(() => {
      openingStore.setStep('frozen');
    }, 4400);

    // 5. Large type "STOP." at 4.7s
    const t4 = setTimeout(() => {
      openingStore.setStep('stop_text');
      setStopTextState('stop');
    }, 4700);

    // 6. "YOU DID." at 5.7s
    const t5 = setTimeout(() => {
      openingStore.setStep('you_did_text');
      setStopTextState('youdid');
    }, 5700);

    // 7. "That's the job." at 6.7s
    const t6 = setTimeout(() => {
      setStopTextState('tagline');
    }, 6700);

    // 8. Pullback and show identity at 7.7s
    const t7 = setTimeout(() => {
      jumpToIdentity();
    }, 7700);

    timeoutsRef.current = [t0, t1, t2, t3, t4, t5, t6, t7];
  };

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || openingStore.isSeen()) {
      jumpToIdentity();
    } else {
      startSequence();
    }

    const unsub = openingStore.subscribe((s) => {
      setStep(s);
      if (s === 'identity' || s === 'completed') {
        setShowIdentity(true);
        setShowSkip(false);
        setIsBlackout(false);
      }
    });

    return () => {
      clearAllTimeouts();
      unsub();
    };
  }, []);

  const handleExploreLab = () => {
    openingStore.setStep('completed');
    scrollManager.scrollToProgress(0.11, 1.6);
  };

  const { name, title, tags, openingSequence } = profileData;
  const stopText = openingSequence?.stop || 'STOP.';
  const youDidText = openingSequence?.youDid || 'YOU DID.';
  const taglineText = openingSequence?.tagline || "That's the job.";

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'var(--font-main)',
      }}
    >
      {/* 1. Blackout Layer (Initial screen) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#060608',
          opacity: isBlackout ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: isBlackout ? 'auto' : 'none',
          zIndex: 60,
        }}
      />

      {/* 2. Skip Button (Visible from frame 1) */}
      {showSkip && (
        <button
          onClick={jumpToIdentity}
          style={{
            position: 'fixed',
            top: '2rem',
            right: '2.5rem',
            zIndex: 100,
            pointerEvents: 'auto',
            background: 'rgba(20, 20, 28, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
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
            e.currentTarget.style.background = 'rgba(255, 71, 87, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(255, 71, 87, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(20, 20, 28, 0.7)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          Skip Intro →
        </button>
      )}

      {/* 3. Abrupt Large Editorial Text: "STOP." "YOU DID." "That's the job." */}
      {stopTextState !== 'none' && !showIdentity && (
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
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              color: '#ffffff',
              textTransform: 'uppercase',
              textShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(255,71,87,0.3)',
              transform: 'scale(1)',
              animation: 'textPop 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {stopTextState === 'stop' && stopText}
            {(stopTextState === 'youdid' || stopTextState === 'tagline') && (
              <>
                <span style={{ color: '#ff4757' }}>{stopText} </span>
                <span>{youDidText}</span>
              </>
            )}
          </div>

          {stopTextState === 'tagline' && (
            <div
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: '#d4d4d8',
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

      {/* 4. Identity Screen & CTAs (Step 5) */}
      {showIdentity && (
        <div
          style={{
            zIndex: 70,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '840px',
            padding: '2rem',
            pointerEvents: 'auto',
            animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Accent Label */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              background: 'rgba(255, 71, 87, 0.12)',
              border: '1px solid rgba(255, 71, 87, 0.35)',
              color: '#ff4757',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#ff4757',
                boxShadow: '0 0 6px #ff4757',
              }}
            />
            {title}
          </div>

          {/* Main Hero Name */}
          <h1
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.02,
              color: '#ffffff',
              marginBottom: '1.25rem',
              textShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
            }}
          >
            {name}
          </h1>

          {/* Tags String */}
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.25rem)',
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
              marginBottom: '2.5rem',
              maxWidth: '620px',
              fontWeight: 400,
            }}
          >
            {tags.join(' · ')}
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Explore Lab CTA */}
            <button
              onClick={handleExploreLab}
              style={{
                background: 'linear-gradient(135deg, #ff4757 0%, #e0283b 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(255, 71, 87, 0.35)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 71, 87, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 71, 87, 0.35)';
              }}
            >
              <span>Explore the Lab</span>
              <span style={{ fontSize: '1.1rem' }}>↓</span>
            </button>

            {/* View Work Directly CTA */}
            <button
              onClick={() => {
                // Smoothly glide to Case Files (zone 2)
                scrollManager.scrollToProgress(0.22, 1.8);
                openingStore.setStep('completed');
              }}
              style={{
                background: 'rgba(20, 20, 30, 0.7)',
                backdropFilter: 'blur(10px)',
                color: '#e4e4e7',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.85rem 1.8rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(20, 20, 30, 0.7)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#e4e4e7';
              }}
            >
              View work directly →
            </button>

            {/* Replay Intro (Dev helper) */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => {
                  openingStore.resetSeen();
                  startSequence();
                }}
                title="Replay opening sequence"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#71717a',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  marginLeft: '0.5rem',
                }}
              >
                ↻ Replay
              </button>
            )}
          </div>
        </div>
      )}

      {/* Global CSS animations */}
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
