import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { landingFor } from "./content/site";
import { annotateText, describeWord, loadEngineDict, onEngineDict, onEngineStatus } from "./engine";
import type { DictView } from "./dict/readings";
import type { Correction, Token, WordToken } from "./pipeline/types";
import { detectScript, toSimplified, toTraditional, type Script } from "./convert";
import {
  builtinPresets,
  emptyDoc,
  titleFromText,
  welcomeDoc,
  type Doc,
  type Preset,
  type Settings,
  type StyleSettings,
} from "./model";
import { deleteDoc, loadDocs, loadSettings, saveDoc, saveSettings } from "./storage";

type Api = {
  ready: boolean;
  docs: Doc[];
  doc: Doc | null;
  settings: Settings;
  presets: Preset[];
  defaultPresetId: string;
  tokens: Token[];
  dictStatus: string;
  dictGeneration: number;
  script: Script;
  updateText: (text: string) => void;
  flushText: () => void;
  setTitle: (title: string) => void;
  setSource: (source: string) => void;
  setAnchor: (offset: number) => void;
  openDoc: (id: string) => void;
  newDoc: () => void;
  removeDoc: (id: string) => void;
  importText: (name: string) => void;
  patchSettings: (patch: Partial<Settings>) => void;
  patchStyle: (patch: Partial<StyleSettings>) => void;
  applyPreset: (id: string) => void;
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;
  setDefaultPreset: (id: string) => void;
  importPresets: (presets: Preset[]) => void;
  correct: (token: WordToken, pinyin: string, scope: "one" | "all") => void;
  reveal: (token: WordToken) => void;
  hidePinyin: (token: WordToken) => void;
  convertTo: (script: "s" | "t") => Promise<void>;
  ensureDict: () => void;
  describe: (token: WordToken) => Promise<DictView>;
};

const Ctx = createContext<Api | null>(null);

export function usePinyin(): Api {
  const value = useContext(Ctx);
  if (!value) throw new Error("PinyinMe state is missing");
  return value;
}

export function Provider({ children }: { children: ReactNode }) {
  const stored = useMemo(() => loadSettings(), []);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docId, setDocId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(stored.settings);
  const [presets, setPresets] = useState<Preset[]>(stored.presets);
  const [defaultPresetId, setDefaultPresetId] = useState(stored.defaultPresetId);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [dictStatus, setDictStatus] = useState("Readings are ready");
  const [dictGeneration, setDictGeneration] = useState(0);
  const [ready, setReady] = useState(false);
  const [script, setScript] = useState<Script>("none");
  const pending = useRef<string | null>(null);
  const debounceRef = useRef(0);
  const generation = useRef(0);
  const landingApplied = useRef(false);
  const docsRef = useRef(docs);
  docsRef.current = docs;
  const doc = docs.find((item) => item.id === docId) ?? null;

  const persistDoc = useCallback((next: Doc) => {
    setDocs((list) => {
      const without = list.filter((item) => item.id !== next.id);
      return [next, ...without].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
    });
    void saveDoc(next);
  }, []);

  const commitText = useCallback((text: string) => {
    const current = docsRef.current.find((item) => item.id === docId);
    if (!current || current.text === text) return;
    const next: Doc = {
      ...current,
      text,
      title: current.titleAuto ? titleFromText(text) : current.title,
      updatedAt: Date.now(),
      revealed: current.revealed.filter((item) => text.startsWith(item.text, item.offset)),
      corrections: current.corrections.filter((item) => text.includes(item.text)),
    };
    persistDoc(next);
  }, [docId, persistDoc]);

  const ensureDict = useCallback(() => {
    loadEngineDict();
  }, []);

  useEffect(() => {
    void loadDocs().then((list) => {
      const initial = list.length > 0 ? list : [welcomeDoc()];
      setDocs(initial);
      setDocId(initial[0]?.id ?? null);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || landingApplied.current) return;
    const landing = landingFor(window.location.pathname);
    const sample = landing?.sample;
    if (!sample) return;
    landingApplied.current = true;
    const existing = docsRef.current.find((item) => item.id === sample.id);
    if (existing) {
      persistDoc({ ...existing, lastOpenedAt: Date.now() });
      setDocId(existing.id);
    } else {
      const now = Date.now();
      const created: Doc = {
        id: sample.id,
        title: sample.title,
        titleAuto: false,
        source: "PinyinMe sample",
        text: sample.text,
        createdAt: now,
        updatedAt: now,
        lastOpenedAt: now,
        anchor: 0,
        corrections: [],
        revealed: [],
      };
      persistDoc(created);
      setDocId(created.id);
    }
    if (sample.settings) {
      const { print, ...rest } = sample.settings;
      setSettings((current) => ({ ...current, ...rest, print: { ...current.print, ...print } }));
    }
  }, [ready, persistDoc]);

  useEffect(() => onEngineStatus(setDictStatus), []);

  useEffect(() => onEngineDict(() => setDictGeneration((value) => value + 1)), []);

  useEffect(() => {
    const start = () => ensureDict();
    let idle = 0;
    let timer = 0;
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(start, { timeout: 2500 });
      } else {
        timer = window.setTimeout(start, 400);
      }
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, [ensureDict]);

  useEffect(() => {
    saveSettings(settings, presets, defaultPresetId);
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.scheme = settings.toneScheme;
  }, [settings, presets, defaultPresetId]);

  useEffect(() => {
    if (!doc) return;
    const run = ++generation.current;
    void annotateText(doc.text, { grouping: settings.grouping, corrections: doc.corrections }, (next) => {
      if (run === generation.current) setTokens(next);
    });
    setScript(detectScript(doc.text));
  }, [doc?.text, doc?.corrections, doc?.id, dictGeneration, settings.grouping]);

  const updateText = useCallback((text: string) => {
    pending.current = text;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const value = pending.current;
      pending.current = null;
      if (value != null) commitText(value);
    }, 180);
  }, [commitText]);

  const flushText = useCallback(() => {
    window.clearTimeout(debounceRef.current);
    if (pending.current != null) {
      const value = pending.current;
      pending.current = null;
      commitText(value);
    }
  }, [commitText]);

  const updateCurrent = useCallback((patch: Partial<Doc>) => {
    if (!doc) return;
    persistDoc({ ...doc, ...patch, updatedAt: Date.now() });
  }, [doc, persistDoc]);

  const api = useMemo<Api>(() => ({
    ready,
    docs,
    doc,
    settings,
    presets,
    defaultPresetId,
    tokens,
    dictStatus,
    dictGeneration,
    script,
    updateText,
    flushText,
    setTitle: (title) => updateCurrent({ title, titleAuto: false }),
    setSource: (source) => updateCurrent({ source }),
    setAnchor: (anchor) => {
      if (!doc || doc.anchor === anchor) return;
      persistDoc({ ...doc, anchor, lastOpenedAt: doc.lastOpenedAt });
    },
    openDoc: (id) => {
      flushText();
      const target = docsRef.current.find((item) => item.id === id);
      if (!target) return;
      const next = { ...target, lastOpenedAt: Date.now() };
      persistDoc(next);
      setDocId(id);
    },
    newDoc: () => {
      flushText();
      const created = emptyDoc();
      persistDoc(created);
      setDocId(created.id);
    },
    removeDoc: (id) => {
      void deleteDoc(id);
      const rest = docsRef.current.filter((item) => item.id !== id);
      setDocs(rest);
      if (docId === id) {
        const created = rest[0] ?? emptyDoc();
        if (!rest[0]) {
          persistDoc(created);
          setDocs([created]);
        }
        setDocId(created.id);
      }
    },
    importText: (name) => {
      if (!doc) return;
      if (!doc.source) updateCurrent({ source: name.replace(/\.(txt|md)$/i, "") });
    },
    patchSettings: (patch) => setSettings((current) => ({ ...current, ...patch })),
    patchStyle: (patch) => setSettings((current) => ({ ...current, ...patch })),
    applyPreset: (id) => {
      const preset = presets.find((item) => item.id === id) ?? builtinPresets.find((item) => item.id === id);
      if (!preset) return;
      setSettings((current) => ({ ...current, ...preset.style }));
    },
    savePreset: (name) => {
      const preset: Preset = {
        id: crypto.randomUUID(),
        name,
        builtin: false,
        style: styleOf(settings),
      };
      setPresets((list) => [...list, preset]);
    },
    deletePreset: (id) => setPresets((list) => list.filter((item) => item.builtin || item.id !== id)),
    setDefaultPreset: setDefaultPresetId,
    importPresets: (incoming) => {
      const custom = incoming.filter((item) => item && item.style && item.name).map((item) => ({
        ...item,
        id: item.builtin ? item.id : crypto.randomUUID(),
        builtin: false,
      }));
      setPresets((list) => [...list.filter((item) => item.builtin), ...custom]);
    },
    correct: (token, pinyin, scope) => {
      if (!doc) return;
      const occurrence = scope === "all" ? "all" : occurrenceOf(tokens, token);
      const next: Correction = { text: token.text, occurrence, pinyin };
      const corrections = doc.corrections.filter((item) => !(item.text === token.text && item.occurrence === occurrence));
      updateCurrent({ corrections: [...corrections, next] });
    },
    reveal: (token) => {
      if (!doc) return;
      if (doc.revealed.some((item) => item.offset === token.start && item.text === token.text)) return;
      updateCurrent({ revealed: [...doc.revealed, { offset: token.start, text: token.text }] });
    },
    hidePinyin: (token) => {
      if (!doc) return;
      updateCurrent({ revealed: doc.revealed.filter((item) => !(item.offset === token.start && item.text === token.text)) });
    },
    ensureDict,
    describe: describeWord,
    convertTo: async (target) => {
      flushText();
      const current = docsRef.current.find((item) => item.id === docId);
      if (!current) return;
      const convert = target === "t" ? toTraditional : toSimplified;
      const text = await convert(current.text);
      const corrections = await Promise.all(current.corrections.map(async (item) => ({ ...item, text: await convert(item.text) })));
      persistDoc({
        ...current,
        text,
        title: current.titleAuto ? titleFromText(text) : current.title,
        corrections,
        revealed: text.length === current.text.length ? current.revealed : [],
        updatedAt: Date.now(),
      });
    },
  }), [ready, docs, doc, settings, presets, defaultPresetId, tokens, dictStatus, dictGeneration, script, updateText, flushText, updateCurrent, persistDoc, docId, ensureDict]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

function styleOf(settings: Settings): StyleSettings {
  const { dictTrigger, dictPinned, rate, print, ...style } = settings;
  void dictTrigger; void dictPinned; void rate; void print;
  return style;
}

function occurrenceOf(tokens: Token[], token: WordToken): number {
  let count = 0;
  for (const item of tokens) {
    if (item.kind !== "word" || item.text !== token.text) continue;
    if (item.start === token.start) return count;
    count += 1;
  }
  return count;
}
