import { polyphonic } from "pinyin-pro";
import type { Dictionary, Entry } from "./types";
import { alignReading, joinReading, readingKey } from "../pipeline/pinyin";
import type { WordToken } from "../pipeline/types";

export type ReadingOption = { pinyin: string; label: string };

export type SenseBlock = {
  pinyin: string;
  pinyinLabel: string;
  senses: string[];
  classifiers: string[];
  trad: string;
  simp: string;
  hsk2: number | null;
  hsk3: number | null;
};

export type DictView = {
  ready: boolean;
  readings: ReadingOption[];
  blocks: SenseBlock[];
  characters: { ch: string; rows: { pinyin: string; sense: string }[] }[];
};

export function readingsFor(token: WordToken, dict: Dictionary | null): ReadingOption[] {
  const map = new Map<string, string>();
  const add = (pinyin: string) => {
    const key = readingKey(pinyin);
    if (key && !map.has(key)) map.set(key, pinyin);
  };
  if (dict) {
    for (const id of token.entryIds) {
      const entry = dict.entries[id];
      if (entry) add(entry.pinyin);
    }
    for (const entry of dict.lookup(token.text) ?? []) add(entry.pinyin);
  }
  if ([...token.text].length === 1) {
    const rows = polyphonic(token.text, { type: "array", toneType: "num" }) as string[][];
    for (const item of rows[0] ?? []) add(item);
  }
  const current = token.slots
    .flatMap((slot) => (slot.syl ? [`${slot.syl.base}${slot.syl.tone}`, ...(slot.syl.erhua ? ["r5"] : [])] : []))
    .join(" ");
  if (current) add(current);
  return [...map.values()].map((pinyin) => {
    const slots = alignReading([...token.text], pinyin);
    return { pinyin, label: slots ? joinReading(slots, "marks") : pinyin };
  });
}

function entryPinyin(entry: Entry, surface: string): string {
  const slots = alignReading([...surface], entry.pinyin);
  return slots ? joinReading(slots, "marks") : entry.pinyin;
}

/** Everything the definition panel needs for one word. `ready` is false until the dictionary is parsed. */
export function describeToken(token: WordToken, dict: Dictionary | null): DictView {
  const readings = readingsFor(token, dict);
  if (!dict) return { ready: false, readings, blocks: [], characters: [] };
  const ids = token.entryIds.length > 0 ? token.entryIds : dict.ids(token.text) ?? [];
  const pairs = ids
    .map((id) => ({ id, entry: dict.entries[id] }))
    .filter((item): item is { id: number; entry: Entry } => item.entry != null);
  const chosen = token.chosenEntry;
  pairs.sort((a, b) => {
    if (a.id === chosen) return -1;
    if (b.id === chosen) return 1;
    return 0;
  });
  const blocks = pairs.map(({ entry }) => ({
    pinyin: entry.pinyin,
    pinyinLabel: entryPinyin(entry, token.text),
    senses: entry.senses,
    classifiers: entry.classifiers,
    trad: entry.trad,
    simp: entry.simp,
    hsk2: entry.hsk2,
    hsk3: entry.hsk3,
  }));
  const characters = [...token.text].map((ch) => ({
    ch,
    rows: (dict.lookup(ch) ?? []).slice(0, 3).map((entry) => ({
      pinyin: entryPinyin(entry, ch),
      sense: entry.senses[0] ?? "",
    })),
  }));
  return { ready: true, readings, blocks, characters };
}
