import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es l'assistant officiel de Tamply, une carte de fidélité digitale conçue pour l'Horeca (restaurants, sandwicheries, brasseries, cafés, friteries, food trucks) en Belgique et en France.

Informations Tamply (à utiliser uniquement) :
- Concept : carte de fidélité 100% digitale, sans application à télécharger pour le client.
- Fonctionnement : QR code scanné au comptoir, le client entre son numéro de téléphone, le gérant valide en un clic depuis son mobile. Récompense automatique à 10 tampons (configurable).
- Tarif : 24,99€ HT/mois par établissement (≈30€ TTC selon TVA), sans engagement, annulable en 1 clic.
- Essai : 30 jours gratuits, sans carte bancaire.
- Multi-établissements : tarif dégressif possible à partir de 3 points de vente (sur demande).
- Politique de remboursement : tout mois entamé est dû en intégralité et n'est pas remboursable. La résiliation prend effet à la fin du mois en cours.
- RGPD : seul le numéro de téléphone du client est stocké, jamais revendu.
- Inclus : clients illimités, SMS de récompense, hébergement, support en français, mises à jour. Aucun frais d'installation, aucune commission par tampon.
- Paiement : Stripe (Visa, Mastercard, Bancontact) — prochainement.

Règles de réponse :
- Réponds toujours en français, ton chaleureux et professionnel, 2 à 4 phrases maximum.
- Si la question sort du périmètre Tamply ou si tu n'as pas l'info, dis-le honnêtement et indique que l'équipe Tamply reviendra par email si une adresse a été fournie.
- N'invente jamais de prix, fonctionnalité, intégration ou statistique.
- Mets en avant l'essai gratuit de 30 jours quand c'est pertinent.`;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const emailRaw = typeof body?.email === "string" ? body.email.trim() : "";
    const honeypot = typeof body?.website === "string" ? body.website.trim() : "";

    // Honeypot anti-spam
    if (honeypot.length > 0) {
      return new Response(JSON.stringify({ ok: true, ai_answer: "" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (question.length < 5 || question.length > 1000) {
      return new Response(
        JSON.stringify({
          error: "La question doit contenir entre 5 et 1000 caractères.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const email = emailRaw.length > 0 ? emailRaw : null;
    if (email && !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Adresse email invalide." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let aiAnswer = "";
    try {
      const aiRes = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: question },
            ],
          }),
        },
      );

      if (aiRes.ok) {
        const data = await aiRes.json();
        aiAnswer = data?.choices?.[0]?.message?.content?.trim() ?? "";
      } else if (aiRes.status === 429) {
        aiAnswer =
          "Beaucoup de questions en ce moment ! Votre message a bien été enregistré, nous vous reviendrons rapidement.";
      } else if (aiRes.status === 402) {
        aiAnswer =
          "Votre question a bien été enregistrée. L'équipe Tamply vous répondra rapidement.";
      } else {
        const t = await aiRes.text();
        console.error("AI gateway error:", aiRes.status, t);
        aiAnswer =
          "Votre question a bien été enregistrée. L'équipe Tamply vous répondra rapidement.";
      }
    } catch (err) {
      console.error("AI request failed:", err);
      aiAnswer =
        "Votre question a bien été enregistrée. L'équipe Tamply vous répondra rapidement.";
    }

    // Persist
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey);
      const { error: insertError } = await supabase.from("faq_questions").insert({
        question,
        email,
        ai_answer: aiAnswer,
        page: "tarifs",
      });
      if (insertError) console.error("Insert faq_questions failed:", insertError);
    }

    return new Response(
      JSON.stringify({ ok: true, ai_answer: aiAnswer }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("faq-free-question error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Erreur inconnue",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});