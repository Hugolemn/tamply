import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useShop } from "@/lib/use-shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Mail, KeyRound, FileText, Trash2, AlertTriangle, Receipt, CreditCard } from "lucide-react";
import { SettingsContent } from "@/components/settings-content";

export const Route = createFileRoute("/dashboard/account")({
  head: () => ({ meta: [{ title: "Mon compte · Tamply" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "profil",
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = useAuth();
  const { shop } = useShop();
  const navigate = useNavigate();
  const deleteAccountFn = useServerFn(deleteMyAccount);
  const { tab } = Route.useSearch();

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.email) setNewEmail(user.email);
  }, [user?.email]);

  const updateEmail = async () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Adresse email invalide");
      return;
    }
    if (trimmed === user?.email) {
      toast.info("Cette adresse est déjà votre email actuel.");
      return;
    }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: trimmed });
    setSavingEmail(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Email de confirmation envoyé. Vérifiez votre nouvelle boîte mail pour valider.");
  };

  const updatePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Mot de passe mis à jour ✓");
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

  if (!user) return null;

  const trialDays = shop ? Math.max(0, Math.ceil((new Date(shop.trial_end).getTime() - Date.now()) / 86400000)) : 0;
  const isTrial = shop?.statut_abonnement === "essai";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Mon compte</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez votre profil, votre abonnement, vos factures et la sécurité de votre compte.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => navigate({ to: "/dashboard/account", search: { tab: v }, replace: true })} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-muted/50 p-1">
          <TabsTrigger value="profil" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Profil
          </TabsTrigger>
          <TabsTrigger value="parametres" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="abonnement" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Abonnement
          </TabsTrigger>
          <TabsTrigger value="factures" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Factures
          </TabsTrigger>
          <TabsTrigger value="danger" className="rounded-lg text-destructive data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Zone dangereuse
          </TabsTrigger>
        </TabsList>

        {/* PROFIL */}
        <TabsContent value="profil" className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="font-bold">Adresse email</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Utilisée pour la connexion et les notifications importantes.
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-semibold">Email actuel</Label>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-semibold">Nouvelle adresse email</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouvelle@adresse.com"
                className="h-11 rounded-xl"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Un email de confirmation sera envoyé à votre <strong>nouvelle</strong> adresse. Tant que vous ne cliquez pas sur le lien, votre email reste inchangé.
              </p>
            </div>
            <Button variant="cta" disabled={savingEmail} onClick={updateEmail} className="w-full sm:w-auto">
              {savingEmail ? "Envoi…" : "Modifier l'email"}
            </Button>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-4">
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="font-bold">Mot de passe</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Choisissez un mot de passe d'au moins 8 caractères.
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-semibold">Nouveau mot de passe</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-semibold">Confirmer le mot de passe</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl"
                autoComplete="new-password"
              />
            </div>
            <Button variant="cta" disabled={savingPassword} onClick={updatePassword} className="w-full sm:w-auto">
              {savingPassword ? "Mise à jour…" : "Mettre à jour le mot de passe"}
            </Button>
          </div>
        </TabsContent>

        {/* PARAMÈTRES */}
        <TabsContent value="parametres" className="space-y-6">
          <SettingsContent />
        </TabsContent>

        {/* ABONNEMENT */}
        <TabsContent value="abonnement" className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="font-bold">Tamply Pro</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  24,99€/mois par établissement. Sans engagement, résiliable à tout moment.
                </p>
              </div>
            </div>

            {shop && (
              <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut actuel</div>
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl font-extrabold">
                    {isTrial ? "Essai gratuit" : shop.statut_abonnement === "actif" ? "Actif" : "Expiré"}
                  </span>
                  {isTrial && (
                    <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-bold text-secondary">
                      {trialDays} jour{trialDays > 1 ? "s" : ""} restant{trialDays > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {isTrial
                    ? `Votre essai gratuit se termine le ${new Date(shop.trial_end).toLocaleDateString("fr-FR")}. Activez votre abonnement avant cette date pour continuer sans interruption.`
                    : "Merci de soutenir Tamply 💛"}
                </p>
              </div>
            )}

            <Button variant="cta" size="xl" disabled className="w-full sm:w-auto">
              Activer Tamply Pro · 24,99€/mois (bientôt)
            </Button>
            <p className="text-xs text-muted-foreground">
              Le paiement sécurisé Stripe sera disponible dans la prochaine mise à jour.
            </p>
          </div>
        </TabsContent>

        {/* FACTURES */}
        <TabsContent value="factures" className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-4">
            <div className="flex items-start gap-3">
              <Receipt className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="font-bold">Mes factures Tamply</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Retrouvez ici l'ensemble de vos factures d'abonnement Tamply Pro, téléchargeables en PDF.
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="font-semibold">Aucune facture pour le moment</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {shop?.statut_abonnement === "essai"
                  ? "Vous êtes actuellement en période d'essai gratuit. Vos factures apparaîtront ici dès l'activation de votre abonnement Tamply Pro."
                  : "Vos factures apparaîtront ici dès votre premier paiement."}
              </p>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
              <p className="font-semibold">💡 Bon à savoir</p>
              <p className="mt-1 text-muted-foreground">
                Une fois votre abonnement actif, chaque facture mensuelle sera automatiquement disponible ici, et vous recevrez également une copie par email.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* DANGER */}
        <TabsContent value="danger" className="space-y-6">
          <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 shadow-card space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <h2 className="font-bold text-destructive">Supprimer mon compte</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Cette action supprime définitivement votre compte, votre établissement
                  {shop ? <> <strong>{shop.nom}</strong></> : null}, vos clients et l'historique des tampons. Elle est <strong>irréversible</strong>.
                </p>
              </div>
            </div>

            <AlertDialog onOpenChange={(o) => !o && setConfirmText("")}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est <strong>irréversible</strong>. Toutes vos données seront effacées :
                    votre compte{shop ? <>, votre établissement <strong>{shop.nom}</strong></> : null}, vos clients et l'historique des tampons.
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
