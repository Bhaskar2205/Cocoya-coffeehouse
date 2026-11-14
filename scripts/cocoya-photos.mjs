#!/usr/bin/env node
/**
 * Processes Cocoya's own photographs (photos/cocoya-originals) into
 * web-ready, gently enhanced images in public/images/cocoya.
 *
 * The "luxe" grade is deliberately softer than the stock-photo grade: it lifts
 * shadows in darker interior shots, adds local contrast (CLAHE) and clarity,
 * warms slightly and adds a whisper of vignette — the café should still look
 * like itself, just at its best.
 *
 *   node scripts/cocoya-photos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "photos", "cocoya-originals");
const outDir = path.join(root, "public", "images", "cocoya");

/** original file → output path, plus per-photo tweaks */
const PHOTOS = [
  ["01.jpg", "drinks/mango-matcha.jpg", {}],
  ["02.jpg", "drinks/vietnamese-drip-alt.jpg", {}],
  ["03.jpg", "drinks/vietnamese-drip.jpg", {}],
  ["04.jpg", "drinks/strawberry-matcha-top.jpg", { lift: 1.08 }],
  ["05.jpg", "drinks/orange-espresso-window.jpg", {}],
  ["06.jpg", "interior/bar-counter.jpg", {}],
  ["07.jpg", "drinks/orange-espresso.jpg", {}],
  ["08.jpg", "interior/bar-lanterns.jpg", { lift: 1.12 }],
  ["09.jpg", "food/basil-chilli-closeup.jpg", { lift: 1.06 }],
  ["10.jpg", "food/basil-chilli-top.jpg", {}],
  ["11.jpg", "interior/lounge.jpg", { lift: 1.12 }],
  ["12.jpg", "interior/dining-hall.jpg", { lift: 1.3, clahe: true }],
  ["13.jpg", "interior/lounge-wide.jpg", { lift: 1.1 }],
  ["14.jpg", "food/basil-chilli.jpg", { lift: 1.06, maxWidth: 1400 }],
  ["15.jpg", "interior/dining-curtains.jpg", { lift: 1.55, clahe: true }],
  ["16.jpg", "drinks/iced-latte.jpg", { lift: 1.1 }],
  ["17.jpg", "drinks/iced-latte-alt.jpg", { lift: 1.04 }],
  ["18.jpg", "drinks/orange-espresso-small.jpg", { lift: 1.06 }],
  ["19.jpg", "drinks/orange-espresso-glow.jpg", { lift: 1.12 }],
  ["20.jpg", "drinks/strawberry-matcha.jpg", { lift: 1.06 }],
  ["21.jpg", "drinks/strawberry-matcha-alt.jpg", { lift: 1.04 }],
  ["22.jpg", "interior/bar-angle.jpg", { lift: 1.12 }],
  ["23.jpg", "food/basil-chilli-plate.jpg", { lift: 1.06 }],
];

const WARM = [
  [1.03, 0.02, 0.0],
  [0.0, 1.0, 0.0],
  [0.0, 0.02, 0.96],
];

function vignette(w, h, strength) {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g" cx="50%" cy="50%" r="78%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#120a05" stop-opacity="${strength}"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  );
}

for (const [file, out, opts] of PHOTOS) {
  const input = path.join(srcDir, file);
  if (!fs.existsSync(input)) {
    console.warn(`skip ${file} (missing)`);
    continue;
  }
  const meta = await sharp(input).metadata();
  const maxWidth = opts.maxWidth ?? 1600;
  let img = sharp(input).rotate().resize({ width: Math.min(maxWidth, meta.width), withoutEnlargement: true });
  if (opts.clahe) img = img.clahe({ width: 96, height: 96, maxSlope: 2 });
  img = img
    .recomb(WARM)
    .modulate({ brightness: opts.lift ?? 1.02, saturation: 1.06 })
    .linear(1.06, -6);
  let buf = await img.toBuffer();
  const { width, height } = await sharp(buf).metadata();
  buf = await sharp(buf)
    .composite([{ input: vignette(width, height, 0.28), blend: "multiply" }])
    .sharpen({ sigma: 0.8, m1: 0.6, m2: 2 })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toBuffer();
  const dest = path.join(outDir, out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  console.log(`✓ ${out.padEnd(36)} ${width}x${height} ${Math.round(buf.length / 1024)} KB`);
}
