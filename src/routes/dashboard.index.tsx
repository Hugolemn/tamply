import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/lib/use-shop";
import { Users, CheckCircle2, Gift, Calendar, ArrowRight, QrCode, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

function Overview() {
  const { shop, loading } = useShop();
  const [stats, setStats] = useState({ clients: 0, tamponsAujourdhui: 0, recompensesMois: 0, pending: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!shop) return;
    setStatsLoading(true);
    (async () => {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

      const [{ count: clients }, { count: tamponsAujourdhui }, { count: pending }, { data: customersMois }] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("shop_id", shop.id),
        supabase.from("stamp_requests").select("*", { count: "exact", head: true }).eq("shop_id", shop.id).eq("statut", "valide").gte("validated_at", todayStart.toISOString()),
        supabase.from("stamp_requests").select("*", { count: "exact", head: true }).eq("shop_id", shop.id).eq("statut", "en_attente"),
        supabase.from("customers").select("total_recompenses").eq("shop_id", shop.id),
      ]);
      const recompensesMois = (customersMois ?? []).reduce((s, c) => s + (c.total_recompenses ?? 0), 0);
      setStats({
        clients: clients ?? 0,
        tamponsAujourdhui: tamponsAujourdhui ?? 0,
        recompensesMois,
        pending: pending ?? 0,
      });
      setStatsLoading(false);
    })();
  }, [shop]);

  if (loading) return <OverviewSkeleton />;
  if (!shop) return <div className="text-muted-foreground">Aucun établissement.</div>;

  const trialDays = Math.max(0, Math.ceil((new Date(shop.trial_end).getTime() - Date.now()) / 86400000));
  const isEmpty = !statsLoading && stats.clients === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">Bonjour {shop.owner_nom?.split(" ")[0] ?? ""} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">{shop.nom}</p>
      </div>

      {shop.statut_abonnement === "essai" && (
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-card">
          <div className="text-sm">
            <b>Essai gratuit</b> — encore <b>{trialDays} jours</b>.
          </div>
          <Link to="/dashboard/subscription" className="text-sm font-semibold text-secondary hover:underline">Activer l'abonnement →</Link>
        </div>
      )}

      {stats.pending > 0 && (
        <Link to="/dashboard/validation" className="block rounded-2xl bg-secondary p-5 text-secondary-foreground shadow-soft transition hover:brightness-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-90">À valider maintenant</div>
              <div className="mt-1 text-2xl font-extrabold">{stats.pending} demande{stats.pending > 1 ? "s" : ""} en attente</div>
            </div>
            <ArrowRight className="h-6 w-6" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statsLoading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <>
            <StatCard icon={Users} label="Clients" value={stats.clients} />
            <StatCard icon={CheckCircle2} label="Tampons aujourd'hui" value={stats.tamponsAujourdhui} />
            <StatCard icon={Gift} label="Récompenses ce mois" value={stats.recompensesMois} />
            <StatCard icon={Calendar} label="Inscrit le" value={new Date(shop.created_at).toLocaleDateString("fr-FR")} />
          </>
        )}
      </div>

      {isEmpty && (
        <Link
          to="/dashboard/qr"
          className="block overflow-hidden rounded-3xl border-2 border-dashed border-primary/60 bg-gradient-hero p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
        >
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="grid h-16 w-16 flex-none place-items-center rounded-2xl bg-gradient-cta shadow-soft">
              <QrCode className="h-8 w-8 text-foreground" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
                <Sparkles className="h-3 w-3" /> Première étape
              </div>
              <h2 className="mt-2 text-lg font-extrabold">Affichez votre QR code au comptoir</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vos premiers clients pourront scanner et recevoir leur premier tampon en quelques secondes.
              </p>
            </div>
            <ArrowRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
          </div>
        </Link>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="mt-3 text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <Skeleton className="mt-3 h-7 w-12" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
      </div>
    </div>
  );
}
