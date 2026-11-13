export type Script = "s" | "t" | "mixed" | "none";

/** Common characters that are traditional and not used as the simplified form. */
const TRADITIONAL_ONLY = new Set(
  Array.from(
    "國這書們來個東車門開關頭髮對麼後發與為無馬魚鳥龍飛雲應廣裡裏臺颱體與麼幹乾叢眾隻裡麼",
  ),
);

let toTrad: ((value: string) => string) | null = null;
let toSimp: ((value: string) => string) | null = null;

async function converters(): Promise<{ toTrad: (value: string) => string; toSimp: (value: string) => string }> {
  if (!toTrad || !toSimp) {
    const OpenCC = (await import("opencc-js")).default;
    // Standard traditional, not Taiwan vocabulary (软件 → 軟件, not 軟體).
    toTrad = OpenCC.Converter({ from: "cn", to: "t" });
    toSimp = OpenCC.Converter({ from: "t", to: "cn" });
  }
  return { toTrad, toSimp };
}

export async function toTraditional(text: string): Promise<string> {
  const { toTrad: convert } = await converters();
  return convert(text);
}

export async function toSimplified(text: string): Promise<string> {
  const { toSimp: convert } = await converters();
  return convert(text);
}

/** Fast label for the script toggle. OpenCC does the real conversion. */
export function detectScript(text: string): Script {
  let trad = 0;
  let han = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x3400) continue;
    han += 1;
    if (TRADITIONAL_ONLY.has(ch)) trad += 1;
  }
  if (han === 0) return "none";
  if (trad >= 2 || (trad >= 1 && trad / han > 0.02)) return "t";
  if (trad === 0) return "s";
  return "mixed";
}
