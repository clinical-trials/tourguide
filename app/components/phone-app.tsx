'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import {
  CalendarDays,
  Map,
  TramFront,
  Menu,
  Download,
  ArrowUpRight,
} from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PhoneApp() {
  const [open, setOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);
  const [installError, setInstallError] = useState('');

  function navigate(event: MouseEvent<HTMLAnchorElement>, section: string) {
    setOpen(false);
    if (
      window.location.pathname !== '/' ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const target = document.getElementById(section);
    if (!target) return;
    event.preventDefault();
    const url = new URL(window.location.href);
    url.hash = section;
    window.history.replaceState(window.history.state, '', url);
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', onInstalled);
    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch(() => {
          // The online site remains usable in browsers without service worker support.
        });
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    setInstallError('');
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
    } catch {
      setInstallError(
        'Use your browser’s menu to add AI SF Tour to your home screen.',
      );
    } finally {
      setInstallPrompt(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <nav className="phone-navigation" aria-label="Phone navigation">
        <a href="/#routes" onClick={(event) => navigate(event, 'routes')}>
          <Map size={21} aria-hidden="true" />
          <span>Routes</span>
        </a>
        <a
          href="/#book"
          className="phone-book"
          onClick={(event) => navigate(event, 'book')}
        >
          <CalendarDays size={21} aria-hidden="true" />
          <span>Book</span>
        </a>
        <a href="/#muni" onClick={(event) => navigate(event, 'muni')}>
          <TramFront size={21} aria-hidden="true" />
          <span>Muni</span>
        </a>
        <SheetTrigger className="phone-more">
          <Menu size={21} aria-hidden="true" />
          <span>More</span>
        </SheetTrigger>
      </nav>
      <SheetContent side="bottom" className="phone-sheet">
        <SheetHeader>
          <SheetTitle>AI SF Tour on your phone</SheetTitle>
          <SheetDescription>
            Keep the routes and city basics close at hand.
          </SheetDescription>
        </SheetHeader>
        <div className="phone-sheet-body">
          <div className="phone-quick-links">
            <a href="/#details" onClick={(event) => navigate(event, 'details')}>
              Good to know <ArrowUpRight size={19} />
            </a>
            <a href="/#games" onClick={(event) => navigate(event, 'games')}>
              Game schedules <ArrowUpRight size={19} />
            </a>
            <a href="/offline.html">
              Offline city guide <ArrowUpRight size={19} />
            </a>
          </div>
          <div className="phone-install">
            <h3>Add to your home screen</h3>
            {installed ? (
              <p role="status">AI SF Tour has been added to your phone.</p>
            ) : (
              <>
                {installPrompt && (
                  <button className="primary-button" onClick={install}>
                    <span>Install AI SF Tour</span>
                    <Download size={19} />
                  </button>
                )}
                <p>
                  <strong>iPhone:</strong> Open this site in Safari. Tap Share,
                  then Add to Home Screen. Turn on Open as Web App if shown,
                  then tap Add.
                </p>
                <p>
                  <strong>Android:</strong> Open your browser’s menu and choose
                  Install app or Add to Home screen.
                </p>
              </>
            )}
            {installError && <p role="status">{installError}</p>}
            <p className="small">
              Booking, payment and live schedules need an internet connection.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
