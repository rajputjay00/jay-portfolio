'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import profileData from '@/../content/profile.json';
import { perfStore } from '@/store/perfStore';
import { attentionStore } from '@/store/attentionStore';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface MessageBubble {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

export default function MessageMeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const retentionCardRef = useRef<HTMLDivElement>(null);
  const retentionTimeRef = useRef<HTMLDivElement>(null);
  const curvePathRef = useRef<SVGPathElement>(null);
  const curveDotRef = useRef<SVGCircleElement>(null);

  const [messages, setMessages] = useState<MessageBubble[]>([
    {
      id: '1',
      sender: 'bot',
      text: "You stayed 0:00. Most portfolios get skimmed. That's the job.",
    },
    { id: '2', sender: 'bot', text: 'What brings you here?' },
  ]);
  const [selectedReply, setSelectedReply] = useState<'hiring' | 'project' | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isGlassBlur, setIsGlassBlur] = useState(perfStore.getSettings().glassBlur);
  const [isDesktop, setIsDesktop] = useState(true);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMountRef = useRef(true);

  const name = profileData.name || 'Jay Rajput';
  const email = profileData.contact?.email || '';
  const instagram = profileData.contact?.instagram || '';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    const unsub = perfStore.subscribe((s) => setIsGlassBlur(s.glassBlur));
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    let isCardInView = false;
    let cardObserver: IntersectionObserver | null = null;

    if (retentionCardRef.current) {
      cardObserver = new IntersectionObserver(
        ([entry]) => {
          isCardInView = entry.isIntersecting;
          if (isCardInView) redrawCurve();
        },
        { threshold: 0.1 }
      );
      cardObserver.observe(retentionCardRef.current);
    }

    const redrawCurve = () => {
      if (!curvePathRef.current || !curveDotRef.current) return;
      const history = attentionStore.getHistory();
      if (!history || history.length === 0) return;

      const n = history.length;
      let d = '';
      let lastX = 4;
      let lastY = 54;

      if (n === 1) {
        const y = 6 + (history[0].unreachedPercent / 100) * 48;
        d = `M 4 ${y.toFixed(1)} L 156 ${y.toFixed(1)}`;
        lastX = 156;
        lastY = y;
      } else {
        history.forEach((pt, idx) => {
          const x = 4 + (idx / (n - 1)) * 152;
          const y = 6 + (pt.unreachedPercent / 100) * 48;
          if (idx === 0) {
            d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          } else {
            d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
          }
          if (idx === n - 1) {
            lastX = x;
            lastY = y;
          }
        });
      }

      curvePathRef.current.setAttribute('d', d);
      curveDotRef.current.setAttribute('cx', lastX.toFixed(1));
      curveDotRef.current.setAttribute('cy', lastY.toFixed(1));
    };

    // Attention Timer listener for direct DOM updates
    const unsubTimer = attentionStore.subscribeTick((sec, formatted) => {
      if (retentionTimeRef.current) {
        retentionTimeRef.current.textContent = formatted;
      }
      if (isCardInView) {
        redrawCurve();
      }
    });

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Viewport enter: freeze time for bubble and trigger animations
    let ctx: gsap.Context | null = null;
    if (sectionRef.current) {
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const frozen = attentionStore.freezeTimeForMessage();
            setMessages((prev) => {
              const next = [...prev];
              next[0] = {
                ...next[0],
                text: `You stayed ${frozen}. Most portfolios get skimmed. That's the job.`,
              };
              return next;
            });

            if (!prefersReducedMotion) {
              gsap.from('.message-title-reveal', {
                y: '100%',
                duration: 0.7,
                ease: 'power3.out',
              });
              gsap.from(['.chat-card', '.retention-card'], {
                y: 24,
                opacity: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power2.out',
              });
            }
          },
        });

        if (!prefersReducedMotion) {
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            onUpdate: (self) => {
              const yOffset = (self.progress - 0.5) * 60;
              gsap.set('.message-glow', { y: yOffset });
            },
          });
        }
      }, sectionRef);
    }

    return () => {
      unsub();
      unsubTimer();
      cardObserver?.disconnect();
      window.removeEventListener('resize', checkDesktop);
      ctx?.revert();
    };
  }, []);

  const handleReplySelect = (choice: 'hiring' | 'project') => {
    setSelectedReply(choice);
    const userText = choice === 'hiring' ? "I'm hiring" : 'I have a project';

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text: userText },
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botResponse =
        choice === 'hiring'
          ? 'Great. Tell me about the role.'
          : 'Nice. Tell me about the brand and the goal.';

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: botResponse },
      ]);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }
      }, 100);
    }, 800);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || isSent) return;

    const subject = selectedReply === 'hiring' ? 'Hiring' : 'Project';
    const body = encodeURIComponent(typedMessage.trim());

    if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text: typedMessage.trim() },
    ]);
    setTypedMessage('');
    setIsSent(true);
  };

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <section
      id="message"
      ref={sectionRef}
      className="message-section"
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
      {/* Soft Ambient Glows in Background */}
      <div
        className="ambient-glow drift-1 message-glow"
        style={{
          top: '10%',
          right: '15%',
          width: '600px',
          height: '600px',
        }}
      />
      <div
        className="ambient-glow drift-2 message-glow"
        style={{
          bottom: '5%',
          left: '10%',
          width: '500px',
          height: '500px',
        }}
      />

      <div className="section-container">
        <div className="title-mask-wrapper">
          <h2 className="section-title message-title-reveal">Message me</h2>
        </div>

        <div className="chat-card-wrapper">
          <div className={`chat-card ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}>
            {/* Header Row */}
            <div className="chat-header">
              <div className="avatar-circle">{initials}</div>
              <div className="header-info">
                <div className="header-name">{name}</div>
                <a
                  href={`https://www.instagram.com/${instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="header-handle"
                >
                  {instagram}
                </a>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div
              ref={chatBodyRef}
              className="chat-body"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
                >
                  <div
                    className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Action Buttons Row before selection */}
              {!selectedReply && (
                <div className="reply-options-row">
                  <button
                    onClick={() => handleReplySelect('hiring')}
                    className="reply-btn btn-hiring"
                  >
                    I'm hiring
                  </button>
                  <button
                    onClick={() => handleReplySelect('project')}
                    className="reply-btn btn-project"
                  >
                    I have a project
                  </button>
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="message-bubble-row bot-row">
                  <div className="typing-indicator bot-bubble">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Row */}
            <div className="chat-footer">
              {selectedReply ? (
                email ? (
                  <form onSubmit={handleSend} className="chat-input-form">
                    <label htmlFor="chat-msg" className="sr-only">
                      Message
                    </label>
                    <input
                      id="chat-msg"
                      ref={inputRef}
                      type="text"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      placeholder="Message..."
                      className="chat-text-input"
                      disabled={isSent}
                      autoComplete="off"
                    />
                    <button
                      type="submit"
                      className="chat-send-btn"
                      aria-label="Send"
                      disabled={!typedMessage.trim() || isSent}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </form>
                ) : (
                  <div className="instagram-fallback-link">
                    Reach me directly via{' '}
                    <a
                      href={`https://www.instagram.com/${instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="accent-link"
                    >
                      {instagram}
                    </a>
                  </div>
                )
              ) : (
                <div className="input-placeholder-disabled">
                  Select an option above to start messaging
                </div>
              )}
            </div>
          </div>

          {/* 4. YOUR RETENTION CARD */}
          <div
            ref={retentionCardRef}
            className={`retention-card ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}
          >
            <div className="retention-left">
              <div className="retention-card-label">YOUR RETENTION ON THIS PAGE</div>
              <div ref={retentionTimeRef} className="retention-live-time">
                0:00
              </div>
              <div className="retention-subline">Better than most Reels.</div>
            </div>
            <div className="retention-right">
              <svg className="retention-mini-svg" viewBox="0 0 160 60" aria-hidden="true">
                <line
                  x1="0"
                  y1="54"
                  x2="160"
                  y2="54"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="1"
                />
                <path
                  ref={curvePathRef}
                  d=""
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  ref={curveDotRef}
                  cx="0"
                  cy="54"
                  r="4"
                  fill="var(--accent)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .message-section {
          padding: 110px 96px;
        }
        .section-container {
          max-width: 1248px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .section-title {
          font-family: var(--font-main);
          font-size: 44px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          line-height: 1.1;
        }
        .chat-card-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        .chat-card {
          width: 560px;
          min-height: 520px;
          border-radius: 28px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          overflow: hidden;
        }
        .retention-card {
          width: 560px;
          border-radius: 24px;
          padding: 22px 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
        }
        .retention-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .retention-card-label {
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .retention-live-time {
          font-family: var(--font-main);
          font-size: 44px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: var(--text);
          font-variant-numeric: tabular-nums;
          line-height: 1.1;
          margin: 4px 0;
        }
        .retention-subline {
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--muted);
        }
        .retention-right {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .retention-mini-svg {
          width: 160px;
          height: 60px;
          overflow: visible;
        }
        .chat-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 24px 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }
        .avatar-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-main);
          font-weight: 600;
          font-size: 16px;
          flex-shrink: 0;
        }
        .header-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .header-name {
          font-family: var(--font-main);
          font-weight: 600;
          font-size: 16px;
          color: var(--text);
          line-height: 1.2;
        }
        .header-handle {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--muted);
          line-height: 1.2;
        }
        .chat-body {
          flex: 1;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
        }
        .message-bubble-row {
          display: flex;
          width: 100%;
          animation: bubblePop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .bot-row {
          justify-content: flex-start;
        }
        .user-row {
          justify-content: flex-end;
        }
        .message-bubble {
          font-family: var(--font-main);
          font-size: 15px;
          line-height: 1.45;
          padding: 12px 18px;
          max-width: 82%;
          box-sizing: border-box;
        }
        .bot-bubble {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text);
          border-radius: 20px 20px 20px 6px;
        }
        .user-bubble {
          background: var(--accent);
          color: var(--bg);
          font-weight: 500;
          border-radius: 20px 20px 6px 20px;
        }
        .reply-options-row {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
          animation: bubblePop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          position: relative;
          z-index: 5;
        }
        .reply-btn {
          min-height: 46px;
          padding: 10px 22px;
          border-radius: 999px;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          pointer-events: auto;
          position: relative;
          z-index: 5;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .reply-btn:hover {
          transform: translateY(-1px);
          opacity: 0.92;
        }
        .btn-hiring {
          background: var(--accent);
          color: var(--bg);
          border: none;
        }
        .btn-project {
          background: transparent;
          border: 1px solid var(--accent);
          color: var(--accent);
        }
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 14px 20px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text);
          opacity: 0.4;
          animation: pulse 1s infinite alternate;
        }
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes pulse {
          0% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.1);
          }
        }
        @keyframes bubblePop {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .chat-footer {
          padding: 18px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }
        .chat-input-form {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        .chat-text-input {
          flex: 1;
          height: 44px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 0 18px;
          font-family: var(--font-main);
          font-size: 15px;
          color: var(--text);
          outline: none;
          transition: border-color 0.2s ease;
        }
        .chat-text-input:focus {
          border-color: var(--accent);
        }
        .chat-send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--bg);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .chat-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }
        .chat-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .input-placeholder-disabled {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          padding: 8px 0;
        }
        .instagram-fallback-link {
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--muted);
          text-align: center;
        }
        .accent-link {
          color: var(--accent);
          text-decoration: underline;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        @media (max-width: 768px) {
          .message-section {
            padding: 64px 24px;
          }
          .section-title {
            font-size: 32px;
          }
          .chat-card {
            width: 100%;
            min-height: 470px;
          }
          .chat-body {
            padding: 20px;
          }
          .reply-options-row {
            flex-direction: column;
            align-items: stretch;
          }
          .reply-btn {
            width: 100%;
          }
          .retention-card {
            width: 100%;
            padding: 18px 20px;
          }
          .retention-live-time {
            font-size: 36px;
          }
          .retention-mini-svg {
            width: 120px;
            height: 50px;
          }
        }
      `}</style>
    </section>
  );
}
