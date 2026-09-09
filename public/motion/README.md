# AI SF Tour photo shader exports

Eight real animated GIFs exported from the existing `createPhotoShader` renderer: four 640px versions and four 360px phone versions. All preserve the source photographs and each route's existing phase offset. No generated imagery or image service was used.

Every GIF is a 6-second infinite loop containing 60 distinct frames with 100ms delays. Rendering uses the existing 2.5px cell size, one exact shader period (`2π / 0.35` elapsed seconds), and nearest-neighbor enlargement. Source sampling uses Lanczos3. FFmpeg encodes a single global palette per GIF without extra dithering and 59 transparent delta frames. This accelerates the existing approximately 17.95-second shader cycle into the requested 6-second export.

The matching `-still.webp` files are lossless first-frame decodes of the final GIFs, so switching between the first GIF frame and its still has no color or texture mismatch. Choose the matching 360px or 640px still when changing responsive sources.

| GIF | Dimensions | Bytes | Palette capacity |
|---|---:|---:|---:|
| san-francisco-shader-640.gif | 640 × 396 | 1,332,297 | 96 |
| branch-a-chinatown-night-shader-640.gif | 640 × 457 | 1,428,052 | 72 |
| branch-b-chase-center-shader-640.gif | 640 × 422 | 1,457,333 | 80 |
| branch-c-ocean-beach-shader-640.gif | 640 × 480 | 1,463,620 | 64 |
| san-francisco-shader-360.gif | 360 × 222 | 447,948 | 96 |
| branch-a-chinatown-night-shader-360.gif | 360 × 257 | 474,736 | 64 |
| branch-b-chase-center-shader-360.gif | 360 × 237 | 489,712 | 64 |
| branch-c-ocean-beach-shader-360.gif | 360 × 270 | 491,733 | 48 |

Palette capacity includes one reserved transparent entry. Dimensions retain source aspect ratios rounded to the nearest whole pixel. All desktop files are below 1.5MB, and every phone file is below 500KB.

`assets.json` contains all filenames, sizes, dimensions, shader phases, source filenames, source renderer hash, method, credits, license links, and transformation notes. `verification.json` records a fresh structural/decode audit with FFprobe and Sharp: loop flags, frame counts, durations, delays, unique frames, shared palettes, embedded credits, first-frame equality, and loop boundary differences. The shader's unsampled endpoint matches its initial frame byte for byte. The GIF boundary's normal single-frame change is within 0.86–1.12 times the mean change between adjacent frames, avoiding an extra seam jump.

`contact-sheet.png` compares the original photographs with decoded final 640px GIF frames at 0, 1.5, 3, and 4.5 seconds. The photographs and sampled frames were visually inspected.

Source photo credits (copied from the existing site's credit metadata):

- California Street: Matthiasmullie, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Cable_car_in_California_Street.jpg
- Chinatown: Frank Schulenburg, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Grant_Avenue,_Chinatown_San_Francisco,_at_night-L1001359.jpg
- Chase Center: Willowcharter, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Chase_Center_2019.jpg
- Ocean Beach: Yair Haklai, CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Pacific_Ocean_Beach-San_Francisco.jpg

Each GIF embeds a comment containing its credit, original source URL, license URL, and adaptation note. Each still embeds the same credit information as XMP. Keep the corresponding source credit/license visible in the site's photography credits.

Reproduction scripts are `export-shader.mjs` (run with width 640 and then 360), `encode-final.mjs`, and `verify-assets.mjs`. They read the source site and write exclusively under this asset directory. `intermediate/` contains scratch renders and encoding comparisons, not files for deployment.
