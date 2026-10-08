'use client';

import React, { useState, useRef } from 'react';
import { caseStudiesList, CaseStudyData } from '@/data/caseStudiesData';
import CaseStudyReaderModal from './CaseStudyReaderModal';

export default function CaseStudiesSection() {
  const [selectedStudy, setSelectedStudy] = useState<CaseStudyData | null>(null);

  return (
    <section
      id="work"
      className="case-studies-section"
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
        <h2 className="section-title">Case studies</h2>

        {/* 2x2 Grid (4 cards) */}
        <div className="cases-grid">
          {caseStudiesList.map((study, index) => (
            <CaseStudyCard
              key={study.id}
              study={study}
              index={index}
              onSelect={() => setSelectedStudy(study)}
            />
          ))}
        </div>
      </div>

      {/* Full Screen Reader Modal */}
      {selectedStudy && (
        <CaseStudyReaderModal
          study={selectedStudy}
          onClose={() => setSelectedStudy(null)}
        />
      )}

      <style jsx>{`
        .case-studies-section {
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
          margin-bottom: 3rem;
          line-height: 1.1;
        }
        .cases-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          width: 100%;
        }

        @media (max-width: 900px) {
          .cases-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .case-studies-section {
            padding: 64px 24px;
          }
          .section-title {
            font-size: 32px;
            margin-bottom: 2rem;
          }
          .cases-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </section>
  );
}

function CaseStudyCard({
  study,
  index,
  onSelect,
}: {
  study: CaseStudyData;
  index: number;
  onSelect: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Up to 4 degrees tilt toward cursor
    const rotateX = ((centerY - y) / centerY) * 4;
    const rotateY = ((x - centerX) / centerX) * 4;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const isAltFallback = index % 2 === 0;

  return (
    <button
      ref={cardRef}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="case-card glass-fake"
      style={{
        transform: transformStyle,
      }}
      aria-label={`Open case study: ${study.title}`}
    >
      {/* Media area on top (260px desktop, 200px mobile) */}
      <div className="card-media">
        {study.heroImage ? (
          <img
            src={study.heroImage}
            alt={study.title}
            className="card-image"
          />
        ) : (
          <div
            className="card-media-fallback"
            style={{
              backgroundColor: isAltFallback ? '#ECE8E1' : '#121214',
              color: isAltFallback ? '#121214' : '#F5EFE6',
            }}
          >
            <span>{study.kicker}</span>
          </div>
        )}
      </div>

      {/* Card body (padding 24px 28px) */}
      <div className="card-body">
        <div className="card-kicker">{study.kicker}</div>

        <h3 className="card-title">
          {study.id === 'creativefuel' && (
            <>Creativefuel · <span className="accent-metric">401K</span></>
          )}
          {study.id === 'brand-social' && (
            <>Brand Social · <span className="accent-metric">5</span> brands</>
          )}
          {study.id === 'strictly-for-corporate' && (
            <>Strictly For Corporate · <span className="accent-metric">39.5K</span></>
          )}
          {study.id === 'campus-community' && (
            <>Campus & Community</>
          )}
        </h3>

        <p className="card-summary">{study.summary}</p>
      </div>

      <style jsx>{`
        .case-card {
          position: relative;
          height: 440px;
          border-radius: 22px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-align: left;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          transition: transform 0.15s cubic-bezier(0.2, 0, 0.38, 0.9), border-color 0.2s ease, box-shadow 0.2s ease;
          padding: 0;
          outline: none;
          color: inherit;
        }
        .case-card:hover {
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
        }
        .card-media {
          width: 100%;
          height: 260px;
          overflow: hidden;
          position: relative;
          background: #0d0c0b;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .case-card:hover .card-image {
          transform: scale(1.03);
        }
        .card-media-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-main);
          font-weight: 600;
          letter-spacing: 0.15em;
          font-size: 14px;
        }
        .card-body {
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
        }
        .card-kicker {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.4rem;
        }
        .card-title {
          font-family: var(--font-main);
          font-size: 28px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: var(--text);
          line-height: 1.15;
          margin-bottom: 0.5rem;
        }
        .accent-metric {
          color: var(--accent);
          font-weight: 600;
        }
        .card-summary {
          font-family: var(--font-main);
          font-size: 15px;
          color: var(--muted);
          line-height: 1.45;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .case-card {
            height: auto;
            min-height: 380px;
          }
          .card-media {
            height: 200px;
          }
          .card-body {
            padding: 20px 22px;
          }
          .card-title {
            font-size: 22px;
          }
          .card-summary {
            font-size: 14px;
          }
        }
      `}</style>
    </button>
  );
}
