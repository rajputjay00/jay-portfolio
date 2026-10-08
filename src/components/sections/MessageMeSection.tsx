'use client';

import React, { useState, useRef, useEffect } from 'react';
import profileData from '@/../content/profile.json';

interface MessageBubble {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

export default function MessageMeSection() {
  const [messages, setMessages] = useState<MessageBubble[]>([
    { id: '1', sender: 'bot', text: "Hi, I'm Jay." },
    { id: '2', sender: 'bot', text: 'What brings you here?' },
  ]);
  const [selectedReply, setSelectedReply] = useState<'hiring' | 'project' | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const name = profileData.name || 'Jay Rajput';
  const email = profileData.contact?.email || '';
  const instagram = profileData.contact?.instagram || '';

  // Generate initials
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleReplySelect = (choice: 'hiring' | 'project') => {
    setSelectedReply(choice);
    const userText = choice === 'hiring' ? "I'm hiring" : 'I have a project';

    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text: userText },
    ]);

    // Show typing indicator then bot response
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
          inputRef.current.focus();
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <section
      id="message"
      className="message-section"
      style={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      <div className="section-container">
        <h2 className="section-title">Message me</h2>

        <div className="chat-card-wrapper">
          <div className="chat-card glass-fake">
            {/* Header Row */}
            <div className="chat-header">
              <div className="avatar-circle">{initials}</div>
              <div className="header-info">
                <div className="header-name">{name}</div>
                <div className="header-handle">{instagram}</div>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div
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

            {/* Input Row (Active once user selects a path) */}
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
                      href={`https://instagram.com/${instagram.replace('@', '')}`}
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
        }
        .section-title {
          font-family: var(--font-main);
          font-size: 44px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 3.5rem;
          line-height: 1.1;
        }
        .chat-card-wrapper {
          display: flex;
          justify-content: center;
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
          animation: bubbleRise 0.3s ease-out forwards;
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
          animation: bubbleRise 0.3s ease-out forwards;
        }
        .reply-btn {
          min-height: 46px;
          padding: 10px 22px;
          border-radius: 999px;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
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
        @keyframes bubbleRise {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
            margin-bottom: 2.5rem;
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
        }
      `}</style>
    </section>
  );
}
