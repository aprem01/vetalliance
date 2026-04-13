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
import { Sparkles, Loader2, Handshake, ShieldCheck, BadgeCheck, SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency } from "@/lib/utils";
import type { VerifiedEntity } from "@/lib/types";

export default function PartnersPage() {
  const [q, setQ] = useState("");
  const [state, setState] = useState("all");
  const [open, setOpen] = useState(false);
  const [explain, setExplain] = useState<{ loading: boolean; text: string; mocked?: boolean }>({ loading: false, text: "" });
  const [selected, setSelected] = useState<{ name: string; caps: string[] } | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<{ name: string; uei: string; cage: string } | null>(null);
  const [verifyUEI, setVerifyUEI] = useState("");
  const [verifyCAGE, setVerifyCAGE] = useState("");
  const [verifyState, setVerifyState] = useState<{
    loading: boolean;
    entity: VerifiedEntity | null;
    reason?: string | null;
    available?: boolean;
    ran?: boolean;
  }>({ loading: false, entity: null, ran: false });

  function openVerify(c: { name: string; uei: string; cage: string }) {
    setVerifyTarget(c);
    setVerifyUEI(c.uei);
    setVerifyCAGE(c.cage);
    setVerifyState({ loading: false, entity: null, ran: false });
    setVerifyOpen(true);
  }

  async function runVerify() {
    setVerifyState({ loading: true, entity: null, ran: true });
    try {
      const res = await fetch("/api/sam/verify-entity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uei: verifyUEI, cage: verifyCAGE }),
      });
      const json = await res.json();
      setVerifyState({
        loading: false,
        entity: json.entity,
        reason: json.reason,
        available: json.available,
        ran: true,
      });
    } catch (e) {
      setVerifyState({
        loading: false,
        entity: null,
        reason: (e as Error).message,
        available: false,
        ran: true,
      });
    }
  }

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
          {filtered.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No partners match"
              description="Try clearing the state filter or rewording the search."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQ("");
                    setState("all");
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          )}
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
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => explainMatch({ name: c.name, caps: c.capabilities })}>
                      <Sparkles className="h-3 w-3" /> Explain match
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openVerify({ name: c.name, uei: c.uei, cage: c.cage })}>
                      {c.verifiedAt ? <BadgeCheck className="h-3 w-3 text-emerald-300" /> : <ShieldCheck className="h-3 w-3" />}
                      {c.verifiedAt ? "Verified" : "Verify"}
                    </Button>
                  </div>
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

      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent onClose={() => setVerifyOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold-300" />
              SAM.gov Entity Verification
            </DialogTitle>
            <DialogDescription>
              {verifyTarget?.name || ""} — verify registration status & certified business types.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>UEI</Label>
                <Input value={verifyUEI} onChange={(e) => setVerifyUEI(e.target.value)} placeholder="12-char UEI" />
              </div>
              <div>
                <Label>CAGE</Label>
                <Input value={verifyCAGE} onChange={(e) => setVerifyCAGE(e.target.value)} placeholder="5-char CAGE" />
              </div>
            </div>
            <Button size="sm" className="w-full" onClick={runVerify} disabled={verifyState.loading || (!verifyUEI && !verifyCAGE)}>
              {verifyState.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
              Run SAM.gov check
            </Button>
            {verifyState.ran && !verifyState.loading && (
              <div className="rounded-md border border-border p-3 bg-navy-950 text-sm">
                {verifyState.entity ? (
                  <div className="space-y-2">
                    <div className="font-semibold text-foreground">{verifyState.entity.legalBusinessName}</div>
                    <div className="text-xs text-muted-foreground">
                      UEI {verifyState.entity.uei}
                      {verifyState.entity.cage ? ` · CAGE ${verifyState.entity.cage}` : ""}
                      {" · "}Registration: {verifyState.entity.registrationStatus}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={verifyState.entity.isSDVOSB ? "success" : "secondary"}>
                        {verifyState.entity.isSDVOSB ? "SAM-verified SDVOSB" : "Not SDVOSB"}
                      </Badge>
                      <Badge variant={verifyState.entity.isVOSB ? "success" : "secondary"}>
                        {verifyState.entity.isVOSB ? "VOSB" : "Not VOSB"}
                      </Badge>
                      {verifyState.entity.isEightA && <Badge variant="success">8(a)</Badge>}
                      {verifyState.entity.isHUBZone && <Badge variant="success">HUBZone</Badge>}
                      {verifyState.entity.isWOSB && <Badge variant="success">WOSB</Badge>}
                    </div>
                    {verifyState.entity.primaryNaics && (
                      <div className="text-xs text-muted-foreground">
                        Primary NAICS: <span className="text-foreground">{verifyState.entity.primaryNaics}</span>
                        {verifyState.entity.naicsCodes.length > 1 && ` (+${verifyState.entity.naicsCodes.length - 1} more)`}
                      </div>
                    )}
                    {verifyState.entity.registrationExpirationDate && (
                      <div className="text-xs text-muted-foreground">
                        Expires: {verifyState.entity.registrationExpirationDate}
                      </div>
                    )}
                  </div>
                ) : verifyState.available === false ? (
                  <div>
                    <Badge variant="warning">Verification unavailable</Badge>
                    <p className="mt-2 text-xs text-muted-foreground">{verifyState.reason || "SAM.gov cannot be reached."}</p>
                  </div>
                ) : (
                  <div>
                    <Badge variant="destructive">Not Found</Badge>
                    <p className="mt-2 text-xs text-muted-foreground">{verifyState.reason || "No matching entity in SAM.gov."}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
