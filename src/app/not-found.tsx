'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found-page">
      {/* Soft Ambient Glow in Background */}
      <div
        className="ambient-glow drift-1"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
        }}
      />

      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <p className="not-found-tagline">
          This page got less reach than a 6am Monday post.
        </p>
        <Link href="/" className="btn-accent not-found-link">
          Back to the good stuff
        </Link>
      </div>

      <style jsx>{`
        .not-found-page {
          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 24px;
          box-sizing: border-box;
        }
        .not-found-content {
          position: relative;
          z-index: 2;
          max-width: 600px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .not-found-code {
          font-family: var(--font-main);
          font-size: clamp(80px, 15vw, 160px);
          font-weight: 600;
          letter-spacing: -0.05em;
          line-height: 0.95;
          color: var(--text);
          margin: 0;
        }
        .not-found-tagline {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(20px, 3.5vw, 30px);
          color: var(--muted);
          line-height: 1.35;
          margin: 0;
        }
        .not-found-link {
          margin-top: 16px;
          height: 48px;
          padding: 0 28px;
          font-size: 15px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 999px;
        }
      `}</style>
    </main>
  );
}
