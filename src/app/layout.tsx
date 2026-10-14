import type { Metadata, Viewport } from 'next';
import { Inter_Tight, Instrument_Serif } from 'next/font/google';
import './globals.css';
import CanvasContainer from '@/components/canvas/CanvasContainer';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import DevFpsCounter from '@/components/dev/DevFpsCounter';

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
});

import profileData from '@/../content/profile.json';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jay-portfolio-tau.vercel.app';
const title = `${profileData.name} · ${profileData.title}`;
const roleLine = `${profileData.title} · ${profileData.tags?.join(' · ') || ''}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description: roleLine,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title,
    description: roleLine,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'You just stopped scrolling. Jay Rajput, Social Media Manager.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: roleLine,
    images: ['/og.png'],
  },
  keywords: [profileData.name, profileData.title, ...(profileData.tags || [])],
  authors: [{ name: profileData.name }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B0A09',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${interTight.variable} ${instrumentSerif.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }
                if (window.location.hash) {
                  history.replaceState(null, '', window.location.pathname + window.location.search);
                }
                window.scrollTo(0, 0);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={interTight.className}>
        <SmoothScrollProvider>
          {/* Persistent full-screen 3D canvas (frameloop active only in hero) */}
          <CanvasContainer />

          {/* Development FPS counter */}
          <DevFpsCounter />

          {/* Page UI Content layer */}
          <main className="ui-layer">
            {children}
          </main>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
