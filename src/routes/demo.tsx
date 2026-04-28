import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { QrCode, Smartphone, CheckCircle2, Gift, RotateCcw, Play, Pause } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Démo Tamply — Voyez comment ça marche en 30 secondes" },
      {
        name: "description",
        content:
          "Découvrez en animation comment Tamply transforme la fidélisation de votre établissement : QR code, validation en un clic, récompense automatique.",
      },
      { property: "og:title", content: "Démo Tamply — Voyez comment ça marche" },
      {
        property: "og:description",
        content:
          "Une démo animée pour comprendre Tamply en 30 secondes : du scan client à la récompense.",
      },
    ],
  }),
  component: DemoPage,
});

type StepKey = "scan" | "phone" | "validate" | "stamp" | "reward";

const STEPS: { key: StepKey; n: number; title: string; subtitle: string; icon: any }[] = [
  { key: "scan", n: 1, title: "Le client scanne le QR code", subtitle: "Affiché sur le comptoir, la table ou la vitrine.", icon: QrCode },
  { key: "phone", n: 2, title: "Il entre son numéro", subtitle: "Pas de compte, pas d'app à installer. 5 secondes.", icon: Smartphone },
  { key: "validate", n: 3, title: "Vous validez en un clic", subtitle: "Notification instantanée. Un gros bouton vert sur votre mobile.", icon: CheckCircle2 },
  { key: "stamp", n: 4, title: "Le tampon s'ajoute", subtitle: "La carte digitale du client se met à jour en temps réel.", icon: RotateCcw },
  { key: "reward", n: 5, title: "À 10 tampons : récompense !", subtitle: "Confettis, animation, et le client revient encore.", icon: Gift },
];

const STEP_DURATION = 5000;

function DemoPage() {
  const [active, setActive] = useState<number>(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % STEPS.length), STEP_DURATION);
    return () => clearTimeout(t);
  }, [active, playing]);

  const step = STEPS[active];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo Tamply" className="h-9 w-9 object-contain" />
            <span className="text-xl font-extrabold tracking-tight">Tamply</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Accueil</Link>
            <Link to="/demo" className="text-foreground font-bold">Démo</Link>
          </nav>
          <Link to="/signup">
            <Button variant="cta">Démarrer</Button>
          </Link>
        </div>
      </header>

      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-card">
            ▶ Démo interactive · 30 secondes
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Tamply, expliqué en <span className="bg-gradient-to-r from-[#E63946] to-[#FFB800] bg-clip-text text-transparent">5 étapes</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Regardez comment vos clients scannent, et comment vous validez en un clic depuis votre comptoir.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.1fr]">
          {/* Steps list */}
          <div className="order-2 lg:order-1">
            <ol className="space-y-3">
              {STEPS.map((s, i) => {
                const isActive = i === active;
                const isDone = i < active;
                return (
                  <li key={s.key}>
                    <button
                      onClick={() => { setActive(i); setPlaying(false); }}
                      className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                        isActive
                          ? "border-primary bg-card shadow-glow"
                          : "border-border/60 bg-card/60 hover:bg-card hover:shadow-card"
                      }`}
                    >
                      <div
                        className={`grid h-10 w-10 flex-none place-items-center rounded-xl text-sm font-bold transition-colors ${
                          isActive
                            ? "bg-gradient-cta text-foreground shadow-soft"
                            : isDone
                            ? "bg-success/15 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-5 w-5" /> : s.n}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <s.icon className={`h-4 w-4 ${isActive ? "text-secondary" : "text-muted-foreground"}`} />
                          <h3 className={`font-bold ${isActive ? "text-foreground" : "text-foreground/80"}`}>{s.title}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{s.subtitle}</p>
                        {isActive && (
                          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                            <div
                              key={`${active}-${playing}`}
                              className="h-full bg-gradient-cta"
                              style={{
                                width: "100%",
                                animation: playing ? `tamplyProgress ${STEP_DURATION}ms linear forwards` : "none",
                                transformOrigin: "left",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPlaying((p) => !p)}
                className="gap-2"
              >
                {playing ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Lecture</>}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setActive(0); setPlaying(true); }}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Recommencer
              </Button>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="order-1 lg:order-2">
            <PhoneStage step={step.key} stepIndex={active} />
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Convaincu ? Essayez gratuitement.</h2>
          <p className="mt-3 text-muted-foreground">30 jours d'essai. Sans carte bancaire. Annulable à tout moment.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup">
              <Button variant="cta" size="xl">Démarrer mon essai gratuit →</Button>
            </Link>
            <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes tamplyProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes tamplyPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes tamplyFadeUp {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes tamplyPulseRing {
          0% { transform: scale(0.8); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes tamplyConfetti {
          0% { transform: translate(0,0) rotate(0); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--r)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function PhoneStage({ step, stepIndex }: { step: StepKey; stepIndex: number }) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Phone frame */}
      <div className="relative mx-auto aspect-[9/19] w-full max-w-[340px] rounded-[3rem] border-[10px] border-foreground/90 bg-background shadow-soft">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground/90" />
        <div key={stepIndex} className="absolute inset-0 overflow-hidden rounded-[2.2rem]">
          <PhoneScene step={step} />
        </div>
      </div>
    </div>
  );
}

function PhoneScene({ step }: { step: StepKey }) {
  if (step === "scan") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-gradient-hero p-6 text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ animation: "tamplyFadeUp 400ms ease-out both" }}>
          Brasserie Chez Marcel
        </div>
        <div className="relative" style={{ animation: "tamplyPop 500ms cubic-bezier(.2,.9,.3,1.2) both" }}>
          <div className="absolute inset-0 rounded-2xl border-2 border-primary" style={{ animation: "tamplyPulseRing 1.6s ease-out infinite" }} />
          <FakeQR />
        </div>
        <p className="text-sm font-semibold text-foreground" style={{ animation: "tamplyFadeUp 600ms ease-out 200ms both" }}>
          📷 Scannez avec votre appareil photo
        </p>
      </div>
    );
  }
  if (step === "phone") {
    return (
      <div className="flex h-full flex-col gap-4 bg-card p-6">
        <div className="text-center text-2xl">🎟️</div>
        <h3 className="text-center text-base font-extrabold leading-tight" style={{ animation: "tamplyFadeUp 400ms ease-out both" }}>
          Votre carte de fidélité
        </h3>
        <p className="text-center text-xs text-muted-foreground" style={{ animation: "tamplyFadeUp 400ms ease-out 80ms both" }}>
          Entrez votre numéro pour ajouter un tampon
        </p>
        <div className="mt-2 rounded-xl border-2 border-primary bg-background px-4 py-3 font-mono text-sm" style={{ animation: "tamplyFadeUp 400ms ease-out 160ms both" }}>
          <TypingNumber />
        </div>
        <button className="mt-2 rounded-xl bg-gradient-cta px-4 py-3 text-sm font-bold shadow-soft" style={{ animation: "tamplyFadeUp 400ms ease-out 240ms both" }}>
          Demander un tampon
        </button>
        <div className="mt-auto text-center text-[10px] text-muted-foreground">Aucune app à installer</div>
      </div>
    );
  }
  if (step === "validate") {
    return (
      <div className="flex h-full flex-col gap-3 bg-muted/40 p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold">📊 Tableau de bord</div>
          <div className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground" style={{ animation: "tamplyPop 400ms ease-out both" }}>
            1 nouvelle demande
          </div>
        </div>
        <div className="rounded-2xl border-2 border-primary bg-card p-4 shadow-glow" style={{ animation: "tamplyFadeUp 400ms ease-out 120ms both" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Nouveau client</div>
              <div className="text-sm font-bold">+32 478 12 34 56</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-lg">🎟️</div>
          </div>
          <button className="mt-4 w-full rounded-xl bg-success px-4 py-4 text-base font-extrabold text-success-foreground shadow-soft" style={{ animation: "tamplyPop 500ms cubic-bezier(.2,.9,.3,1.3) 400ms both" }}>
            ✓ Valider le tampon
          </button>
          <button className="mt-2 w-full rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
            Refuser
          </button>
        </div>
        <div className="mt-auto text-center text-[10px] text-muted-foreground">Notification en temps réel 🔔</div>
      </div>
    );
  }
  if (step === "stamp") {
    return (
      <div className="flex h-full flex-col gap-3 bg-card p-5">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brasserie Chez Marcel</div>
          <div className="mt-1 text-sm font-bold">Votre carte de fidélité</div>
        </div>
        <div className="rounded-full bg-success/15 px-3 py-1 text-center text-xs font-bold text-success" style={{ animation: "tamplyPop 400ms ease-out both" }}>
          +1 tampon ajouté !
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => {
            const filled = i < 7;
            const isNew = i === 6;
            return (
              <div
                key={i}
                className={`aspect-square grid place-items-center rounded-xl border-2 text-base font-bold ${
                  filled
                    ? "border-primary bg-primary text-foreground shadow-soft"
                    : "border-dashed border-border bg-muted/40"
                }`}
                style={isNew ? { animation: "tamplyPop 600ms cubic-bezier(.2,.9,.3,1.4) 200ms both" } : undefined}
              >
                {filled ? "✓" : ""}
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-center text-xs font-semibold text-muted-foreground">
          7 / 10 — plus que 3 pour la récompense !
        </div>
      </div>
    );
  }
  // reward
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-hero p-6 text-center">
      <Confetti />
      <div className="text-6xl" style={{ animation: "tamplyPop 700ms cubic-bezier(.2,.9,.3,1.5) both" }}>🎁</div>
      <h3 className="text-xl font-extrabold" style={{ animation: "tamplyFadeUp 500ms ease-out 200ms both" }}>
        Bravo !
      </h3>
      <p className="text-sm text-muted-foreground" style={{ animation: "tamplyFadeUp 500ms ease-out 320ms both" }}>
        Votre 10ème tampon vous offre :
      </p>
      <div className="rounded-2xl border-2 border-primary bg-card px-5 py-3 text-base font-extrabold shadow-glow" style={{ animation: "tamplyPop 600ms cubic-bezier(.2,.9,.3,1.4) 400ms both" }}>
        🍻 Une boisson offerte
      </div>
      <p className="text-[11px] text-muted-foreground" style={{ animation: "tamplyFadeUp 500ms ease-out 600ms both" }}>
        À présenter au comptoir
      </p>
    </div>
  );
}

function FakeQR() {
  // Pseudo-random but stable QR-like grid
  const cells = Array.from({ length: 13 * 13 }, (_, i) => {
    const x = i % 13;
    const y = Math.floor(i / 13);
    const corner =
      (x < 3 && y < 3) || (x > 9 && y < 3) || (x < 3 && y > 9);
    if (corner) {
      const inner = (x === 1 || x === 11) && (y === 1 || y === 11);
      const ring = x === 0 || x === 2 || x === 10 || x === 12 || y === 0 || y === 2 || y === 10 || y === 12;
      return inner ? 1 : ring && (x < 3 || x > 9) && (y < 3 || y > 9) ? 1 : 0;
    }
    return ((x * 31 + y * 17 + x * y) % 3) === 0 ? 1 : 0;
  });
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className="grid h-44 w-44 grid-cols-13 gap-[2px]" style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}>
        {cells.map((c, i) => (
          <div key={i} className={c ? "bg-foreground rounded-[2px]" : "bg-transparent"} />
        ))}
      </div>
    </div>
  );
}

function TypingNumber() {
  const target = "+32 478 12 34 56";
  const [text, setText] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setText(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, 110);
    return () => clearInterval(id);
  }, []);
  return (
    <span>
      {text}
      <span className="ml-0.5 inline-block h-4 w-[2px] -translate-y-[1px] animate-pulse bg-foreground/70 align-middle" />
    </span>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 28 });
  const colors = ["#FFD700", "#E63946", "#FFB800", "#3CB371", "#4F8EF7"];
  return (
    <div className="pointer-events-none absolute inset-0">
      {pieces.map((_, i) => {
        const tx = (Math.random() - 0.5) * 240;
        const ty = (Math.random() - 0.2) * 320;
        const r = (Math.random() - 0.5) * 720;
        const c = colors[i % colors.length];
        const delay = Math.random() * 600;
        const size = 6 + Math.random() * 6;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/3 block rounded-sm"
            style={{
              width: size,
              height: size * 0.4,
              background: c,
              ["--tx" as any]: `${tx}px`,
              ["--ty" as any]: `${ty}px`,
              ["--r" as any]: `${r}deg`,
              animation: `tamplyConfetti 1400ms ease-out ${delay}ms forwards`,
            }}
          />
        );
      })}
    </div>
  );
}