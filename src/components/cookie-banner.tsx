import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "tamply.cookies.acknowledged.v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage indisponible : on n'affiche rien
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Information sur les cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-border/60 bg-card/95 p-4 shadow-soft backdrop-blur md:inset-x-auto md:right-4 md:left-auto md:bottom-4"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Cookie className="h-5 w-5" />
        </div>
        <div className="flex-1 text-sm text-foreground">
          <p className="font-semibold">Cookies & confidentialité</p>
          <p className="mt-1 text-muted-foreground">
            Tamply utilise uniquement des cookies strictement nécessaires au fonctionnement du service
            (session, authentification). Aucun cookie publicitaire, aucun traceur tiers.{" "}
            <Link to="/confidentialite" className="font-medium text-primary underline">
              En savoir plus
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={dismiss} size="sm" variant="cta">
              J'ai compris
            </Button>
            <Link
              to="/confidentialite"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}