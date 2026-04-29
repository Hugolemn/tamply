import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { CookieBanner } from "@/components/cookie-banner";
import appCss from "../styles.css?url";
import logo from "@/assets/logo.png";
import { Home, Search } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero px-4">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative w-full max-w-lg text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src={logo} alt="Logo Tamply" className="h-9 w-9 object-contain" />
          <span className="text-xl font-extrabold tracking-tight">Tamply</span>
        </Link>

        {/* Carte de fidélité illustrative avec une case manquante */}
        <div className="mx-auto mt-10 max-w-sm rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => {
              const missing = i === 4; // case manquante au milieu
              if (missing) {
                return (
                  <div
                    key={i}
                    className="aspect-square grid place-items-center rounded-xl border-2 border-dashed border-secondary bg-secondary/10 text-2xl font-extrabold text-secondary"
                  >
                    ?
                  </div>
                );
              }
              const filled = i < 7 && i !== 4;
              return (
                <div
                  key={i}
                  className={`aspect-square grid place-items-center rounded-xl border-2 text-lg font-bold ${
                    filled
                      ? "border-primary bg-primary text-foreground shadow-soft"
                      : "border-dashed border-border bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {filled ? "✓" : ""}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-secondary shadow-card">
          <Search className="h-3 w-3" /> Erreur 404
        </div>
        <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">Il manque une case…</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground md:text-base">
          La page que vous cherchez n'existe pas ou a été déplacée. Mais pas d'inquiétude, votre fidélité reste intacte.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-soft transition hover:brightness-110"
        >
          <Home className="h-4 w-4" /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: "Tamply — La carte de fidélité digitale pour l'Horeca" },
      {
        name: "description",
        content:
          "Tamply : la carte de fidélité digitale pour restaurants, sandwicheries, brasseries, cafés et friteries. Aucune app à télécharger pour vos clients. Validez chaque tampon en un clic.",
      },
      { name: "author", content: "Tamply" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Tamply — Carte de fidélité digitale" },
      { property: "og:description", content: "La fidélité digitale simple pour tous les commerces de l'Horeca." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:site_name", content: "Tamply" },
      { property: "og:image", content: "/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Tamply — Carte de fidélité digitale" },
      { name: "twitter:description", content: "La fidélité digitale simple pour tous les commerces de l'Horeca." },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://tamply.app/" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster position="top-center" richColors />
      <CookieBanner />
    </AuthProvider>
  );
}
