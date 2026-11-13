import { useState } from "react";
import type { Doc } from "../model";

function when(time: number): string {
  const delta = Date.now() - time;
  const minute = 60_000;
  if (delta < minute) return "Just now";
  if (delta < 60 * minute) return `${Math.floor(delta / minute)} min ago`;
  const date = new Date(time);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function Library({
  docs,
  activeId,
  onOpen,
  onNew,
  onDelete,
  onClose,
}: {
  docs: Doc[];
  activeId: string;
  onOpen: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [pending, setPending] = useState<string | null>(null);
  return (
    <div className="library">
      <div className="drawer-bar">
        <h2 id="library-title">Saved texts</h2>
        <button type="button" onClick={onClose} aria-label="Close library">Close</button>
      </div>
      <button type="button" className="primary" onClick={onNew}>New text</button>
      <ul>
        {docs.map((doc) => (
          <li key={doc.id}>
            <button type="button" className={doc.id === activeId ? "row on" : "row"} onClick={() => onOpen(doc.id)}>
              <strong>{doc.title || "Untitled"}</strong>
              <span>{doc.source || "No source"} · {when(doc.lastOpenedAt)} · {[...doc.text].length.toLocaleString()} chars</span>
            </button>
            {pending === doc.id ? (
              <button type="button" className="danger" onClick={() => onDelete(doc.id)}>Confirm delete</button>
            ) : (
              <button type="button" onClick={() => setPending(doc.id)} aria-label={`Delete ${doc.title}`}>Delete</button>
            )}
          </li>
        ))}
      </ul>
      {docs.length === 0 ? <p>Nothing saved in this browser yet.</p> : null}
    </div>
  );
}
