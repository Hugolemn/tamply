import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/lib/use-shop";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Calendar, Activity, Award } from "lucide-react";

export const Route = createFileRoute("/dashboard/stats")({
  head: () => ({ meta: [{ title: "Statistiques · Tamply" }] }),
  component: StatsPage,
});

type Period = 7 | 30 | 90;

function StatsPage() {
  const { shop, loading } = useShop();
  const [period, setPeriod] = useState<Period>(30);
  const [rows, setRows] = useState<{ validated_at: string }[] | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!shop) return;
    setFetching(true);
    const since = new Date();
    since.setDate(since.getDate() - period + 1);
    since.setHours(0, 0, 0, 0);
    (async () => {
      const { data } = await supabase
        .from("stamp_requests")
        .select("validated_at")
        .eq("shop_id", shop.id)
        .eq("statut", "valide")
        .gte("validated_at", since.toISOString())
        .order("validated_at", { ascending: true })
        .limit(5000);
      setRows((data ?? []).filter((r) => r.validated_at) as { validated_at: string }[]);
      setFetching(false);
    })();
  }, [shop, period]);

  const { daily, total, peakDay, heatmap, peakHour, peakDow } = useMemo(() => {
    const days: { date: Date; key: string; count: number }[] = [];
    const now = new Date(); now.setHours(0, 0, 0, 0);
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      days.push({ date: d, key: dayKey(d), count: 0 });
    }
    const dailyMap = new Map(days.map((d) => [d.key, d]));
    // heatmap: 7 jours (lundi=0) x 24 heures
    const hm: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let total = 0;
    for (const r of rows ?? []) {
      const d = new Date(r.validated_at);
      const k = dayKey(d);
      const day = dailyMap.get(k);
      if (day) day.count += 1;
      const dow = (d.getDay() + 6) % 7; // Mon=0
      hm[dow][d.getHours()] += 1;
      total += 1;
    }
    const peakDay = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
    let peakHour = 0, peakDow = 0, peakVal = -1;
    for (let i = 0; i < 7; i++) for (let h = 0; h < 24; h++) if (hm[i][h] > peakVal) { peakVal = hm[i][h]; peakHour = h; peakDow = i; }
    return { daily: days, total, peakDay, heatmap: hm, peakHour, peakDow: peakVal > 0 ? peakDow : -1 };
  }, [rows, period]);

  if (loading) return <PageSkeleton />;
  if (!shop) return <div className="text-muted-foreground">Aucun établissement.</div>;

  const avg = (total / period).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Statistiques</h1>
          <p className="mt-1 text-sm text-muted-foreground">Analyse de l'activité de {shop.nom}</p>
        </div>
        <div className="inline-flex rounded-xl border border-border/60 bg-card p-1 shadow-card">
          {[7, 30, 90].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as Period)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                period === p ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p} jours
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi icon={Activity} label="Tampons validés" value={fetching ? "…" : total.toString()} />
        <Kpi icon={TrendingUp} label="Moyenne / jour" value={fetching ? "…" : avg} />
        <Kpi
          icon={Award}
          label="Meilleure journée"
          value={fetching || !peakDay || peakDay.count === 0 ? "—" : `${peakDay.count}`}
          sub={fetching || !peakDay || peakDay.count === 0 ? undefined : peakDay.date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
        />
        <Kpi
          icon={Calendar}
          label="Pic d'affluence"
          value={fetching || peakDow < 0 ? "—" : `${peakHour}h`}
          sub={fetching || peakDow < 0 ? undefined : DOW_LABELS[peakDow]}
        />
      </div>

      <Card title="Évolution sur les derniers jours" subtitle={`Tampons validés par jour — ${period} derniers jours`}>
        {fetching ? <Skeleton className="h-56 w-full" /> : <LineChart days={daily} />}
      </Card>

      <Card title="Heures et jours d'affluence" subtitle="Quand vos clients scannent le plus">
        {fetching ? <Skeleton className="h-72 w-full" /> : total === 0 ? (
          <div className="grid h-40 place-items-center text-sm text-muted-foreground">
            Pas encore de tampons validés sur cette période.
          </div>
        ) : (
          <Heatmap matrix={heatmap} />
        )}
      </Card>
    </div>
  );
}

const DOW_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function Kpi({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="mt-3 text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] font-semibold text-secondary">{sub}</div>}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
      <header className="mb-4">
        <h2 className="text-base font-extrabold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function LineChart({ days }: { days: { date: Date; count: number }[] }) {
  const W = 600, H = 200, P = 28;
  const max = Math.max(1, ...days.map((d) => d.count));
  const stepX = (W - P * 2) / Math.max(1, days.length - 1);
  const points = days.map((d, i) => {
    const x = P + i * stepX;
    const y = H - P - (d.count / max) * (H - P * 2);
    return { x, y, d };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${path} L${points[points.length - 1].x.toFixed(1)} ${H - P} L${points[0].x.toFixed(1)} ${H - P} Z`;
  const ticks = 4;
  const xLabels = days.length <= 8
    ? days.map((_, i) => i)
    : Array.from({ length: 5 }, (_, i) => Math.round((i * (days.length - 1)) / 4));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-full min-w-[480px]">
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const y = P + (i * (H - P * 2)) / ticks;
          const v = Math.round(((ticks - i) / ticks) * max);
          return (
            <g key={i}>
              <line x1={P} y1={y} x2={W - P} y2={y} stroke="currentColor" className="text-border" strokeDasharray="3 3" />
              <text x={P - 6} y={y + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">{v}</text>
            </g>
          );
        })}
        <path d={area} className="fill-primary/15" />
        <path d={path} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.d.count > 0 ? 3 : 1.5} className="fill-primary" />
        ))}
        {xLabels.map((i) => {
          const p = points[i];
          if (!p) return null;
          return (
            <text key={i} x={p.x} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {p.d.date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function Heatmap({ matrix }: { matrix: number[][] }) {
  const max = Math.max(1, ...matrix.flat());
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex items-center gap-1 pl-10 text-[9px] font-semibold text-muted-foreground">
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="w-5 text-center">{h % 3 === 0 ? `${h}h` : ""}</div>
          ))}
        </div>
        {matrix.map((row, dow) => (
          <div key={dow} className="mt-1 flex items-center gap-1">
            <div className="w-9 text-right text-[10px] font-semibold text-muted-foreground">{DOW_LABELS[dow]}</div>
            {row.map((v, h) => {
              const intensity = v === 0 ? 0 : 0.15 + (v / max) * 0.85;
              return (
                <div
                  key={h}
                  title={`${DOW_LABELS[dow]} ${h}h — ${v} tampon${v > 1 ? "s" : ""}`}
                  className="h-5 w-5 rounded-[4px] border border-border/40"
                  style={{
                    background: v === 0 ? "transparent" : `color-mix(in oklab, var(--primary) ${Math.round(intensity * 100)}%, transparent)`,
                  }}
                />
              );
            })}
          </div>
        ))}
        <div className="mt-3 flex items-center gap-2 pl-10 text-[10px] text-muted-foreground">
          <span>Moins</span>
          {[0.15, 0.4, 0.65, 0.9].map((o) => (
            <div key={o} className="h-3 w-3 rounded-[3px]" style={{ background: `color-mix(in oklab, var(--primary) ${o * 100}%, transparent)` }} />
          ))}
          <span>Plus</span>
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
