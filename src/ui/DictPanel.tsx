import { useState } from "react";
import { formatClassifier, splitClassifiers } from "../dict/format";
import type { DictView } from "../dict/readings";
import { hskLevel } from "../pipeline/hsk";
import { readingKey } from "../pipeline/pinyin";
import type { WordToken } from "../pipeline/types";
import type { HskSyllabus } from "../model";

export function DictBody({
  token,
  view,
  syllabus,
  onListen,
  onSentence,
  onCorrect,
  onReveal,
  onHide,
  masked,
}: {
  token: WordToken;
  view: DictView | null;
  syllabus: HskSyllabus;
  onListen: () => void;
  onSentence: () => void;
  onCorrect: (pinyin: string, scope: "one" | "all") => void;
  onReveal: () => void;
  onHide: () => void;
  masked: boolean;
}) {
  const [everywhere, setEverywhere] = useState(false);
  const readings = view?.readings ?? [];
  const blocks = view?.blocks ?? [];
  const primary = blocks[0];
  const level = hskLevel(token, syllabus);
  const current = readings.find((item) => readingKey(item.pinyin) === readingKey(currentNumeric(token))) ?? readings[0];
  const chars = view?.characters ?? [...token.text].map((ch) => ({ ch, rows: [] }));

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
      {!view?.ready ? <p className="dict-note">The dictionary is still loading. Readings use the built-in pinyin data for now.</p> : null}
      {view?.ready && blocks.length === 0 ? <p className="dict-note">No CC-CEDICT entry for this form. The reading comes from the pinyin library.</p> : null}
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
      {blocks.slice(1).length > 0 ? (
        <div className="other-entries">
          {blocks.slice(1).map((block, index) => (
            <details key={index}>
              <summary>
                {block.pinyinLabel}
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    onCorrect(block.pinyin, everywhere ? "all" : "one");
                  }}
                >
                  Use this reading
                </button>
              </summary>
              <ol className="senses">
                {block.senses.map((sense, senseIndex) => (
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
          {chars.map((item, index) => (
            <div key={`${item.ch}${index}`}>
              <strong>{item.ch}</strong>
              {item.rows.length === 0 ? <p>No entry</p> : item.rows.map((row, rowIndex) => (
                <p key={rowIndex}>
                  <span className="mini-py">{row.pinyin}</span>
                  {row.sense ? ` ${row.sense}` : ""}
                </p>
              ))}
            </div>
          ))}
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
