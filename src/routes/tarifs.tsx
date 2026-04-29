import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  Coffee,
  Sparkles,
  ArrowLeft,
  Shield,
  CreditCard,
  Headphones,
  Infinity as InfinityIcon,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs Tamply — 29€/mois, 30 jours d'essai gratuit" },
      {
        name: "description",
        content:
          "Un seul tarif simple : 29€/mois par établissement, sans engagement. 30 jours d'essai gratuit, sans carte bancaire. Clients illimités, support en français.",
      },
      { property: "og:title", content: "Tarifs Tamply — 29€/mois, 30 jours d'essai gratuit" },
      {
        property: "og:description",
        content:
          "Un seul tarif simple, sans engagement. Essai 30 jours sans carte bancaire.",
      },
      { property: "og:url", content: "https://tamply.app/tarifs" },
      { name: "twitter:title", content: "Tarifs Tamply — 29€/mois" },
      {
        name: "twitter:description",
        content: "30 jours d'essai gratuit, sans carte bancaire. Sans engagement.",
      },
      {
        name: "keywords",
        content:
          "tarif carte fidélité digitale, prix Tamply, abonnement fidélisation Horeca, fidélité restaurant prix",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Tamply Pro",
          description:
            "Carte de fidélité digitale pour les commerces de l'Horeca, par établissement.",
          brand: { "@type": "Brand", name: "Tamply" },
          offers: {
            "@type": "Offer",
            price: "29",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            description:
              "29€/mois par établissement, 30 jours d'essai gratuit sans carte bancaire",
          },
        }),
      },
    ],
  }),
  component: TarifsPage,
});

function TarifsPage() {
  useRevealOnScroll();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <PricingCard />
      <WhatsIncluded />
      <PriceFaq />
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
          <img
            src={logo}
            alt="Logo Tamply"
            className="h-9 w-9 object-contain"
            width="36"
            height="36"
            decoding="async"
          />
          <span className="text-xl font-extrabold tracking-tight">Tamply</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden items-center gap-1 text-sm font-semibold text-foreground/80 hover:text-foreground sm:flex"
          >
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <Link to="/signup">
            <Button variant="cta" size="default">
              Démarrer
            </Button>
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
      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center md:py-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-card">
          <Sparkles className="h-3.5 w-3.5 text-tamply-red" />
          Un seul tarif, sans surprise
        </div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
          Fidélisez vos clients{" "}
          <span className="bg-gradient-to-r from-[#E63946] to-[#FFB800] bg-clip-text text-transparent">
            sans exploser votre budget
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Pas de palier, pas de surcoût par client. 30 jours d'essai pour vous décider, sans carte
          bancaire.
        </p>
      </div>
    </section>
  );
}

function PricingCard() {
  const features = [
    "Clients illimités",
    "QR code unique pour votre établissement",
    "Validation des tampons en temps réel",
    "Tableau de bord mobile et desktop",
    "SMS de récompense automatiques",
    "Récompense personnalisable (ex : à 10 tampons)",
    "Aucune app à télécharger pour vos clients",
    "Conforme RGPD",
    "Support en français",
    "Mises à jour incluses",
  ];
  return (
    <section className="py-16">
      <div className="mx-auto max-w-lg px-4 reveal">
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary bg-card p-8 shadow-glow">
          <div className="absolute right-4 top-4 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
            30 jours offerts
          </div>
          <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Tamply Pro
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-5xl font-extrabold">29€</span>
            <span className="text-muted-foreground">/mois</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            par établissement · TVA en sus
          </p>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
            <div className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-secondary/15">
              <Coffee className="h-4 w-4 text-secondary" />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Moins d'1€ par jour.</span> Aucune
              limite de clients, aucune commission par tampon.
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
            <Button variant="cta" size="xl" className="w-full">
              Démarrer mon essai gratuit
            </Button>
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Aucune carte bancaire requise
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatsIncluded() {
  const items = [
    {
      icon: InfinityIcon,
      title: "Vraiment illimité",
      desc: "Clients, tampons, validations : aucune limite, jamais. Le tarif ne bouge pas avec votre succès.",
    },
    {
      icon: Shield,
      title: "Sans engagement",
      desc: "Annulez en un clic depuis votre tableau de bord. Vous gardez l'accès jusqu'à la fin de la période payée.",
    },
    {
      icon: CreditCard,
      title: "Pas de mauvaise surprise",
      desc: "Pas de prélèvement automatique après l'essai. Vous renseignez votre carte uniquement si vous décidez de continuer.",
    },
    {
      icon: Headphones,
      title: "Support en français",
      desc: "Une vraie personne vous répond, par email ou chat, quand vous en avez besoin.",
    },
  ];
  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-5xl px-4 reveal">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Ce qui est compris</h2>
          <p className="mt-3 text-muted-foreground">
            Aucune option cachée, aucun module payant en plus.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-card"
            >
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

function PriceFaq() {
  const items = [
    {
      q: "Comment fonctionne l'essai gratuit de 30 jours ?",
      a: "Vous créez votre compte sans carte bancaire et accédez à toutes les fonctionnalités pendant 30 jours. À la fin, rien ne se passe automatiquement : vous choisissez d'activer l'abonnement ou non.",
    },
    {
      q: "Le tarif inclut-il la TVA ?",
      a: "Le prix de 29€/mois est hors TVA. La TVA applicable selon votre pays (Belgique ou France) est ajoutée sur la facture.",
    },
    {
      q: "Puis-je annuler à tout moment ?",
      a: "Oui, en un clic depuis votre tableau de bord. Aucun engagement, aucun frais d'annulation. Vous gardez l'accès jusqu'à la fin de la période payée.",
    },
    {
      q: "Que se passe-t-il si je dépasse un certain nombre de clients ?",
      a: "Rien. Tamply n'a aucune limite de clients ni de tampons. Le tarif reste 29€/mois, que vous ayez 10 ou 10 000 clients.",
    },
    {
      q: "Y a-t-il des frais cachés (commission, SMS, setup) ?",
      a: "Non. Le SMS de récompense, l'hébergement, le QR code, le support et toutes les mises à jour sont inclus. Aucun frais d'installation, aucune commission par tampon.",
    },
    {
      q: "J'ai plusieurs établissements, est-ce que vous proposez un tarif dégressif ?",
      a: "Le tarif est de 29€/mois par établissement. À partir de 3 points de vente, contactez-nous pour discuter d'un tarif adapté.",
    },
    {
      q: "Quels modes de paiement acceptez-vous ?",
      a: "Le paiement par carte bancaire (Visa, Mastercard, Bancontact) sera disponible prochainement, opéré par Stripe. Pendant la période de lancement, l'essai reste 100% gratuit.",
    },
    {
      q: "Puis-je récupérer une facture pour ma comptabilité ?",
      a: "Oui, chaque paiement génère automatiquement une facture téléchargeable depuis votre espace, conforme aux exigences comptables belges et françaises.",
    },
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 reveal">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Questions sur le tarif</h2>
          <p className="mt-3 text-muted-foreground">
            Tout ce qu'il faut savoir avant de démarrer.
          </p>
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
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-gradient-hero py-20">
      <div className="mx-auto max-w-3xl px-4 text-center reveal">
        <h2 className="text-3xl font-extrabold md:text-4xl">
          Prêt à essayer Tamply gratuitement ?
        </h2>
        <p className="mt-3 text-muted-foreground">
          30 jours pour tester, sans carte bancaire et sans engagement.
        </p>
        <Link to="/signup" className="mt-8 inline-block">
          <Button variant="cta" size="xl">
            Démarrer gratuitement →
          </Button>
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
          <img
            src={logo}
            alt="Logo Tamply"
            className="h-7 w-7 object-contain"
            width="28"
            height="28"
            loading="lazy"
            decoding="async"
          />
          <span className="font-bold text-foreground">Tamply</span>
          <span>· © {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6">
          <Link to="/mentions-legales" className="hover:text-foreground">
            Mentions légales
          </Link>
          <Link to="/cgv" className="hover:text-foreground">
            CGV
          </Link>
          <Link to="/confidentialite" className="hover:text-foreground">
            Confidentialité
          </Link>
        </div>
      </div>
    </footer>
  );
}