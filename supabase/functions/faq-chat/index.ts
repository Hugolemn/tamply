import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es l'assistant officiel de Tamply, une carte de fidélité digitale conçue pour l'Horeca (restaurants, sandwicheries, brasseries, cafés, friteries, food trucks) en Belgique et en France.

Voici les informations clés sur Tamply :
- Concept : carte de fidélité 100% digitale, sans application à télécharger pour le client.
- Fonctionnement : le client scanne un QR code au comptoir, entre son numéro de téléphone, le gérant valide en un clic depuis son mobile. Récompense automatique à 10 tampons (configurable).
 - Tarif : 24,99€ HT/mois par établissement, sans engagement, annulable en 1 clic. Essai gratuit de 30 jours sans carte bancaire.
- Multi-établissements : tarif dégressif à partir de 3 points de vente (sur demande).
- RGPD : seul le numéro de téléphone du client est stocké, jamais revendu. Le client peut demander suppression à tout moment.
- Matériel : aucun matériel spécifique requis. Un smartphone suffit côté gérant. Le QR code est imprimable depuis le tableau de bord.
- Avantages : plus de cartes en carton perdues, validation à une main pendant le coup de feu, SMS automatiques de récompense, tableau de bord mobile.
- Public cible : gérants d'établissements Horeca indépendants en Belgique et en France.

Règles de réponse :
- Réponds toujours en français, de manière chaleureuse, concise et concrète (2-4 phrases maximum).
- Si une question sort du périmètre de Tamply ou si tu ne sais pas, dis-le honnêtement et invite à contacter l'équipe (contact@tamply… ou via le formulaire).
- Ne fais jamais de promesses commerciales que les infos ci-dessus ne couvrent pas (ex : intégrations spécifiques, fonctionnalités non listées).
- Mets en avant l'essai gratuit de 30 jours quand c'est pertinent.
- N'invente jamais de prix, fonctionnalités ou statistiques.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages must be a non-empty array" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
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
            ...messages,
          ],
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error:
              "Trop de questions en peu de temps. Merci de réessayer dans un instant.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "L'assistant est temporairement indisponible. Merci de réessayer plus tard.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erreur de l'assistant. Réessayez." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("faq-chat error:", e);
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