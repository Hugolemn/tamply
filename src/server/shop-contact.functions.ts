import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Récupère le nom du commerce et l'email du commerçant à partir d'un shopId.
 * Utilisé sur la page de politique de confidentialité pour afficher le bon contact.
 */
export const getShopContact = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ shopId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { data: shop, error } = await supabaseAdmin
      .from("shops")
      .select("nom, owner_id")
      .eq("id", data.shopId)
      .maybeSingle();
    if (error || !shop) return null;

    const { data: userRes, error: userErr } =
      await supabaseAdmin.auth.admin.getUserById(shop.owner_id);
    if (userErr || !userRes?.user?.email) {
      return { nom: shop.nom, email: null as string | null };
    }
    return { nom: shop.nom, email: userRes.user.email };
  });