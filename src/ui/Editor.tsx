import { useEffect, useRef, useState } from "react";
import { SAMPLES } from "../model";
import type { Doc } from "../model";

export function Editor({
  doc,
  onText,
  onTitle,
  onSource,
  onImport,
  onDone,
}: {
  doc: Doc;
  onText: (text: string) => void;
  onTitle: (title: string) => void;
  onSource: (source: string) => void;
  onImport: (name: string, text: string) => void;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState(doc.text);
  const seen = useRef(doc.text);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (doc.text !== seen.current) {
      seen.current = doc.text;
      setDraft(doc.text);
    }
  }, [doc.id, doc.text]);

  const commit = (value: string) => {
    seen.current = value;
    onText(value);
  };

  const readFile = async (file: File) => {
    let text = (await file.text()).replace(/^\uFEFF/, "");
    if (file.name.toLowerCase().endsWith(".md") && text.startsWith("---\n")) {
      const end = text.indexOf("\n---", 3);
      if (end !== -1) text = text.slice(end + 4).replace(/^\n/, "");
    }
    setDraft(text);
    commit(text);
    onImport(file.name, text);
  };

  return (
    <section className="editor no-print" aria-label="Text editor">
      <h2 className="sr-only">Text</h2>
      <div className="editor-meta">
        <label>
          Title
          <input value={doc.title} onChange={(event) => onTitle(event.target.value)} />
        </label>
        <label>
          Source
          <input value={doc.source} placeholder="Book, URL, or note" onChange={(event) => onSource(event.target.value)} />
        </label>
      </div>
      <div className="samples">
        <span>Try</span>
        {SAMPLES.map((sample) => (
          <button
            type="button"
            key={sample.text}
            onClick={() => {
              setDraft(sample.text);
              commit(sample.text);
            }}
          >
            {sample.label}
          </button>
        ))}
        <button type="button" onClick={() => fileRef.current?.click()}>
          Import .txt or .md
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void readFile(file);
            event.target.value = "";
          }}
        />
      </div>
      <div
        className="editor-box"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) void readFile(file);
        }}
      >
        <textarea
          value={draft}
          aria-label="Chinese text"
          placeholder="Paste or type Chinese text…"
          onChange={(event) => {
            const value = event.target.value;
            setDraft(value);
            commit(value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) {
              event.preventDefault();
              commit(draft);
              onDone();
            }
          }}
        />
        <p className="hint">
          {draft.length.toLocaleString()} characters · Shift+Enter to read
        </p>
      </div>
      <button type="button" className="primary" onClick={() => { commit(draft); onDone(); }}>
        Annotate with Pinyin
      </button>
    </section>
  );
}
