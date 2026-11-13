import { pinyin as toPinyin, polyphonic } from "pinyin-pro";
import type { Dictionary, Entry } from "../dict/types";
import { endsSentence } from "./han";
import { alignReading, proTokenToSyl, readingKey, slotsToNumeric } from "./pinyin";
import { scan } from "./scan";
import { segmentHan } from "./segment";
import type { Correction, PlainToken, Slot, Token, WordToken } from "./types";

export type Grouping = "word" | "char";

export type AnnotateOptions = {
  dict: Dictionary | null;
  grouping?: Grouping;
  corrections?: readonly Correction[];
};

const PRONOUNS = new Set(
  "我 你 您 他 她 它 咱 我们 我們 你们 你們 他们 他們 她们 她們 它们 它們 咱们 咱們 大家 谁 誰 自己".split(/\s+/),
);

const COMPLEMENT_WORD = new Set(
  "好 多 少 快 慢 完 住 到 懂 清楚 明白 厉害 厲害 漂亮 舒服 认真 認真 动 動 开 開 远 遠 近 大 小 高 低 早 晚 紧 緊 稳 穩 准 準 饱 飽 累 死 掉 成 够 夠 见 見 了 起 上 下".split(/\s+/),
);

function startsComplement(word: string): boolean {
  if (/^(很|太|最|更|不|真|非常|比较|比較)/.test(word)) return true;
  return COMPLEMENT_WORD.has(word);
}

type ProRow = { pinyin?: string; isZh?: boolean };

function readingsFor(text: string): (string | null)[] {
  const chars = [...text];
  if (chars.length === 0) return [];
  const rows = toPinyin(text, { type: "all", toneType: "num", toneSandhi: false }) as ProRow[];
  if (rows.length !== chars.length) {
    return chars.map((ch) => {
      const one = toPinyin(ch, { type: "all", toneType: "num", toneSandhi: false }) as ProRow[];
      const row = one[0];
      return row?.isZh && row.pinyin ? row.pinyin : null;
    });
  }
  return rows.map((row) => (row.isZh && row.pinyin ? row.pinyin : null));
}

function scoreKeys(candidate: string, preferred: string): number {
  if (!candidate || !preferred) return 0;
  if (candidate === preferred) return 100;
  const strip = (value: string) => value.replace(/[1-5]/g, "");
  if (strip(candidate) === strip(preferred)) return 50;
  const left = candidate.split(" ");
  const right = preferred.split(" ");
  let score = 0;
  const n = Math.min(left.length, right.length);
  for (let i = 0; i < n; i++) {
    if (left[i] === right[i]) score += 5;
    else if (strip(left[i] ?? "") === strip(right[i] ?? "")) score += 2;
  }
  return score;
}

function chooseEntry(entries: Entry[], ids: number[], proNumeric: string): { id: number; low: boolean } {
  const distinct = new Set(entries.map((entry) => readingKey(entry.pinyin)));
  if (distinct.size <= 1) return { id: ids[0] ?? -1, low: false };
  const preferred = readingKey(proNumeric);
  let best = 0;
  let bestScore = -1;
  entries.forEach((entry, index) => {
    const score = scoreKeys(readingKey(entry.pinyin), preferred);
    if (score > bestScore) {
      bestScore = score;
      best = index;
    }
  });
  const chosen = readingKey(entries[best]?.pinyin ?? "");
  const uniqueHit = [...distinct].filter((key) => key === preferred).length === 1 && chosen === preferred;
  return { id: ids[best] ?? -1, low: !uniqueHit };
}

function slotsFromPro(chars: string[], pro: (string | null)[], offset: number): Slot[] {
  return chars.map((ch, index) => {
    const raw = pro[offset + index];
    const syl = raw ? proTokenToSyl(raw) : null;
    if (syl?.base === "r") {
      return { ch, syl: null };
    }
    return { ch, syl };
  });
}

function metaOf(entry: Entry | undefined): Pick<WordToken, "hsk2" | "hsk3" | "freq"> {
  return {
    hsk2: entry?.hsk2 ?? null,
    hsk3: entry?.hsk3 ?? null,
    freq: entry?.freq ?? null,
  };
}

function applyDe(tokens: Token[]) {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token?.kind !== "word" || token.text !== "得" || token.corrected) continue;
    const prev = previousWord(tokens, i);
    const next = nextWord(tokens, i);
    let numeric: string | null = null;
    if (prev && PRONOUNS.has(prev.text)) numeric = "dei3";
    else if (prev && next && startsComplement(next.text)) numeric = "de5";
    if (numeric) {
      const slots = alignReading(["得"], numeric);
      if (slots) token.slots = slots;
    }
    token.lowConfidence = true;
  }
}

function previousWord(tokens: Token[], index: number): WordToken | null {
  for (let i = index - 1; i >= 0; i--) {
    const token = tokens[i];
    if (!token || token.kind === "space") continue;
    if (token.kind === "break" || token.kind === "punct") return null;
    if (token.kind === "word") return token;
    return null;
  }
  return null;
}

function nextWord(tokens: Token[], index: number): WordToken | null {
  for (let i = index + 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token || token.kind === "space") continue;
    if (token.kind === "break" || token.kind === "punct") return null;
    if (token.kind === "word") return token;
    return null;
  }
  return null;
}

function explode(token: WordToken): WordToken[] {
  if (token.slots.length <= 1) return [token];
  const parts: WordToken[] = [];
  let offset = token.start;
  token.slots.forEach((slot, index) => {
    const syl = slot.syl ?? { base: "r", tone: 5 as const, erhua: false };
    const slots: Slot[] = [{ ch: slot.ch, syl: slot.syl ? { ...syl, erhua: false } : { base: "r", tone: 5, erhua: false } }];
    const text = slot.ch;
    parts.push({
      ...token,
      text,
      start: offset,
      end: offset + text.length,
      slots,
      lowConfidence: token.lowConfidence,
      entryIds: token.entryIds,
      chosenEntry: index === 0 ? token.chosenEntry : null,
    });
    offset += text.length;
  });
  return parts;
}

function applyCorrections(tokens: Token[], corrections: readonly Correction[]) {
  const seen = new Map<string, number>();
  for (const token of tokens) {
    if (token.kind !== "word") continue;
    const n = seen.get(token.text) ?? 0;
    seen.set(token.text, n + 1);
    const specific = corrections.find((item) => item.text === token.text && item.occurrence === n);
    const all = corrections.find((item) => item.text === token.text && item.occurrence === "all");
    const chosen = specific ?? all;
    if (!chosen) continue;
    const slots = alignReading([...token.text], chosen.pinyin);
    if (!slots) continue;
    token.slots = slots;
    token.corrected = true;
    token.lowConfidence = false;
  }
}

const CHUNK = 7000;

export function planChunks(text: string): { text: string; start: number }[] {
  if (text.length <= CHUNK) return [{ text, start: 0 }];
  const parts: { text: string; start: number }[] = [];
  let index = 0;
  while (index < text.length) {
    let end = Math.min(text.length, index + CHUNK);
    if (end < text.length) {
      const breakAt = text.lastIndexOf("\n", end);
      if (breakAt > index + CHUNK / 2) end = breakAt + 1;
      const code = text.charCodeAt(end);
      if (end < text.length && code >= 0xdc00 && code <= 0xdfff) end -= 1;
    }
    parts.push({ text: text.slice(index, end), start: index });
    if (end === index) break;
    index = end;
  }
  return parts;
}

function annotateDocument(text: string, options: AnnotateOptions, wordsOnly = false): Token[] {
  const pro = text.includes("\u4e00") || /[\u3400-\u9fff\u3007]/.test(text) || [...text].some((ch) => (ch.codePointAt(0) ?? 0) > 0xffff)
    ? readingsFor(text)
    : [];
  const runs = scan(text);
  const tokens: Token[] = [];
  let sentence = 0;

  const bump = (kind: Token["kind"], value: string) => {
    if (kind === "break") sentence += 1;
    else if (kind === "punct" && endsSentence(value)) sentence += 1;
  };

  for (const run of runs) {
    if (run.kind !== "han") {
      const token: PlainToken = {
        kind: run.kind,
        text: run.text,
        start: run.start,
        end: run.end,
        sentence,
      };
      tokens.push(token);
      bump(run.kind, run.text);
      continue;
    }

    const chars = run.chars;
    const segments = options.dict
      ? segmentHan(chars, options.dict)
      : chars.map((ch) => ({ text: ch, ids: null as number[] | null }));

    let consumed = 0;
    for (const segment of segments) {
      const local = [...segment.text];
      const proSlice = pro.slice(run.cpStart + consumed, run.cpStart + consumed + local.length);
      const proNumeric = proSlice.filter((item): item is string => !!item).join(" ");
      const ids = segment.ids ?? [];
      const entries = ids.map((id) => options.dict?.entries[id]).filter((entry): entry is Entry => entry != null);
      let slots: Slot[] | null = null;
      let chosen: number | null = null;
      let low = false;
      if (entries.length > 0) {
        const pick = chooseEntry(entries, ids, proNumeric);
        chosen = pick.id >= 0 ? pick.id : null;
        low = pick.low;
        const entry = options.dict?.entries[pick.id];
        if (entry) slots = alignReading(local, entry.pinyin);
      }
      if (!slots) {
        slots = alignReading(local, proNumeric) ?? slotsFromPro(local, pro, run.cpStart + consumed);
        if (options.dict && local.length === 1 && proSlice[0]) {
          const rows = polyphonic(local[0], { type: "array", toneType: "num" }) as string[][];
          const distinct = new Set((rows[0] ?? []).map((item) => readingKey(item)).filter(Boolean));
          if (distinct.size > 1) low = true;
        }
      }
      const entry = chosen != null ? options.dict?.entries[chosen] : entries[0];
      const start = run.start + [...chars.slice(0, consumed)].join("").length;
      const word: WordToken = {
        kind: "word",
        text: segment.text,
        start,
        end: start + segment.text.length,
        slots,
        ...metaOf(entry),
        lowConfidence: low,
        corrected: false,
        entryIds: ids,
        chosenEntry: chosen,
        sentence,
      };
      tokens.push(word);
      consumed += local.length;
    }
  }

  applyDe(tokens);
  if (wordsOnly) return tokens;
  return finishTokens(tokens, options);
}

function explodeAll(tokens: Token[], options: AnnotateOptions): Token[] {
  if ((options.grouping ?? "word") !== "char") return tokens;
  const flat: Token[] = [];
  for (const token of tokens) {
    if (token.kind !== "word") {
      flat.push(token);
      continue;
    }
    const parts = explode(token);
    if (parts.length === 1) {
      flat.push(token);
      continue;
    }
    for (const part of parts) {
      const ids = options.dict?.ids(part.text) ?? [];
      const entries = ids.map((id) => options.dict?.entries[id]).filter((entry): entry is Entry => entry != null);
      const proNumeric = slotsToNumeric(part.slots);
      if (entries.length > 0) {
        const pick = chooseEntry(entries, ids, proNumeric);
        const entry = options.dict?.entries[pick.id];
        flat.push({
          ...part,
          entryIds: ids,
          chosenEntry: pick.id,
          lowConfidence: part.corrected ? false : pick.low || part.lowConfidence,
          ...metaOf(entry),
        });
      } else {
        flat.push({ ...part, entryIds: [], chosenEntry: null, hsk2: null, hsk3: null, freq: null });
      }
    }
  }
  return flat;
}

function finishTokens(tokens: Token[], options: AnnotateOptions): Token[] {
  applyCorrections(tokens, options.corrections ?? []);
  return explodeAll(tokens, options);
}

export function annotate(text: string, options: AnnotateOptions): Token[] {
  const parts = planChunks(text);
  if (parts.length === 1) return annotateDocument(text, options);
  const merged: Token[] = [];
  let sentenceOffset = 0;
  for (const part of parts) {
    const local = annotateDocument(part.text, options, true);
    let maxSentence = sentenceOffset;
    for (const token of local) {
      const sentence = token.sentence + sentenceOffset;
      if (sentence > maxSentence) maxSentence = sentence;
      merged.push({ ...token, start: token.start + part.start, end: token.end + part.start, sentence });
    }
    sentenceOffset = maxSentence + 1;
  }
  return finishTokens(merged, options);
}

export async function annotateProgressive(
  text: string,
  options: AnnotateOptions,
  onPartial: (tokens: Token[]) => void,
): Promise<Token[]> {
  const parts = planChunks(text);
  if (parts.length === 1) {
    const tokens = annotateDocument(text, options);
    onPartial(tokens);
    return tokens;
  }
  const merged: Token[] = [];
  let sentenceOffset = 0;
  for (const part of parts) {
    const local = annotateDocument(part.text, options, true);
    let maxSentence = sentenceOffset;
    for (const token of local) {
      const sentence = token.sentence + sentenceOffset;
      if (sentence > maxSentence) maxSentence = sentence;
      merged.push({ ...token, start: token.start + part.start, end: token.end + part.start, sentence });
    }
    sentenceOffset = maxSentence + 1;
    onPartial(merged.slice());
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  const done = finishTokens(merged, options);
  onPartial(done);
  return done;
}

export function tokenText(tokens: readonly Token[]): string {
  return tokens.map((token) => token.text).join("");
}
