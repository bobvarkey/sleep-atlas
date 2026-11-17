import type { Wave } from "@/data/cases";
const W = 900;
function line(fn: (x: number) => number, h: number) {
  let d = ""; for (let x = 0; x <= W; x += 2) d += `${x ? "L" : "M"}${x},${(h / 2 + fn(x)).toFixed(1)}`; return d;
}
const r = (s: number) => () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - 0.5; };
type Ch = { label: string; fn: (x: number) => number };
function channels(w: Wave): Ch[] {
  const n = r(7);
  const noise = (a: number) => () => n() * a;
  const sin = (f: number, a: number) => (x: number) => Math.sin(x * f) * a;
  const flat = (x: number) => noise(1.5)();
  switch (w) {
    case "alpha": return [{ label: "O2-M1", fn: (x) => sin(0.55, 9)(x) * (0.7 + 0.3 * Math.sin(x / 40)) + noise(3)() }, { label: "E1", fn: flat }, { label: "Chin", fn: noise(6) }];
    case "n1": return [{ label: "C4-M1", fn: (x) => sin(0.28, 6)(x) + noise(5)() + (Math.abs(x - 600) < 15 ? -22 * Math.cos((x - 600) / 10) : 0) }, { label: "E1", fn: sin(0.012, 14) }, { label: "Chin", fn: noise(4) }];
    case "n2": return [{ label: "C4-M1", fn: (x) => noise(6)() + sin(0.2, 4)(x) + (x > 200 && x < 280 ? Math.sin(x * 0.9) * 10 * Math.sin(((x - 200) / 80) * Math.PI) : 0) + (x > 520 && x < 600 ? -30 * Math.sin(((x - 520) / 80) * Math.PI * 2) : 0) + (x > 700 && x < 770 ? Math.sin(x * 0.9) * 9 * Math.sin(((x - 700) / 70) * Math.PI) : 0) }, { label: "E1", fn: noise(3) }, { label: "Chin", fn: noise(3) }];
    case "n3": return [{ label: "F4-M1", fn: (x) => sin(0.035, 26)(x) + sin(0.05, 10)(x) + noise(4)() }, { label: "E1", fn: (x) => sin(0.035, 12)(x) }, { label: "Chin", fn: noise(2) }];
    case "rem": return [{ label: "C4-M1", fn: (x) => noise(5)() + (x > 300 && x < 420 ? sin(0.3, 10)(x) - ((x * 0.3) % (Math.PI * 2)) * 2 : sin(0.4, 3)(x)) }, { label: "E1", fn: (x) => (Math.floor(x / 60) % 3 === 0 ? 18 : -14) * Math.tanh(Math.sin(x / 9.5) * 3) * 0.6 }, { label: "Chin", fn: flat }];
    case "osa": return [{ label: "Airflow", fn: (x) => (x > 250 && x < 650 ? noise(1)() : sin(0.04, 18)(x)) }, { label: "Chest", fn: (x) => sin(0.04, x > 250 && x < 650 ? 12 : 15)(x) }, { label: "Abdomen", fn: (x) => sin(0.04, x > 250 && x < 650 ? -12 : 15)(x) }];
    case "csa": { const env = (x: number) => Math.max(0, Math.sin((x / W) * Math.PI * 2.5)); return [{ label: "Airflow", fn: (x) => sin(0.06, 20)(x) * env(x) }, { label: "Chest", fn: (x) => sin(0.06, 14)(x) * env(x) }, { label: "Abdomen", fn: (x) => sin(0.06, 14)(x) * env(x) }]; }
    case "plm": return [{ label: "C4-M1", fn: (x) => noise(6)() + sin(0.2, 4)(x) }, { label: "L-Leg", fn: (x) => (x % 300 < 50 ? noise(40)() : noise(2)()) }, { label: "R-Leg", fn: (x) => ((x + 20) % 300 < 40 ? noise(30)() : noise(2)()) }];
    case "seizure": return [{ label: "F4-M1", fn: (x) => (x < 350 ? noise(6)() : sin(0.5, 4 + (x - 350) / 20)(x) + noise(6)()) }, { label: "F3-M1", fn: (x) => (x < 380 ? noise(6)() : sin(0.5, 3 + (x - 380) / 25)(x) + noise(8)()) }, { label: "Chin", fn: (x) => (x > 450 ? noise(30)() : noise(3)()) }];
  }
}
export function Tracing({ wave }: { wave: Wave }) {
  const chs = channels(wave); const h = 90;
  return (
    <svg viewBox={`-70 0 ${W + 80} ${h * chs.length}`} className="w-full trace-panel" role="img" aria-label="Illustrative polysomnography tracing">
      {Array.from({ length: 31 }).map((_, i) => <line key={i} x1={i * 30} x2={i * 30} y1={0} y2={h * chs.length} className="trace-grid" />)}
      {chs.map((c, i) => (
        <g key={c.label} transform={`translate(0 ${i * h})`}>
          <text x={-64} y={h / 2 + 4} className="trace-label">{c.label}</text>
          <path d={line(c.fn, h)} className="trace-line" />
        </g>
      ))}
    </svg>
  );
}
