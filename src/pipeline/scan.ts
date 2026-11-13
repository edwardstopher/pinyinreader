import { isDigit, isHan, isPunctChar } from "./han";

export type Run = {
  kind: "han" | "plain" | "punct" | "space" | "break";
  text: string;
  start: number;
  end: number;
  /** Code-point index into the whole string. Only set for han runs. */
  cpStart: number;
  chars: string[];
};

function urlEnd(text: string, index: number): number | null {
  const rest = text.slice(index);
  const match = /^(?:https?:\/\/|www\.)[^\s<>]+/i.exec(rest);
  return match ? index + match[0].length : null;
}

/**
 * Split text into runs without dropping or merging characters.
 * Newlines, spaces and punctuation stay intact. Han runs are code points,
 * so a character outside the BMP is never split in half.
 */
export function scan(text: string): Run[] {
  const runs: Run[] = [];
  let utf16 = 0;
  let cp = 0;

  const push = (run: Run) => {
    const prev = runs[runs.length - 1];
    if (prev && prev.kind === run.kind && run.kind !== "punct" && run.kind !== "break" && prev.end === run.start) {
      prev.text += run.text;
      prev.end = run.end;
      prev.chars.push(...run.chars);
      return;
    }
    runs.push(run);
  };

  while (utf16 < text.length) {
    const link = urlEnd(text, utf16);
    if (link != null && link > utf16) {
      const slice = text.slice(utf16, link);
      const chars = [...slice];
      push({ kind: "plain", text: slice, start: utf16, end: link, cpStart: cp, chars });
      utf16 = link;
      cp += chars.length;
      continue;
    }

    const code = text.codePointAt(utf16);
    if (code == null) break;
    const ch = String.fromCodePoint(code);
    const next = utf16 + ch.length;

    if (ch === "\r") {
      const withN = text[next] === "\n";
      const end = withN ? next + 1 : next;
      push({ kind: "break", text: text.slice(utf16, end), start: utf16, end, cpStart: cp, chars: [...text.slice(utf16, end)] });
      cp += withN ? 2 : 1;
      utf16 = end;
      continue;
    }
    if (ch === "\n") {
      push({ kind: "break", text: ch, start: utf16, end: next, cpStart: cp, chars: [ch] });
      utf16 = next;
      cp += 1;
      continue;
    }
    if (ch === " " || ch === "\t" || ch === "\u3000" || ch === "\u00a0") {
      push({ kind: "space", text: ch, start: utf16, end: next, cpStart: cp, chars: [ch] });
      utf16 = next;
      cp += 1;
      continue;
    }
    if (isDigit(ch)) {
      let end = next;
      let look = end;
      while (look < text.length) {
        const ncode = text.codePointAt(look);
        if (ncode == null) break;
        const nch = String.fromCodePoint(ncode);
        if (isDigit(nch)) {
          end = look + nch.length;
          look = end;
          continue;
        }
        if ((nch === "." || nch === "," || nch === "，" || nch === "．") && look + nch.length < text.length) {
          const after = text.codePointAt(look + nch.length);
          if (after != null && isDigit(String.fromCodePoint(after))) {
            end = look + nch.length;
            look = end;
            continue;
          }
        }
        break;
      }
      const slice = text.slice(utf16, end);
      const chars = [...slice];
      push({ kind: "plain", text: slice, start: utf16, end, cpStart: cp, chars });
      cp += chars.length;
      utf16 = end;
      continue;
    }
    if (isHan(code)) {
      push({ kind: "han", text: ch, start: utf16, end: next, cpStart: cp, chars: [ch] });
      utf16 = next;
      cp += 1;
      continue;
    }
    if (isPunctChar(ch)) {
      push({ kind: "punct", text: ch, start: utf16, end: next, cpStart: cp, chars: [ch] });
      utf16 = next;
      cp += 1;
      continue;
    }
    push({ kind: "plain", text: ch, start: utf16, end: next, cpStart: cp, chars: [ch] });
    utf16 = next;
    cp += 1;
  }

  return runs;
}
