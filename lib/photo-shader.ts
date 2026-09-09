export const PHOTO_CELL_SIZE = 2.5;
export const PHOTO_FRAME_INTERVAL = 1000 / 20;
export type PhotoPointer = { x: number; y: number };

// Sample once; only the fine ink/lime treatment changes per frame.
export function createPhotoShader(
  source: Uint8ClampedArray,
  columns: number,
  rows: number,
  phase = 0,
) {
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const tones = new Uint8Array(columns * rows);
  const edges = new Float32Array(columns);
  const waveX = new Float32Array(columns);
  const waveCosX = new Float32Array(columns);
  const waveY = new Float32Array(rows);
  const waveCosY = new Float32Array(rows);
  for (let y = 0; y < rows; y++) {
    waveY[y] = Math.sin((y / rows) * 3);
    waveCosY[y] = Math.cos((y / rows) * 3);
    for (let x = 0; x < columns; x++) {
      const index = y * columns + x;
      const offset = index * 4;
      const light =
        (source[offset] * 0.2126 +
          source[offset + 1] * 0.7152 +
          source[offset + 2] * 0.0722) /
        255;
      tones[index] =
        light * 1.6 > (bayer[(y % 4) * 4 + (x % 4)] + 0.5) / 16 ? 1 : 0;
    }
  }
  for (let x = 0; x < columns; x++) {
    edges[x] = Math.pow(Math.abs(x / columns - 0.5) * 2, 1.5) * 0.35;
  }
  return (
    output: Uint8ClampedArray,
    elapsed: number,
    pointer?: PhotoPointer,
  ) => {
    for (let x = 0; x < columns; x++) {
      const angle = (x / columns) * 7 - elapsed * 0.35 + phase;
      waveX[x] = Math.sin(angle);
      waveCosX[x] = Math.cos(angle);
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const index = y * columns + x;
        const offset = index * 4;
        const wave =
          0.5 + 0.5 * (waveX[x] * waveCosY[y] + waveCosX[x] * waveY[y]);
        const band = wave * wave * wave * wave;
        let mix = 0.05 + edges[x] + band * band * 0.42;
        if (pointer)
          mix *= Math.min(1, Math.hypot(x - pointer.x, y - pointer.y) / 48);
        const light = tones[index];
        output[offset] = source[offset] * (1 - mix) + (light ? 213 : 10) * mix;
        output[offset + 1] =
          source[offset + 1] * (1 - mix) + (light ? 255 : 21) * mix;
        output[offset + 2] =
          source[offset + 2] * (1 - mix) + (light ? 88 : 27) * mix;
        output[offset + 3] = 255;
      }
    }
  };
}
