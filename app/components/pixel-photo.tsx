'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import {
  createPhotoShader,
  PHOTO_CELL_SIZE,
  PHOTO_FRAME_INTERVAL,
  type PhotoPointer,
} from '@/lib/photo-shader';

type PixelPhotoProps = {
  src?: string;
  srcSet?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  variant?: 'hero' | 'route';
  priority?: boolean;
  focusY?: number;
  phase?: number;
};

export default function PixelPhoto({
  src = '/photos/san-francisco-1280.webp',
  srcSet,
  alt = 'A cable car on California Street at night, with a fine pixel color treatment',
  caption = 'LOCAL STREETS. GLOBAL IDEAS.',
  width = 6016,
  height = 3718,
  variant = 'hero',
  priority = false,
  focusY = 0.62,
  phase = 0,
}: PixelPhotoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const elapsedRef = useRef(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const photo = imageRef.current;
    if (!canvas || !photo) return;
    const context = canvas.getContext('2d', { alpha: false });
    const sample = document.createElement('canvas');
    const sampler = sample.getContext('2d', { willReadFrequently: true });
    if (!context || !sampler) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let visible = false;
    let previousTick = 0;
    let lastPaint = 0;
    let pointer: PhotoPointer | undefined;
    let output: ImageData | undefined;
    let render: ReturnType<typeof createPhotoShader> | undefined;

    function paint() {
      if (!context || !canvas || !render || !output) return;
      render(output.data, elapsedRef.current, pointer);
      context.putImageData(output, 0, 0);
      canvas.dataset.ready = 'true';
    }
    function tick(now: number) {
      if (previousTick) elapsedRef.current += (now - previousTick) / 1000;
      previousTick = now;
      if (now - lastPaint >= PHOTO_FRAME_INTERVAL) {
        paint();
        lastPaint = now;
      }
      frame = requestAnimationFrame(tick);
    }
    function syncPlayback() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTick = 0;
      if (
        render &&
        visible &&
        !document.hidden &&
        !paused &&
        !reducedMotion.matches
      ) {
        frame = requestAnimationFrame(tick);
      }
    }
    function resize() {
      if (
        !photo?.complete ||
        !photo.naturalWidth ||
        !canvas ||
        !sampler ||
        !context
      )
        return;
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const columns = Math.ceil(bounds.width / PHOTO_CELL_SIZE);
      const rows = Math.ceil(bounds.height / PHOTO_CELL_SIZE);
      canvas.width = sample.width = columns;
      canvas.height = sample.height = rows;
      const scale = Math.max(
        bounds.width / photo.naturalWidth,
        bounds.height / photo.naturalHeight,
      );
      const sourceWidth = bounds.width / scale;
      const sourceHeight = bounds.height / scale;
      sampler.drawImage(
        photo,
        (photo.naturalWidth - sourceWidth) / 2,
        (photo.naturalHeight - sourceHeight) * focusY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        columns,
        rows,
      );
      // Keep the original img visible if a future remote photo cannot be sampled.
      try {
        render = createPhotoShader(
          sampler.getImageData(0, 0, columns, rows).data,
          columns,
          rows,
          phase,
        );
        output = context.createImageData(columns, rows);
        paint();
      } catch {
        render = undefined;
        delete canvas.dataset.ready;
      }
      syncPlayback();
    }
    function move(event: PointerEvent) {
      if (paused || reducedMotion.matches || !finePointer.matches || !canvas)
        return;
      const bounds = canvas.getBoundingClientRect();
      pointer = {
        x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
        y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
      };
    }
    function leave() {
      pointer = undefined;
    }
    function motionPreferenceChanged() {
      pointer = undefined;
      paint();
      syncPlayback();
    }
    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    photo.addEventListener('load', resize);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    reducedMotion.addEventListener('change', motionPreferenceChanged);
    document.addEventListener('visibilitychange', syncPlayback);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      photo.removeEventListener('load', resize);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerleave', leave);
      reducedMotion.removeEventListener('change', motionPreferenceChanged);
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [src, focusY, phase, paused]);

  return (
    <figure
      className={`${variant === 'hero' ? 'hero-photo' : 'route-photo'} pixel-photo`}
    >
      <img
        ref={imageRef}
        src={src}
        srcSet={
          srcSet ??
          (variant === 'hero'
            ? '/photos/san-francisco-640.webp 640w, /photos/san-francisco-1280.webp 1280w'
            : undefined)
        }
        sizes="(min-width: 1024px) 45vw, 90vw"
        alt={alt}
        width={width}
        height={height}
        style={{ objectPosition: `50% ${focusY * 100}%` }}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
      <canvas ref={canvasRef} aria-hidden="true" />
      <button
        className="photo-motion-toggle"
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-label={`${paused ? 'Resume' : 'Pause'} photo motion: ${caption}`}
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
        <span>{paused ? 'Resume' : 'Pause'}</span>
      </button>
      <figcaption>
        <span>{caption}</span>
        <ArrowUpRight size={24} aria-hidden="true" />
      </figcaption>
    </figure>
  );
}
