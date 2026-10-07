import type { Metadata, Viewport } from 'next';
import { Syne } from 'next/font/google';
import './globals.css';
import CanvasContainer from '@/components/canvas/CanvasContainer';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import DevFpsCounter from '@/components/dev/DevFpsCounter';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['700', '800'],
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
  themeColor: '#08090C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={syne.variable}>
      <body>
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
