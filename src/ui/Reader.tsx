import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { groupTokens, type Chunk } from "../pipeline/group";
import { formatSyl, needsApostrophe } from "../pipeline/pinyin";
import type { Slot, Token, WordToken } from "../pipeline/types";
import { showPinyin } from "../pipeline/hsk";
import { hanFontStack, pyFontStack, type Settings, type StyleSettings, type ToneFormat } from "../model";
import { isWord } from "../pipeline/types";

function PinyinLine({ slots, format }: { slots: Slot[]; format: ToneFormat }) {
  const nodes: ReactNode[] = [];
  let previous = "";
  slots.forEach((slot, index) => {
    if (!slot.syl) return;
    const text = formatSyl(slot.syl, format, true);
    if (previous && format === "numbers") nodes.push(" ");
    else if (previous && needsApostrophe(previous, text)) nodes.push("'");
    nodes.push(
      <span className="syl" data-tone={slot.syl.tone} key={index}>
        {text}
      </span>,
    );
    previous = text;
  });
  return <>{nodes}</>;
}

const WordView = memo(function WordView({
  token,
  masked,
  selected,
  format,
  tabIndex,
  speaking,
  onSelect,
  onHover,
  onHoverEnd,
}: {
  token: WordToken;
  masked: boolean;
  selected: boolean;
  format: ToneFormat;
  tabIndex: number;
  speaking: boolean;
  onSelect: (token: WordToken, element: HTMLElement) => void;
  onHover: (token: WordToken, element: HTMLElement) => void;
  onHoverEnd: () => void;
}) {
  const reading = slotsLabel(token.slots, format);
  const label = `${token.text}, ${reading || "no reading"}${token.lowConfidence ? ", other readings" : ""}${token.hsk2 ? `, HSK ${token.hsk2}` : ""}`;
  return (
    <span
      className={`word${masked ? " is-masked" : ""}${selected ? " is-selected" : ""}${token.lowConfidence ? " is-unsure" : ""}${speaking ? " is-speaking" : ""}`}
      role="button"
      tabIndex={tabIndex}
      data-offset={token.start}
      data-sentence={token.sentence}
      aria-label={label}
      aria-pressed={selected}
      onClick={(event) => onSelect(token, event.currentTarget)}
      onMouseEnter={(event) => onHover(token, event.currentTarget)}
      onMouseLeave={onHoverEnd}
    >
      <span className="py" aria-hidden="true">
        <PinyinLine slots={token.slots} format={format} />
      </span>
      <span className="hz">
        {token.slots.map((slot, index) => (
          <span className="ch" data-tone={slot.syl?.tone ?? 5} key={index}>
            {slot.ch}
          </span>
        ))}
      </span>
    </span>
  );
});

function slotsLabel(slots: Slot[], format: ToneFormat): string {
  return slots
    .filter((slot) => slot.syl)
    .map((slot) => formatSyl(slot.syl!, format, true))
    .join(format === "numbers" ? " " : "");
}

function paragraphsOf(tokens: Token[]): Chunk[][] {
  const chunks = groupTokens(tokens);
  const paragraphs: Chunk[][] = [[]];
  for (const chunk of chunks) {
    if (chunk.type === "break") paragraphs.push([]);
    else paragraphs[paragraphs.length - 1]?.push(chunk);
  }
  return paragraphs;
}

export function readerStyle(style: StyleSettings, printMinPt: number): CSSProperties {
  return {
    "--han-size": `${style.hanSize}px`,
    "--py-size": `${style.pySize}px`,
    "--char-spacing": `${style.charSpacing}px`,
    "--word-spacing": `${style.wordSpacing}px`,
    "--line-height": String(style.lineHeight),
    "--para-gap": `${style.paragraphSpacing}px`,
    "--measure": style.measure > 0 ? `${style.measure * style.hanSize}px` : "100%",
    "--han-font": hanFontStack(style.hanFont),
    "--py-font": pyFontStack(style.pyFont),
    "--py-min-print": `${printMinPt}pt`,
  } as CSSProperties;
}

export function Reader({
  tokens,
  settings,
  style,
  revealed,
  selected,
  speaking,
  docId,
  anchor,
  forceAll,
  scriptLang,
  hasText,
  onSelect,
  onHover,
  onHoverEnd,
  onKey,
  onAnchor,
}: {
  tokens: Token[];
  settings: Settings;
  style: StyleSettings;
  revealed: { offset: number; text: string }[];
  selected: number | null;
  speaking: number;
  docId: string;
  anchor: number;
  forceAll: boolean;
  scriptLang: string;
  hasText: boolean;
  onSelect: (token: WordToken, element: HTMLElement) => void;
  onHover: (token: WordToken, element: HTMLElement) => void;
  onHoverEnd: () => void;
  onKey: (event: KeyboardEvent<HTMLDivElement>) => void;
  onAnchor: (offset: number) => void;
}) {
  const paragraphs = useMemo(() => paragraphsOf(tokens), [tokens]);
  const [count, setCount] = useState(24);
  const root = useRef<HTMLDivElement>(null);
  const restored = useRef("");

  useEffect(() => {
    setCount(24);
    restored.current = "";
  }, [docId, forceAll]);

  useEffect(() => {
    if (forceAll || count >= paragraphs.length) return;
    const id = requestAnimationFrame(() => setCount((value) => Math.min(paragraphs.length, value + 20)));
    return () => cancelAnimationFrame(id);
  }, [count, paragraphs.length, forceAll]);

  useEffect(() => {
    if (!anchor || restored.current === docId) return;
    const el = root.current?.querySelector(`[data-offset="${anchor}"]`);
    if (el) {
      el.scrollIntoView({ block: "center" });
      restored.current = docId;
    }
  }, [anchor, docId, count, tokens]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let timer = 0;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const box = node.getBoundingClientRect();
        const words = node.querySelectorAll<HTMLElement>(".word");
        for (const word of words) {
          const rect = word.getBoundingClientRect();
          if (rect.bottom > box.top + 8) {
            onAnchor(Number(word.dataset.offset ?? 0));
            break;
          }
        }
      }, 400);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [onAnchor]);

  const visible = paragraphs.slice(0, forceAll ? paragraphs.length : count);
  const selective = {
    hskHide: style.hskHide,
    syllabus: style.hskSyllabus,
    freqHide: style.freqHide,
    positionHidden: style.position === "hidden",
  };
  let firstWord = true;

  return (
    <div
      id="reader"
      className={`reader pos-${style.position} tone-${style.toneColor} scheme-${style.toneScheme}`}
      lang={scriptLang}
      ref={root}
      style={readerStyle(style, settings.print.minPinyinPt)}
      data-print-tone={settings.print.toneMode}
      data-scheme={style.toneScheme}
      onKeyDown={onKey}
      tabIndex={-1}
      aria-describedby="reader-help"
    >
      <h2 className="sr-only">Reading</h2>
      <p id="reader-help" className="sr-only">
        Reading view. Use the arrow keys to move between words. Press Enter to open the dictionary.
      </p>
      <p className="print-legend">Tone underlines: 1 solid, 2 dotted, 3 dashed, 4 wavy. Neutral tone has no underline.</p>
      {tokens.length === 0 ? (
        <p className="empty-read">{hasText ? "Adding pinyin…" : "Paste or type Chinese on the left, or open a saved text."}</p>
      ) : (
        visible.map((paragraph, index) => (
          <p className={paragraph.length === 0 ? "para blank" : "para"} key={index} aria-hidden={paragraph.length === 0 ? true : undefined}>
            {paragraph.map((chunk, chunkIndex) => {
              if (chunk.type !== "unit") return <span className="gap" key={chunkIndex}>{chunk.token.text}</span>;
              const body = chunk.body[0];
              const word = body && isWord(body) ? body : null;
              const masked = word ? style.position !== "hidden" && !showPinyin(word, { ...selective, positionHidden: false }, revealed) : false;
              const tab = word ? (word.start === selected || (selected == null && firstWord) ? 0 : -1) : undefined;
              if (word && firstWord) firstWord = false;
              return (
                <span className={`unit${word ? "" : " is-plain"}${speaking >= 0 && chunk.sentence === speaking ? " is-speaking" : ""}`} key={chunkIndex}>
                  {chunk.opens.map((token, tokenIndex) => (
                    <span className="punct" key={`o${tokenIndex}`}>{token.text}</span>
                  ))}
                  {word ? (
                    <WordView
                      token={word}
                      masked={masked}
                      selected={selected === word.start}
                      format={style.toneFormat}
                      tabIndex={tab ?? -1}
                      speaking={speaking === word.sentence}
                      onSelect={onSelect}
                      onHover={onHover}
                      onHoverEnd={onHoverEnd}
                    />
                  ) : (
                    <span className="plain">{body?.text ?? ""}</span>
                  )}
                  {chunk.closes.map((token, tokenIndex) => (
                    <span className={token.kind === "space" ? "gap" : "punct"} key={`c${tokenIndex}`}>{token.text}</span>
                  ))}
                </span>
              );
            })}
          </p>
        ))
      )}
      {!forceAll && count < paragraphs.length ? <p className="more">Showing the start of a long text…</p> : null}
    </div>
  );
}
