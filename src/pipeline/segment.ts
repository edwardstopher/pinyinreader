import type { Entry } from "../dict/types";

export type DictLookup = {
  maxLen: number;
  lookup(form: string): Entry[] | undefined;
  ids(form: string): number[] | undefined;
};

export type Segment = {
  text: string;
  ids: number[] | null;
};

function bestFreq(entries: Entry[]): number | null {
  let best: number | null = null;
  for (const entry of entries) {
    if (entry.freq == null) continue;
    if (best == null || entry.freq < best) best = entry.freq;
  }
  return best;
}

function wordCost(length: number, freq: number | null): number {
  let cost = length === 1 ? 1 : 1 / (length * length);
  if (freq != null && freq > 0) {
    cost -= Math.min(0.15, 1.1 / Math.log2(freq + 3));
  }
  return Math.max(0.01, cost);
}

/**
 * Dictionary dynamic-programming segmentation.
 * Longer dictionary words win, and a leftover single character is expensive,
 * so "研究生命起源" stays 研究|生命|起源 rather than 研究生|命|起源.
 */
export function segmentHan(chars: string[], dict: DictLookup): Segment[] {
  const n = chars.length;
  if (n === 0) return [];
  const utf16: number[] = [0];
  let joined = "";
  for (const ch of chars) {
    joined += ch;
    utf16.push(joined.length);
  }
  const best = new Float64Array(n + 1);
  best.fill(Number.POSITIVE_INFINITY);
  best[0] = 0;
  const prev = new Int32Array(n + 1);
  prev.fill(-1);

  const max = Math.min(dict.maxLen, 20);
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(best[i])) continue;
    const limit = Math.min(max, n - i);
    for (let len = limit; len >= 1; len--) {
      const form = joined.slice(utf16[i], utf16[i + len]);
      const entries = dict.lookup(form);
      if (!entries || entries.length === 0) continue;
      const next = best[i] + wordCost(len, bestFreq(entries));
      if (next < best[i + len]) {
        best[i + len] = next;
        prev[i + len] = i;
      }
    }
    const known = dict.lookup(chars[i] ?? "");
    if (!known || known.length === 0) {
      const next = best[i] + 1.8;
      if (next < best[i + 1]) {
        best[i + 1] = next;
        prev[i + 1] = i;
      }
    }
  }

  const parts: Segment[] = [];
  let cursor = n;
  while (cursor > 0) {
    const start = prev[cursor];
    if (start < 0 || start >= cursor) {
      const ch = chars[cursor - 1] ?? "";
      parts.push({ text: ch, ids: dict.ids(ch) ?? null });
      cursor -= 1;
      continue;
    }
    const text = joined.slice(utf16[start], utf16[cursor]);
    parts.push({ text, ids: dict.ids(text) ?? null });
    cursor = start;
  }
  parts.reverse();
  return parts;
}
