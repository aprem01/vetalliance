"use client";
import { useState, useMemo } from "react";
import { COMPANIES } from "@/lib/seed/companies";
import { PRIMES } from "@/lib/seed/primes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Loader2, Handshake } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PartnersPage() {
  const [q, setQ] = useState("");
  const [state, setState] = useState("all");
  const [open, setOpen] = useState(false);
  const [explain, setExplain] = useState<{ loading: boolean; text: string; mocked?: boolean }>({ loading: false, text: "" });
  const [selected, setSelected] = useState<{ name: string; caps: string[] } | null>(null);

  const filtered = useMemo(() => {
    return COMPANIES.filter((c) => {
      if (state !== "all" && c.state !== state) return false;
      if (q && !`${c.name} ${c.capabilities.join(" ")} ${c.naics.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, state]);

  async function explainMatch(partnerB: { name: string; caps: string[] }) {
    setSelected(partnerB);
    setOpen(true);
    setExplain({ loading: true, text: "" });
    const res = await fetch("/api/ai/explain-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerA: "Arlington Defense Solutions LLC",
        partnerB: partnerB.name,
        opportunityTitle: "VA EHRM Data Integration",
        capabilitiesA: ["Cybersecurity", "Cloud Migration", "DevSecOps"],
        capabilitiesB: partnerB.caps,
      }),
    });
    const json = await res.json();
    setExplain({ loading: false, text: json.explanation || "", mocked: json.mocked });
  }

  const states = Array.from(new Set(COMPANIES.map((c) => c.state)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find Teaming Partners</h1>
        <p className="text-sm text-muted-foreground">Match with SDVOSBs, VOSBs, and large Primes.</p>
      </div>

      <Tabs defaultValue="subs">
        <TabsList>
          <TabsTrigger value="subs">SDVOSB / VOSB Subs</TabsTrigger>
          <TabsTrigger value="primes">Large Primes</TabsTrigger>
        </TabsList>

        <TabsContent value="subs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="md:col-span-2">
              <Label>Search</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, capability, NAICS…" />
            </div>
            <div>
              <Label>State</Label>
              <Select value={state} onChange={(e) => setState(e.target.value)}>
                <option value="all">All</option>
                {states.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.state} · UEI {c.uei} · CAGE {c.cage}</div>
                    </div>
                    <Badge>{c.role}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {c.capabilities.slice(0, 4).map((cap) => <Badge key={cap} variant="secondary">{cap}</Badge>)}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.employees} FTE · {c.revenue}</span>
                    <span>{c.pastPerformance} past perf</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => explainMatch({ name: c.name, caps: c.capabilities })}>
                    <Sparkles className="h-3 w-3" /> AI: Explain the match
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="primes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRIMES.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{formatCurrency(p.annualFederal)} annual federal · {p.activeContracts} contracts</div>
                    </div>
                    <Badge variant={p.sdvosbSubActual < p.sdvosbSubGoal ? "destructive" : "success"}>
                      {p.sdvosbSubActual}% sub to SDVOSB
                    </Badge>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">Small Business POC: <span className="text-gold-300">{p.pocEmail}</span></div>
                  <Button size="sm" className="w-full mt-3"><Handshake className="h-3 w-3" /> Request Introduction</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              AI Match Explanation
              {explain.mocked && <Badge variant="warning">Mocked</Badge>}
            </DialogTitle>
            <DialogDescription>{selected?.name || ""}</DialogDescription>
          </DialogHeader>
          {explain.loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
          ) : (
            <p className="whitespace-pre-wrap text-sm text-foreground">{explain.text}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
