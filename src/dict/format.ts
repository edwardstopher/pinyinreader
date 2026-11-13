import { alignReading, joinReading } from "../pipeline/pinyin";

export function splitClassifiers(raw: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  for (const ch of raw) {
    if (ch === "[") depth += 1;
    else if (ch === "]" && depth > 0) depth -= 1;
    else if (ch === "," && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export function formatClassifier(raw: string): string {
  const match = /^(.*)\[([^\]]+)\]$/.exec(raw.trim());
  if (!match) return raw;
  const forms = match[1].split("|").filter(Boolean);
  const simp = forms[forms.length - 1] || forms[0] || raw;
  const trad = forms[0] || simp;
  const slots = alignReading([...simp], match[2].trim());
  const pinyin = slots ? joinReading(slots, "marks") : match[2];
  return trad !== simp ? `${simp} ${trad} ${pinyin}` : `${simp} ${pinyin}`;
}
