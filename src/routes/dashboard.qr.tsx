import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useShop } from "@/lib/use-shop";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/qr")({
  component: QrPage,
});

function QrPage() {
  const { shop, refresh } = useShop();
  const ref = useRef<HTMLDivElement>(null);

  if (!shop) return null;
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/c/${shop.id}`;

  const download = () => {
    const canvas = ref.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `tamply-qr-${shop.nom.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const markDisplayed = async () => {
    const { error } = await supabase
      .from("shops")
      .update({ qr_displayed_at: new Date().toISOString() })
      .eq("id", shop.id);
    if (error) {
      toast.error("Impossible de mettre à jour");
      return;
    }
    toast.success("Bravo ! QR code marqué comme affiché 🎉");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Votre QR code</h1>
        <p className="mt-1 text-sm text-muted-foreground">Imprimez-le et affichez-le sur votre comptoir.</p>
      </div>
      <div className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-card">
        <div className="mx-auto inline-block rounded-2xl bg-white p-6 shadow-glow" ref={ref}>
          <QRCodeCanvas value={url} size={260} level="H" includeMargin={false} />
        </div>
        <div className="mt-4 text-sm font-bold">{shop.nom}</div>
        <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          {url} <ExternalLink className="h-3 w-3" />
        </a>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="cta" size="xl" onClick={download}>
            <Download /> Télécharger en PNG
          </Button>
          <a href={url} target="_blank" rel="noreferrer">
            <Button variant="outline" size="xl">Voir l'aperçu client</Button>
          </a>
        </div>
        {shop.qr_displayed_at ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1.5 text-xs font-semibold text-secondary">
            <CheckCircle2 className="h-4 w-4" /> QR code affiché au comptoir
          </div>
        ) : (
          <div className="mt-6">
            <Button variant="outline" onClick={markDisplayed}>
              <CheckCircle2 /> J'ai affiché mon QR code
            </Button>
          </div>
        )}
      </div>
      <div className="rounded-2xl bg-accent p-5 text-sm">
        <b>💡 Astuce :</b> Imprimez le QR en A5 minimum, plastifiez-le, et placez-le bien visible près de la caisse.
      </div>
    </div>
  );
}
