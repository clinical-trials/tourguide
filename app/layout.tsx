import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, DM_Sans } from 'next/font/google';
import PhoneApp from './components/phone-app';
import './globals.css';
const display = Barlow_Condensed({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});
const body = DM_Sans({ variable: '--font-body', subsets: ['latin'] });
export const metadata: Metadata = {
  icons: { icon: '/favicon.svg', apple: '/icons/apple-touch-icon.png' },
  manifest: '/manifest.webmanifest',
  applicationName: 'AI SF Tour',
  appleWebApp: {
    capable: true,
    title: 'AI SF Tour',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  title: 'AI SF Tour — San Francisco, beyond the prompt',
  description:
    'Explore San Francisco on foot and by Muni. Branches A and B run Tuesday–Sunday, $195 per adult, ages 16+. Discover Branch C, a sunny-day west-side special.',
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#101a20',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        {children}
        <PhoneApp />
      </body>
    </html>
  );
}
