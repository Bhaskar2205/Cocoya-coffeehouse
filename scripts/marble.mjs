#!/usr/bin/env node
/**
 * Pre-renders the milk-marbling textures used inside the illustrated glasses.
 *
 * Rendering feTurbulence + feDisplacementMap live in the browser is expensive
 * (it is recomputed on every repaint — painful on phones). Baking it once into
 * two small transparent WebPs keeps the exact look at a fraction of the cost;
 * the glasses crossfade between the two seeds to suggest gentle swirling.
 *
 *   node scripts/marble.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "images", "art");
fs.mkdirSync(outDir, { recursive: true });

// Same shapes as components/art/glass.tsx (glass coordinate space 420×600).
const CLOUDS = [
  [168, 250, 62, 30, 0.7],
  [252, 228, 54, 26, 0.68],
  [208, 312, 78, 24, 0.55],
  [150, 365, 46, 20, 0.45],
  [262, 352, 52, 22, 0.48],
  [204, 420, 64, 16, 0.32],
  [220, 186, 90, 26, 0.8],
];
const TENDRILS = [
  ["M140 330 C170 300 190 340 220 300 C240 275 262 300 280 270", 9],
  ["M130 410 C165 380 200 420 236 382 C256 362 280 380 296 352", 12],
  ["M172 230 C186 260 214 236 232 262", 6],
];

// Crop window inside the glass (must match <image x y width height> in glass.tsx).
const X = 60, Y = 120, W = 300, H = 360, SCALE = 2;

function svg(seed, freq) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}" viewBox="${X} ${Y} ${W} ${H}">
  <defs>
    <filter id="m" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="64" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="3.4"/>
    </filter>
  </defs>
  <g filter="url(#m)">
    ${CLOUDS.map(([cx, cy, rx, ry, o]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#f6ecdf" opacity="${o}"/>`).join("\n    ")}
    ${TENDRILS.map(([d, w]) => `<path d="${d}" stroke="#6a3a1e" stroke-width="${w}" stroke-linecap="round" fill="none" opacity="0.5"/>`).join("\n    ")}
  </g>
</svg>`;
}

for (const [name, seed, freq] of [
  ["marble-a", 4, "0.011 0.026"],
  ["marble-b", 11, "0.014 0.032"],
]) {
  const out = path.join(outDir, `${name}.webp`);
  await sharp(Buffer.from(svg(seed, freq))).webp({ quality: 82, alphaQuality: 90 }).toFile(out);
  console.log(`✓ ${path.relative(root, out)} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
}
