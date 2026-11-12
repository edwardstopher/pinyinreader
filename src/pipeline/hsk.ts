import type { WordToken } from "./types";

export type HskSyllabus = "2" | "3";

export type SelectiveSettings = {
  /** 0 shows every word. Otherwise hide words at or below this level. */
  hskHide: number;
  syllabus: HskSyllabus;
  /** 0 off. Otherwise hide words whose frequency rank is this or better. */
  freqHide: number;
  /** C1 hidden position suppresses pinyin even after a tap-to-reveal. */
  positionHidden: boolean;
};

export function hskLevel(word: Pick<WordToken, "hsk2" | "hsk3">, syllabus: HskSyllabus): number | null {
  return syllabus === "2" ? word.hsk2 : word.hsk3;
}

/** True when selective pinyin would hide this word before a manual reveal. */
export function maskedByLevel(word: Pick<WordToken, "hsk2" | "hsk3" | "freq">, settings: SelectiveSettings): boolean {
  if (settings.positionHidden) return true;
  const level = hskLevel(word, settings.syllabus);
  if (settings.hskHide > 0 && level != null && level <= settings.hskHide) return true;
  if (settings.freqHide > 0 && word.freq != null && word.freq <= settings.freqHide) return true;
  return false;
}

export function showPinyin(
  word: Pick<WordToken, "hsk2" | "hsk3" | "freq" | "start" | "text">,
  settings: SelectiveSettings,
  revealed: readonly { offset: number; text: string }[],
): boolean {
  if (settings.positionHidden) return false;
  if (revealed.some((item) => item.offset === word.start && item.text === word.text)) return true;
  return !maskedByLevel(word, settings);
}
