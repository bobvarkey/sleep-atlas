import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { atlasFigures, type AtlasFigure } from "@/data/atlas";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Random EEG quiz — Sleep Atlas" },
      {
        name: "description",
        content:
          "A random sleep EEG or PSG tracing from the atlas, with board-style options and an explanation.",
      },
    ],
  }),
  component: QuizPage,
});

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], seed: number) {
  const a = [...arr];
  const random = rng(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function optionsFor(item: AtlasFigure) {
  const pool = atlasFigures.filter((f) => f.id !== item.id);
  const same = shuffle(
    pool.filter((f) => f.category === item.category),
    hash(item.id + "same"),
  );
  const rest = shuffle(
    pool.filter((f) => f.category !== item.category),
    hash(item.id + "rest"),
  );
  const picks = [...same, ...rest].slice(0, 3);
  return shuffle([item, ...picks], hash(item.id + "options"));
}

const QUESTION: Record<string, string> = {
  "Sleep staging": "Which sleep stage — or sleep EEG pattern — is this?",
  Breathing: "Which respiratory pattern is shown?",
  Movement: "Which movement phenomenon is shown?",
  Neurology: "What does this EEG show?",
  Artifacts: "Which artifact is shown?",
  "Clinical traces": "What does this tracing show?",
  Concepts: "Which concept fits this tracing?",
};

function QuizPage() {
  const [order, setOrder] = useState<string[]>(() => atlasFigures.map((f) => f.id));
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  useEffect(() => {
    setOrder(
      shuffle(
        atlasFigures.map((f) => f.id),
        Math.floor(Math.random() * 1_000_000_000),
      ),
    );
    setPos(0);
  }, []);

  const item = useMemo(
    () => atlasFigures.find((f) => f.id === order[pos]) ?? atlasFigures[0]!,
    [order, pos],
  );
  const options = useMemo(() => optionsFor(item), [item]);
  const correct = picked === item.id;

  const choose = (id: string) => {
    if (picked !== null) return;
    setPicked(id);
    setScore((s) => ({ right: s.right + (id === item.id ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    setPicked(null);
    if (pos + 1 >= order.length) {
      setOrder(
        shuffle(
          atlasFigures.map((f) => f.id),
          Math.floor(Math.random() * 1_000_000_000),
        ),
      );
      setPos(0);
    } else {
      setPos((p) => p + 1);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition hover:text-primary"
        >
          ← Back to home
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {score.right}/{score.total} correct
          </span>
          <Link
            to="/atlas"
            className="rounded-md border border-border px-3 py-2 font-mono text-xs uppercase tracking-wider text-primary transition hover:bg-primary/10"
          >
            Atlas library →
          </Link>
        </div>
      </div>

      <header className="mt-8 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          One tracing at a time
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
          Random <span className="text-primary">EEG quiz</span>
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          A shuffled page from the atlas. Name the pattern, then read why.
        </p>
      </header>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="rounded-md bg-paper p-2">
            <img
              src={item.image}
              alt={`${item.category} tracing for quiz question`}
              className="mx-auto max-h-[46vh] w-auto max-w-full object-contain"
            />
          </div>
          <p className="mt-3 px-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {item.category} · PDF p. {item.page}
          </p>
        </div>

        <div className="flex flex-col rounded-lg border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-primary">Question</p>
          <h2 className="mt-2 font-display text-2xl leading-tight">
            {QUESTION[item.category] ?? "What does this tracing show?"}
          </h2>

          <div className="mt-4 grid gap-2">
            {options.map((o) => {
              const state =
                picked === null
                  ? "border-border hover:border-primary"
                  : o.id === item.id
                    ? "border-success bg-success/15"
                    : o.id === picked
                      ? "border-destructive bg-destructive/15"
                      : "border-border opacity-60";
              return (
                <button
                  key={o.id}
                  onClick={() => choose(o.id)}
                  disabled={picked !== null}
                  className={`rounded-md border px-4 py-3 text-left text-sm transition ${state}`}
                >
                  {o.title}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="mt-4 rounded-md border-l-4 border-primary bg-muted p-4">
              <p className={`font-semibold ${correct ? "text-success" : "text-destructive"}`}>
                {correct ? "Correct." : `Not quite — this is ${item.title}.`}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
              <p className="mt-2 text-sm leading-relaxed">{item.explanation}</p>
              <details className="mt-3 text-xs text-muted-foreground">
                <summary className="cursor-pointer font-mono uppercase tracking-wider text-primary">
                  Full caption
                </summary>
                <p className="mt-2 leading-relaxed">{item.caption}</p>
              </details>
              <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
                {item.book} · {item.chapter} · PDF p. {item.page}
              </p>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <Link
              to="/atlas"
              className="font-mono text-xs text-muted-foreground hover:text-primary"
            >
              Browse the atlas
            </Link>
            <button
              onClick={next}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Next random tracing →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
