import type { Slot, Syl } from "./types";

const TONE_ROW: Record<string, string> = {
  a: "aāáǎà",
  e: "eēéěè",
  i: "iīíǐì",
  o: "oōóǒò",
  u: "uūúǔù",
  ü: "üǖǘǚǜ",
};

const SYLLABLE =
  /^([a-zA-ZüÜ:v]+)([0-5])$/;

export type ToneFormat = "marks" | "numbers" | "none";

export function normalizeBase(raw: string): string {
  return raw.replace(/u:/gi, "ü").replace(/v/gi, "ü").toLowerCase();
}

export function normalizeTone(tone: number): 1 | 2 | 3 | 4 | 5 {
  if (tone === 0 || tone === 5) return 5;
  if (tone >= 1 && tone <= 4) return tone as 1 | 2 | 3 | 4;
  return 5;
}

/** "xue2" / "nu:3" / "nü3" / "er0" → a syllable without erhua folding. */
export function parseSyllableToken(token: string): { base: string; tone: 1 | 2 | 3 | 4 | 5; embeddedErhua: boolean } | null {
  const match = SYLLABLE.exec(token.trim());
  if (!match) return null;
  let base = normalizeBase(match[1]);
  const tone = normalizeTone(Number(match[2]));
  let embeddedErhua = false;
  if (base.endsWith("r") && base !== "er" && base !== "r" && /[aeiouü]/.test(base.slice(0, -1))) {
    base = base.slice(0, -1);
    embeddedErhua = true;
  }
  return { base, tone, embeddedErhua };
}

export function readingKey(pinyin: string): string {
  return pinyin
    .trim()
    .split(/\s+/)
    .map((part) => {
      const parsed = parseSyllableToken(part);
      if (!parsed) return part.toLowerCase();
      const extra = parsed.embeddedErhua ? " r5" : "";
      return `${parsed.base}${parsed.tone}${extra}`;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function paint(base: string, tone: 1 | 2 | 3 | 4 | 5): string {
  if (tone === 5) return base;
  const chars = [...base];
  let index = chars.findIndex((ch) => ch === "a");
  if (index < 0) index = chars.findIndex((ch) => ch === "e");
  if (index < 0) index = chars.findIndex((ch) => ch === "o");
  if (index < 0) {
    for (let i = chars.length - 1; i >= 0; i--) {
      if ("iuü".includes(chars[i])) {
        index = i;
        break;
      }
    }
  }
  if (index < 0) return base;
  const row = TONE_ROW[chars[index]];
  if (!row) return base;
  const marked = [...row][tone];
  if (!marked) return base;
  chars[index] = marked;
  return chars.join("");
}

export function formatSyl(
  syl: Syl,
  format: ToneFormat,
  includeErhua = true,
): string {
  const er = includeErhua && syl.erhua ? "r" : "";
  if (format === "numbers") {
    const body = syl.erhua && includeErhua ? `${syl.base}r` : syl.base;
    return `${body}${syl.tone}`;
  }
  if (format === "none") return `${syl.base}${er}`;
  return `${paint(syl.base, syl.tone)}${er}`;
}

const VOWEL_START = /^[aeoāáǎàēéěèōóǒòüǖǘǚǜ]/;

export function needsApostrophe(previous: string, next: string): boolean {
  return previous.length > 0 && VOWEL_START.test(next);
}

/** Visible pinyin for a word, syllables colored by the caller. */
export function joinReading(slots: Slot[], format: ToneFormat): string {
  const parts: string[] = [];
  for (const slot of slots) {
    if (!slot.syl) continue;
    const text = formatSyl(slot.syl, format, true);
    if (parts.length > 0 && format !== "numbers" && needsApostrophe(parts[parts.length - 1] ?? "", text)) {
      parts.push("'");
    } else if (parts.length > 0 && format === "numbers") {
      parts.push(" ");
    }
    parts.push(text);
  }
  return parts.join("");
}

/**
 * Align a CEDICT numeric reading to the characters of a word.
 * Returns null when the syllable count cannot be paired with the characters.
 */
export function alignReading(chars: string[], numeric: string): Slot[] | null {
  const expanded: { base: string; tone: 1 | 2 | 3 | 4 | 5; isR: boolean }[] = [];
  for (const part of numeric.trim().split(/\s+/)) {
    if (!part) continue;
    const parsed = parseSyllableToken(part);
    if (!parsed) return null;
    const isR = parsed.base === "r";
    expanded.push({ base: parsed.base, tone: parsed.tone, isR });
    if (parsed.embeddedErhua) expanded.push({ base: "r", tone: 5, isR: true });
  }
  const slots: Slot[] = [];
  let si = 0;
  for (const ch of chars) {
    const syl = expanded[si];
    if (!syl) return null;
    if (syl.isR) {
      const previous = slots[slots.length - 1];
      if (!previous?.syl) return null;
      if (ch !== "儿" && ch !== "兒" && chars.length !== expanded.length) return null;
      previous.syl.erhua = true;
      slots.push({ ch, syl: null });
      si++;
      continue;
    }
    slots.push({ ch, syl: { base: syl.base, tone: syl.tone, erhua: false } });
    si++;
  }
  if (si !== expanded.length) return null;
  return slots;
}

export function slotsToNumeric(slots: Slot[]): string {
  const parts: string[] = [];
  for (const slot of slots) {
    if (!slot.syl) continue;
    parts.push(`${slot.syl.base}${slot.syl.tone}`);
    if (slot.syl.erhua) parts.push("r5");
  }
  return parts.join(" ");
}

export function proTokenToSyl(pinyin: string): Syl | null {
  const parsed = parseSyllableToken(pinyin);
  if (!parsed || parsed.base === "r") {
    if (parsed?.base === "r") return { base: "r", tone: 5, erhua: false };
    return null;
  }
  return { base: parsed.base, tone: parsed.tone, erhua: parsed.embeddedErhua };
}
