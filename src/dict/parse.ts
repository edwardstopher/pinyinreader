import type { Dictionary, Entry } from "./types";

function numOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Parse the compact dictionary produced by scripts/build-dict.mjs. */
export function parseDict(text: string): Dictionary {
  const entries: Entry[] = [];
  const byForm = new Map<string, number[]>();
  let maxLen = 1;
  let version = "unknown";

  const addKey = (form: string, index: number) => {
    if (!form) return;
    const list = byForm.get(form);
    if (list) list.push(index);
    else byForm.set(form, [index]);
    const len = [...form].length;
    if (len > maxLen) maxLen = len;
  };

  for (const line of text.split("\n")) {
    if (!line) continue;
    if (line.startsWith("#")) {
      if (line.startsWith("# version ")) version = line.slice("# version ".length).trim();
      continue;
    }
    const [simp, trad, pinyin, hsk2, hsk3, freq, classifiers, senses] = line.split("\t");
    if (!simp || !pinyin) continue;
    const entry: Entry = {
      simp,
      trad: trad || simp,
      pinyin,
      hsk2: numOrNull(hsk2),
      hsk3: numOrNull(hsk3),
      freq: numOrNull(freq),
      classifiers: classifiers ? classifiers.split("\u001e").filter(Boolean) : [],
      senses: senses ? senses.split("\u001f").filter(Boolean) : [],
    };
    const index = entries.length;
    entries.push(entry);
    addKey(entry.simp, index);
    if (entry.trad !== entry.simp) addKey(entry.trad, index);
  }

  const dict: Dictionary = {
    version,
    entries,
    byForm,
    maxLen,
    lookup(form) {
      const ids = byForm.get(form);
      if (!ids) return undefined;
      return ids.map((id) => entries[id]).filter((entry): entry is Entry => entry != null);
    },
    ids(form) {
      return byForm.get(form);
    },
  };
  return dict;
}
