import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/lib/use-shop";
import { Button } from "@/components/ui/button";
import { Check, X, Inbox, Volume2, VolumeX, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/validation")({
  component: Validation,
});

interface PendingReq {
  id: string;
  numero_telephone: string;
  created_at: string;
  customer_id: string;
}

function Validation() {
  const { shop } = useShop();
  const [requests, setRequests] = useState<PendingReq[]>([]);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [soundOn, setSoundOn] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const soundRef = useRef(true);

  // Charger préférence son
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("tamply-sound");
    if (stored === "off") { setSoundOn(false); soundRef.current = false; }
  }, []);
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);

  // Sound on new request
  const beep = () => {
    if (!soundRef.current) return;
    try {
      if (typeof window === "undefined") return;
      audioCtxRef.current ||= new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current!;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const markNew = (id: string) => {
    setNewIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => {
      setNewIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 4000);
  };

  const toggleSound = () => {
    setSoundOn((v) => {
      const next = !v;
      try { localStorage.setItem("tamply-sound", next ? "on" : "off"); } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (!shop) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("stamp_requests")
        .select("id, numero_telephone, created_at, customer_id")
        .eq("shop_id", shop.id)
        .eq("statut", "en_attente")
        .order("created_at", { ascending: true });
      if (cancelled) return;
      const list = (data ?? []) as PendingReq[];
      knownIds.current = new Set(list.map((r) => r.id));
      setRequests(list);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`pending-${shop.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "stamp_requests", filter: `shop_id=eq.${shop.id}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as any;
          if (!row) return;
          if (payload.eventType === "INSERT" && row.statut === "en_attente") {
            if (!knownIds.current.has(row.id)) {
              knownIds.current.add(row.id);
              setRequests((r) => [...r, row]);
              markNew(row.id);
              beep();
            }
          } else {
            // UPDATE/DELETE: re-filter pending list
            setRequests((r) => r.filter((x) => x.id !== row.id || (payload.eventType === "UPDATE" && row.statut === "en_attente")));
          }
        }
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [shop]);

  const decide = async (id: string, statut: "valide" | "refuse") => {
    setBusy((b) => ({ ...b, [id]: true }));
    const { error } = await supabase.from("stamp_requests").update({ statut }).eq("id", id);
    setBusy((b) => ({ ...b, [id]: false }));
    if (error) { toast.error(error.message); return; }
    setRequests((r) => r.filter((x) => x.id !== id));
    toast.success(statut === "valide" ? "Tampon validé ✓" : "Demande refusée");
  };

  if (!shop) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Tampons à valider</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mises à jour en temps réel · {soundOn ? "Notification sonore activée" : "Notification sonore coupée"}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? "Couper le son" : "Activer le son"}
          className="flex flex-none items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-card hover:text-foreground"
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="hidden sm:inline">{soundOn ? "Son activé" : "Son coupé"}</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-gradient-hero p-10 text-center shadow-card">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/25" />
            <div className="absolute inset-0 grid place-items-center rounded-2xl bg-gradient-cta shadow-soft">
              <Inbox className="h-8 w-8 text-foreground" />
            </div>
          </div>
          <div className="mt-5 text-lg font-extrabold">En attente de demandes</div>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Cette page se met à jour automatiquement dès qu'un client scanne votre QR code.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border bg-card p-4 shadow-card ${
                newIds.has(r.id)
                  ? "border-secondary/60 animate-pop-in animate-ring-flash"
                  : "border-border/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Client</div>
                    {newIds.has(r.id) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                        <Sparkles className="h-3 w-3" /> Nouveau
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-2xl font-extrabold tracking-tight">{r.numero_telephone}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Demande à {new Date(r.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="refuse" size="huge"
                  disabled={busy[r.id]}
                  onClick={() => decide(r.id, "refuse")}
                >
                  <X className="!size-7" /> Refuser
                </Button>
                <Button
                  variant="validate" size="huge"
                  disabled={busy[r.id]}
                  onClick={() => decide(r.id, "valide")}
                >
                  <Check className="!size-7" /> Valider
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
