import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LayoutGrid, CheckCircle2, Users, QrCode, Settings, CreditCard, LogOut } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord · Tamply" }] }),
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", icon: LayoutGrid, label: "Vue d'ensemble", exact: true },
  { to: "/dashboard/validation", icon: CheckCircle2, label: "Tampons" },
  { to: "/dashboard/clients", icon: Users, label: "Clients" },
  { to: "/dashboard/qr", icon: QrCode, label: "QR code" },
  { to: "/dashboard/settings", icon: Settings, label: "Paramètres" },
  { to: "/dashboard/subscription", icon: CreditCard, label: "Abonnement" },
] as const;

function DashboardLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-muted-foreground">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-0">
      {/* Top header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-cta shadow-soft">🍟</div>
            <span className="text-lg font-extrabold">Tamply</span>
          </Link>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
        {/* Desktop nav */}
        <nav className="mx-auto hidden max-w-5xl gap-1 overflow-x-auto px-4 pb-2 md:flex">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        {NAV.map((n) => {
          const active = n.exact ? path === n.to : path.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <n.icon className={`h-5 w-5 ${active ? "text-secondary" : ""}`} />
              <span className="line-clamp-1 px-0.5">{n.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
