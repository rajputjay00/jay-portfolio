import React from 'react';

export default function HomePage() {
  return (
    <div className="interactive" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2.5rem', pointerEvents: 'auto' }}>
      {/* Top Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        <div>
          <div style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            The Attention Lab
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Jay Rajput
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            3D Engine Initialized
          </span>
        </div>
      </header>

      {/* Center Notice */}
      <div style={{ maxWidth: '640px', margin: 'auto 0' }}>
        <div style={{ display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: '4px', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.3)', color: '#ff4757', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          Foundation Ready
        </div>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
          Persistent 3D Canvas Active
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '520px' }}>
          Next.js + TypeScript, React Three Fiber, Drei, GSAP, Lenis, and Postprocessing are wired up. Ready for Room-by-Room build.
        </p>
      </div>

      {/* Footer Info */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div>
          <span>Next.js 14 · Three.js · R3F · Lenis · GSAP</span>
        </div>
        <div>
          <span>60+ FPS Target</span>
        </div>
      </footer>
    </div>
  );
}
