import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { caseForDate, cases } from "@/data/cases";
import { Tracing } from "@/components/Tracing";

type QuizSearch = { topic?: string | undefined; c?: string | undefined };

export const Route = createFileRoute("/quiz")({
  validateSearch: (search: Record<string, unknown>): QuizSearch => ({
    topic: typeof search["topic"] === "string" ? (search["topic"] as string) : undefined,
    c: typeof search["c"] === "string" ? (search["c"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sleep Atlas Daily — case of the day" },
      { name: "description", content: "Answer a board-style sleep medicine question on a vignette or PSG tracing." },
      { property: "og:title", content: "Sleep Atlas Daily — case of the day" },
      { property: "og:description", content: "Answer a board-style sleep medicine question on a vignette or PSG tracing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Quiz,
});

function Quiz() {
  const { topic, c: caseId } = Route.useSearch();
  const today = caseForDate();

  const pool = useMemo(
    () => (topic ? cases.filter((c) => c.topic === topic) : cases),
    [topic],
  );

  const startIndex = useMemo(() => {
    if (caseId) {
      const i = pool.findIndex((c) => c.id === caseId);
      if (i >= 0) return i;
    }
    if (!topic) {
      const i = pool.findIndex((c) => c.id === today.c.id);
      if (i >= 0) return i;
    }
    return 0;
  }, [pool, caseId, topic, today.c.id]);

  const [idx, setIdx] = useState(startIndex);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState<Record<string, boolean>>({});
  const c = pool[idx] ?? pool[0]!;

  useEffect(() => {
    setScore(JSON.parse(localStorage.getItem("sa-score") || "{}"));
  }, []);
  useEffect(() => setIdx(startIndex), [startIndex]);
  useEffect(() => setPicked(null), [idx, topic]);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const next = { ...score, [c.id]: i === c.answer };
    setScore(next);
    localStorage.setItem("sa-score", JSON.stringify(next));
  };
  const correct = Object.values(score).filter(Boolean).length;
  const isToday = !topic && c.id === today.c.id;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link to="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
            ← All topics
          </Link>
          <h1 className="font-display text-4xl font-bold">
            {topic ?? <>Sleep Atlas <span className="text-primary">Daily</span></>}
          </h1>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          {correct}/{Object.keys(score).length} correct
        </p>
      </header>

      <article className="mt-8 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider">
          <span className="rounded bg-primary px-2 py-1 text-primary-foreground">{c.kind}</span>
          <span className="text-accent">{c.topic}</span>
          {isToday && <span className="text-muted-foreground">· today's case</span>}
        </div>
        <h2 className="mt-3 font-display text-3xl">{c.title}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{c.vignette}</p>
        {c.wave && (
          <div className="mt-5">
            <Tracing wave={c.wave} />
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">Schematic illustration, not a real recording.</p>
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
              <button key={i} onClick={() => choose(i)} className={`rounded-md border px-4 py-3 text-left transition ${state}`}>
                <span className="mr-3 font-mono text-primary">{String.fromCharCode(65 + i)}</span>
                {o}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="mt-5 rounded-md border-l-4 border-primary bg-muted p-4">
            <p className="font-semibold">{picked === c.answer ? "Correct." : `Answer: ${String.fromCharCode(65 + c.answer)}`}</p>
            <p className="mt-1 text-muted-foreground">{c.explanation}</p>
          </div>
        )}
      </article>

      <nav className="mt-6 flex justify-between font-mono text-sm">
        <button
          onClick={() => setIdx((idx - 1 + pool.length) % pool.length)}
          className="text-muted-foreground hover:text-primary"
        >
          ← Previous
        </button>
        <span className="text-muted-foreground">
          {idx + 1} / {pool.length}
        </span>
        <button
          onClick={() => setIdx((idx + 1) % pool.length)}
          className="text-muted-foreground hover:text-primary"
        >
          Next →
        </button>
      </nav>
    </main>
  );
}
