'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';

type PixelPhotoProps = {
  src?: string;
  srcSet?: string;
  motionKey?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  variant?: 'hero' | 'route';
  priority?: boolean;
  focusY?: number;
};

function GifFrame({
  motionKey,
  focusY,
  onError,
}: {
  motionKey: string;
  focusY: number;
  onError: () => void;
}) {
  const [ready, setReady] = useState(false);
  return (
    <picture>
      <source
        media="(max-width: 600px)"
        srcSet={`/motion/${motionKey}-shader-360.gif`}
      />
      <img
        className="photo-gif"
        data-ready={ready}
        src={`/motion/${motionKey}-shader-640.gif`}
        alt=""
        aria-hidden="true"
        style={{ objectPosition: `50% ${focusY * 100}%` }}
        decoding="async"
        onLoad={() => setReady(true)}
        onError={onError}
      />
    </picture>
  );
}

export default function PixelPhoto({
  src = '/photos/san-francisco-1280.webp',
  srcSet,
  motionKey = 'san-francisco',
  alt = 'A cable car on California Street at night, with a fine pixel color treatment',
  caption = 'LOCAL STREETS. GLOBAL IDEAS.',
  width = 6016,
  height = 3718,
  variant = 'hero',
  priority = false,
  focusY = 0.62,
}: PixelPhotoProps) {
  const figureRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [gifFailed, setGifFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    function syncPlayback() {
      setMotionAllowed(!reducedMotion.matches);
      setEligible(visible && !document.hidden && !reducedMotion.matches);
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(figure);
    reducedMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, []);

  const playing = eligible && !paused && !gifFailed;
  return (
    <figure
      ref={figureRef}
      className={`${variant === 'hero' ? 'hero-photo' : 'route-photo'} pixel-photo`}
      data-motion={playing ? 'playing' : 'still'}
    >
      <picture>
        {!posterFailed && (
          <source
            media="(max-width: 600px)"
            srcSet={`/motion/${motionKey}-shader-360-still.webp`}
          />
        )}
        <img
          src={posterFailed ? src : `/motion/${motionKey}-shader-640-still.webp`}
          srcSet={posterFailed ? srcSet : undefined}
          sizes="(min-width: 1024px) 45vw, 90vw"
          alt={alt}
          width={width}
          height={height}
          style={{ objectPosition: `50% ${focusY * 100}%` }}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onError={() => setPosterFailed(true)}
        />
      </picture>
      {playing && (
        <GifFrame
          motionKey={motionKey}
          focusY={focusY}
          onError={() => setGifFailed(true)}
        />
      )}
      {motionAllowed && !gifFailed && (
        <button
          className="photo-motion-toggle"
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={`${paused ? 'Resume' : 'Pause'} photo motion: ${caption}`}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
          <span>{paused ? 'Resume' : 'Pause'}</span>
        </button>
      )}
      <figcaption>
        <span>{caption}</span>
        <ArrowUpRight size={24} aria-hidden="true" />
      </figcaption>
    </figure>
  );
}
