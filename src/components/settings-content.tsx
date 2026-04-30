import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/lib/use-shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Volume2, Bell, Vibrate, Upload, ImageIcon, Trash2, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EMOJI_CATEGORIES: { id: string; label: string; emojis: string[] }[] = [
  {
    id: "plats",
    label: "Plats",
    emojis: ["🍟","🍔","🌭","🍕","🥪","🌮","🌯","🥙","🧆","🥘","🍝","🍜","🍲","🍛","🍱","🍣","🍤","🍙","🍘","🍚","🍢","🍡","🥟","🍥","🥗","🥣","🍿","🥡"],
  },
  {
    id: "boulangerie",
    label: "Boulangerie",
    emojis: ["🥐","🥖","🍞","🥨","🥯","🧇","🥞","🧈","🍳","🥓","🥚","🧀"],
  },
  {
    id: "desserts",
    label: "Desserts",
    emojis: ["🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯","🍦","🍨","🍧"],
  },
  {
    id: "fruits",
    label: "Fruits",
    emojis: ["🍎","🍏","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🫒","🥑"],
  },
  {
    id: "legumes",
    label: "Légumes",
    emojis: ["🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫛","🧄","🧅","🥔","🍠","🍄","🥜","🌰"],
  },
  {
    id: "boissons",
    label: "Boissons",
    emojis: ["☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🍾","🧉","🥛","🍼"],
  },
  {
    id: "autres",
    label: "Autres",
    emojis: ["💇","💅","✂️","🌸","⭐","❤️","🎁","🛍️","📚","🐾","🌿","💎","🔑","🎯","🏆","🎨","🎵","📷"],
  },
];

const PRESET_COLORS = [
  "#FFD700", "#F59E0B", "#EF4444", "#EC4899", "#A855F7",
  "#6366F1", "#3B82F6", "#06B6D4", "#10B981", "#84CC16",
  "#78716C", "#0F172A",
];

export function SettingsContent() {
  const { shop, refresh } = useShop();
  const [form, setForm] = useState({ nom: "", description_recompense: "", tampons_requis: 10, couleur: "#FFD700", logo_url: "", stamp_emoji: "🍟" });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);
  const [notifOn, setNotifOn] = useState(false);
  const [notifSupported, setNotifSupported] = useState(true);
  const [vibrationSupported, setVibrationSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSoundOn(localStorage.getItem("tamply-sound") !== "off");
    setVibrationOn(localStorage.getItem("tamply-vibration") !== "off");
    setVibrationSupported(typeof navigator !== "undefined" && "vibrate" in navigator);
    if (typeof Notification === "undefined") {
      setNotifSupported(false);
    } else {
      setNotifOn(
        localStorage.getItem("tamply-notif") === "on" && Notification.permission === "granted"
      );
    }
  }, []);

  const toggleSound = (v: boolean) => {
    setSoundOn(v);
    try { localStorage.setItem("tamply-sound", v ? "on" : "off"); } catch {}
  };

  const toggleVibration = (v: boolean) => {
    setVibrationOn(v);
    try { localStorage.setItem("tamply-vibration", v ? "on" : "off"); } catch {}
    if (v) {
      try { navigator.vibrate?.([120, 60, 180]); } catch {}
    }
  };

  const toggleNotif = async (v: boolean) => {
    if (!v) {
      setNotifOn(false);
      try { localStorage.setItem("tamply-notif", "off"); } catch {}
      return;
    }
    if (typeof Notification === "undefined") {
      toast.error("Votre navigateur ne supporte pas les notifications.");
      return;
    }
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm !== "granted") {
      toast.error("Autorisez les notifications dans votre navigateur pour activer cette option.");
      return;
    }
    setNotifOn(true);
    try { localStorage.setItem("tamply-notif", "on"); } catch {}
    toast.success("Notifications activées ✓");
  };

  useEffect(() => {
    if (shop) setForm({
      nom: shop.nom,
      description_recompense: shop.description_recompense,
      tampons_requis: shop.tampons_requis,
      couleur: shop.couleur,
      logo_url: shop.logo_url ?? "",
      stamp_emoji: (shop as any).stamp_emoji ?? "🍟",
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
      stamp_emoji: form.stamp_emoji || "🍟",
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

  const uploadLogoFile = async (file: File) => {
    if (!shop) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez fournir une image (PNG, JPG, WEBP, SVG…)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde (max 5 Mo)");
      return;
    }
    setUploadingLogo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/${shop.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("shop-logos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("shop-logos").getPublicUrl(path);
      const newUrl = pub.publicUrl;
      const { error: updErr } = await supabase.from("shops").update({ logo_url: newUrl }).eq("id", shop.id);
      if (updErr) throw updErr;
      setForm((f) => ({ ...f, logo_url: newUrl }));
      toast.success("Logo mis à jour ✓");
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors de l'upload");
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    if (!shop) return;
    setUploadingLogo(true);
    const { error } = await supabase.from("shops").update({ logo_url: null }).eq("id", shop.id);
    setUploadingLogo(false);
    if (error) { toast.error(error.message); return; }
    setForm((f) => ({ ...f, logo_url: "" }));
    toast.success("Logo supprimé");
    refresh();
  };

  if (!shop) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-4">
        <h2 className="font-bold">Établissement</h2>
        <div>
          <Label className="mb-1.5 block text-sm font-semibold">Nom</Label>
          <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="h-11 rounded-xl" />
        </div>

        <div>
          <Label className="mb-1.5 block text-sm font-semibold">Logo (optionnel)</Label>
          <p className="mb-3 text-xs text-muted-foreground">
            PNG, JPG, WEBP ou SVG, 5 Mo max.
          </p>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-muted/20 p-5 sm:flex-row sm:items-center sm:gap-5">
            <div className="grid h-20 w-20 flex-none place-items-center overflow-hidden rounded-2xl border border-border/60 bg-background">
              {uploadingLogo ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : form.logo_url ? (
                <img src={form.logo_url} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <ImageIcon className="h-7 w-7 text-muted-foreground/60" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-semibold">
                {form.logo_url ? "Logo en place" : "Aucun logo"}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" /> Choisir un fichier
                </Button>
                {form.logo_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploadingLogo}
                    onClick={removeLogo}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" /> Supprimer
                  </Button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadLogoFile(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-sm font-semibold">Couleur de marque</Label>
          <p className="mb-3 text-xs text-muted-foreground">
            Utilisée comme accent visuel dans la carte de fidélité de vos clients.
          </p>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 flex-none rounded-2xl border border-border/60 shadow-soft"
                style={{ backgroundColor: form.couleur }}
                aria-label="Aperçu de la couleur"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="relative h-10 w-10 flex-none cursor-pointer overflow-hidden rounded-lg border border-border">
                    <input
                      type="color"
                      value={form.couleur}
                      onChange={(e) => setForm({ ...form, couleur: e.target.value })}
                      className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
                    />
                  </label>
                  <Input
                    value={form.couleur}
                    onChange={(e) => setForm({ ...form, couleur: e.target.value })}
                    className="h-10 rounded-xl font-mono uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => {
                  const active = c.toLowerCase() === form.couleur.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, couleur: c })}
                      className={`h-8 w-8 rounded-full border-2 transition hover:scale-110 ${
                        active ? "border-foreground ring-2 ring-foreground/20" : "border-border/60"
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Couleur ${c}`}
                    />
                  );
                })}
              </div>
            </div>
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
        <div>
          <Label className="mb-1.5 block text-sm font-semibold">Emoji du tampon</Label>
          <p className="mb-3 text-xs text-muted-foreground">
            Cet emoji s'affichera dans la carte de fidélité que voient vos clients.
          </p>
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-xl border-2 border-primary bg-primary/10 text-3xl">
              {form.stamp_emoji || "🍟"}
            </div>
            <Input
              value={form.stamp_emoji}
              onChange={(e) => setForm({ ...form, stamp_emoji: e.target.value.slice(0, 4) })}
              placeholder="🍟"
              className="h-11 w-24 rounded-xl text-center text-2xl"
            />
          </div>
          <Tabs defaultValue="plats" className="mt-4">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
              {EMOJI_CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {EMOJI_CATEGORIES.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="mt-3">
                <div className="grid grid-cols-8 gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 sm:grid-cols-10">
                  {cat.emojis.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setForm({ ...form, stamp_emoji: e })}
                      className={`grid h-10 w-10 place-items-center rounded-lg border text-xl transition hover:scale-110 ${
                        form.stamp_emoji === e ? "border-primary bg-primary/10" : "border-transparent bg-background"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <Button variant="cta" size="xl" disabled={saving} onClick={save} className="w-full sm:w-auto">
        {saving ? "Enregistrement…" : "Enregistrer"}
      </Button>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-4">
        <div>
          <h2 className="font-bold">Alertes de validation</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Soyez prévenu dès qu'un client scanne votre QR code, même si vous n'êtes pas sur la page de validation.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Volume2 className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold text-sm">Son d'alerte</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Joue un « ding-dong » à chaque nouvelle demande.
              </p>
            </div>
          </div>
          <Switch checked={soundOn} onCheckedChange={toggleSound} />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Vibrate className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold text-sm">Vibration (mobile)</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {vibrationSupported
                  ? "Fait vibrer votre téléphone à chaque nouvelle demande."
                  : "Non disponible sur cet appareil."}
              </p>
            </div>
          </div>
          <Switch checked={vibrationOn && vibrationSupported} disabled={!vibrationSupported} onCheckedChange={toggleVibration} />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold text-sm">Notifications système</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {notifSupported
                  ? "Affiche une notification du navigateur, même onglet en arrière-plan."
                  : "Non disponible sur ce navigateur."}
              </p>
            </div>
          </div>
          <Switch checked={notifOn} disabled={!notifSupported} onCheckedChange={toggleNotif} />
        </div>
      </div>

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
      </div>
    </div>
  );
}