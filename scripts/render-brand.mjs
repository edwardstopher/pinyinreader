/**
 * Rasterize the social card and icons with the system Chrome.
 * Not part of the Vercel build: the PNGs and favicon.ico are committed.
 *
 *   node scripts/render-brand.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const chrome = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";
const dir = join(tmpdir(), "pinyinme-brand");
mkdirSync(dir, { recursive: true });

const mark = (size) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: ${size}px; height: ${size}px; overflow: hidden; background: #9c2f1c; }
  body { display: flex; align-items: center; justify-content: center; }
  span { font-family: "Liberation Serif", Georgia, serif; font-size: ${Math.round(size * 0.58)}px; line-height: 1; color: #fffdf9; }
</style></head><body><span>ā</span></body></html>`;

function cardHtml({ title, sub, words }) {
  const wordHtml = words.map((word) => {
    const units = word.units.map((unit) => `<div class="unit"><span class="py t${unit.tone}">${unit.py}</span><span class="hz">${unit.hz}</span></div>`).join("");
    return `<div class="word"><div class="units">${units}</div><p class="gloss">${word.gloss}</p></div>`;
  }).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #f7f4ee; color: #1d1a16; }
  body { font-family: "Liberation Sans", "Nimbus Sans", sans-serif; }
  .bar { position: absolute; inset: 0 auto 0 0; width: 18px; background: #9c2f1c; }
  .wrap { padding: 68px 80px 56px 92px; }
  .brand { display: flex; align-items: baseline; gap: 18px; }
  .mark { font-family: "Liberation Serif", Georgia, serif; font-size: 78px; line-height: 0.8; color: #9c2f1c; }
  .name { font-family: "Liberation Serif", Georgia, serif; font-size: 58px; letter-spacing: -0.03em; }
  h1 { font-size: 60px; font-weight: 700; letter-spacing: -0.035em; margin: 28px 0 8px; }
  .sub { margin: 0; font-size: 28px; color: #5c564c; }
  .card { margin-top: 42px; background: #fffdf9; border: 1px solid #e3dbd0; border-radius: 18px; padding: 28px 40px 24px; display: flex; gap: 72px; }
  .word { text-align: center; }
  .units { display: flex; gap: 10px; justify-content: center; }
  .unit { display: flex; flex-direction: column; align-items: center; min-width: 72px; }
  .py { font-family: "Liberation Serif", Georgia, serif; font-size: 26px; line-height: 1; }
  .hz { font-family: "WenQuanYi Micro Hei", "Droid Sans Fallback", sans-serif; font-size: 64px; line-height: 1.15; }
  .gloss { margin: 8px 0 0; color: #5c564c; font-size: 20px; }
  .t2 { color: #8a4b00; }
  .t3 { color: #1b6b32; }
  .t4 { color: #154a9a; }
</style></head><body>
  <div class="bar"></div>
  <div class="wrap">
    <div class="brand"><span class="mark">ā</span><span class="name">PinyinMe</span></div>
    <h1>${title}</h1>
    <p class="sub">${sub}</p>
    <div class="card">${wordHtml}</div>
  </div>
</body></html>`;
}

const bank = { units: [{ py: "yín", hz: "银", tone: 2 }, { py: "háng", hz: "行", tone: 2 }], gloss: "银行 · bank" };
const walk = { units: [{ py: "xíng", hz: "行", tone: 2 }, { py: "zǒu", hz: "走", tone: 3 }], gloss: "行走 · to walk" };
const moon = { units: [{ py: "míng", hz: "明", tone: 2 }, { py: "yuè", hz: "月", tone: 4 }], gloss: "明月 · bright moon" };
const tradBank = { units: [{ py: "yín", hz: "銀", tone: 2 }, { py: "háng", hz: "行", tone: 2 }], gloss: "銀行 · bank" };

const cards = [
  { file: "public/og-image.png", title: "Chinese to pinyin", sub: "Definitions · HSK levels · simplified or traditional · print", words: [bank, walk] },
  { file: "public/og-chinese-to-pinyin.png", title: "Chinese to pinyin", sub: "A reading on each word, with tone marks", words: [bank, walk] },
  { file: "public/og-pinyin-for-printing.png", title: "Print with pinyin", sub: "A reading handout, not a handwriting sheet", words: [moon, bank] },
  { file: "public/og-hsk-pinyin.png", title: "HSK pinyin", sub: "Hide readings up to a level you choose", words: [bank, walk] },
  { file: "public/og-traditional-chinese-pinyin.png", title: "Traditional characters", sub: "Pinyin for the text as written", words: [tradBank, walk] },
  { file: "public/og-chinese-reader.png", title: "Reader and dictionary", sub: "Your text, with definitions when you ask", words: [bank, walk] },
];

function shot(html, file, width, height) {
  const htmlPath = join(dir, `${width}x${height}-${file.replace(/\W/g, "")}.html`);
  writeFileSync(htmlPath, html);
  // Headless Chrome writes the PNG and then often fails to exit in this environment.
  spawnSync("timeout", ["12", chrome,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--virtual-time-budget=2000",
    `--window-size=${width},${height}`,
    `--screenshot=${file}`,
    `file://${htmlPath}`,
  ], { stdio: "inherit" });
}

function pngSize(file) {
  const data = readFileSync(file);
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

function icoFromPngs(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = 6 + 16 * count;
  const entries = pngs.map((png) => {
    const entry = Buffer.alloc(16);
    const size = png.size >= 256 ? 0 : png.size;
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.buffer.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((png) => png.buffer)]);
}

const cardsOnly = process.argv.includes("cards");
const jobs = [
  ...cards.map((item) => ({ html: cardHtml(item), file: join(root, item.file), width: 1200, height: 630 })),
  ...(cardsOnly ? [] : [
    { html: mark(512), file: join(root, "public/icon-512.png"), width: 512, height: 512 },
    { html: mark(192), file: join(root, "public/icon-192.png"), width: 192, height: 192 },
    { html: mark(180), file: join(root, "public/apple-touch-icon.png"), width: 180, height: 180 },
    { html: mark(48), file: join(dir, "icon-48.png"), width: 48, height: 48 },
    { html: mark(32), file: join(dir, "icon-32.png"), width: 32, height: 32 },
    { html: mark(16), file: join(dir, "icon-16.png"), width: 16, height: 16 },
  ]),
];

for (const job of jobs) {
  shot(job.html, job.file, job.width, job.height);
  const size = pngSize(job.file);
  if (size.width !== job.width || size.height !== job.height) {
    throw new Error(`${job.file} is ${size.width}x${size.height}, expected ${job.width}x${job.height}`);
  }
  console.log(job.file, size);
}

if (!cardsOnly) {
  const ico = icoFromPngs([16, 32, 48].map((size) => ({
    size,
    buffer: readFileSync(join(dir, `icon-${size}.png`)),
  })));
  writeFileSync(join(root, "public/favicon.ico"), ico);
  console.log("favicon.ico", ico.length);
}
