"use client";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface Msg { role: "user" | "assistant"; content: string }

export function AdvisorDock() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      if (!res.body) throw new Error("no body");
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
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "Sorry — advisor unavailable. Try again." };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-3 text-sm font-semibold text-navy-900 shadow-lg hover:bg-gold-400"
        >
          <MessageSquare className="h-4 w-4" />
          Ask VetAlliance Advisor
        </button>
      )}
      <div
        className={cn(
          "fixed bottom-4 right-4 z-30 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-border bg-card shadow-2xl transition-all",
          open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-foreground">VetAlliance Advisor</div>
            <div className="text-[10px] text-gold-400 uppercase tracking-wider">Claude Sonnet 4.5</div>
          </div>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Ask about federal contracting — SDVOSB certs, FAR clauses, agency mandates, teaming strategy, or a specific opportunity.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("rounded-md p-3 text-sm", m.role === "user" ? "bg-navy-700 ml-6" : "bg-navy-950 border border-border mr-6")}>
              <div className="text-[10px] uppercase tracking-wider text-gold-400 mb-1">{m.role === "user" ? "You" : "Advisor"}</div>
              <div className="whitespace-pre-wrap text-foreground">{m.content || (loading && m.role === "assistant" ? <Loader2 className="h-3 w-3 animate-spin" /> : "")}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="border-t border-border p-3">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Ask about a FAR clause, opportunity, or teaming strategy..."
              className="flex-1 resize-none rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              rows={2}
            />
            <Button onClick={send} disabled={loading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
