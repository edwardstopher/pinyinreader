export type Entry = {
  simp: string;
  trad: string;
  /** Numeric pinyin separated by spaces, neutral tone as 5. */
  pinyin: string;
  /** HSK 2.0 level, 1–6. */
  hsk2: number | null;
  /** HSK 3.0 (2026 syllabus) level, 1–7. Band 7 includes 7–9. */
  hsk3: number | null;
  /** Lower is more frequent. Null when the word is not on the frequency list. */
  freq: number | null;
  classifiers: string[];
  senses: string[];
};

export type Dictionary = {
  version: string;
  entries: Entry[];
  byForm: Map<string, number[]>;
  maxLen: number;
  lookup(form: string): Entry[] | undefined;
  ids(form: string): number[] | undefined;
};

export type DictMeta = {
  version: string;
  cedictDate: string;
  cedictEntries: number;
  hskSource: string;
  file: string;
  lines: number;
};
