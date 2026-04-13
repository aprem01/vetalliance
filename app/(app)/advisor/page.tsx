"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "What agencies are most behind on their SDVOSB mandate?",
  "Explain FAR 52.219-14 limitations on subcontracting.",
  "How does a Mentor-Protégé JV differ from a regular teaming agreement?",
  "Draft a 3-bullet elevator pitch for a cybersecurity SDVOSB.",
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    const userMsg: Msg = { role: "user", content: message };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "Sorry — advisor unavailable." };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Advisor</h1>
        <p className="text-sm text-muted-foreground">Full-screen chat with VetAlliance Advisor (Claude Sonnet 4.5).</p>
      </div>

      <div className="rounded-lg border border-border bg-card flex flex-col h-[calc(100vh-220px)]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Try asking:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left rounded-md border border-border bg-navy-950 p-3 text-sm text-foreground hover:border-gold-500/40 transition-colors"
                  >{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("rounded-md p-4 text-sm", m.role === "user" ? "bg-navy-700 ml-12" : "bg-navy-950 border border-border mr-12")}>
              <div className="text-[10px] uppercase tracking-wider text-gold-400 mb-2">{m.role === "user" ? "You" : "Advisor"}</div>
              <div className="whitespace-pre-wrap text-foreground">
                {m.content || (loading && m.role === "assistant" ? <Loader2 className="h-3 w-3 animate-spin" /> : "")}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about FAR clauses, opportunities, teaming strategy, proposal writing…"
              rows={2}
              className="flex-1 resize-none rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
