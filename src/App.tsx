import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { DictView } from "./dict/readings";
import { flushSync } from "react-dom";
import { toneColors } from "./theme";
import { showPinyin } from "./pipeline/hsk";
import { isWord, type WordToken } from "./pipeline/types";
import { HSK_MAX, type StyleSettings } from "./model";
import { chineseVoices, speakParts, stopSpeech, supportsSpeech } from "./speech";
import { usePinyin } from "./state";
import { About } from "./ui/About";
import { DictBody } from "./ui/DictPanel";
import { useDialog } from "./ui/dialog";
import { Editor } from "./ui/Editor";
import { Library } from "./ui/Library";
import { Reader } from "./ui/Reader";
import { SettingsPanel } from "./ui/Settings";

function useMatch(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export function App() {
  const app = usePinyin();
  const narrow = useMatch("(max-width: 960px)");
  const canHover = useMatch("(hover: hover) and (pointer: fine)");
  const [editorOpen, setEditorOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [popover, setPopover] = useState<{ top: number; left: number } | null>(null);
  const [sheet, setSheet] = useState(false);
  const [speaking, setSpeaking] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [printMode, setPrintMode] = useState(false);
  const [view, setView] = useState<{ start: number; view: DictView } | null>(null);
  const hoverTimer = useRef(0);

  const closeLibrary = useCallback(() => setLibraryOpen(false), []);
  const closeStyle = useCallback(() => setStyleOpen(false), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);
  const libraryRef = useDialog(libraryOpen, closeLibrary);
  const styleRef = useDialog(styleOpen, closeStyle);
  const aboutRef = useDialog(aboutOpen, closeAbout);

  useEffect(() => {
    if (app.doc && app.doc.text.length === 0) setEditorOpen(true);
  }, [app.doc?.id, app.doc?.text.length]);

  useEffect(() => {
    const family = app.settings.theme === "dark" ? "dark" : app.settings.theme === "contrast" ? "contrast" : "light";
    const colors = toneColors[app.settings.toneScheme][family];
    for (const [tone, hex] of Object.entries(colors)) {
      document.documentElement.style.setProperty(`--tone-${tone}`, hex);
    }
  }, [app.settings.theme, app.settings.toneScheme]);

  useEffect(() => {
    const { paper, orientation, marginMm } = app.settings.print;
    let node = document.getElementById("page-setup");
    if (!node) {
      node = document.createElement("style");
      node.id = "page-setup";
      document.head.appendChild(node);
    }
    node.textContent = `@page { size: ${paper === "letter" ? "letter" : "A4"} ${orientation}; margin: ${marginMm}mm; }`;
  }, [app.settings.print]);

  useEffect(() => {
    if (!supportsSpeech()) return;
    const update = () => setVoices(chineseVoices());
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);

  useEffect(() => {
    if (!popover) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".popover, .word")) return;
      setPopover(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [popover]);

  useEffect(() => {
    const before = () => { flushSync(() => setPrintMode(true)); };
    const after = () => setPrintMode(false);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  const presetStyle = app.presets.find((item) => item.id === app.settings.print.presetId)?.style;
  const style: StyleSettings = printMode && presetStyle ? presetStyle : app.settings;
  const selectedToken = app.tokens.find((token): token is WordToken => isWord(token) && token.start === selected) ?? null;

  useEffect(() => {
    if (!selectedToken) return;
    const start = selectedToken.start;
    let cancel = false;
    void app.describe(selectedToken).then((next) => {
      if (!cancel) setView({ start, view: next });
    });
    return () => {
      cancel = true;
    };
  }, [selectedToken, app.dictGeneration, app.describe]);
  const panel = app.settings.dictPinned && !narrow;
  const dictView = view && selectedToken && view.start === selectedToken.start ? view.view : null;
  const masked = selectedToken
    ? style.position !== "hidden" && !showPinyin(selectedToken, {
      hskHide: style.hskHide,
      syllabus: style.hskSyllabus,
      freqHide: style.freqHide,
      positionHidden: false,
    }, app.doc?.revealed ?? [])
    : false;

  const place = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - 368);
    const below = rect.bottom + 8;
    const top = below + 340 > window.innerHeight ? Math.max(8, rect.top - 340) : below;
    setPopover({ top, left });
  };

  const select = (token: WordToken, element: HTMLElement, revealWord = true) => {
    void app.ensureDict();
    const hide = app.settings.position !== "hidden" && !showPinyin(token, {
      hskHide: app.settings.hskHide,
      syllabus: app.settings.hskSyllabus,
      freqHide: app.settings.freqHide,
      positionHidden: false,
    }, app.doc?.revealed ?? []);
    if (revealWord && hide) app.reveal(token);
    setSelected(token.start);
    if (narrow) {
      setSheet(true);
      setPopover(null);
      return;
    }
    if (app.settings.dictPinned) {
      setPopover(null);
      return;
    }
    place(element);
  };

  const sentences = useMemo(() => {
    const list: { text: string; sentence: number }[] = [];
    let current = -1;
    let buffer = "";
    for (const token of app.tokens) {
      if (token.sentence !== current) {
        if (buffer.trim()) list.push({ text: buffer, sentence: current });
        current = token.sentence;
        buffer = "";
      }
      buffer += token.text;
    }
    if (buffer.trim()) list.push({ text: buffer, sentence: current });
    return list;
  }, [app.tokens]);

  const play = (parts: { text: string; sentence: number }[]) => {
    if (!supportsSpeech()) return;
    if (voices.length === 0) return;
    setPlaying(true);
    speakParts(parts, app.settings.rate, app.script, (sentence) => {
      setSpeaking(sentence);
      if (sentence < 0) setPlaying(false);
    });
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const words = [...event.currentTarget.querySelectorAll<HTMLElement>(".word")];
    const index = words.findIndex((element) => element === document.activeElement);
    const focusAt = (next: number) => {
      const element = words[next];
      if (!element) return;
      element.focus();
      event.preventDefault();
    };
    if (event.key === "ArrowRight") focusAt(index < 0 ? 0 : index + 1);
    if (event.key === "ArrowLeft") focusAt(index <= 0 ? 0 : index - 1);
    if (event.key === "Home") focusAt(0);
    if (event.key === "End") focusAt(words.length - 1);
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && words.length > 0) {
      const current = words[Math.max(index, 0)];
      if (!current) return;
      const rect = current.getBoundingClientRect();
      const below = event.key === "ArrowDown";
      const candidates = words.filter((element) => {
        const box = element.getBoundingClientRect();
        return below ? box.top > rect.bottom - 2 : box.bottom < rect.top + 2;
      });
      const nearest = [...candidates].sort((a, b) => {
        const da = Math.abs(a.getBoundingClientRect().left - rect.left) + Math.abs(a.getBoundingClientRect().top - rect.top);
        const db = Math.abs(b.getBoundingClientRect().left - rect.left) + Math.abs(b.getBoundingClientRect().top - rect.top);
        return da - db;
      })[0];
      if (nearest) {
        nearest.focus();
        event.preventDefault();
      }
    }
    if (event.key === "Enter" || event.key === " ") {
      const element = words[index];
      if (!element) return;
      const token = app.tokens.find((item) => isWord(item) && item.start === Number(element.dataset.offset));
      if (token && isWord(token)) {
        event.preventDefault();
        select(token, element);
      }
    }
    if (event.key === "Escape") {
      setPopover(null);
      setSheet(false);
      setSelected(null);
    }
  };

  const hskMax = HSK_MAX[app.settings.hskSyllabus];
  const noVoice = supportsSpeech() && voices.length === 0;

  return (
    <div className="app">
      <header className="top no-print">
        <div className="brand">
          <p className="logo"><span aria-hidden="true">ā</span> PinyinMe</p>
          <p className="tagline">Read Chinese</p>
        </div>
        <div className="script" role="group" aria-label="Script">
          <button type="button" aria-pressed={app.script !== "t"} onClick={() => void app.convertTo("s")}>简</button>
          <button type="button" aria-pressed={app.script === "t"} onClick={() => void app.convertTo("t")}>繁</button>
        </div>
        <nav className="actions" aria-label="Tools">
          <button type="button" aria-pressed={editorOpen} onClick={() => setEditorOpen((open) => !open)}>Text</button>
          <button type="button" onClick={() => { app.newDoc(); setEditorOpen(true); setLibraryOpen(false); }}>New</button>
          <button type="button" aria-pressed={libraryOpen} onClick={() => setLibraryOpen(true)}>Library</button>
          <button type="button" aria-pressed={styleOpen} onClick={() => setStyleOpen(true)}>Style</button>
          <button type="button" onClick={() => { flushSync(() => setPrintMode(true)); window.print(); }}>Print</button>
          <button type="button" onClick={() => setAboutOpen(true)}>About</button>
        </nav>
      </header>
      <div className="ad-region" hidden data-ad-slot="reserved" />
      <div className={`workspace${panel ? " with-panel" : ""}`}>
        <div className="column">
          {editorOpen && app.doc ? (
            <Editor
              doc={app.doc}
              onText={app.updateText}
              onTitle={app.setTitle}
              onSource={app.setSource}
              onImport={app.importText}
              onDone={() => {
                app.flushText();
                setEditorOpen(false);
                document.querySelector<HTMLElement>("#reader .word")?.focus();
              }}
            />
          ) : null}
          <div className="reader-toolbar no-print">
            <label>
              Hide pinyin up to
              <select
                value={Math.min(app.settings.hskHide, hskMax)}
                onChange={(event) => app.patchStyle({ hskHide: Number(event.target.value) })}
              >
                <option value={0}>Show all</option>
                {Array.from({ length: hskMax }, (_, index) => index + 1).map((level) => (
                  <option key={level} value={level}>HSK {app.settings.hskSyllabus === "3" && level === 7 ? "7–9" : level}</option>
                ))}
              </select>
            </label>
            <label>
              Speed
              <input
                type="range"
                min={0.6}
                max={1.3}
                step={0.05}
                value={app.settings.rate}
                aria-valuetext={`${app.settings.rate} times`}
                onChange={(event) => app.patchSettings({ rate: Number(event.target.value) })}
              />
            </label>
            {playing ? (
              <button type="button" onClick={() => { stopSpeech(); setPlaying(false); setSpeaking(-1); }}>Stop</button>
            ) : (
              <button type="button" onClick={() => play(sentences)} disabled={!supportsSpeech() || noVoice}>Play passage</button>
            )}
            <span className="status">{app.dictStatus}</span>
          </div>
          {noVoice ? <p className="voice-note no-print">No Chinese voice is installed in this browser, so playback isn’t available.</p> : null}
          {app.doc ? (
            <Reader
              tokens={app.tokens}
              settings={app.settings}
              style={style}
              revealed={app.doc.revealed}
              selected={selected}
              speaking={speaking}
              docId={app.doc.id}
              anchor={app.doc.anchor}
              forceAll={printMode}
              scriptLang={app.script === "t" ? "zh-Hant" : "zh-Hans"}
              hasText={app.doc.text.length > 0}
              onSelect={select}
              onHover={(token, element) => {
                void app.ensureDict();
                if (!canHover || app.settings.dictTrigger !== "hover") return;
                window.clearTimeout(hoverTimer.current);
                hoverTimer.current = window.setTimeout(() => select(token, element, false), 280);
              }}
              onHoverEnd={() => window.clearTimeout(hoverTimer.current)}
              onKey={onKey}
              onAnchor={app.setAnchor}
            />
          ) : (
            <p className="empty-read">Loading your texts…</p>
          )}
        </div>
        {panel ? (
          <aside className="dock no-print" aria-label="Dictionary">
            <h2 className="sr-only">Dictionary</h2>
            {selectedToken ? <DictBody
              token={selectedToken}
              view={dictView}
              syllabus={style.hskSyllabus}
              masked={masked}
              onListen={() => play([{ text: selectedToken.text, sentence: selectedToken.sentence }])}
              onSentence={() => {
                const sentence = sentences.find((item) => item.sentence === selectedToken.sentence);
                if (sentence) play([sentence]);
              }}
              onCorrect={(pinyin, scope) => app.correct(selectedToken, pinyin, scope)}
              onReveal={() => app.reveal(selectedToken)}
              onHide={() => app.hidePinyin(selectedToken)}
            /> : <p className="dict-note">Select a word to see its definition. On a phone, the dictionary opens as a sheet.</p>}
          </aside>
        ) : null}
      </div>
      <footer className="foot no-print">
        <p>PinyinMe — free tool for Chinese learners. Dictionary: CC-CEDICT, CC BY-SA 4.0.</p>
      </footer>
      {popover && selectedToken && !panel ? (
        <div className="popover no-print" style={{ top: popover.top, left: popover.left }} role="dialog" aria-label="Definition">
          <button type="button" className="close-pop" onClick={() => setPopover(null)} aria-label="Close definition">Close</button>
          <DictBody
            token={selectedToken}
            view={dictView}
            syllabus={app.settings.hskSyllabus}
            masked={masked}
            onListen={() => play([{ text: selectedToken.text, sentence: selectedToken.sentence }])}
            onSentence={() => {
              const sentence = sentences.find((item) => item.sentence === selectedToken.sentence);
              if (sentence) play([sentence]);
            }}
            onCorrect={(pinyin, scope) => app.correct(selectedToken, pinyin, scope)}
            onReveal={() => app.reveal(selectedToken)}
            onHide={() => app.hidePinyin(selectedToken)}
          />
        </div>
      ) : null}
      {sheet && selectedToken ? (
        <div className="sheet-wrap no-print">
          <button type="button" className="backdrop" aria-label="Close dictionary" onClick={() => setSheet(false)} />
          <div className="sheet" role="dialog" aria-label="Definition">
            <button type="button" onClick={() => setSheet(false)}>Close</button>
            <DictBody
              token={selectedToken}
              view={dictView}
              syllabus={app.settings.hskSyllabus}
              masked={masked}
              onListen={() => play([{ text: selectedToken.text, sentence: selectedToken.sentence }])}
              onSentence={() => {
                const sentence = sentences.find((item) => item.sentence === selectedToken.sentence);
                if (sentence) play([sentence]);
              }}
              onCorrect={(pinyin, scope) => app.correct(selectedToken, pinyin, scope)}
              onReveal={() => app.reveal(selectedToken)}
              onHide={() => app.hidePinyin(selectedToken)}
            />
          </div>
        </div>
      ) : null}
      {libraryOpen ? (
        <div className="overlay no-print">
          <button type="button" className="backdrop" aria-label="Close library" onClick={closeLibrary} />
          <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="library-title" ref={libraryRef}>
            <Library
              docs={app.docs}
              activeId={app.doc?.id ?? ""}
              onOpen={(id) => { app.openDoc(id); setLibraryOpen(false); setEditorOpen(false); }}
              onNew={() => { app.newDoc(); setLibraryOpen(false); setEditorOpen(true); }}
              onDelete={app.removeDoc}
              onClose={closeLibrary}
            />
          </div>
        </div>
      ) : null}
      {styleOpen ? (
        <div className="overlay no-print">
          <button type="button" className="backdrop" aria-label="Close style settings" onClick={closeStyle} />
          <div className="drawer wide" role="dialog" aria-modal="true" aria-labelledby="style-title" ref={styleRef}>
            <SettingsPanel
              settings={app.settings}
              presets={app.presets}
              defaultPresetId={app.defaultPresetId}
              onChange={app.patchSettings}
              onStyle={app.patchStyle}
              onApplyPreset={app.applyPreset}
              onSavePreset={app.savePreset}
              onDeletePreset={app.deletePreset}
              onDefault={app.setDefaultPreset}
              onImport={app.importPresets}
              onClose={closeStyle}
            />
          </div>
        </div>
      ) : null}
      {aboutOpen ? (
        <div className="overlay no-print">
          <button type="button" className="backdrop" aria-label="Close about" onClick={closeAbout} />
          <div className="drawer" role="dialog" aria-modal="true" ref={aboutRef}>
            <About onClose={closeAbout} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
