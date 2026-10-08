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

export const metadata: Metadata = {
  title: 'The Attention Lab — Jay Rajput',
  description: 'Social Media Manager who creates attention and runs it at scale. Instagram · Content · Strategy · Growth.',
  keywords: ['Jay Rajput', 'Social Media Manager', 'Instagram Growth', 'Content Strategy', 'Attention Lab'],
  authors: [{ name: 'Jay Rajput' }],
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
