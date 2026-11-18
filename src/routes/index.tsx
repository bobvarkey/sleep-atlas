import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { caseForDate, cases } from "@/data/cases";
import { atlasFigures, atlasItems } from "@/data/atlas";
import { Tracing } from "@/components/Tracing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sleep Atlas Daily — one case a day" },
      {
        name: "description",
        content: "Daily sleep medicine vignette or PSG tracing with a board-style question.",
      },
      { property: "og:title", content: "Sleep Atlas Daily" },
      {
        property: "og:description",
        content: "Daily sleep medicine vignette or PSG tracing with a board-style question.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const today = caseForDate();
  const [idx, setIdx] = useState(today.index);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState<Record<string, boolean>>({});
  const c = cases[idx]!;
  useEffect(() => {
    setScore(JSON.parse(localStorage.getItem("sa-score") || "{}"));
  }, []);
  useEffect(() => setPicked(null), [idx]);
  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const next = { ...score, [c.id]: i === c.answer };
    setScore(next);
    localStorage.setItem("sa-score", JSON.stringify(next));
  };
  const correct = Object.values(score).filter(Boolean).length;
  const date = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const daySeed = [...new Date().toISOString().slice(0, 10)].reduce(
    (a, ch) => a + ch.charCodeAt(0),
    0,
  );
  const featured = atlasFigures[daySeed % atlasFigures.length]!;
  const snippets = atlasItems.filter((i) => i.kind === "snippet");
  const snippetA = snippets[daySeed % snippets.length]!;
  const snippetB = snippets[(daySeed + 1) % snippets.length]!;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">{date}</p>
          <h1 className="font-display text-5xl font-bold">
            Sleep Atlas <span className="text-primary">Daily</span>
          </h1>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          {correct}/{Object.keys(score).length} correct
        </p>
      </header>

      <nav className="mt-4 flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wider">
        <Link
          to="/atlas"
          className="rounded-md border border-border px-3 py-2 text-primary transition hover:bg-primary/10"
        >
          Atlas library →
        </Link>
        <Link
          to="/quiz"
          className="rounded-md border border-border px-3 py-2 text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          Random EEG quiz →
        </Link>
      </nav>

      <article className="mt-8 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider">
          <span className="rounded bg-primary px-2 py-1 text-primary-foreground">{c.kind}</span>
          <span className="text-accent">{c.topic}</span>
          {idx === today.index && <span className="text-muted-foreground">· today's case</span>}
        </div>
        <h2 className="mt-3 font-display text-3xl">{c.title}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{c.vignette}</p>
        {c.wave && (
          <div className="mt-5">
            <Tracing wave={c.wave} />
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              Schematic illustration, not a real recording.
            </p>
          </div>
        )}
        <h3 className="mt-6 text-lg font-semibold">{c.question}</h3>
        <div className="mt-3 grid gap-2">
          {c.options.map((o, i) => {
            const state =
              picked === null
                ? "border-border hover:border-primary"
                : i === c.answer
                  ? "border-success bg-success/15"
                  : i === picked
                    ? "border-destructive bg-destructive/15"
                    : "border-border opacity-60";
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                className={`rounded-md border px-4 py-3 text-left transition ${state}`}
              >
                <span className="mr-3 font-mono text-primary">{String.fromCharCode(65 + i)}</span>
                {o}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="mt-5 rounded-md border-l-4 border-primary bg-muted p-4">
            <p className="font-semibold">
              {picked === c.answer ? "Correct." : `Answer: ${String.fromCharCode(65 + c.answer)}`}
            </p>
            <p className="mt-1 text-muted-foreground">{c.explanation}</p>
          </div>
        )}
      </article>

      <nav className="mt-6 flex justify-between font-mono text-sm">
        <button
          onClick={() => setIdx((idx - 1 + cases.length) % cases.length)}
          className="text-muted-foreground hover:text-primary"
        >
          ← Previous
        </button>
        <button onClick={() => setIdx(today.index)} className="text-primary">
          Today
        </button>
        <button
          onClick={() => setIdx((idx + 1) % cases.length)}
          className="text-muted-foreground hover:text-primary"
        >
          Next →
        </button>
      </nav>

      <section className="mt-12 border-t border-border pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              From the bookshelf
            </p>
            <h2 className="mt-1 font-display text-2xl">Today from the atlas</h2>
          </div>
          <Link to="/atlas" className="font-mono text-xs text-muted-foreground hover:text-primary">
            Browse all {atlasFigures.length} tracings →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link
            to="/atlas"
            className="group overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary"
          >
            <div className="bg-paper p-2">
              <img
                src={featured.image}
                alt={featured.title}
                className="h-32 w-full object-contain"
              />
            </div>
            <div className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                {featured.category}
              </p>
              <h3 className="mt-1 font-display text-lg">{featured.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{featured.summary}</p>
            </div>
          </Link>
          {[snippetA, snippetB].map((s) => (
            <Link
              key={s.id}
              to="/atlas"
              className="rounded-lg border border-l-4 border-border border-l-primary bg-card p-4 transition hover:border-primary"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary">Concept</p>
              <h3 className="mt-1 font-display text-lg">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
