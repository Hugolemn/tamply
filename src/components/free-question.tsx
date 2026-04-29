import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, MessageCircleQuestion, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export function FreeQuestion() {
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (trimmed.length < 5) {
      toast.error("Votre question doit contenir au moins 5 caractères.");
      return;
    }
    if (trimmed.length > 1000) {
      toast.error("Votre question est trop longue (1000 caractères max).");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Adresse email invalide.");
      return;
    }

    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/faq-free-question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            question: trimmed,
            email: email.trim(),
            website,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }
      setAnswer(data.ai_answer ?? "");
      setSubmitted(true);
      setQuestion("");
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'envoyer votre question. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const askAnother = () => {
    setSubmitted(false);
    setAnswer(null);
  };

  return (
    <div className="rounded-3xl border-2 border-border/60 bg-gradient-to-br from-card to-muted/30 p-6 shadow-card md:p-8">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-secondary/15">
          <MessageCircleQuestion className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold">Une autre question ?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Posez-la librement. Notre assistant vous répond instantanément, et l'équipe Tamply
            reçoit votre message pour un suivi personnalisé.
          </p>
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="fq-question" className="mb-1.5 block text-xs font-semibold text-foreground">
              Votre question <span className="text-tamply-red">*</span>
            </label>
            <Textarea
              id="fq-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex : Est-ce que je peux gérer plusieurs établissements avec un seul compte ?"
              rows={4}
              maxLength={1000}
              required
              disabled={loading}
              className="resize-none"
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">
              {question.length}/1000
            </div>
          </div>

          <div>
            <label htmlFor="fq-email" className="mb-1.5 block text-xs font-semibold text-foreground">
              Votre email <span className="font-normal text-muted-foreground">(optionnel — pour vous recontacter)</span>
            </label>
            <Input
              id="fq-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              maxLength={255}
              disabled={loading}
            />
          </div>

          {/* Honeypot anti-bot — caché aux humains */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          <Button
            type="submit"
            variant="cta"
            size="lg"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Obtenir une réponse
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/5 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-success" />
            <div className="text-sm">
              <div className="font-semibold text-foreground">
                Votre question a bien été reçue.
              </div>
              <div className="mt-1 text-muted-foreground">
                {email
                  ? "Nous reviendrons vers vous par email si nécessaire."
                  : "Pensez à laisser votre email la prochaine fois pour un suivi personnalisé."}
              </div>
            </div>
          </div>

          {answer && (
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-secondary">
                <Sparkles className="h-3 w-3" /> Réponse instantanée
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {answer}
              </p>
            </div>
          )}

          <Button variant="outline" size="default" onClick={askAnother}>
            Poser une autre question
          </Button>
        </div>
      )}
    </div>
  );
}