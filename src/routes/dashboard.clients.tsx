import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/lib/use-shop";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, QrCode, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/clients")({
  component: Clients,
});

function maskPhone(phone: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length <= 8) return phone;
  return `${digits.slice(0, 4)} ••• ${digits.slice(-4)}`;
}

interface Customer {
  id: string; numero_telephone: string; total_tampons: number;
  total_points: number; total_recompenses: number;
  derniere_visite: string | null; created_at: string;
}

function Clients() {
  const { shop } = useShop();
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const isPoints = (shop as any)?.loyalty_mode === "points";

  useEffect(() => {
    if (!shop) return;
    (async () => {
      const { data } = await supabase.from("customers").select("*").eq("shop_id", shop.id).order("derniere_visite", { ascending: false, nullsFirst: false });
      setList((data ?? []) as Customer[]);
      setLoading(false);
    })();
  }, [shop]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">Vos clients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Chargement…" : `${list.length} client${list.length > 1 ? "s" : ""}`}
        </p>
      </div>
      {loading ? (
        <ClientsSkeleton />
      ) : list.length === 0 ? (
        <EmptyClients />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Numéro</th>
                <th className="px-4 py-3 text-center">{isPoints ? "Points" : "Tampons"}</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Récompenses</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Dernière visite</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-semibold">{maskPhone(c.numero_telephone)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-primary/30 px-2.5 py-1 font-bold">
                      {isPoints ? c.total_points : c.total_tampons}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-secondary font-bold">🎁 {c.total_recompenses}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                    {c.derniere_visite ? new Date(c.derniere_visite).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ClientsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-3 last:border-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-10 rounded-full" />
          <Skeleton className="hidden h-4 w-12 sm:block" />
          <Skeleton className="hidden h-4 w-20 sm:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyClients() {
  return (
    <div className="rounded-3xl border-2 border-dashed border-primary/40 bg-gradient-hero p-8 text-center shadow-card sm:p-12">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-cta shadow-soft">
        <Users className="h-8 w-8 text-foreground" />
      </div>
      <h2 className="mt-4 text-xl font-extrabold">Aucun client pour le moment</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Affichez votre QR code au comptoir : dès qu'un client le scanne, il apparaît ici avec son nombre de tampons.
      </p>
      <Link
        to="/dashboard/qr"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-soft transition hover:brightness-110"
      >
        <QrCode className="h-4 w-4" /> Afficher mon QR code <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
