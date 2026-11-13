import type { DictView } from "./dict/readings";
import type { Grouping } from "./pipeline/annotate";
import type { Correction, Token, WordToken } from "./pipeline/types";

type PartialHandler = (tokens: Token[]) => void;

type Pending = {
  partial?: PartialHandler;
  resolve: (value?: DictView) => void;
  reject: (error: Error) => void;
};

const pending = new Map<number, Pending>();
const statusListeners = new Set<(message: string) => void>();
const dictListeners = new Set<() => void>();

let worker: Worker | null = null;
let failed = false;
let nextId = 0;
let latestAnnotate = 0;

function failAll(error: Error) {
  failed = true;
  worker?.terminate();
  worker = null;
  for (const [id, item] of pending) {
    pending.delete(id);
    item.reject(error);
  }
}

function handleMessage(event: MessageEvent) {
  const message = event.data as
    | { type: "status"; message: string }
    | { type: "dict-ready" }
    | { type: "partial"; id: number; tokens: Token[] }
    | { type: "annotated"; id: number }
    | { type: "described"; id: number; view: DictView }
    | { type: "failed"; id: number; message: string };
  if (message.type === "status") {
    for (const listener of statusListeners) listener(message.message);
    return;
  }
  if (message.type === "dict-ready") {
    for (const listener of dictListeners) listener();
    return;
  }
  const item = pending.get(message.id);
  if (!item) return;
  if (message.type === "partial") {
    item.partial?.(message.tokens);
    return;
  }
  pending.delete(message.id);
  if (message.type === "failed") item.reject(new Error(message.message));
  else if (message.type === "described") item.resolve(message.view);
  else item.resolve();
}

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./engine.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = handleMessage;
  worker.onerror = () => failAll(new Error("The annotation worker failed."));
  return worker;
}

export function onEngineStatus(listener: (message: string) => void): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

export function onEngineDict(listener: () => void): () => void {
  dictListeners.add(listener);
  return () => dictListeners.delete(listener);
}

export function loadEngineDict(): void {
  if (failed || typeof Worker === "undefined") return;
  try {
    getWorker().postMessage({ type: "load" });
  } catch {
    failed = true;
  }
}

export async function annotateText(
  text: string,
  options: { grouping?: Grouping; corrections?: Correction[] },
  onPartial: PartialHandler,
): Promise<void> {
  if (failed || typeof Worker === "undefined") {
    await annotateOnMain(text, options, onPartial);
    return;
  }
  const id = ++nextId;
  latestAnnotate = id;
  try {
    await new Promise<void>((resolve, reject) => {
      pending.set(id, {
        partial: (tokens) => {
          if (id === latestAnnotate) onPartial(tokens);
        },
        resolve: () => resolve(),
        reject,
      });
      getWorker().postMessage({
        type: "annotate",
        id,
        text,
        grouping: options.grouping,
        corrections: options.corrections ?? [],
      });
    });
  } catch {
    pending.delete(id);
    await annotateOnMain(text, options, onPartial);
  }
}

export async function describeWord(token: WordToken): Promise<DictView> {
  if (failed || typeof Worker === "undefined") return describeOnMain(token);
  const id = ++nextId;
  try {
    const view = await new Promise<DictView>((resolve, reject) => {
      pending.set(id, {
        resolve: (value) => resolve(value ?? { ready: false, readings: [], blocks: [], characters: [] }),
        reject,
      });
      getWorker().postMessage({ type: "describe", id, token });
    });
    return view;
  } catch {
    pending.delete(id);
    return describeOnMain(token);
  }
}

async function annotateOnMain(
  text: string,
  options: { grouping?: Grouping; corrections?: Correction[] },
  onPartial: PartialHandler,
): Promise<void> {
  const { annotateProgressive } = await import("./pipeline/annotate");
  await annotateProgressive(text, { dict: null, grouping: options.grouping, corrections: options.corrections }, onPartial);
}

async function describeOnMain(token: WordToken): Promise<DictView> {
  const { describeToken } = await import("./dict/readings");
  return describeToken(token, null);
}
