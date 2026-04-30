import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

export interface Shop {
  id: string;
  owner_id: string;
  nom: string;
  owner_nom: string | null;
  logo_url: string | null;
  couleur: string;
  description_recompense: string;
  tampons_requis: number;
  statut_abonnement: string;
  trial_end: string;
  created_at: string;
  qr_displayed_at: string | null;
}

export function useShop() {
  const { user, loading: authLoading } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setShop(null); setLoading(false); return; }
    const { data, error } = await supabase.from("shops").select("*").eq("owner_id", user.id).maybeSingle();
    if (!error) setShop(data as Shop | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    refresh();
  }, [authLoading, refresh]);

  return { shop, loading: authLoading || loading, refresh, setShop };
}
