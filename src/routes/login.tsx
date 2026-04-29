import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion · Tamply" },
      { name: "description", content: "Connectez-vous à votre espace Tamply pour gérer vos clients fidèles." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // If already signed in, send the user to the dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [authLoading, user, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email et mot de passe requis.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        toast.error("Email non confirmé. Vérifiez votre boîte mail.");
      } else if (msg.includes("invalid login") || msg.includes("invalid_credentials")) {
        toast.error("Email ou mot de passe incorrect.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Bon retour 👋");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={logo} alt="Logo Tamply" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-extrabold">Tamply</span>
        </Link>
        <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft">
          <h1 className="text-2xl font-extrabold">Connexion</h1>
          <p className="mt-1 text-sm text-muted-foreground">Heureux de vous revoir.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label className="mb-1.5 block text-sm font-semibold">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
                autoComplete="email"
                autoFocus
                required
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-sm font-semibold">Mot de passe</Label>
                <Link to="/forgot-password" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                  Oublié ?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" variant="cta" size="xl" disabled={loading} className="mt-2 w-full">
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/signup" className="font-semibold text-foreground hover:underline">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
