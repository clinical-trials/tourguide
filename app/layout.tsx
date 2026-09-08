import type { Metadata } from 'next';
import { Barlow_Condensed, DM_Sans } from 'next/font/google';
import './globals.css';
const display = Barlow_Condensed({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});
const body = DM_Sans({ variable: '--font-body', subsets: ['latin'] });
export const metadata: Metadata = {
  icons: { icon: '/favicon.svg' },
  title: 'AI SF Tour — San Francisco, beyond the prompt',
  description:
    'A contemporary San Francisco walking and Muni tour. Two half-day routes, Tuesday–Sunday. $195 per adult, ages 16+.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
