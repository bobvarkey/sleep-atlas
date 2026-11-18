import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  BedDouble,
  Brain,
  Clock,
  CloudMoon,
  Footprints,
  HeartPulse,
  Moon,
  MoonStar,
  Shuffle,
  Sparkles,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { caseForDate, cases } from "@/data/cases";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sleep Atlas Daily — choose your case" },
      { name: "description", content: "Pick a sleep medicine topic and answer board-style questions on daily vignettes and PSG tracings." },
      { property: "og:title", content: "Sleep Atlas Daily" },
      { property: "og:description", content: "Pick a sleep medicine topic and answer board-style questions on daily vignettes and PSG tracings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

const topicIcons: Record<string, LucideIcon> = {
  "Sleep staging": Brain,
  "Sleep apnea": Wind,
  "Movement disorders": Footprints,
  "Parasomnia vs seizure": Zap,
  "Parasomnia": CloudMoon,
  "Narcolepsy": Moon,
  "REM behavior disorder": MoonStar,
  "Circadian": Clock,
  "Restless legs": Activity,
  "Insomnia": BedDouble,
  "Hypersomnia": Moon,
  "Pediatric sleep": Sparkles,
  "Women's sleep": HeartPulse,
};

function Landing() {
  const today = caseForDate();
  const [score, setScore] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setScore(JSON.parse(localStorage.getItem("sa-score") || "{}"));
  }, []);
  const correct = Object.values(score).filter(Boolean).length;
  const answered = Object.keys(score).length;
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const topics = new Map<string, number>();
  for (const c of cases) topics.set(c.topic, (topics.get(c.topic) ?? 0) + 1);
  const topicList = [...topics.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">{date}</p>
          <h1 className="font-display text-5xl font-bold">
            Sleep Atlas <span className="text-primary">Daily</span>
          </h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            One sleep medicine case at a time — a vignette or a tracing, a question, and the reasoning behind the answer.
          </p>
        </div>
        {answered > 0 && (
          <p className="font-mono text-sm text-muted-foreground">
            {correct}/{answered} correct
          </p>
        )}
      </header>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Start here</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link
            to="/quiz"
            search={{}}
            className="group rounded-lg border border-primary bg-card p-5 transition hover:bg-primary/10"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-primary p-2 text-primary-foreground"><Moon size={20} /></span>
              <div>
                <p className="font-display text-xl font-semibold">Today's case</p>
                <p className="text-sm text-muted-foreground">{today.c.title} · {today.c.topic}</p>
              </div>
            </div>
          </Link>
          <Link
            to="/quiz"
            search={{}}
            className="group rounded-lg border border-border bg-card p-5 transition hover:border-primary"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-muted p-2 text-primary"><Shuffle size={20} /></span>
              <div>
                <p className="font-display text-xl font-semibold">Mixed — all topics</p>
                <p className="text-sm text-muted-foreground">{cases.length} cases, shuffled by day</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Or pick a topic</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topicList.map(([topic, count]) => {
            const Icon = topicIcons[topic] ?? Brain;
            return (
              <Link
                key={topic}
                to="/quiz"
                search={{ topic }}
                className="group rounded-lg border border-border bg-card p-4 transition hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-muted p-2 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="font-semibold">{topic}</p>
                    <p className="font-mono text-xs text-muted-foreground">{count} case{count === 1 ? "" : "s"}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="mt-12 border-t border-border pt-4">
        <p className="font-mono text-[11px] text-muted-foreground">
          Original teaching cases written for this app. Tracings are schematic illustrations, not real recordings.
        </p>
      </footer>
    </main>
  );
}
