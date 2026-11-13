import { isOpeningPunct } from "./han";
import type { Token } from "./types";

/** A piece that must stay on one line: a word or plain span plus its punctuation. */
export type Unit = {
  type: "unit";
  opens: Token[];
  body: Token[];
  closes: Token[];
  sentence: number;
};

export type Gap = {
  type: "space" | "break";
  token: Token;
};

export type Chunk = Unit | Gap;

/**
 * Closing punctuation stays with the previous word, opening punctuation with
 * the next, including spaces that sit between them. A line can wrap on the
 * remaining spaces, never between a word, its pinyin and its punctuation.
 */
export function groupTokens(tokens: readonly Token[]): Chunk[] {
  const chunks: Chunk[] = [];
  let pending: Token[] = [];

  const absorbSpaces = () => {
    const spaces: Token[] = [];
    while (chunks.length > 0 && chunks[chunks.length - 1]?.type === "space") {
      const gap = chunks.pop() as Gap;
      spaces.unshift(gap.token);
    }
    return spaces;
  };

  for (const token of tokens) {
    if (token.kind === "punct" && isOpeningPunct(token.text)) {
      pending.push(token);
      continue;
    }
    if (token.kind === "space" && pending.length > 0) {
      pending.push(token);
      continue;
    }
    if (token.kind === "punct") {
      const spaces = absorbSpaces();
      const last = chunks[chunks.length - 1];
      if (last?.type === "unit") {
        last.closes.push(...spaces, token);
        continue;
      }
      if (pending.length > 0) {
        chunks.push({ type: "unit", opens: pending, body: [], closes: [...spaces, token], sentence: token.sentence });
        pending = [];
        continue;
      }
      chunks.push({ type: "unit", opens: [], body: [], closes: [...spaces, token], sentence: token.sentence });
      continue;
    }
    if (token.kind === "break") {
      if (pending.length > 0) {
        chunks.push({ type: "unit", opens: [], body: pending, closes: [], sentence: pending[0]?.sentence ?? token.sentence });
        pending = [];
      }
      chunks.push({ type: "break", token });
      continue;
    }
    if (token.kind === "space") {
      chunks.push({ type: "space", token });
      continue;
    }
    chunks.push({
      type: "unit",
      opens: pending,
      body: [token],
      closes: [],
      sentence: token.sentence,
    });
    pending = [];
  }
  if (pending.length > 0) {
    chunks.push({ type: "unit", opens: [], body: pending, closes: [], sentence: pending[0]?.sentence ?? 0 });
  }
  return chunks;
}

export function chunkText(chunk: Chunk): string {
  if (chunk.type !== "unit") return chunk.token.text;
  return [...chunk.opens, ...chunk.body, ...chunk.closes].map((token) => token.text).join("");
}
