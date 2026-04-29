import { createFileRoute } from "@tanstack/react-router";
import { useShop } from "@/lib/use-shop";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/subscription")({
  component: Sub,
});

function Sub() {
  const { shop } = useShop();
  if (!shop) return null;
  const trialDays = Math.max(0, Math.ceil((new Date(shop.trial_end).getTime() - Date.now()) / 86400000));
  const isTrial = shop.statut_abonnement === "essai";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Abonnement</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tamply Pro — 24,99€/mois par établissement.</p>
      </div>

      <div className="rounded-3xl border-2 border-primary bg-card p-6 shadow-glow">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut actuel</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold">
            {isTrial ? "Essai gratuit" : shop.statut_abonnement === "actif" ? "Actif" : "Expiré"}
          </span>
          {isTrial && <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-bold text-secondary">{trialDays} jours restants</span>}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {isTrial
            ? `Votre essai gratuit se termine le ${new Date(shop.trial_end).toLocaleDateString("fr-FR")}. Activez votre abonnement avant cette date pour continuer sans interruption.`
            : "Merci de soutenir Tamply 💛"}
        </p>
        <Button variant="cta" size="xl" disabled className="mt-5 w-full sm:w-auto">
          Activer Tamply Pro · 24,99€/mois (bientôt)
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Le paiement sécurisé Stripe sera disponible dans la prochaine mise à jour.
        </p>
      </div>
    </div>
  );
}
