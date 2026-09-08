'use client';

import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

// A small, demand-rendered mosaic. The original photograph is the no-JS fallback.
export default function PixelPhoto() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const photo = imageRef.current;
    if (!canvas || !photo) return;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;
    const sample = document.createElement('canvas');
    const sampler = sample.getContext('2d', { willReadFrequently: true });
    if (!sampler) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    let frame = 0;
    let pixels: Uint8ClampedArray | undefined;
    let columns = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let pointer: { x: number; y: number } | undefined;

    function paint() {
      frame = 0;
      if (!context || !pixels || !width) return;
      const cellWidth = width / columns;
      const cellHeight = height / rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const offset = (y * columns + x) * 4;
          const r = pixels[offset];
          const g = pixels[offset + 1];
          const b = pixels[offset + 2];
          const luminance = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
          const threshold = (bayer[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
          const lit = luminance * 1.6 > threshold;
          // Stronger square dithering at the edges keeps the street legible.
          const edge = Math.abs(x / columns - 0.46) * 1.8;
          const distance = pointer
            ? Math.hypot(x * cellWidth - pointer.x, y * cellHeight - pointer.y)
            : Infinity;
          const mix =
            Math.max(0, Math.min(0.92, edge)) * Math.min(1, distance / 130);
          const ink = lit ? [213, 255, 88] : [10, 21, 27];
          context.fillStyle = `rgb(${Math.round(r * (1 - mix) + ink[0] * mix)} ${Math.round(g * (1 - mix) + ink[1] * mix)} ${Math.round(b * (1 - mix) + ink[2] * mix)})`;
          context.fillRect(
            x * cellWidth,
            y * cellHeight,
            Math.ceil(cellWidth),
            Math.ceil(cellHeight),
          );
        }
      }
      canvas!.dataset.ready = 'true';
    }

    function queuePaint() {
      if (!frame) frame = requestAnimationFrame(paint);
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
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      columns = Math.ceil(width / 5);
      rows = Math.ceil(height / 5);
      sample.width = columns;
      sample.height = rows;
      const scale = Math.max(
        width / photo.naturalWidth,
        height / photo.naturalHeight,
      );
      const sourceWidth = width / scale;
      const sourceHeight = height / scale;
      sampler.drawImage(
        photo,
        (photo.naturalWidth - sourceWidth) / 2,
        (photo.naturalHeight - sourceHeight) * 0.62,
        sourceWidth,
        sourceHeight,
        0,
        0,
        columns,
        rows,
      );
      pixels = sampler.getImageData(0, 0, columns, rows).data;
      queuePaint();
    }

    function move(event: PointerEvent) {
      if (reducedMotion.matches || !finePointer.matches) return;
      const bounds = canvas!.getBoundingClientRect();
      pointer = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      queuePaint();
    }
    function leave() {
      pointer = undefined;
      queuePaint();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    photo.addEventListener('load', resize);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    reducedMotion.addEventListener('change', leave);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      photo.removeEventListener('load', resize);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerleave', leave);
      reducedMotion.removeEventListener('change', leave);
    };
  }, []);

  return (
    <figure className="hero-photo pixel-photo">
      <img
        ref={imageRef}
        src="/san-francisco.jpg"
        alt="A cable car on California Street at night, with a square-pixel color treatment"
        width="6016"
        height="3718"
        fetchPriority="high"
      />
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="photo-shutters" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${i * 35}ms` }} />
        ))}
      </div>
      <figcaption>
        <span>LOCAL STREETS. GLOBAL IDEAS.</span>
        <ArrowUpRight size={30} />
      </figcaption>
    </figure>
  );
}
