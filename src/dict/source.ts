import type { DictMeta } from "./types";
import { readDictCache, writeDictCache } from "../storage";

async function decodeDict(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  // Servers often advertise Content-Encoding: gzip for a .gz file, and fetch()
  // then returns the already-uncompressed text. Only inflate a real gzip payload.
  const gzip = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  if (!gzip) return new TextDecoder().decode(buffer);
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

/** Download or reuse the cached dictionary text. Parsing happens in the worker. */
export async function dictionaryText(onStatus: (message: string) => void): Promise<string> {
  onStatus("Loading dictionary…");
  let meta: DictMeta | null = null;
  try {
    const response = await fetch("/dict/meta.json");
    if (response.ok) meta = (await response.json()) as DictMeta;
  } catch {
    meta = null;
  }
  const cached = await readDictCache().catch(() => null);
  if (cached && (!meta || cached.version === meta.version)) {
    onStatus("Preparing dictionary…");
    return cached.text;
  }
  if (!meta) {
    if (cached) return cached.text;
    throw new Error("The dictionary could not be downloaded.");
  }
  try {
    onStatus("Downloading dictionary…");
    const response = await fetch(meta.file);
    if (!response.ok) throw new Error(String(response.status));
    const text = await decodeDict(await response.arrayBuffer());
    await writeDictCache(meta.version, text).catch(() => undefined);
    onStatus("Preparing dictionary…");
    return text;
  } catch (error) {
    if (cached) return cached.text;
    throw error;
  }
}
