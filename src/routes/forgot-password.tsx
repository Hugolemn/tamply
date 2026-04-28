import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Mot de passe oublié · Tamply" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Email envoyé !");
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={logo} alt="Logo Tamply" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-extrabold">Tamply</span>
        </Link>
        <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft">
          <h1 className="text-2xl font-extrabold">Mot de passe oublié ?</h1>
          <p className="mt-1 text-sm text-muted-foreground">Recevez un lien pour le réinitialiser.</p>
          {sent ? (
            <div className="mt-6 rounded-xl bg-success/10 p-4 text-sm text-foreground">
              📬 Si un compte existe pour <b>{email}</b>, un email vient d'être envoyé.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label className="mb-1.5 block text-sm font-semibold">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" required />
              </div>
              <Button type="submit" variant="cta" size="xl" disabled={loading} className="w-full">
                {loading ? "Envoi…" : "Envoyer le lien"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-semibold text-foreground hover:underline">← Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
