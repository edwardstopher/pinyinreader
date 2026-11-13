import { describeToken, type DictView } from "./dict/readings";
import { parseDict } from "./dict/parse";
import { dictionaryText } from "./dict/source";
import type { Dictionary } from "./dict/types";
import { annotateProgressive, type Grouping } from "./pipeline/annotate";
import type { Correction, Token, WordToken } from "./pipeline/types";

type Inbound =
  | { type: "load" }
  | { type: "annotate"; id: number; text: string; grouping?: Grouping; corrections?: Correction[] }
  | { type: "describe"; id: number; token: WordToken };

type Outbound =
  | { type: "status"; message: string }
  | { type: "dict-ready" }
  | { type: "partial"; id: number; tokens: Token[] }
  | { type: "annotated"; id: number }
  | { type: "described"; id: number; view: DictView }
  | { type: "failed"; id: number; message: string };

const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<Inbound>) => void) | null;
  postMessage: (message: Outbound) => void;
};

let dictionary: Dictionary | null = null;
let loading: Promise<void> | null = null;
let announced = false;

function post(message: Outbound) {
  scope.postMessage(message);
}

function loadDictionary() {
  if (dictionary) {
    if (!announced) {
      announced = true;
      post({ type: "status", message: "Dictionary ready" });
      post({ type: "dict-ready" });
    }
    return;
  }
  if (loading) return;
  loading = dictionaryText((message) => post({ type: "status", message }))
    .then((text) => {
      dictionary = parseDict(text);
      announced = true;
      post({ type: "status", message: "Dictionary ready" });
      post({ type: "dict-ready" });
    })
    .catch(() => {
      loading = null;
      post({ type: "status", message: "Dictionary unavailable. Readings still work." });
    });
}

scope.onmessage = (event) => {
  const message = event.data;
  if (!message) return;
  if (message.type === "load") {
    loadDictionary();
    return;
  }
  if (message.type === "describe") {
    if (!dictionary) loadDictionary();
    post({ type: "described", id: message.id, view: describeToken(message.token, dictionary) });
    return;
  }
  void annotateProgressive(
    message.text,
    { dict: dictionary, grouping: message.grouping, corrections: message.corrections ?? [] },
    (tokens) => post({ type: "partial", id: message.id, tokens }),
  )
    .then(() => post({ type: "annotated", id: message.id }))
    .catch((error: unknown) => post({ type: "failed", id: message.id, message: error instanceof Error ? error.message : "annotate failed" }));
};
