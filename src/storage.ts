import { openDB, type IDBPDatabase } from "idb";
// The store names are fixed; values are checked at the call site.
import { builtinPresets, defaultSettings, emptyDoc, titleFromText, welcomeDoc, type Doc, type Preset, type Settings } from "./model";

const SETTINGS_KEY = "pinyinme.v1";

let database: Promise<IDBPDatabase | null> | null = null;
const memoryDocs = new Map<string, Doc>();

function db(): Promise<IDBPDatabase | null> {
  database ??= openDB("pinyinme", 1, {
    upgrade(store) {
      if (!store.objectStoreNames.contains("docs")) store.createObjectStore("docs");
      if (!store.objectStoreNames.contains("kv")) store.createObjectStore("kv");
    },
  }).catch(() => null);
  return database;
}

let docsPromise: Promise<Doc[]> | null = null;

export function loadDocs(): Promise<Doc[]> {
  if (!docsPromise) {
    docsPromise = fetchDocs().catch((error) => {
      docsPromise = null;
      throw error;
    });
  }
  return docsPromise;
}

async function fetchDocs(): Promise<Doc[]> {
  const store = await db();
  if (!store) {
    if (memoryDocs.size === 0) memoryDocs.set("welcome", welcomeDoc());
    return [...memoryDocs.values()].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
  }
  const all = (await store.getAll("docs")) as Doc[];
  if (all.length === 0) {
    const welcome = welcomeDoc();
    await store.put("docs", welcome, welcome.id);
    return [welcome];
  }
  return all.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
}

export async function saveDoc(doc: Doc): Promise<void> {
  const store = await db();
  if (!store) {
    memoryDocs.set(doc.id, doc);
    return;
  }
  await store.put("docs", doc, doc.id);
}

export async function deleteDoc(id: string): Promise<void> {
  const store = await db();
  if (!store) {
    memoryDocs.delete(id);
    return;
  }
  await store.delete("docs", id);
}

export function loadSettings(): { settings: Settings; presets: Preset[]; defaultPresetId: string } {
  const fallback = {
    settings: defaultSettings(),
    presets: builtinPresets,
    defaultPresetId: "comfortable",
  };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { settings?: Settings; presets?: Preset[]; defaultPresetId?: string };
    return {
      settings: { ...defaultSettings(), ...parsed.settings, print: { ...defaultSettings().print, ...parsed.settings?.print } },
      presets: mergePresets(parsed.presets ?? []),
      defaultPresetId: parsed.defaultPresetId || "comfortable",
    };
  } catch {
    return fallback;
  }
}

function mergePresets(saved: Preset[]): Preset[] {
  const custom = saved.filter((preset) => !preset.builtin);
  return [...builtinPresets, ...custom];
}

export function saveSettings(settings: Settings, presets: Preset[], defaultPresetId: string): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ settings, presets, defaultPresetId }));
}

export async function readDictCache(): Promise<{ version: string; text: string } | null> {
  const store = await db();
  if (!store) return null;
  return ((await store.get("kv", "dict")) as { version: string; text: string } | undefined) ?? null;
}

export async function writeDictCache(version: string, text: string): Promise<void> {
  const store = await db();
  if (!store) return;
  await store.put("kv", { version, text }, "dict");
}

export function touchTitle(doc: Doc, text: string): Doc {
  if (!doc.titleAuto) return { ...doc, text };
  return { ...doc, text, title: titleFromText(text) || "Untitled" };
}

export function newDocument(): Doc {
  return emptyDoc();
}
