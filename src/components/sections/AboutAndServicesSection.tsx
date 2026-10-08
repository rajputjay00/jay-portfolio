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

    if (!prefersReducedMotion && listRef.current && sectionRef.current) {
      const items = listRef.current.querySelectorAll('li');

      const ctx = gsap.context(() => {
        // Title mask reveal & services list entrance
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.from('.about-title-reveal', {
              y: '100%',
              duration: 0.7,
              ease: 'power3.out',
            });
            if (items.length > 0) {
              gsap.from(items, {
                y: 12,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out',
              });
            }
          },
        });

        // Ambient glow scroll scrub
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            const yOffset = (self.progress - 0.5) * 60;
            gsap.set('.about-glow', { y: yOffset });
          },
        });
      }, sectionRef);

      return () => ctx.revert();
    }
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
        overflow: 'hidden',
      }}
    >
      {/* Soft Ambient Glow in Background */}
      <div
        className="ambient-glow drift-1 about-glow"
        style={{
          top: '20%',
          left: '-10%',
          width: '600px',
          height: '600px',
        }}
      />
      <div
        className="ambient-glow drift-2 about-glow"
        style={{
          bottom: '10%',
          right: '-10%',
          width: '550px',
          height: '550px',
        }}
      />

      <div className="section-container">
        <div className="title-mask-wrapper">
          <h2 className="section-title about-title-reveal">About and services</h2>
        </div>

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

            {profileData.contact?.cvFile ? (
              <a
                href={profileData.contact.cvFile}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-download-link glass-fake"
              >
                Download the boring version (PDF)
              </a>
            ) : null}
          </div>

          {/* Right Column: 6 Services List */}
          <div className="services-right-col">
            <ul ref={listRef} className="services-list">
              {services.map((service, idx) => (
                <li key={service.id || idx} className="service-item">
                  <div className="service-top-border" />
                  <div className="service-content">
                    <span className="service-name">{service.name}</span>
                  </div>
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
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        }
        .cv-download-link {
          display: inline-flex;
          align-items: center;
          margin-top: 2rem;
          padding: 12px 24px;
          border-radius: 999px;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
          text-decoration: none;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .cv-download-link:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.24);
        }
        .service-item {
          height: 72px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          cursor: pointer;
        }
        .service-top-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.16);
          transition: background 0.25s ease;
        }
        .service-content {
          display: flex;
          align-items: center;
          font-family: var(--font-main);
          font-weight: 500;
          font-size: 24px;
          color: var(--text);
          letter-spacing: -0.02em;
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.25s ease;
        }
        @media (pointer: fine) {
          .service-item:hover .service-top-border {
            background: var(--accent);
          }
          .service-item:hover .service-content {
            transform: translateX(8px);
            color: var(--accent);
          }
        }
        .service-name {
          line-height: 1.2;
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
            height: 64px;
          }
          .service-content {
            font-size: 21px;
          }
        }

        @media (max-width: 768px) {
          .about-section {
            padding: 64px 24px;
          }
          .section-title {
            font-size: 32px;
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
          }
          .service-content {
            font-size: 19px;
          }
        }
      `}</style>
    </section>
  );
}
