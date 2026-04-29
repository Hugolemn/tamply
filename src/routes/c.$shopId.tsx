import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { Loader2, Phone } from "lucide-react";
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
}
interface Customer { id: string; total_tampons: number; total_recompenses: number; }

type Step = "phone" | "waiting" | "stamped" | "reward" | "refused" | "timeout";

function ClientFlow() {
  const { shopId } = Route.useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopErr, setShopErr] = useState(false);
  const [phone, setPhone] = useState("");
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
        .select("id, nom, logo_url, couleur, description_recompense, tampons_requis, stamp_emoji")
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
              .from("customers").select("id, total_tampons, total_recompenses").eq("id", customer.id).maybeSingle();
            if (c) setCustomer(c as Customer);
            const updated = (c as Customer) ?? customer;
            // Reward attribution = total_recompenses augmenté OU compteur retombé à 0
            if ((c?.total_recompenses ?? customer.total_recompenses) > customer.total_recompenses || updated.total_tampons === 0) {
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
    setSubmitting(true);

    // Find existing or create
    const { data: existing } = await supabase
      .from("customers").select("id, total_tampons, total_recompenses")
      .eq("shop_id", shop.id).eq("numero_telephone", cleaned).maybeSingle();

    let cust = existing as Customer | null;
    if (!cust) {
      const { data: created, error } = await supabase
        .from("customers")
        .insert({ shop_id: shop.id, numero_telephone: cleaned })
        .select("id, total_tampons, total_recompenses").single();
      if (error || !created) { setSubmitting(false); return; }
      cust = created as Customer;
    }

    const { data: req, error: reqErr } = await supabase
      .from("stamp_requests")
      .insert({ shop_id: shop.id, customer_id: cust.id, numero_telephone: cleaned })
      .select("id").single();
    setSubmitting(false);
    if (reqErr || !req) return;
    setCustomer(cust);
    setReqId(req.id);
    setStep("waiting");
  };

  const restart = () => { setStep("phone"); setPhone(""); setCustomer(null); setReqId(null); };

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
        <PhoneStep phone={phone} setPhone={setPhone} submit={submitPhone} submitting={submitting} />
      )}
      {step === "waiting" && <WaitingStep />}
      {step === "stamped" && customer && (
        <StampedStep shop={shop} count={customer.total_tampons} restart={restart} />
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
    <div className="min-h-screen bg-gradient-hero px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">
        <div className="mt-2 flex items-center justify-center gap-2 opacity-70">
          <img src={logo} alt="Logo Tamply" className="h-7 w-7 object-contain" />
          <span className="text-sm font-extrabold">Tamply</span>
        </div>
        <div className="mt-6 flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

function Header({ shop }: { shop: Shop }) {
  return (
    <div className="text-center">
      {shop.logo_url ? (
        <img src={shop.logo_url} alt={shop.nom} className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-soft" />
      ) : (
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-3xl shadow-soft" style={{ background: shop.couleur }}>🍟</div>
      )}
      <h1 className="mt-3 text-xl font-extrabold">{shop.nom}</h1>
      <p className="mt-1 text-xs text-muted-foreground">Carte de fidélité digitale</p>
    </div>
  );
}

function PhoneStep({ phone, setPhone, submit, submitting }: { phone: string; setPhone: (v: string) => void; submit: () => void; submitting: boolean; }) {
  const ok = phone.trim().length >= 6;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (ok && !submitting) submit(); }} className="mt-10 flex flex-1 flex-col">
      <h2 className="text-center text-2xl font-extrabold">Entre ton numéro</h2>
      <p className="mt-1 text-center text-sm text-muted-foreground">Pas de compte. Pas d'appli. Juste ton tampon.</p>
      <div className="relative mt-8">
        <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="tel" inputMode="tel" autoFocus
          value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="0470 12 34 56"
          className="h-16 rounded-2xl pl-12 text-xl font-bold shadow-card"
        />
      </div>
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

function StampedStep({ shop, count, restart }: { shop: Shop; count: number; restart: () => void }) {
  const total = shop.tampons_requis;
  const progress = Math.min(count, total);
  return (
    <div className="mt-10 flex flex-1 flex-col">
      <h2 className="text-center text-2xl font-extrabold">Super ! +1 tampon 🎉</h2>
      <p className="mt-1 text-center text-muted-foreground">
        Tu as <b>{progress}</b> tampon{progress > 1 ? "s" : ""} sur <b>{total}</b>
      </p>
      <div className="mt-6 rounded-3xl border border-border/60 bg-card p-5 shadow-card">
        <StampGrid total={total} filled={progress} emoji={shop.stamp_emoji || "🍟"} />
        <div className="mt-4 text-center text-sm font-semibold">
          Plus que <b className="text-secondary">{Math.max(0, total - progress)}</b> pour ta récompense !
        </div>
      </div>
      <div className="mt-auto pt-8">
        <Button variant="outline" size="xl" onClick={restart} className="w-full">Terminé</Button>
      </div>
    </div>
  );
}

function StampGrid({ total, filled, emoji }: { total: number; filled: number; emoji: string }) {
  const cols = total <= 10 ? 5 : total <= 16 ? 4 : 5;
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < filled;
        return (
          <div
            key={i}
            className={`aspect-square rounded-xl border-2 grid place-items-center text-lg font-bold transition-all ${
              done ? "bg-primary border-primary text-foreground shadow-soft scale-100" : "bg-muted/40 border-dashed border-border text-muted-foreground"
            }`}
          >
            {done ? emoji : i + 1}
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
