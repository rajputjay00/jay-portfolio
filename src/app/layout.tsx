import type { Metadata, Viewport } from 'next';
import './globals.css';
import CanvasContainer from '@/components/canvas/CanvasContainer';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import DevFpsCounter from '@/components/dev/DevFpsCounter';

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
  themeColor: '#070709',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>
          {/* Persistent full-screen 3D canvas */}
          <CanvasContainer />

          {/* Development FPS counter badge */}
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
