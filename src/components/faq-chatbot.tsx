import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/faq-chat`;

const SUGGESTIONS = [
  "Comment ça marche pour mes clients ?",
  "Est-ce que je peux personnaliser la récompense ?",
  "Combien de temps pour configurer ?",
  "Avez-vous un tarif pour plusieurs établissements ?",
];

export function FaqChatbot() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "Une erreur est survenue.");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";
      let done = false;

      // Add empty assistant message we'll fill
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as
              | string
              | undefined;
            if (delta) {
              assistantSoFar += delta;
              const current = assistantSoFar;
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === prev.length - 1 && m.role === "assistant"
                    ? { ...m, content: current }
                    : m,
                ),
              );
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Une erreur est survenue.";
      setError(msg);
      // Remove placeholder empty assistant message if present
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-cta">
          <Sparkles className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-bold leading-tight">
            Posez votre question
          </h3>
          <p className="text-xs text-muted-foreground">
            Notre assistant répond en quelques secondes.
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="max-h-80 min-h-[120px] space-y-3 overflow-y-auto rounded-2xl bg-muted/30 p-4"
      >
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Quelques exemples pour démarrer :
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-foreground shadow-soft"
                  : "bg-background border border-border/60 text-foreground"
              }`}
            >
              {m.content || (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre question…"
          className="flex-1 rounded-full border border-border/60 bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="cta"
          size="default"
          disabled={isLoading || !input.trim()}
          className="gap-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Envoyer</span>
        </Button>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Réponses générées par IA · pour les sujets sensibles, contactez notre équipe.
      </p>
    </div>
  );
}