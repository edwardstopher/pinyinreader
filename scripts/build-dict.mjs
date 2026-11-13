/**
 * Build the compact CC-CEDICT + HSK dictionary served from public/dict.
 *
 * Sources (downloaded if the local cache is missing):
 * - CC-CEDICT, CC BY-SA 4.0, https://www.mdbg.net/chinese/dictionary?page=cc-cedict
 * - HSK levels and frequency ranks from drkameleon/complete-hsk-vocabulary (MIT)
 *   commit 7ac65bf1a6387d35f1ade478906172a19311c7f9
 *   HSK 2.0 = old-* levels, HSK 3.0 = newest-* (2026 syllabus) levels.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, "data", "raw");
const OUT_DIR = path.join(ROOT, "public", "dict");
const HSK_SHA = "7ac65bf1a6387d35f1ade478906172a19311c7f9";
const CEDICT_URL = "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz";
const HSK_URL = `https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/${HSK_SHA}/complete.min.json`;

async function ensure(url, file) {
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  process.stdout.write(`downloading ${url}\n`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`failed to download ${url}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(file, buffer);
}

function normalizePinyin(raw) {
  return raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const match = /^([A-Za-z\u00FCu:v:]+)([0-5])$/i.exec(token);
      if (!match) return token.toLowerCase();
      const base = match[1].replace(/u:/gi, "ü").replace(/v/gi, "ü").toLowerCase();
      const tone = match[2] === "0" ? "5" : match[2];
      return `${base}${tone}`;
    })
    .join(" ");
}

function minLevel(levels, prefix) {
  let best = null;
  for (const level of levels ?? []) {
    if (!String(level).startsWith(prefix)) continue;
    const n = Number(String(level).slice(prefix.length));
    if (!Number.isFinite(n) || n <= 0) continue;
    if (best == null || n < best) best = n;
  }
  return best;
}

function clean(value) {
  return value.replace(/[\t\n\r\u001e\u001f]/g, " ").trim();
}

const cedictFile = path.join(CACHE, "cedict.txt.gz");
const hskFile = path.join(CACHE, "hsk.min.json");
// Prefer the already-fetched copies when present.
const cedictSource = fs.existsSync("/tmp/pinyinme-data/cedict.txt.gz")
  ? "/tmp/pinyinme-data/cedict.txt.gz"
  : cedictFile;
const hskSource = fs.existsSync("/tmp/pinyinme-data/hsk.min.json")
  ? "/tmp/pinyinme-data/hsk.min.json"
  : hskFile;

if (!fs.existsSync(cedictSource)) await ensure(CEDICT_URL, cedictFile);
if (!fs.existsSync(hskSource)) await ensure(HSK_URL, hskFile);

const cedictGz = fs.readFileSync(fs.existsSync(cedictSource) ? cedictSource : cedictFile);
const cedict = zlib.gunzipSync(cedictGz).toString("utf8");
const hskList = JSON.parse(fs.readFileSync(fs.existsSync(hskSource) ? hskSource : hskFile, "utf8"));

let cedictDate = "";
let cedictEntries = 0;
for (const line of cedict.split("\n")) {
  if (line.startsWith("#! date=")) cedictDate = line.slice("#! date=".length).trim();
  if (line.startsWith("#! entries=")) cedictEntries = Number(line.slice("#! entries=".length).trim());
}
const version = (cedictDate || "undated").slice(0, 10);

const hskBySimp = new Map();
for (const item of hskList) {
  const simp = item.s;
  if (!simp) continue;
  const prev = hskBySimp.get(simp) ?? { hsk2: null, hsk3: null, freq: null, forms: [] };
  const hsk2 = minLevel(item.l, "o");
  const hsk3 = minLevel(item.l, "t");
  if (hsk2 != null && (prev.hsk2 == null || hsk2 < prev.hsk2)) prev.hsk2 = hsk2;
  if (hsk3 != null && (prev.hsk3 == null || hsk3 < prev.hsk3)) prev.hsk3 = hsk3;
  if (typeof item.q === "number" && (prev.freq == null || item.q < prev.freq)) prev.freq = item.q;
  for (const form of item.f ?? []) {
    if (form?.i?.n) prev.forms.push({ trad: form.t || simp, pinyin: normalizePinyin(form.i.n) });
  }
  hskBySimp.set(simp, prev);
}

const merged = new Map();
const seenSimp = new Set();
const lineRe = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.*)\/\s*$/;

for (const line of cedict.split("\n")) {
  if (!line || line.startsWith("#")) continue;
  const match = lineRe.exec(line);
  if (!match) continue;
  const trad = match[1];
  const simp = match[2];
  const pinyin = normalizePinyin(match[3]);
  const parts = match[4].split("/").map((part) => part.trim()).filter(Boolean);
  const classifiers = [];
  const senses = [];
  for (const part of parts) {
    if (part.startsWith("CL:")) classifiers.push(clean(part.slice(3)));
    else senses.push(clean(part));
  }
  const key = `${simp}\t${trad}\t${pinyin}`;
  const meta = hskBySimp.get(simp);
  const existing = merged.get(key);
  if (existing) {
    for (const sense of senses) if (!existing.senses.includes(sense)) existing.senses.push(sense);
    for (const item of classifiers) if (!existing.classifiers.includes(item)) existing.classifiers.push(item);
    continue;
  }
  merged.set(key, {
    simp,
    trad,
    pinyin,
    hsk2: meta?.hsk2 ?? null,
    hsk3: meta?.hsk3 ?? null,
    freq: meta?.freq ?? null,
    classifiers,
    senses,
  });
  seenSimp.add(simp);
}

let hskOnly = 0;
for (const [simp, meta] of hskBySimp) {
  if (seenSimp.has(simp)) continue;
  const unique = new Set();
  for (const form of meta.forms) {
    const key = `${simp}\t${form.trad}\t${form.pinyin}`;
    if (unique.has(key) || merged.has(key)) continue;
    unique.add(key);
    merged.set(key, {
      simp,
      trad: form.trad,
      pinyin: form.pinyin,
      hsk2: meta.hsk2,
      hsk3: meta.hsk3,
      freq: meta.freq,
      classifiers: [],
      senses: [],
    });
    hskOnly += 1;
  }
}

const lines = [];
for (const entry of merged.values()) {
  lines.push(
    [
      entry.simp,
      entry.trad,
      entry.pinyin,
      entry.hsk2 ?? "",
      entry.hsk3 ?? "",
      entry.freq ?? "",
      entry.classifiers.join("\u001e"),
      entry.senses.join("\u001f"),
    ].join("\t"),
  );
}

const header = [
  "# pinyinme-dict 1",
  `# version ${version}`,
  `# cedict ${cedictDate || "unknown"} entries ${cedictEntries || "unknown"}`,
  `# license CC-CEDICT CC BY-SA 4.0 https://creativecommons.org/licenses/by-sa/4.0/`,
  `# hsk drkameleon/complete-hsk-vocabulary@${HSK_SHA}`,
  `# hsk2 old HSK 2.0 (o1-o6); hsk3 newest HSK 3.0 2026 syllabus (t1-t7)`,
  "",
].join("\n");

const body = header + lines.join("\n") + "\n";
fs.mkdirSync(OUT_DIR, { recursive: true });
const gz = zlib.gzipSync(Buffer.from(body), { level: 9 });
fs.writeFileSync(path.join(OUT_DIR, "cedict.txt.gz"), gz);
fs.writeFileSync(
  path.join(OUT_DIR, "meta.json"),
  JSON.stringify(
    {
      version,
      cedictDate,
      cedictEntries,
      hskSource: `drkameleon/complete-hsk-vocabulary@${HSK_SHA}`,
      file: "/dict/cedict.txt.gz",
      lines: lines.length,
      hskOnly,
    },
    null,
    2,
  ) + "\n",
);

process.stdout.write(
  `entries ${lines.length} (hsk-only ${hskOnly}) gz ${(gz.length / 1024 / 1024).toFixed(2)} MB text ${(body.length / 1024 / 1024).toFixed(2)} MB\n`,
);
