import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Smartphone, Zap, RefreshCw, Sparkles, Play, QrCode, CheckCircle2, Gift, Coffee, MessageCircle, Store, UtensilsCrossed, Sandwich, Beer, Truck, IceCream, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { FaqChatbot } from "@/components/faq-chatbot";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tamply — La carte de fidélité digitale pour l'Horeca" },
      {
        name: "description",
        content:
          "Restaurants, sandwicheries, brasseries, cafés, friteries, food trucks : fidélisez vos clients sans qu'ils téléchargent d'app. Validez chaque tampon en un clic. 30 jours d'essai gratuit, puis 29€/mois.",
      },
      { property: "og:title", content: "Tamply — La carte de fidélité digitale pour l'Horeca" },
      { property: "og:description", content: "Aucune app à télécharger. Validez en un clic. 30 jours gratuits." },
      { property: "og:image", content: "/og-image.jpg" },
      { property: "og:url", content: "https://tamply.app/" },
      { name: "twitter:title", content: "Tamply — La carte de fidélité digitale pour l'Horeca" },
      { name: "twitter:description", content: "Aucune app à télécharger. Validez en un clic. 30 jours gratuits." },
      { name: "keywords", content: "carte fidélité digitale, fidélisation Horeca, restaurant, café, brasserie, sandwicherie, food truck, QR code, programme fidélité" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Tamply",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description:
            "Carte de fidélité digitale pour les commerces de l'Horeca. Aucune application à télécharger pour les clients.",
          offers: {
            "@type": "Offer",
            price: "29",
            priceCurrency: "EUR",
            description: "29€/mois par établissement, 30 jours d'essai gratuit",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Tamply",
          url: "https://tamply.app",
          logo: "https://tamply.app/og-image.jpg",
          description: "La carte de fidélité digitale pour l'Horeca",
          areaServed: ["BE", "FR"],
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  useRevealOnScroll();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Benefits />
      <HowItWorks />
      <ForWho />
      <Pricing />
      <FinalCta />
      <Faq />
      <Footer />
      <StickyMobileCta />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo Tamply" className="h-9 w-9 object-contain" width="36" height="36" decoding="async" />
          <span className="text-xl font-extrabold tracking-tight">Tamply</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#avantages" className="text-muted-foreground hover:text-foreground">Avantages</a>
          <Link to="/demo" className="text-muted-foreground hover:text-foreground">Démo</Link>
          <a href="#pour-qui" className="text-muted-foreground hover:text-foreground">Pour qui</a>
          <a href="#tarifs" className="text-muted-foreground hover:text-foreground">Tarifs</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm font-semibold text-foreground/80 hover:text-foreground sm:block">
            Connexion
          </Link>
          <Link to="/signup">
            <Button variant="cta" size="default">Démarrer</Button>
          </Link>
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg text-foreground/80 hover:bg-muted md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {/* Mobile dropdown menu */}
      {open && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-md md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2 text-sm font-semibold">
            <a href="#avantages" onClick={close} className="rounded-lg px-3 py-3 text-foreground/80 hover:bg-muted hover:text-foreground">Avantages</a>
            <Link to="/demo" onClick={close} className="rounded-lg px-3 py-3 text-foreground/80 hover:bg-muted hover:text-foreground">Démo</Link>
            <a href="#pour-qui" onClick={close} className="rounded-lg px-3 py-3 text-foreground/80 hover:bg-muted hover:text-foreground">Pour qui</a>
            <a href="#tarifs" onClick={close} className="rounded-lg px-3 py-3 text-foreground/80 hover:bg-muted hover:text-foreground">Tarifs</a>
            <a href="#faq" onClick={close} className="rounded-lg px-3 py-3 text-foreground/80 hover:bg-muted hover:text-foreground">FAQ</a>
            <Link to="/login" onClick={close} className="rounded-lg px-3 py-3 text-foreground/80 hover:bg-muted hover:text-foreground">Connexion</Link>
          </nav>
        </div>
      )}
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
  const [stamps, setStamps] = useState(0);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setStamps((prev) => {
        const next = prev >= 7 ? 0 : prev + 1;
        if (next > 0) {
          setPulse(true);
          setTimeout(() => setPulse(false), 400);
        }
        return next;
      });
    }, 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative mx-auto mt-14 max-w-md">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/30 via-secondary/20 to-transparent blur-2xl" />
      <div className="relative rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-cta">🎟️</div>
            <div>
              <div className="text-sm font-bold">Brasserie Chez Marcel</div>
              <div className="text-xs text-muted-foreground">+32 4 78 …</div>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold text-success transition-all duration-300 ${
              pulse ? "scale-110 bg-success/25" : "scale-100 bg-success/10"
            }`}
          >
            +1 tampon
          </span>
        </div>
        <div className="mt-6 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl border-2 grid place-items-center text-lg transition-all duration-500 ${
                i < stamps
                  ? "border-solid border-primary bg-primary shadow-soft scale-100"
                  : "border-dashed border-border bg-muted/40 scale-95"
              }`}
            >
              {i < stamps ? "✓" : ""}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-sm font-semibold text-muted-foreground">
          {stamps} / 10 — plus que {10 - stamps} pour la récompense&nbsp;!
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
      <div className="mx-auto max-w-6xl px-4 reveal">
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
      <div className="relative mx-auto max-w-6xl px-4 reveal">
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
            <div className="demo-phone-glow absolute -inset-5 rounded-[3rem] transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100" />
            <div className="demo-phone-shell relative mx-auto aspect-[9/19] w-full max-w-[300px] rounded-[2.5rem] border-[8px] border-foreground/90 bg-background shadow-soft transition-transform duration-500 group-hover:-translate-y-1">
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
      <div className="mx-auto max-w-6xl px-4 reveal">
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
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
              <div className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-secondary/15">
                <Coffee className="h-4 w-4 text-secondary" />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Moins d'1€ par jour.</span> Le prix de 2 cafés pour fidéliser tous vos clients ce mois-ci — et économiser l'impression de cartes en carton.
              </p>
            </div>
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

function ForWho() {
  const trades = [
    { icon: UtensilsCrossed, label: "Restaurants" },
    { icon: Sandwich, label: "Sandwicheries" },
    { icon: Beer, label: "Brasseries & bars" },
    { icon: Coffee, label: "Cafés & salons de thé" },
    { icon: Truck, label: "Food trucks" },
    { icon: IceCream, label: "Glaciers & friteries" },
  ];
  return (
    <section id="pour-qui" className="bg-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-4 reveal">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-card">
            <Store className="h-3.5 w-3.5 text-tamply-red" />
            Pensé pour l'Horeca
          </div>
          <h2 className="text-3xl font-extrabold md:text-4xl">Conçu pour votre métier</h2>
          <p className="mt-3 text-muted-foreground">
            Tamply s'adapte à tous les commerces où vos clients reviennent — du comptoir au food truck.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {trades.map((t) => (
            <div
              key={t.label}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-6 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-cta">
                <t.icon className="h-6 w-6 text-foreground" />
              </div>
              <div className="text-sm font-bold">{t.label}</div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
          Vous démarrez parmi les premiers commerces à utiliser Tamply.
          Devenez client fondateur et bénéficiez d'un accompagnement personnalisé.
        </p>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 text-center reveal">
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
          <img src={logo} alt="Logo Tamply" className="h-7 w-7 object-contain" width="28" height="28" loading="lazy" decoding="async" />
          <span className="font-bold text-foreground">Tamply</span>
          <span>· © {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6">
          <Link to="/mentions-legales" className="hover:text-foreground">Mentions légales</Link>
          <Link to="/cgv" className="hover:text-foreground">CGV</Link>
          <Link to="/confidentialite" className="hover:text-foreground">Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}

function Faq() {
  const items = [
    {
      q: "Mes clients doivent-ils télécharger une application ?",
      a: "Non, jamais. Ils scannent un QR code à votre comptoir, entrent leur numéro de téléphone, c'est tout. Tout se passe dans leur navigateur, sans inscription ni installation.",
    },
    {
      q: "Ai-je besoin de matériel particulier ?",
      a: "Non. Un simple smartphone suffit pour valider les tampons. Côté comptoir, vous imprimez votre QR code (fourni dans votre tableau de bord) et vous l'affichez. C'est tout.",
    },
    {
      q: "Est-ce conforme au RGPD ?",
      a: "Oui. Nous ne stockons que le numéro de téléphone du client (utilisé uniquement pour les tampons et le SMS de récompense). Aucune donnée n'est revendue. Le client peut demander la suppression à tout moment.",
    },
    {
      q: "Puis-je annuler quand je veux ?",
      a: "Oui, en un clic depuis votre tableau de bord. Sans engagement, sans frais cachés. Vous gardez l'accès jusqu'à la fin de la période payée.",
    },
    {
      q: "Que se passe-t-il après les 30 jours d'essai ?",
      a: "Rien d'automatique : vous ne renseignez votre carte bancaire que si vous décidez de continuer. Pas de prélèvement surprise.",
    },
    {
      q: "Et si j'ai plusieurs établissements ?",
      a: "Le tarif de 29€/mois est par établissement. Contactez-nous pour un tarif dégressif à partir de 3 points de vente.",
    },
  ];
  return (
    <section id="faq" className="bg-muted/40 py-20">
      <div className="mx-auto max-w-3xl px-4 reveal">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Questions fréquentes</h2>
          <p className="mt-3 text-muted-foreground">Tout ce qu'il faut savoir avant de se lancer.</p>
        </div>
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {items.map((it, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-border/60 bg-card px-5 shadow-card"
            >
              <AccordionTrigger className="text-left text-base font-bold hover:no-underline">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12">
          <div className="mb-5 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-card">
              <MessageCircle className="h-3.5 w-3.5 text-tamply-red" />
              Une autre question ?
            </div>
            <h3 className="text-2xl font-extrabold md:text-3xl">
              Discutez avec notre assistant
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Posez n'importe quelle question sur Tamply, en français, à toute heure.
            </p>
          </div>
          <FaqChatbot />
        </div>
      </div>
    </section>
  );
}

function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 p-3 shadow-soft backdrop-blur-md md:hidden">
      <Link to="/signup" className="block">
        <Button variant="cta" size="lg" className="w-full">
          Démarrer gratuitement →
        </Button>
      </Link>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">
        30 jours offerts · sans carte bancaire
      </p>
    </div>
  );
}

