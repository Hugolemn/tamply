import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/lib/use-shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { deleteMyAccount } from "@/server/account.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: Settings,
});

function Settings() {
  const { shop, refresh } = useShop();
  const [form, setForm] = useState({ nom: "", description_recompense: "", tampons_requis: 10, couleur: "#FFD700", logo_url: "" });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const navigate = useNavigate();
  const deleteAccountFn = useServerFn(deleteMyAccount);

  useEffect(() => {
    if (shop) setForm({
      nom: shop.nom,
      description_recompense: shop.description_recompense,
      tampons_requis: shop.tampons_requis,
      couleur: shop.couleur,
      logo_url: shop.logo_url ?? "",
    });
  }, [shop]);

  const save = async () => {
    if (!shop) return;
    setSaving(true);
    const { error } = await supabase.from("shops").update({
      nom: form.nom.trim(),
      description_recompense: form.description_recompense.trim(),
      tampons_requis: Math.max(3, Math.min(50, form.tampons_requis)),
      couleur: form.couleur,
      logo_url: form.logo_url.trim() || null,
    }).eq("id", shop.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Paramètres enregistrés ✓");
    refresh();
  };

  const exportData = async () => {
    if (!shop) return;
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: shops }, { data: customers }, { data: requests }] = await Promise.all([
        supabase.from("shops").select("*").eq("id", shop.id),
        supabase.from("customers").select("*").eq("shop_id", shop.id),
        supabase.from("stamp_requests").select("*").eq("shop_id", shop.id),
      ]);
      const payload = {
        export_date: new Date().toISOString(),
        rgpd_notice: "Export de vos données personnelles conformément à l'article 20 du RGPD (droit à la portabilité).",
        account: { id: user?.id, email: user?.email, created_at: user?.created_at },
        shops: shops ?? [],
        customers: customers ?? [],
        stamp_requests: requests ?? [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tamply-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export téléchargé ✓");
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccountFn({});
      await supabase.auth.signOut();
      toast.success("Compte supprimé. À bientôt.");
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors de la suppression");
      setDeleting(false);
    }
  };

  if (!shop) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personnalisez votre programme de fidélité.</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-4">
        <h2 className="font-bold">Établissement</h2>
        <div>
          <Label className="mb-1.5 block text-sm font-semibold">Nom</Label>
          <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="h-11 rounded-xl" />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm font-semibold">URL du logo (optionnel)</Label>
          <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://…" className="h-11 rounded-xl" />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm font-semibold">Couleur de marque</Label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.couleur} onChange={(e) => setForm({ ...form, couleur: e.target.value })} className="h-11 w-16 cursor-pointer rounded-xl border border-border bg-transparent" />
            <Input value={form.couleur} onChange={(e) => setForm({ ...form, couleur: e.target.value })} className="h-11 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-4">
        <h2 className="font-bold">Programme de fidélité</h2>
        <div>
          <Label className="mb-1.5 block text-sm font-semibold">Récompense</Label>
          <Input value={form.description_recompense} onChange={(e) => setForm({ ...form, description_recompense: e.target.value })} placeholder="Ex : 1 boisson offerte, 1 dessert gratuit, -10%…" className="h-11 rounded-xl" />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm font-semibold">Tampons requis (3 à 50)</Label>
          <Input type="number" min={3} max={50} value={form.tampons_requis} onChange={(e) => setForm({ ...form, tampons_requis: Number(e.target.value) })} className="h-11 rounded-xl" />
        </div>
      </div>

      <Button variant="cta" size="xl" disabled={saving} onClick={save} className="w-full sm:w-auto">
        {saving ? "Enregistrement…" : "Enregistrer"}
      </Button>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-4">
        <div>
          <h2 className="font-bold">Mes données personnelles (RGPD)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vous disposez d'un droit d'accès, de portabilité et d'effacement sur vos données.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex-1">
            <p className="font-semibold text-sm">Exporter mes données</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Téléchargez un fichier JSON contenant l'ensemble de vos données (compte, établissement, clients, tampons).
            </p>
          </div>
          <Button variant="outline" onClick={exportData} disabled={exporting} className="shrink-0">
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Export…" : "Télécharger"}
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <div className="flex-1">
            <p className="font-semibold text-sm text-destructive">Supprimer mon compte</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Supprime définitivement votre compte, votre établissement et toutes les données associées. Action irréversible.
            </p>
          </div>
          <AlertDialog onOpenChange={(o) => !o && setConfirmText("")}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="shrink-0">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est <strong>irréversible</strong>. Toutes vos données seront effacées :
                  votre compte, votre établissement <strong>{shop.nom}</strong>, vos clients et l'historique des tampons.
                  <br /><br />
                  Pour confirmer, tapez <strong>SUPPRIMER</strong> ci-dessous :
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="h-11 rounded-xl"
              />
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => { e.preventDefault(); deleteAccount(); }}
                  disabled={confirmText !== "SUPPRIMER" || deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Suppression…" : "Supprimer définitivement"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
