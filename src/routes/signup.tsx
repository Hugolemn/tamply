import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Inscription · Tamply — 30 jours gratuits" },
      {
        name: "description",
        content:
          "Créez votre compte Tamply en 1 minute et lancez votre programme de fidélité digital. 30 jours d'essai gratuit, sans carte bancaire.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Signup,
});

const Schema = z.object({
  nom_etablissement: z.string().trim().min(2, "Nom de l'établissement trop court").max(100),
  nom_gerant: z.string().trim().min(2, "Votre nom est requis").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(8, "Au moins 8 caractères").max(72),
});

function Signup() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom_etablissement: "", nom_gerant: "", email: "", password: "" });
  const [acceptCgv, setAcceptCgv] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  // Already logged in -> dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [authLoading, user, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!acceptCgv) {
      toast.error("Vous devez accepter les CGV et la politique de confidentialité.");
      return;
    }
    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nom_etablissement: parsed.data.nom_etablissement,
          nom_gerant: parsed.data.nom_gerant,
        },
      },
    });
    if (error) {
      setLoading(false);
      const msg = error.message.toLowerCase();
      if (msg.includes("registered") || msg.includes("already")) {
        toast.error("Cet email est déjà utilisé. Connectez-vous plutôt.");
      } else if (msg.includes("password")) {
        toast.error("Mot de passe trop faible (au moins 8 caractères).");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Email confirmation required: no session returned
    if (data.user && !data.session) {
      setLoading(false);
      setNeedsEmailConfirm(true);
      toast.success("Compte créé ! Vérifiez votre email pour activer votre accès.");
      return;
    }

    // Session present -> create the shop now
    if (data.user) {
      const { error: shopErr } = await supabase.from("shops").insert({
        owner_id: data.user.id,
        nom: parsed.data.nom_etablissement,
        owner_nom: parsed.data.nom_gerant,
      });
      if (shopErr) {
        setLoading(false);
        toast.error("Compte créé mais impossible de créer l'établissement : " + shopErr.message);
        navigate({ to: "/dashboard" });
        return;
      } else {
        toast.success("Bienvenue sur Tamply ! 🎉");
      }
    }
    setLoading(false);
    navigate({ to: "/dashboard" });
  };

  if (needsEmailConfirm) {
    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-10">
        <div className="mx-auto max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <img src={logo} alt="Logo Tamply" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-extrabold">Tamply</span>
          </Link>
          <div className="rounded-3xl border border-border/60 bg-card p-7 text-center shadow-soft">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-cta text-2xl">
              📬
            </div>
            <h1 className="mt-4 text-2xl font-extrabold">Vérifiez votre email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Nous avons envoyé un lien de confirmation à{" "}
              <span className="font-semibold text-foreground">{form.email}</span>. Cliquez dessus pour activer votre compte et accéder à votre tableau de bord.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Pensez à vérifier vos spams. Pas reçu ? Réessayez dans quelques minutes.
            </p>
            <Link to="/login" className="mt-6 inline-block">
              <Button variant="outline" size="lg">Aller à la connexion</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={logo} alt="Logo Tamply" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-extrabold">Tamply</span>
        </Link>
        <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft">
          <h1 className="text-2xl font-extrabold">Créez votre compte</h1>
          <p className="mt-1 text-sm text-muted-foreground">30 jours d'essai gratuit, sans carte bancaire.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Nom de l'établissement" value={form.nom_etablissement} onChange={(v) => setForm({ ...form, nom_etablissement: v })} placeholder="Brasserie Chez Marcel" autoComplete="organization" />
            <Field label="Votre nom complet" value={form.nom_gerant} onChange={(v) => setForm({ ...form, nom_gerant: v })} placeholder="Marcel Dupont" autoComplete="name" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="marcel@monrestaurant.be" autoComplete="email" />
            <Field label="Mot de passe" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Au moins 8 caractères" autoComplete="new-password" />
            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="accept-cgv"
                checked={acceptCgv}
                onCheckedChange={(v) => setAcceptCgv(v === true)}
                className="mt-0.5"
              />
              <label htmlFor="accept-cgv" className="text-xs leading-relaxed text-muted-foreground">
                J'ai lu et j'accepte les{" "}
                <Link to="/cgv" target="_blank" className="font-semibold text-foreground underline">
                  Conditions Générales de Vente
                </Link>{" "}
                ainsi que la{" "}
                <Link to="/confidentialite" target="_blank" className="font-semibold text-foreground underline">
                  politique de confidentialité
                </Link>
                .
              </label>
            </div>
            <Button type="submit" variant="cta" size="xl" disabled={loading || !acceptCgv} className="mt-2 w-full">
              {loading ? "Création…" : "Créer mon compte"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link to="/login" className="font-semibold text-foreground hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, autoComplete }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; autoComplete?: string }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-semibold">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} className="h-11 rounded-xl" required />
    </div>
  );
}
