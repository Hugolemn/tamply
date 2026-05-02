import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { Loader2, Phone, Euro } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/c/$shopId")({
  head: () => ({
    meta: [
      { title: "Carte de fidélité · Tamply" },
      {
        name: "description",
        content:
          "Récupérez votre tampon de fidélité en quelques secondes. Aucune application à installer.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClientFlow,
});

interface Shop {
  id: string; nom: string; logo_url: string | null; couleur: string;
  description_recompense: string; tampons_requis: number; stamp_emoji: string;
  card_template?: string | null;
  loyalty_mode?: "tampons" | "points";
  montant_tranche?: number;
  points_par_tranche?: number;
  points_requis?: number;
}
interface Customer { id: string; total_tampons: number; total_points: number; total_recompenses: number; }

type Step = "phone" | "waiting" | "stamped" | "reward" | "refused" | "timeout";

function ClientFlow() {
  const { shopId } = Route.useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopErr, setShopErr] = useState(false);
  const [phone, setPhone] = useState("");
  const [montant, setMontant] = useState("");
  const [step, setStep] = useState<Step>("phone");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [reqId, setReqId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("id, nom, logo_url, couleur, description_recompense, tampons_requis, stamp_emoji, card_template, loyalty_mode, montant_tranche, points_par_tranche, points_requis")
        .eq("id", shopId)
        .maybeSingle();
      if (error || !data) setShopErr(true);
      else setShop(data as Shop);
    })();
  }, [shopId]);

  // Subscribe when waiting
  useEffect(() => {
    if (step !== "waiting" || !reqId || !customer || !shop) return;
    timeoutRef.current = setTimeout(() => setStep("timeout"), 60_000);

    const channel = supabase
      .channel(`req-${reqId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "stamp_requests", filter: `id=eq.${reqId}` },
        async (payload) => {
          const row = payload.new as any;
          if (row.statut === "valide") {
            // Reload customer
            const { data: c } = await supabase
              .from("customers").select("id, total_tampons, total_points, total_recompenses").eq("id", customer.id).maybeSingle();
            if (c) setCustomer(c as Customer);
            const updated = (c as Customer) ?? customer;
            // Reward attribution = total_recompenses augmenté
            if ((c?.total_recompenses ?? customer.total_recompenses) > customer.total_recompenses) {
              setStep("reward");
              setTimeout(() => fireConfetti(), 50);
            } else {
              setStep("stamped");
            }
            cleanup();
          } else if (row.statut === "refuse") {
            setStep("refused");
            cleanup();
          }
        }
      )
      .subscribe();
    channelRef.current = channel;

    return cleanup;
    function cleanup() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [step, reqId, customer, shop]);

  const fireConfetti = () => {
    const colors = ["#FFD700", "#E63946", "#FFB800"];
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.7 }, colors }), 250);
    setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 }, colors }), 500);
    setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 }, colors }), 500);
  };

  const submitPhone = async () => {
    if (!shop) return;
    const cleaned = phone.trim();
    if (cleaned.length < 6 || cleaned.length > 20) { return; }
    const isPoints = shop.loyalty_mode === "points";
    const montantNum = isPoints ? Number(montant.replace(",", ".")) : null;
    if (isPoints && (!montantNum || montantNum <= 0 || montantNum > 100000)) {
      return;
    }
    setSubmitting(true);

    // Find existing or create
    const { data: existing } = await supabase
      .from("customers").select("id, total_tampons, total_points, total_recompenses")
      .eq("shop_id", shop.id).eq("numero_telephone", cleaned).maybeSingle();

    let cust = existing as Customer | null;
    if (!cust) {
      const { data: created, error } = await supabase
        .from("customers")
        .insert({ shop_id: shop.id, numero_telephone: cleaned })
        .select("id, total_tampons, total_points, total_recompenses").single();
      if (error || !created) { setSubmitting(false); return; }
      cust = created as Customer;
    }

    const { data: req, error: reqErr } = await supabase
      .from("stamp_requests")
      .insert({
        shop_id: shop.id,
        customer_id: cust.id,
        numero_telephone: cleaned,
        montant_achat: isPoints ? montantNum : null,
      })
      .select("id").single();
    setSubmitting(false);
    if (reqErr || !req) return;
    setCustomer(cust);
    setReqId(req.id);
    setStep("waiting");
  };

  const restart = () => { setStep("phone"); setPhone(""); setMontant(""); setCustomer(null); setReqId(null); };

  if (shopErr) {
    return (
      <Wrapper>
        <div className="text-center">
          <div className="text-5xl">🤔</div>
          <h1 className="mt-4 text-2xl font-extrabold">Établissement introuvable</h1>
          <p className="mt-2 text-muted-foreground">Vérifiez le QR code ou demandez au gérant.</p>
        </div>
      </Wrapper>
    );
  }
  if (!shop) {
    return <Wrapper><Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" /></Wrapper>;
  }

  return (
    <Wrapper>
      <Header shop={shop} />
      {step === "phone" && (
        <PhoneStep
          shop={shop}
          phone={phone} setPhone={setPhone}
          montant={montant} setMontant={setMontant}
          submit={submitPhone} submitting={submitting}
        />
      )}
      {step === "waiting" && <WaitingStep />}
      {step === "stamped" && customer && (
        <StampedStep shop={shop} customer={customer} restart={restart} />
      )}
      {step === "reward" && (
        <RewardStep shop={shop} restart={restart} />
      )}
      {step === "refused" && <ResultMsg emoji="🙅" title="Demande refusée" desc="Le gérant n'a pas validé cette demande." onBack={restart} />}
      {step === "timeout" && <ResultMsg emoji="⏱️" title="Trop long !" desc="Le gérant n'a pas répondu. Réessayez dans un instant." onBack={restart} />}
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6" style={{ background: "oklch(97% 0.01 95)" }}>
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">
        <div className="mt-2 flex items-center justify-center gap-2 opacity-60">
          <img src={logo} alt="Logo Tamply" className="h-7 w-7 object-contain" />
          <span className="text-xs font-bold tracking-wide">Tamply</span>
        </div>
        <div className="mt-6 flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

function Header({ shop }: { shop: Shop }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="rounded-full bg-white p-3 shadow-lg ring-1 ring-black/5">
        {shop.logo_url ? (
          <img src={shop.logo_url} alt={shop.nom} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div
            className="grid h-14 w-14 place-items-center rounded-full text-3xl"
            style={{ background: shop.couleur }}
          >
            {shop.stamp_emoji || "🍟"}
          </div>
        )}
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">{shop.nom}</h1>
      <p className="mt-1 text-sm text-neutral-500">Fidélité récompensée</p>
    </div>
  );
}

function PhoneStep({
  shop, phone, setPhone, montant, setMontant, submit, submitting,
}: {
  shop: Shop;
  phone: string; setPhone: (v: string) => void;
  montant: string; setMontant: (v: string) => void;
  submit: () => void; submitting: boolean;
}) {
  const isPoints = shop.loyalty_mode === "points";
  const montantNum = Number(montant.replace(",", "."));
  const montantOk = !isPoints || (Number.isFinite(montantNum) && montantNum > 0 && montantNum <= 100000);
  const ok = phone.trim().length >= 6 && montantOk;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (ok && !submitting) submit(); }} className="mt-10 flex flex-1 flex-col">
      <h2 className="text-center text-2xl font-extrabold">
        {isPoints ? "Ton numéro et ton montant" : "Entre ton numéro"}
      </h2>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        {isPoints
          ? "Pas de compte. Pas d'appli. Juste tes points."
          : "Pas de compte. Pas d'appli. Juste ton tampon."}
      </p>
      <div className="relative mt-8">
        <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="tel" inputMode="tel" autoFocus
          value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="0470 12 34 56"
          className="h-16 rounded-2xl pl-12 text-xl font-bold shadow-card"
        />
      </div>
      {isPoints && (
        <div className="mt-4">
          <div className="relative">
            <Euro className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              inputMode="decimal"
              value={montant}
              onChange={(e) => setMontant(e.target.value.replace(/[^0-9.,]/g, ""))}
              placeholder="Montant de ton achat"
              className="h-16 rounded-2xl pl-12 text-xl font-bold shadow-card"
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {shop.points_par_tranche ?? 1} pt(s) par tranche de {(shop.montant_tranche ?? 5).toFixed(2)} €
          </p>
        </div>
      )}
      <div className="mt-auto pt-8">
        <Button type="submit" variant="cta" size="huge" disabled={!ok || submitting} className="w-full">
          {submitting ? "Envoi…" : "Valider"}
        </Button>
        <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
          Ton numéro est conservé uniquement par le commerçant pour suivre tes tampons de fidélité.
          Il n'est jamais revendu ni partagé. Tu peux demander sa suppression à tout moment auprès du commerçant.
          <br />
          En continuant, tu acceptes notre{" "}
          <a
            href="/confidentialite"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </form>
  );
}

function WaitingStep() {
  return (
    <div className="mt-12 text-center">
      <div className="relative mx-auto h-24 w-24">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        <div className="absolute inset-2 grid place-items-center rounded-full bg-gradient-cta shadow-glow">
          <Loader2 className="h-10 w-10 animate-spin text-foreground" />
        </div>
      </div>
      <h2 className="mt-8 text-2xl font-extrabold">En attente…</h2>
      <p className="mt-2 text-muted-foreground">Le gérant valide ta demande dans un instant 👨‍🍳</p>
    </div>
  );
}

function StampedStep({ shop, customer, restart }: { shop: Shop; customer: Customer; restart: () => void }) {
  const isPoints = shop.loyalty_mode === "points";
  const total = isPoints ? (shop.points_requis ?? 100) : shop.tampons_requis;
  const count = isPoints ? customer.total_points : customer.total_tampons;
  const progress = Math.min(count, total);
  const remaining = Math.max(0, total - progress);
  return (
    <div className="mt-8 flex flex-1 flex-col">
      <p className="text-center text-sm font-semibold uppercase tracking-wider" style={{ color: shop.couleur }}>
        {isPoints ? "Points ajoutés !" : "+1 tampon ajouté"}
      </p>
      <h2 className="mt-1 text-center text-2xl font-semibold tracking-tight text-neutral-900">
        Merci pour ta visite 🎉
      </h2>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg">
        <h3 className="text-base font-medium text-neutral-800">Votre prochaine récompense</h3>
        {isPoints ? (
          <PointsBar
            total={total}
            current={progress}
            color={shop.couleur}
          />
        ) : (
          <div className="mt-4">
            <StampGrid
              total={total}
              filled={progress}
              emoji={shop.stamp_emoji || "🍟"}
              color={shop.couleur}
            />
          </div>
        )}
        <div className="mt-5 text-center">
          <p className="text-base font-medium text-neutral-700">
            {progress} / {total} {isPoints ? "points" : "tampons"}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {remaining === 0
              ? "Récompense débloquée !"
              : `Plus que ${remaining} ${isPoints ? "pts" : ""} pour ${shop.description_recompense.toLowerCase()}`}
          </p>
        </div>
      </div>
      <div className="mt-auto pt-8">
        <Button
          size="xl"
          onClick={restart}
          className="w-full rounded-xl text-white shadow-sm hover:brightness-110"
          style={{ background: shop.couleur }}
        >
          Terminé
        </Button>
      </div>
    </div>
  );
}

function PointsBar({ total, current, color }: { total: number; current: number; color: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className="mt-4">
      <div className="h-4 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function StampGrid({
  total, filled, emoji, color,
}: { total: number; filled: number; emoji: string; color: string }) {
  const cols = total <= 10 ? 5 : total <= 16 ? 4 : 5;
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < filled;
        return (
          <div
            key={i}
            className="aspect-square rounded-xl grid place-items-center text-lg leading-none border-2 transition-all"
            style={{
              background: done ? color : "transparent",
              borderColor: done ? color : "color-mix(in oklab, var(--muted-foreground) 35%, transparent)",
              borderStyle: done ? "solid" : "dashed",
              color: done ? "#0a0a0a" : "color-mix(in oklab, var(--muted-foreground) 80%, transparent)",
            }}
          >
            {done ? emoji : ""}
          </div>
        );
      })}
    </div>
  );
}

function RewardStep({ shop, restart }: { shop: Shop; restart: () => void }) {
  return (
    <div className="mt-6 flex flex-1 flex-col text-center">
      <div className="text-6xl">🎉</div>
      <h2 className="mt-4 text-3xl font-extrabold">Félicitations !</h2>
      <p className="mt-2 text-muted-foreground">Tu as gagné</p>
      <div className="mt-4 rounded-3xl bg-gradient-cta p-8 shadow-glow">
        <div className="text-4xl">🎁</div>
        <div className="mt-3 text-2xl font-extrabold">{shop.description_recompense}</div>
      </div>
      <div className="mt-6 rounded-2xl border-2 border-dashed border-primary bg-card p-4 text-sm font-semibold">
        Montre cet écran au gérant pour récupérer ta récompense ✨
      </div>
      <div className="mt-auto pt-6">
        <Button variant="outline" size="xl" onClick={restart} className="w-full">C'est fait, merci !</Button>
      </div>
    </div>
  );
}

function ResultMsg({ emoji, title, desc, onBack }: { emoji: string; title: string; desc: string; onBack: () => void }) {
  return (
    <div className="mt-12 flex flex-1 flex-col text-center">
      <div className="text-6xl">{emoji}</div>
      <h2 className="mt-4 text-2xl font-extrabold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{desc}</p>
      <div className="mt-auto pt-8">
        <Button variant="cta" size="xl" onClick={onBack} className="w-full">Réessayer</Button>
      </div>
    </div>
  );
}
