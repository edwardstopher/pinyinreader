import { useMemo, useState } from "react";
import { polyphonic } from "pinyin-pro";
import { formatClassifier, splitClassifiers } from "../dict/format";
import type { Dictionary, Entry } from "../dict/types";
import { hskLevel } from "../pipeline/hsk";
import { alignReading, joinReading, readingKey } from "../pipeline/pinyin";
import type { WordToken } from "../pipeline/types";
import type { HskSyllabus } from "../model";

export function readingsFor(token: WordToken, dict: Dictionary | null): { pinyin: string; label: string }[] {
  const map = new Map<string, string>();
  const add = (pinyin: string) => {
    const key = readingKey(pinyin);
    if (key && !map.has(key)) map.set(key, pinyin);
  };
  if (dict) {
    for (const id of token.entryIds) {
      const entry = dict.entries[id];
      if (entry) add(entry.pinyin);
    }
    for (const entry of dict.lookup(token.text) ?? []) add(entry.pinyin);
  }
  if ([...token.text].length === 1) {
    const rows = polyphonic(token.text, { type: "array", toneType: "num" }) as string[][];
    for (const item of rows[0] ?? []) add(item);
  }
  const current = token.slots
    .flatMap((slot) => (slot.syl ? [`${slot.syl.base}${slot.syl.tone}`, ...(slot.syl.erhua ? ["r5"] : [])] : []))
    .join(" ");
  if (current) add(current);
  return [...map.values()].map((pinyin) => {
    const slots = alignReading([...token.text], pinyin);
    return { pinyin, label: slots ? joinReading(slots, "marks") : pinyin };
  });
}

function entryPinyin(entry: Entry, surface: string): string {
  const slots = alignReading([...surface], entry.pinyin);
  return slots ? joinReading(slots, "marks") : entry.pinyin;
}

export function DictBody({
  token,
  dict,
  syllabus,
  onListen,
  onSentence,
  onCorrect,
  onReveal,
  onHide,
  masked,
}: {
  token: WordToken;
  dict: Dictionary | null;
  syllabus: HskSyllabus;
  onListen: () => void;
  onSentence: () => void;
  onCorrect: (pinyin: string, scope: "one" | "all") => void;
  onReveal: () => void;
  onHide: () => void;
  masked: boolean;
}) {
  const [everywhere, setEverywhere] = useState(false);
  const entries = useMemo(() => {
    const ids = token.entryIds.length > 0 ? token.entryIds : dict?.ids(token.text) ?? [];
    const list = ids.map((id) => dict?.entries[id]).filter((entry): entry is Entry => entry != null);
    const chosen = token.chosenEntry;
    return [...list].sort((a, b) => {
      const ai = dict?.entries.indexOf(a) ?? 0;
      const bi = dict?.entries.indexOf(b) ?? 0;
      if (ai === chosen) return -1;
      if (bi === chosen) return 1;
      return 0;
    });
  }, [dict, token]);
  const primary = entries[0];
  const level = hskLevel(token, syllabus);
  const readings = useMemo(() => (dict ? readingsFor(token, dict) : []), [dict, token]);
  const current = readings.find((item) => readingKey(item.pinyin) === readingKey(currentNumeric(token))) ?? readings[0];
  const chars = [...token.text];

  return (
    <div className="dict-body">
      <header className="dict-head">
        <div>
          <p className="dict-word">{token.text}</p>
          {primary && primary.trad !== primary.simp ? (
            <p className="dict-alt">{token.text === primary.simp ? primary.trad : primary.simp}</p>
          ) : null}
          <p className="dict-py">{current?.label ?? "No reading"}</p>
        </div>
        <div className="badges">
          {level != null ? <span className="badge">HSK {syllabus === "3" && level === 7 ? "7–9" : level}</span> : <span className="badge quiet">No HSK level</span>}
          {token.freq != null ? <span className="badge quiet">Frequency {token.freq.toLocaleString()}</span> : null}
          {token.lowConfidence ? <span className="badge quiet">Other readings</span> : null}
        </div>
      </header>
      <div className="dict-actions">
        <button type="button" onClick={onListen}>Play word</button>
        <button type="button" onClick={onSentence}>Play sentence</button>
        {masked ? <button type="button" onClick={onReveal}>Show pinyin</button> : <button type="button" onClick={onHide}>Hide pinyin</button>}
      </div>
      {readings.length > 1 ? (
        <fieldset className="readings">
          <legend>Reading</legend>
          <label className="check">
            <input type="checkbox" checked={everywhere} onChange={(event) => setEverywhere(event.target.checked)} />
            Every “{token.text}” in this text
          </label>
          <div className="reading-list">
            {readings.map((item) => (
              <button
                type="button"
                key={item.pinyin}
                className={item.pinyin === current?.pinyin ? "on" : ""}
                onClick={() => onCorrect(item.pinyin, everywhere ? "all" : "one")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      {!dict ? <p className="dict-note">The dictionary is still loading. Readings use the built-in pinyin data for now.</p> : null}
      {dict && entries.length === 0 ? <p className="dict-note">No CC-CEDICT entry for this form. The reading comes from the pinyin library.</p> : null}
      {primary && primary.senses.length === 0 && (primary.hsk2 || primary.hsk3) ? (
        <p className="dict-note">This word is on an HSK list. CC-CEDICT has no definition for it.</p>
      ) : null}
      {primary && primary.senses.length > 0 ? (
        <>
          <ol className="senses">
            {primary.senses.map((sense, index) => (
              <li key={index}>{sense}</li>
            ))}
          </ol>
          {primary.classifiers.length > 0 ? (
            <p className="measures">
              <span>Measure words</span>
              {primary.classifiers.flatMap(splitClassifiers).map((item) => (
                <span key={item}>{formatClassifier(item)}</span>
              ))}
            </p>
          ) : null}
        </>
      ) : null}
      {entries.slice(1).length > 0 ? (
        <div className="other-entries">
          {entries.slice(1).map((entry, index) => (
            <details key={index}>
              <summary>
                {entryPinyin(entry, token.text)}
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    onCorrect(entry.pinyin, everywhere ? "all" : "one");
                  }}
                >
                  Use this reading
                </button>
              </summary>
              <ol className="senses">
                {entry.senses.map((sense, senseIndex) => (
                  <li key={senseIndex}>{sense}</li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      ) : null}
      {chars.length > 1 ? (
        <section className="breakdown">
          <h3>Characters</h3>
          {chars.map((ch, index) => {
            const list = (dict?.lookup(ch) ?? []).slice(0, 3);
            return (
              <div key={`${ch}${index}`}>
                <strong>{ch}</strong>
                {list.length === 0 ? <p>No entry</p> : list.map((entry, entryIndex) => (
                  <p key={entryIndex}>
                    <span className="mini-py">{entryPinyin(entry, ch)}</span>
                    {entry.senses[0] ? ` ${entry.senses[0]}` : ""}
                  </p>
                ))}
              </div>
            );
          })}
        </section>
      ) : null}
      <p className="credit">Definitions from CC-CEDICT, used under CC BY-SA 4.0.</p>
    </div>
  );
}

function currentNumeric(token: WordToken): string {
  return token.slots
    .flatMap((slot) => (slot.syl ? [`${slot.syl.base}${slot.syl.tone}`, ...(slot.syl.erhua ? ["r5"] : [])] : []))
    .join(" ");
}
