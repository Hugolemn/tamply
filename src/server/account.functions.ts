import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * RGPD — Droit à l'effacement (art. 17).
 * Supprime le compte du commerçant authentifié et toutes ses données associées.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // 1. Récupérer les boutiques de l'utilisateur
    const { data: shops, error: shopsErr } = await supabaseAdmin
      .from("shops")
      .select("id")
      .eq("owner_id", userId);
    if (shopsErr) throw new Error(shopsErr.message);

    const shopIds = (shops ?? []).map((s) => s.id);

    if (shopIds.length > 0) {
      // 2. Supprimer les demandes de tampons liées
      const { error: srErr } = await supabaseAdmin
        .from("stamp_requests")
        .delete()
        .in("shop_id", shopIds);
      if (srErr) throw new Error(srErr.message);

      // 3. Supprimer les clients liés
      const { error: cErr } = await supabaseAdmin
        .from("customers")
        .delete()
        .in("shop_id", shopIds);
      if (cErr) throw new Error(cErr.message);

      // 4. Supprimer les boutiques
      const { error: sErr } = await supabaseAdmin
        .from("shops")
        .delete()
        .eq("owner_id", userId);
      if (sErr) throw new Error(sErr.message);
    }

    // 5. Supprimer le compte auth
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) throw new Error(authErr.message);

    return { success: true };
  });