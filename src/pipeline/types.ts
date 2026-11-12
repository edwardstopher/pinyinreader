/** A syllable aligned to one or more characters of a word. */
export type Syl = {
  /** Plain letters, with ü rather than v or u:. */
  base: string;
  /** 1–4, or 5 for the neutral tone. Citation tones, not sandhi. */
  tone: 1 | 2 | 3 | 4 | 5;
  /** True when an erhua 儿 is pronounced as a trailing -r on this syllable. */
  erhua: boolean;
};

/** One character of a word and the syllable it belongs to. */
export type Slot = {
  ch: string;
  /**
   * Syllable for this character. Null when the character is an erhua 儿
   * whose sound is folded into the previous syllable.
   */
  syl: Syl | null;
};

export type Correction = {
  /** Surface characters of the word the override applies to. */
  text: string;
  /** 0-based occurrence, or every occurrence in the document. */
  occurrence: number | "all";
  /** Numeric pinyin, e.g. "huan2 shu1" or "yi1 dian3 r5". */
  pinyin: string;
};

export type WordToken = {
  kind: "word";
  text: string;
  start: number;
  end: number;
  slots: Slot[];
  hsk2: number | null;
  hsk3: number | null;
  /** Corpus frequency rank. Lower is more frequent. */
  freq: number | null;
  lowConfidence: boolean;
  corrected: boolean;
  /** Indexes into the dictionary entry list for this surface form. */
  entryIds: number[];
  chosenEntry: number | null;
  sentence: number;
};

export type PlainToken = {
  kind: "plain" | "punct" | "space" | "break";
  text: string;
  start: number;
  end: number;
  sentence: number;
};

export type Token = WordToken | PlainToken;

export function isWord(token: Token): token is WordToken {
  return token.kind === "word";
}
