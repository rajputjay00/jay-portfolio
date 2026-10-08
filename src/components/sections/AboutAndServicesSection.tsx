'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import profileData from '@/../content/profile.json';
import servicesData from '@/../content/services.json';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function cleanText(text: string): string {
  return text.replace(/\[DUMMY\]\s*/g, '').trim();
}

export default function AboutAndServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const shortBio = profileData.shortBio || profileData.bio || '';
  const aboutStory = cleanText(profileData.about?.story || '');
  const photo = profileData.about?.photo || '';
  const services = servicesData.services || [];

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !listRef.current) return;

    const items = listRef.current.querySelectorAll('li');
    if (items.length === 0) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: listRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.from(items, {
            y: 12,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="about-section"
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
        <h2 className="section-title">About and services</h2>

        <div className="about-grid">
          {/* Left Column: Photo, Short Bio, About Story */}
          <div className="about-left-col">
            <div className="photo-container">
              {photo ? (
                <img
                  src={photo}
                  alt={profileData.name}
                  loading="lazy"
                  decoding="async"
                  className="profile-photo"
                />
              ) : (
                <div className="photo-placeholder" />
              )}
            </div>

            <div className="short-bio">{shortBio}</div>

            <p className="about-story">{aboutStory}</p>
          </div>

          {/* Right Column: 6 Services List */}
          <div className="services-right-col">
            <ul ref={listRef} className="services-list">
              {services.map((service, idx) => (
                <li key={service.id || idx} className="service-item">
                  <span className="service-name">{service.name}</span>
                  <span className="service-arrow">↗</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
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
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 96px;
          align-items: start;
        }
        .about-left-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .photo-container {
          width: 180px;
          height: 225px;
          border-radius: 18px;
          overflow: hidden;
          background: #1e1e21;
          flex-shrink: 0;
        }
        .profile-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .photo-placeholder {
          width: 100%;
          height: 100%;
          background: #1e1e21;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .short-bio {
          font-family: var(--font-main);
          font-size: 28px;
          font-weight: 500;
          line-height: 1.3;
          color: var(--text);
          letter-spacing: -0.02em;
        }
        .about-story {
          font-family: var(--font-main);
          font-size: 15px;
          line-height: 1.55;
          color: var(--muted);
          margin: 0;
        }
        .services-right-col {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .services-list {
          list-style: none;
          margin: 0;
          padding: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.16);
        }
        .service-item {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
          font-family: var(--font-main);
          font-weight: 500;
          font-size: 24px;
          color: var(--text);
          letter-spacing: -0.02em;
          transition: color 0.2s ease, padding-left 0.2s ease;
        }
        .service-item:hover {
          color: var(--accent);
          padding-left: 6px;
        }
        .service-name {
          line-height: 1.2;
        }
        .service-arrow {
          font-size: 20px;
          color: var(--muted);
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .service-item:hover .service-arrow {
          color: var(--accent);
          transform: translate(3px, -3px);
        }

        @media (max-width: 1024px) {
          .about-section {
            padding: 80px 48px;
          }
          .about-grid {
            gap: 48px;
          }
          .short-bio {
            font-size: 24px;
          }
          .service-item {
            font-size: 21px;
            height: 64px;
          }
        }

        @media (max-width: 768px) {
          .about-section {
            padding: 64px 24px;
          }
          .section-title {
            font-size: 32px;
            margin-bottom: 2.5rem;
          }
          .about-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .short-bio {
            font-size: 21px;
          }
          .service-item {
            height: 58px;
            font-size: 19px;
          }
        }
      `}</style>
    </section>
  );
}
