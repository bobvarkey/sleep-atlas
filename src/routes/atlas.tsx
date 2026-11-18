import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  atlasItems,
  categories,
  type AtlasCategory,
  type AtlasFigure,
  type AtlasItem,
} from "@/data/atlas";

export const Route = createFileRoute("/atlas")({
  head: () => ({
    meta: [
      { title: "Atlas library — Sleep Atlas" },
      {
        name: "description",
        content:
          "Labeled EEG epochs, polysomnograms and key facts from five sleep medicine textbooks.",
      },
    ],
  }),
  component: AtlasPage,
});

const FILTERS = ["All", ...categories] as const;
type Filter = (typeof FILTERS)[number];

function sourceLabel(item: AtlasItem) {
  return `${item.book} · ${item.chapter} · PDF p. ${item.page}`;
}

function AtlasPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<AtlasFigure | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return atlasItems.filter((item) => {
      if (filter !== "All" && item.category !== filter) return false;
      if (!q) return true;
      return [item.title, item.summary, item.explanation, item.book, item.chapter]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [filter, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition hover:text-primary"
        >
          ← Back to home
        </Link>
        <Link
          to="/quiz"
          className="rounded-md border border-border px-3 py-2 font-mono text-xs uppercase tracking-wider text-primary transition hover:bg-primary/10"
        >
          Random EEG quiz →
        </Link>
      </div>

      <header className="mt-8 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          From the bookshelf
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
          Atlas <span className="text-primary">library</span>
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Labeled EEG epochs, polysomnograms and key facts pulled from five sleep medicine texts.
          Tap a tracing to enlarge it; every card keeps its source page.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patterns, topics, books…"
          className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
          aria-label="Search the atlas"
        />
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 font-mono text-xs text-muted-foreground">
        {items.length} {items.length === 1 ? "entry" : "entries"}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) =>
          item.kind === "figure" ? (
            <FigureCard key={item.id} item={item} onOpen={() => setOpen(item)} />
          ) : (
            <SnippetCard key={item.id} item={item} />
          ),
        )}
      </div>

      {items.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">
          Nothing matches “{query}”. Try a broader term.
        </p>
      )}

      {open && <Lightbox item={open} onClose={() => setOpen(null)} />}
    </main>
  );
}

function FigureCard({ item, onOpen }: { item: AtlasFigure; onOpen: () => void }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <button
        onClick={onOpen}
        className="group bg-paper p-2 text-left"
        aria-label={`Enlarge ${item.title}`}
      >
        <img
          src={item.image}
          alt={`${item.title} — ${item.summary}`}
          loading="lazy"
          className="h-44 w-full object-contain transition duration-300 group-hover:scale-[1.015]"
        />
      </button>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
          <span className="text-primary">{item.category}</span>
          <span className="text-muted-foreground">· PDF p. {item.page}</span>
        </div>
        <h2 className="mt-2 font-display text-xl leading-tight">{item.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
        <p className="mt-3 text-sm leading-relaxed">{item.explanation}</p>
        <p className="mt-auto pt-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
          {sourceLabel(item)}
        </p>
      </div>
    </article>
  );
}

function SnippetCard({ item }: { item: AtlasItem }) {
  return (
    <article className="flex flex-col rounded-lg border border-l-4 border-border border-l-primary bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-primary">Concept</p>
      <h2 className="mt-2 font-display text-xl leading-tight">{item.title}</h2>
      <p className="mt-3 font-display text-lg leading-snug">{item.summary}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.explanation}</p>
      <p className="mt-auto pt-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
        {sourceLabel(item)}
      </p>
    </article>
  );
}

function Lightbox({ item, onClose }: { item: AtlasFigure; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex items-start justify-between gap-4 border-b border-border px-5 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
            {item.category} · PDF p. {item.page}
          </p>
          <h2 className="mt-1 font-display text-2xl">{item.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-md border border-border px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          Close ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6" onClick={(e) => e.stopPropagation()}>
        <img
          src={item.image}
          alt={`${item.title} — ${item.summary}`}
          className="mx-auto max-h-[65vh] w-auto max-w-full rounded-md border border-border bg-paper object-contain"
        />
        <div className="mx-auto mt-6 max-w-3xl">
          <p className="leading-relaxed text-muted-foreground">{item.summary}</p>
          <p className="mt-3 leading-relaxed">{item.explanation}</p>
          <p className="mt-5 border-l-2 border-border pl-4 text-xs leading-relaxed text-muted-foreground">
            {item.caption}
          </p>
          <p className="mt-4 font-mono text-[10px] text-muted-foreground">{sourceLabel(item)}</p>
        </div>
      </div>
    </div>
  );
}
