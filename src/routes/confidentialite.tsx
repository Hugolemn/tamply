import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import logo from "@/assets/logo.png";
import { getShopContact } from "@/server/shop-contact.functions";

export const Route = createFileRoute("/confidentialite")({
  validateSearch: (search: Record<string, unknown>) =>
    z.object({ shop: z.string().uuid().optional() }).parse(search),
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Tamply" },
      { name: "description", content: "Comment Tamply collecte, utilise et protège vos données personnelles, conformément au RGPD." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Politique de confidentialité — Tamply" },
      { property: "og:description", content: "Notre engagement RGPD : transparence sur la collecte et le traitement des données." },
    ],
  }),
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  const { shop: shopId } = Route.useSearch();
  const [contact, setContact] = useState<{ nom: string; email: string | null } | null>(null);

  useEffect(() => {
    if (!shopId) { setContact(null); return; }
    let cancelled = false;
    getShopContact({ data: { shopId } })
      .then((res) => { if (!cancelled) setContact(res); })
      .catch(() => { if (!cancelled) setContact(null); });
    return () => { cancelled = true; };
  }, [shopId]);

  return (
    <div className="min-h-screen bg-background">
      <LegalHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground">Politique de confidentialité</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <Section title="1. Responsable du traitement">
          <p>
            Le <strong>commerçant</strong> utilisant Tamply est responsable des données collectées via son
            programme de fidélité. <strong>Tamply</strong> (éditeur de la plateforme) agit en tant que{" "}
            <strong>sous-traitant</strong> au sens du RGPD, et traite les données uniquement pour le compte
            du commerçant et selon ses instructions.
          </p>
        </Section>

        <Section title="2. Données collectées">
          <p>
            Nous collectons uniquement le <strong>numéro de téléphone</strong> du client final, saisi
            volontairement lors du scan du QR code du commerçant. Aucune autre donnée personnelle (nom,
            email, adresse) n'est demandée au client.
          </p>
        </Section>

        <Section title="3. Finalités du traitement">
          <p>
            Le numéro de téléphone est utilisé exclusivement pour le <strong>suivi du programme de
            fidélité</strong> (enregistrement des tampons et attribution des récompenses) du commerçant.
          </p>
        </Section>

        <Section title="4. Durée de conservation">
          <p>
            Les données sont conservées <strong>tant que le client participe au programme de fidélité</strong>
            du commerçant. Elles sont <strong>supprimées sur simple demande</strong> du client.
          </p>
        </Section>

        <Section title="5. Vos droits">
          <p>
            Tout client peut demander la <strong>consultation</strong>, la <strong>modification</strong> ou
            la <strong>suppression</strong> de ses données :
          </p>
          {contact ? (
            <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-sm text-foreground">
                Contactez le commerçant <strong>{contact.nom}</strong>
                {contact.email ? (
                  <>
                    {" "}à l'adresse{" "}
                    <a href={`mailto:${contact.email}`} className="font-medium underline">
                      {contact.email}
                    </a>
                    .
                  </>
                ) : (
                  <>.</>
                )}
              </p>
            </div>
          ) : (
            <p className="mt-3">
              Contactez directement le commerçant dont vous avez scanné le QR code.
            </p>
          )}
        </Section>

        <Section title="6. Sécurité">
          <p>
            Les données sont stockées de manière <strong>sécurisée</strong> via notre infrastructure
            backend (Supabase, hébergement UE). Elles ne sont <strong>jamais revendues</strong> ni
            partagées avec des tiers.
          </p>
        </Section>

        <Section title="7. Modifications">
          <p>
            Cette politique peut être mise à jour à tout moment. La date de dernière mise à jour figure en haut du
            document.
          </p>
        </Section>
      </main>
      <LegalFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function LegalHeader() {
  return (
    <header className="border-b border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo Tamply" className="h-8 w-8 object-contain" />
          <span className="font-bold text-foreground">Tamply</span>
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Retour à l'accueil</Link>
      </div>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer className="mt-12 border-t border-border/60 bg-background py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row">
        <span>© {new Date().getFullYear()} Tamply</span>
        <div className="flex gap-6">
          <Link to="/mentions-legales" className="hover:text-foreground">Mentions légales</Link>
          <Link to="/confidentialite" className="hover:text-foreground">Confidentialité</Link>
          <Link to="/cgv" className="hover:text-foreground">CGV</Link>
        </div>
      </div>
    </footer>
  );
}