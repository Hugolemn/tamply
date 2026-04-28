import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Inscription · Tamply" }] }),
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
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom_etablissement: "", nom_gerant: "", email: "", password: "" });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      options: { emailRedirectTo: redirectUrl },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message.includes("registered") ? "Cet email est déjà utilisé." : error.message);
      return;
    }
    if (data.user) {
      const { error: shopErr } = await supabase.from("shops").insert({
        owner_id: data.user.id,
        nom: parsed.data.nom_etablissement,
        owner_nom: parsed.data.nom_gerant,
      });
      if (shopErr) {
        toast.error("Compte créé mais impossible de créer l'établissement : " + shopErr.message);
      } else {
        toast.success("Bienvenue sur Tamply ! 🎉");
      }
    }
    setLoading(false);
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
          <h1 className="text-2xl font-extrabold">Créez votre compte</h1>
          <p className="mt-1 text-sm text-muted-foreground">30 jours d'essai gratuit, sans carte bancaire.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Nom de l'établissement" value={form.nom_etablissement} onChange={(v) => setForm({ ...form, nom_etablissement: v })} placeholder="Brasserie Chez Marcel" />
            <Field label="Votre nom complet" value={form.nom_gerant} onChange={(v) => setForm({ ...form, nom_gerant: v })} placeholder="Marcel Dupont" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="marcel@monrestaurant.be" />
            <Field label="Mot de passe" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Au moins 8 caractères" />
            <Button type="submit" variant="cta" size="xl" disabled={loading} className="mt-2 w-full">
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

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-semibold">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 rounded-xl" required />
    </div>
  );
}
