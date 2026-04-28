import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check, Smartphone, Zap, RefreshCw, Sparkles, Play, QrCode, CheckCircle2, Gift } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tamply — La carte de fidélité digitale pour l'Horeca" },
      {
        name: "description",
        content:
          "Restaurants, sandwicheries, brasseries, cafés, friteries, food trucks : fidélisez vos clients sans qu'ils téléchargent d'app. Validez chaque tampon en un clic. 30 jours d'essai gratuit, puis 29€/mois.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Benefits />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-cta shadow-soft">
            <span className="text-lg">🎟️</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight">Tamply</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#avantages" className="text-muted-foreground hover:text-foreground">Avantages</a>
          <Link to="/demo" className="text-muted-foreground hover:text-foreground">Démo</Link>
          <a href="#temoignages" className="text-muted-foreground hover:text-foreground">Témoignages</a>
          <a href="#tarifs" className="text-muted-foreground hover:text-foreground">Tarifs</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm font-semibold text-foreground/80 hover:text-foreground sm:block">
            Connexion
          </Link>
          <Link to="/signup">
            <Button variant="cta" size="default">Démarrer</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-card">
            <Sparkles className="h-3.5 w-3.5 text-tamply-red" />
            Pensé pour l'Horeca en Belgique et en France
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
            La carte de fidélité digitale pour votre <span className="bg-gradient-to-r from-[#E63946] to-[#FFB800] bg-clip-text text-transparent">établissement</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Restaurants, sandwicheries, brasseries, cafés, friteries, food trucks. Vos clients scannent un QR code au comptoir, vous validez en un clic.
            Plus de cartes en carton perdues. Plus de clients oubliés.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup">
              <Button variant="cta" size="xl">Démarrer gratuitement →</Button>
            </Link>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">30 jours d'essai · sans carte bancaire</div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto mt-14 max-w-md">
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-cta">🎟️</div>
            <div>
              <div className="text-sm font-bold">Brasserie Chez Marcel</div>
              <div className="text-xs text-muted-foreground">+32 4 78 …</div>
            </div>
          </div>
          <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">+1 tampon</span>
        </div>
        <div className="mt-6 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl border-2 border-dashed grid place-items-center text-lg ${
                i < 7 ? "bg-primary border-primary shadow-soft" : "border-border bg-muted/40"
              }`}
            >
              {i < 7 ? "✓" : ""}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-sm font-semibold text-muted-foreground">
          7 / 10 — plus que 3 pour la récompense !
        </div>
      </div>
    </div>
  );
}

function Benefits() {
  const items = [
    {
      icon: Smartphone,
      title: "Aucune app à télécharger",
      desc: "Vos clients scannent, saisissent leur numéro, c'est tout. Pas d'inscription, pas d'install.",
    },
    {
      icon: Zap,
      title: "Validez en un clic",
      desc: "Notification instantanée sur votre mobile. Un gros bouton vert. Utilisable à une main.",
    },
    {
      icon: RefreshCw,
      title: "Vos clients reviennent plus",
      desc: "Récompense automatique à 10 tampons. Plus de cartes oubliées au fond du sac.",
    },
  ];
  return (
    <section id="avantages" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Tout simplement, ça marche.</h2>
          <p className="mt-3 text-muted-foreground">Conçu avec et pour les gérants de l'Horeca.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all hover:shadow-soft hover:-translate-y-0.5">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-cta">
                <it.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, icon: QrCode, t: "Le client scanne", d: "Un QR code à votre comptoir." },
    { n: 2, icon: Smartphone, t: "Il entre son numéro", d: "Pas de compte, pas d'app." },
    { n: 3, icon: CheckCircle2, t: "Vous validez", d: "Un clic sur votre mobile." },
    { n: 4, icon: Gift, t: "Il revient", d: "Récompense à 10 tampons." },
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20">
      <div className="absolute -left-24 top-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -right-24 bottom-12 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-card">
            <Play className="h-3 w-3 fill-current text-tamply-red" />
            Démo interactive
          </div>
          <h2 className="text-3xl font-extrabold md:text-4xl">Voyez Tamply en action</h2>
          <p className="mt-3 text-muted-foreground">
            30 secondes pour comprendre, du scan client à la récompense.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Phone preview */}
          <Link to="/demo" className="group relative mx-auto block w-full max-w-sm">
            <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-primary/30 to-secondary/20 opacity-60 blur-2xl transition-opacity group-hover:opacity-90" />
            <div className="relative mx-auto aspect-[9/19] w-full max-w-[300px] rounded-[2.5rem] border-[8px] border-foreground/90 bg-background shadow-soft transition-transform group-hover:-translate-y-1">
              <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-foreground/90" />
              <div className="absolute inset-0 flex flex-col gap-3 overflow-hidden rounded-[1.8rem] bg-card p-4 pt-8">
                <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Brasserie Chez Marcel
                </div>
                <div className="rounded-full bg-success/15 px-3 py-1 text-center text-[11px] font-bold text-success">
                  +1 tampon ajouté !
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square grid place-items-center rounded-lg border-2 text-xs font-bold ${
                        i < 7
                          ? "border-primary bg-primary text-foreground shadow-soft"
                          : "border-dashed border-border bg-muted/40"
                      }`}
                    >
                      {i < 7 ? "✓" : ""}
                    </div>
                  ))}
                </div>
                <div className="text-center text-[10px] font-semibold text-muted-foreground">
                  7 / 10 — plus que 3 !
                </div>
              </div>
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center rounded-[1.8rem] bg-foreground/0 transition-colors group-hover:bg-foreground/10">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-background/95 shadow-glow ring-2 ring-primary/40 transition-transform group-hover:scale-110">
                  <Play className="h-7 w-7 translate-x-0.5 fill-foreground text-foreground" />
                </div>
              </div>
            </div>
          </Link>

          {/* Steps + CTA */}
          <div>
            <ol className="space-y-3">
              {steps.map((s) => (
                <li key={s.n} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-card">
                  <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-gradient-cta text-sm font-bold shadow-soft">
                    {s.n}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <s.icon className="h-4 w-4 text-secondary" />
                      <h3 className="font-bold">{s.t}</h3>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link to="/demo">
                <Button variant="cta" size="lg" className="gap-2">
                  <Play className="h-4 w-4 fill-current" />
                  Lancer la démo interactive
                </Button>
              </Link>
              <span className="text-xs text-muted-foreground">30 secondes · sans inscription</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const features = [
    "Clients illimités",
    "QR code unique pour votre établissement",
    "Validation en temps réel",
    "Tableau de bord mobile",
    "SMS de récompense automatiques",
    "Support en français",
  ];
  return (
    <section id="tarifs" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Un seul tarif, simple.</h2>
          <p className="mt-3 text-muted-foreground">Sans engagement. Annulable à tout moment.</p>
        </div>
        <div className="mx-auto mt-10 max-w-lg">
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary bg-card p-8 shadow-glow">
            <div className="absolute right-4 top-4 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
              30 jours offerts
            </div>
            <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tamply Pro</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold">29€</span>
              <span className="text-muted-foreground">/mois</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">par établissement, après l'essai gratuit</p>
            <ul className="mt-6 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-success/15">
                    <Check className="h-3 w-3 text-success" />
                  </div>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-8 block">
              <Button variant="cta" size="xl" className="w-full">Démarrer mon essai gratuit</Button>
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">Aucune carte bancaire requise</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { name: "Sophie", role: "Sandwicherie La Bonne Mie · Lille", quote: "Validation en un clic, c'est exactement ce qu'il me fallait pendant le coup de feu du midi." },
    { name: "Marcel", role: "Brasserie Chez Marcel · Liège", quote: "Mes habitués adorent. Et je ne perds plus de cartes en carton derrière le comptoir." },
    { name: "Inès", role: "Café Le Central · Bruxelles", quote: "Mes clients reviennent plus souvent depuis qu'ils suivent leurs tampons sur leur téléphone." },
    { name: "Karim", role: "Food truck Le Bon Burger · Charleroi", quote: "Parfait pour un food truck : un QR code, et c'est parti." },
  ];
  return (
    <section id="temoignages" className="bg-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Ils l'utilisent déjà</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.map((it) => (
            <div key={it.name} className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
              <div className="text-2xl">⭐⭐⭐⭐⭐</div>
              <p className="mt-3 text-sm leading-relaxed">« {it.quote} »</p>
              <div className="mt-4 border-t border-border/60 pt-3">
                <div className="text-sm font-bold">{it.name}</div>
                <div className="text-xs text-muted-foreground">{it.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-extrabold md:text-4xl">Prêt à fidéliser vos clients ?</h2>
        <p className="mt-3 text-muted-foreground">30 jours d'essai gratuit. Sans carte bancaire.</p>
        <Link to="/signup" className="mt-8 inline-block">
          <Button variant="cta" size="xl">Démarrer gratuitement →</Button>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-cta text-sm">🎟️</div>
          <span className="font-bold text-foreground">Tamply</span>
          <span>· © {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Mentions légales</a>
          <a href="#" className="hover:text-foreground">CGU</a>
          <a href="#" className="hover:text-foreground">Confidentialité</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}
