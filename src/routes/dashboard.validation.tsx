import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/lib/use-shop";
import { Button } from "@/components/ui/button";
import { Check, X, Inbox, Volume2, VolumeX, Sparkles, Bell, BellOff, Clock, User, Receipt, Plus, Minus, QrCode, Users, Share2, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/validation")({
  component: Validation,
});

function maskPhone(phone: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length <= 8) return phone;
  const start = digits.slice(0, 4);
  const end = digits.slice(-4);
  return `${start} ••• ${end}`;
}

interface PendingReq {
  id: string;
  numero_telephone: string;
  created_at: string;
  customer_id: string;
  montant_achat: number | null;
}

function Validation() {
  const { shop } = useShop();
  const [requests, setRequests] = useState<PendingReq[]>([]);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [stampCounts, setStampCounts] = useState<Record<string, number>>({});
  const [soundOn, setSoundOn] = useState(true);
  const [notifOn, setNotifOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const soundRef = useRef(true);
  const notifRef = useRef(false);
  const vibrationRef = useRef(true);
  const titleBlinkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const originalTitleRef = useRef<string>("");

  // Charger préférence son
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("tamply-sound");
    if (stored === "off") { setSoundOn(false); soundRef.current = false; }
    const vib = localStorage.getItem("tamply-vibration");
    if (vib === "off") { vibrationRef.current = false; }
    const notifStored = localStorage.getItem("tamply-notif");
    if (notifStored === "on" && typeof Notification !== "undefined" && Notification.permission === "granted") {
      setNotifOn(true);
      notifRef.current = true;
    }
    originalTitleRef.current = document.title;
  }, []);
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);
  useEffect(() => { notifRef.current = notifOn; }, [notifOn]);

  // Double bip sur nouvelle demande (plus reconnaissable)
  const beep = () => {
    if (!soundRef.current) return;
    try {
      if (typeof window === "undefined") return;
      audioCtxRef.current ||= new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current!;
      const playTone = (freq: number, startOffset: number, duration: number) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        const start = ctx.currentTime + startOffset;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        o.connect(g).connect(ctx.destination);
        o.start(start);
        o.stop(start + duration + 0.05);
      };
      // Ding-dong : note haute puis légèrement plus haute
      playTone(880, 0, 0.18);
      playTone(1175, 0.18, 0.28);
    } catch {}
    // Vibration sur mobile (si autorisée)
    try {
      if (vibrationRef.current && typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([120, 60, 180]);
      }
    } catch {}
  };

  // Notification système (fonctionne même si l'onglet est en arrière-plan)
  const showSystemNotif = (phone: string) => {
    if (!notifRef.current) return;
    try {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const n = new Notification("🔔 Nouveau tampon à valider", {
        body: `Client : ${phone}`,
        tag: "tamply-pending",
        icon: "/favicon.png",
        badge: "/favicon.png",
      });
      n.onclick = () => { window.focus(); n.close(); };
      setTimeout(() => n.close(), 8000);
    } catch {}
  };

  // Faire clignoter le titre tant qu'il y a des demandes en attente
  useEffect(() => {
    if (typeof document === "undefined") return;
    const baseTitle = originalTitleRef.current || document.title;
    if (titleBlinkRef.current) {
      clearInterval(titleBlinkRef.current);
      titleBlinkRef.current = null;
    }
    if (requests.length > 0) {
      let toggle = false;
      const update = () => {
        toggle = !toggle;
        document.title = toggle
          ? `(${requests.length}) 🔔 Tampon à valider`
          : `(${requests.length}) Tampons en attente`;
      };
      update();
      titleBlinkRef.current = setInterval(update, 1200);
    } else {
      document.title = baseTitle;
    }
    return () => {
      if (titleBlinkRef.current) {
        clearInterval(titleBlinkRef.current);
        titleBlinkRef.current = null;
      }
      document.title = baseTitle;
    };
  }, [requests.length]);

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

  const toggleNotif = async () => {
    if (typeof Notification === "undefined") {
      toast.error("Votre navigateur ne supporte pas les notifications.");
      return;
    }
    if (notifOn) {
      setNotifOn(false);
      try { localStorage.setItem("tamply-notif", "off"); } catch {}
      return;
    }
    let perm = Notification.permission;
    if (perm === "default") {
      perm = await Notification.requestPermission();
    }
    if (perm !== "granted") {
      toast.error("Autorisez les notifications dans votre navigateur pour activer cette option.");
      return;
    }
    setNotifOn(true);
    try { localStorage.setItem("tamply-notif", "on"); } catch {}
    toast.success("Notifications activées ✓");
  };

  useEffect(() => {
    if (!shop) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("stamp_requests")
        .select("id, numero_telephone, created_at, customer_id, montant_achat")
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
              showSystemNotif(row.numero_telephone);
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
    const n = Math.max(1, Math.min(50, stampCounts[id] ?? 1));
    const payload = statut === "valide" ? { statut, nb_tampons: n } : { statut };
    const { error } = await supabase.from("stamp_requests").update(payload).eq("id", id);
    setBusy((b) => ({ ...b, [id]: false }));
    if (error) { toast.error(error.message); return; }
    setRequests((r) => r.filter((x) => x.id !== id));
    toast.success(statut === "valide" ? "Tampon validé ✓" : "Demande refusée");
  };

  if (!shop) return null;
  const isPoints = (shop as any).loyalty_mode === "points";
  const montantTranche = Number((shop as any).montant_tranche ?? 5);
  const pointsParTranche = Number((shop as any).points_par_tranche ?? 1);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">
            {isPoints ? "Demandes à valider" : "Tampons à valider"}
            {requests.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-sm font-extrabold text-secondary-foreground align-middle">
                {requests.length}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mises à jour en temps réel
          </p>
        </div>
        <div className="flex flex-none items-center gap-2">
          <button
            type="button"
            onClick={toggleNotif}
            aria-label={notifOn ? "Couper les notifications" : "Activer les notifications"}
            title={notifOn ? "Notifications activées" : "Activer les notifications système"}
            className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-card hover:text-foreground"
          >
            {notifOn ? <Bell className="h-4 w-4 text-secondary" /> : <BellOff className="h-4 w-4" />}
            <span className="hidden sm:inline">{notifOn ? "Notif activées" : "Notif coupées"}</span>
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? "Couper le son" : "Activer le son"}
            className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-card hover:text-foreground"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{soundOn ? "Son activé" : "Son coupé"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyValidation shopId={shop.id} shopName={shop.nom} />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const pointsGagnes = isPoints && r.montant_achat != null
              ? Math.floor(Number(r.montant_achat) / Math.max(0.01, montantTranche)) * pointsParTranche
              : 0;
            const nbTampons = stampCounts[r.id] ?? 1;
            const setNb = (n: number) => setStampCounts((s) => ({ ...s, [r.id]: Math.max(1, Math.min(50, n)) }));

            return (
              <div
                key={r.id}
                className={`group relative overflow-hidden rounded-[28px] border bg-card shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-soft ${
                  newIds.has(r.id)
                    ? "border-secondary/60 animate-pop-in animate-ring-flash"
                    : "border-border/60"
                }`}
              >
                <div className="absolute inset-y-0 left-0 w-1.5 bg-secondary/75" />

                <div className="border-b border-border/60 px-5 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pl-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      À traiter maintenant
                    </div>

                    {newIds.has(r.id) ? (
                      <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-secondary-foreground shadow-soft">
                        <Sparkles className="h-3.5 w-3.5" /> Nouveau
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-muted-foreground">
                        {new Date(r.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 p-5 pl-7 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="grid h-13 w-13 flex-none place-items-center rounded-2xl bg-gradient-cta shadow-soft">
                      <User className="h-6 w-6 text-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Client
                      </div>
                      <div className="mt-1 truncate text-xl font-extrabold sm:text-[1.7rem]">
                        {maskPhone(r.numero_telephone)}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                        <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1">
                          Demande reçue à {new Date(r.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {!isPoints && (
                          <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1">
                            {nbTampons} tampon{nbTampons > 1 ? "s" : ""} à ajouter
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border/60 bg-muted/30 p-4">
                    {isPoints && r.montant_achat != null ? (
                      <>
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Receipt className="h-3.5 w-3.5" />
                          Achat déclaré
                        </div>
                        <div className="mt-2 text-3xl font-extrabold leading-none text-foreground">
                          {Number(r.montant_achat).toFixed(2)} €
                        </div>
                        <div className="mt-3 rounded-2xl bg-background/80 px-3 py-2 text-sm font-bold text-secondary shadow-card">
                          +{pointsGagnes} points après validation
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Nombre de tampons à ajouter
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-background/80 p-1.5 shadow-card">
                          <button
                            type="button"
                            onClick={() => setNb(nbTampons - 1)}
                            disabled={nbTampons <= 1 || busy[r.id]}
                            className="flex h-11 w-14 flex-none items-center justify-center gap-1 rounded-xl border border-border/60 bg-card text-sm font-extrabold text-foreground transition hover:bg-muted disabled:opacity-40"
                            aria-label="Diminuer"
                            title="Retirer 1 tampon"
                          >
                            <Minus className="h-4 w-4" />
                            <span>-1</span>
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={nbTampons}
                            onChange={(e) => setNb(parseInt(e.target.value, 10) || 1)}
                            className="h-11 w-full min-w-0 border-0 bg-transparent text-center text-2xl font-extrabold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => setNb(nbTampons + 1)}
                            disabled={nbTampons >= 50 || busy[r.id]}
                            className="flex h-11 w-14 flex-none items-center justify-center gap-1 rounded-xl bg-secondary text-sm font-extrabold text-secondary-foreground transition hover:opacity-90 disabled:opacity-40"
                            aria-label="Augmenter"
                            title="Ajouter 1 tampon"
                          >
                            <Plus className="h-4 w-4" />
                            <span>+1</span>
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[1, 2, 3, 5, 10].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setNb(n)}
                              disabled={busy[r.id]}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                                nbTampons === n
                                  ? "bg-secondary text-secondary-foreground shadow-soft"
                                  : "border border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              ×{n}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/60 p-3 sm:p-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      variant="refuse"
                      size="huge"
                      disabled={busy[r.id]}
                      onClick={() => decide(r.id, "refuse")}
                    >
                      <X className="!size-7" /> Refuser
                    </Button>
                    <Button
                      variant="validate"
                      size="huge"
                      disabled={busy[r.id]}
                      onClick={() => decide(r.id, "valide")}
                    >
                      <Check className="!size-7" /> Valider
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyValidation({ shopId, shopName }: { shopId: string; shopName: string }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/c/${shopId}` : "";

  const share = async () => {
    const text = `Scannez pour gagner vos tampons chez ${shopName} : ${url}`;
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title: shopName, text, url });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papier ✓");
        return;
      }
    } catch {
      // user cancelled — silent
    }
  };

  const cards: Array<{
    icon: React.ReactNode;
    title: string;
    desc: string;
    to?: string;
    onClick?: () => void;
  }> = [
    {
      icon: <QrCode className="h-5 w-5" />,
      title: "Afficher mon QR code au comptoir",
      desc: "Imprimez ou affichez votre QR code pour vos clients.",
      to: "/dashboard/qr",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Voir mes clients",
      desc: "Consultez la liste de vos clients fidèles.",
      to: "/dashboard/clients",
    },
    {
      icon: <Share2 className="h-5 w-5" />,
      title: "Partager mon lien par SMS",
      desc: "Envoyez votre lien fidélité en quelques secondes.",
      onClick: share,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border-2 border-dashed border-border bg-gradient-hero p-8 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-cta shadow-soft">
          <CheckCircle2 className="h-7 w-7 text-foreground" />
        </div>
        <h2 className="mt-4 text-xl font-extrabold">
          Prêt à recevoir vos premiers tampons ! ✅
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Cette page se met à jour automatiquement dès qu'un client scanne votre QR code.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <div className="group flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft">
              <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-gradient-cta text-foreground shadow-soft">
                {c.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-sm font-extrabold">
                  <span className="truncate">{c.title}</span>
                  <ChevronRight className="h-4 w-4 flex-none text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          );
          if (c.to) {
            return (
              <Link key={c.title} to={c.to} className="block">
                {inner}
              </Link>
            );
          }
          return (
            <button key={c.title} type="button" onClick={c.onClick} className="block w-full">
              {inner}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-accent p-4 text-sm">
        <b>💡 Astuce :</b> montrez votre QR code à vos clients en caisse et invitez-les à scanner — les premières demandes arrivent en quelques secondes.
      </div>
    </div>
  );
}
