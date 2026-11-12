import type { Correction } from "./pipeline/types";

export type Position = "above" | "below" | "inline" | "hidden";
export type ToneFormat = "marks" | "numbers" | "none";
export type Grouping = "word" | "char";
export type ToneColor = "off" | "pinyin" | "chars" | "both";
export type ToneScheme = "classic" | "colorblind";
export type HanFont = "sans" | "song" | "kai";
export type PyFont = "sans" | "serif" | "readable";
export type ThemeName = "light" | "dark" | "sepia" | "contrast";
export type HskSyllabus = "2" | "3";
export type DictTrigger = "hover" | "click";
export type Paper = "letter" | "a4";
export type PrintTone = "color" | "grayscale" | "patterns";

export type StyleSettings = {
  grouping: Grouping;
  position: Position;
  toneFormat: ToneFormat;
  toneColor: ToneColor;
  toneScheme: ToneScheme;
  hanFont: HanFont;
  pyFont: PyFont;
  hanSize: number;
  pySize: number;
  charSpacing: number;
  wordSpacing: number;
  lineHeight: number;
  paragraphSpacing: number;
  /** Approximate characters per line. 0 means the full width. */
  measure: number;
  theme: ThemeName;
  hskSyllabus: HskSyllabus;
  hskHide: number;
  freqHide: number;
};

export type PrintSettings = {
  /** Null uses the style currently on screen. */
  presetId: string | null;
  paper: Paper;
  orientation: "portrait" | "landscape";
  marginMm: number;
  toneMode: PrintTone;
  minPinyinPt: number;
};

export type Settings = StyleSettings & {
  dictTrigger: DictTrigger;
  dictPinned: boolean;
  rate: number;
  print: PrintSettings;
};

export type Preset = {
  id: string;
  name: string;
  builtin: boolean;
  style: StyleSettings;
};

export type Reveal = { offset: number; text: string };

export type Doc = {
  id: string;
  title: string;
  titleAuto: boolean;
  source: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
  anchor: number;
  corrections: Correction[];
  revealed: Reveal[];
};

export const WELCOME_TEXT = `今天天气很好，我们去公园散步吧。湖边有一点儿风，我想在那儿坐一会儿。

坐下来之前，我要先去图书馆还书。图书馆旁边是银行，今天就不用过去了。

汉字看起来很难，拼音却能帮你把它们读出来。已经认识的词，可以把拼音收起来；想不起来的时候，点一下就行。`;

export const SAMPLES = [
  { label: "我想学中文", text: "我想学中文" },
  { label: "拼音帮助你发音汉字", text: "拼音帮助你发音汉字" },
];

export const defaultStyle: StyleSettings = {
  grouping: "word",
  position: "below",
  toneFormat: "marks",
  toneColor: "pinyin",
  toneScheme: "classic",
  hanFont: "sans",
  pyFont: "sans",
  hanSize: 32,
  pySize: 15,
  charSpacing: 0,
  wordSpacing: 6,
  lineHeight: 1.85,
  paragraphSpacing: 14,
  measure: 34,
  theme: "light",
  hskSyllabus: "2",
  hskHide: 0,
  freqHide: 0,
};

export const defaultSettings = (): Settings => ({
  ...defaultStyle,
  theme: defaultTheme(),
  dictTrigger: "click",
  dictPinned: true,
  rate: 0.9,
  print: {
    presetId: null,
    paper: defaultPaper(),
    orientation: "portrait",
    marginMm: 16,
    toneMode: "color",
    minPinyinPt: 9,
  },
});

function defaultTheme(): ThemeName {
  if (typeof localStorage === "undefined") return "light";
  const legacy = localStorage.getItem("theme");
  if (legacy === "dark" || legacy === "light") return legacy;
  if (typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

function defaultPaper(): Paper {
  if (typeof navigator !== "undefined" && navigator.language === "en-US") return "letter";
  return "a4";
}

export const builtinPresets: Preset[] = [
  { id: "comfortable", name: "Comfortable", builtin: true, style: { ...defaultStyle } },
  {
    id: "beginner",
    name: "Beginner large",
    builtin: true,
    style: {
      ...defaultStyle,
      position: "above",
      hanSize: 44,
      pySize: 18,
      lineHeight: 2.15,
      measure: 22,
      wordSpacing: 10,
      toneColor: "pinyin",
    },
  },
  {
    id: "handout",
    name: "Print handout",
    builtin: true,
    style: {
      ...defaultStyle,
      position: "above",
      theme: "light",
      hanFont: "song",
      pyFont: "serif",
      hanSize: 20,
      pySize: 11,
      lineHeight: 1.7,
      measure: 42,
      wordSpacing: 4,
      toneColor: "off",
      hskHide: 0,
    },
  },
];

export function titleFromText(text: string): string {
  const line = text.split(/\n/).map((item) => item.trim()).find(Boolean) ?? "Untitled";
  const chars = [...line];
  return chars.length > 28 ? `${chars.slice(0, 28).join("")}…` : line || "Untitled";
}

export function hanFontStack(font: HanFont): string {
  if (font === "song") return '"Songti SC", "Noto Serif SC", "Source Han Serif SC", STSong, SimSun, PMingLiU, serif';
  if (font === "kai") return '"Kaiti SC", STKaiti, KaiTi, "楷体", "AR PL UKai", serif';
  return '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", sans-serif';
}

export function pyFontStack(font: PyFont): string {
  if (font === "serif") return '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
  if (font === "readable") return '"Atkinson Hyperlegible", Verdana, "Segoe UI", sans-serif';
  return 'Inter, "Source Sans 3", system-ui, sans-serif';
}

export function emptyDoc(): Doc {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: "Untitled",
    titleAuto: true,
    source: "",
    text: "",
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    anchor: 0,
    corrections: [],
    revealed: [],
  };
}

export function welcomeDoc(): Doc {
  const now = Date.now();
  return {
    id: "welcome",
    title: "去公园",
    titleAuto: false,
    source: "PinyinMe sample",
    text: WELCOME_TEXT,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    anchor: 0,
    corrections: [],
    revealed: [],
  };
}

export const HSK_MAX: Record<HskSyllabus, number> = { "2": 6, "3": 7 };

export const FREQ_OPTIONS = [0, 300, 1000, 3000, 8000] as const;
