"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Loader2, UserCheck, ExternalLink } from "lucide-react";
import type { MentorProfile, ProtegeProfile, MentorProtegePair } from "@/lib/types";

function capacityBadge(level: MentorProfile["capacityLevel"]) {
  if (level === "open") return <Badge variant="success">Accepting</Badge>;
  if (level === "limited") return <Badge variant="warning">Limited</Badge>;
  return <Badge variant="secondary">Full</Badge>;
}

function readinessBadge(score: number) {
  if (score >= 75) return <Badge variant="success">Ready · {score}</Badge>;
  if (score >= 55) return <Badge variant="warning">Developing · {score}</Badge>;
  return <Badge variant="secondary">Early · {score}</Badge>;
}

export function MentorProtegeClient({
  mentors,
  proteges,
  pairs,
}: {
  mentors: MentorProfile[];
  proteges: ProtegeProfile[];
  pairs: MentorProtegePair[];
}) {
  const [mentorQ, setMentorQ] = useState("");
  const [mentorNaics, setMentorNaics] = useState("all");
  const [mentorProgram, setMentorProgram] = useState("all");
  const [mentorCapacity, setMentorCapacity] = useState("all");

  const [protQ, setProtQ] = useState("");
  const [protCert, setProtCert] = useState("all");

  const [matchOpen, setMatchOpen] = useState(false);
  const [matchTarget, setMatchTarget] = useState<{ mentor: MentorProfile; protege: ProtegeProfile } | null>(null);
  const [matchState, setMatchState] = useState<{ loading: boolean; score: number; rationale: string; mocked?: boolean }>({ loading: false, score: 0, rationale: "" });

  // Represent "current user" as the first protege for "Find a Mentor" flow.
  const defaultProtege = proteges[0];

  const filteredMentors = useMemo(
    () =>
      mentors.filter((m) => {
        if (mentorNaics !== "all" && m.primaryNAICS !== mentorNaics) return false;
        if (mentorProgram !== "all" && !m.programsOffered.includes(mentorProgram as MentorProfile["programsOffered"][number])) return false;
        if (mentorCapacity !== "all" && m.capacityLevel !== mentorCapacity) return false;
        if (mentorQ && !`${m.name} ${m.specialties.join(" ")} ${m.primaryNAICS}`.toLowerCase().includes(mentorQ.toLowerCase())) return false;
        return true;
      }),
    [mentors, mentorQ, mentorNaics, mentorProgram, mentorCapacity]
  );

  const filteredProteges = useMemo(
    () =>
      proteges.filter((p) => {
        if (protCert !== "all" && !p.certifications.includes(protCert)) return false;
        if (protQ && !`${p.name} ${p.goals.join(" ")} ${p.targetAgencies.join(" ")}`.toLowerCase().includes(protQ.toLowerCase())) return false;
        return true;
      }),
    [proteges, protQ, protCert]
  );

  const mentorNaicsOptions = Array.from(new Set(mentors.map((m) => m.primaryNAICS))).sort();
  const certOptions = Array.from(new Set(proteges.flatMap((p) => p.certifications))).sort();

  async function runMatch(mentor: MentorProfile, protege: ProtegeProfile) {
    setMatchTarget({ mentor, protege });
    setMatchOpen(true);
    setMatchState({ loading: true, score: 0, rationale: "" });
    try {
      const res = await fetch("/api/ai/match-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorProfile: mentor, protegeProfile: protege }),
      });
      const json = await res.json();
      setMatchState({ loading: false, score: json.score || 0, rationale: json.rationale || "", mocked: json.mocked });
    } catch (e) {
      setMatchState({ loading: false, score: 0, rationale: (e as Error).message, mocked: true });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mentor-Protégé</h1>
        <p className="text-sm text-muted-foreground">
          SBA All Small Mentor-Protégé Program (ASMP), 8(a) Mentor-Protégé, and DoD Mentor-Protégé pairings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle className="text-sm">Mentors Accepting</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gold-300">{mentors.filter((m) => m.capacityLevel !== "full").length}</div><div className="text-xs text-muted-foreground">of {mentors.length} tracked</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Protégés Seeking</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{proteges.length}</div><div className="text-xs text-muted-foreground">veteran-owned firms</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Active Pairs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{pairs.length}</div><div className="text-xs text-muted-foreground">JV-eligible agreements</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Avg. Readiness</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{Math.round(proteges.reduce((s, p) => s + p.readinessScore, 0) / proteges.length)}</div><div className="text-xs text-muted-foreground">protégé readiness score</div></CardContent></Card>
      </div>

      <Tabs defaultValue="mentors">
        <TabsList>
          <TabsTrigger value="mentors">Find a Mentor</TabsTrigger>
          <TabsTrigger value="proteges">Find a Protégé</TabsTrigger>
          <TabsTrigger value="active">Active Pairs</TabsTrigger>
          <TabsTrigger value="info">Program Info</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="md:col-span-2">
              <Label>Search</Label>
              <Input value={mentorQ} onChange={(e) => setMentorQ(e.target.value)} placeholder="Name, specialty…" />
            </div>
            <div>
              <Label>Primary NAICS</Label>
              <Select value={mentorNaics} onChange={(e) => setMentorNaics(e.target.value)}>
                <option value="all">All</option>
                {mentorNaicsOptions.map((n) => <option key={n}>{n}</option>)}
              </Select>
            </div>
            <div>
              <Label>Program</Label>
              <Select value={mentorProgram} onChange={(e) => setMentorProgram(e.target.value)}>
                <option value="all">All</option>
                <option value="ASMP">ASMP</option>
                <option value="8(a) MP">8(a) MP</option>
                <option value="DoD MP">DoD MP</option>
              </Select>
            </div>
            <div>
              <Label>Capacity</Label>
              <Select value={mentorCapacity} onChange={(e) => setMentorCapacity(e.target.value)}>
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="limited">Limited</option>
                <option value="full">Full</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMentors.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground">NAICS {m.primaryNAICS} · {m.yearsOfFederalExperience} yrs federal · {m.geography}</div>
                    </div>
                    {capacityBadge(m.capacityLevel)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {m.specialties.slice(0, 3).map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                    {m.programsOffered.map((p) => <Badge key={p}>{p}</Badge>)}
                  </div>
                  {defaultProtege && (
                    <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => runMatch(m, defaultProtege)}>
                      <Sparkles className="h-3 w-3" /> Match score vs. {defaultProtege.name.split(" ")[0]}…
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredMentors.length === 0 && <div className="text-sm text-muted-foreground">No mentors match current filters.</div>}
          </div>
        </TabsContent>

        <TabsContent value="proteges">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="md:col-span-2">
              <Label>Search</Label>
              <Input value={protQ} onChange={(e) => setProtQ(e.target.value)} placeholder="Name, goal, target agency…" />
            </div>
            <div>
              <Label>Certification</Label>
              <Select value={protCert} onChange={(e) => setProtCert(e.target.value)}>
                <option value="all">All</option>
                {certOptions.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredProteges.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">Revenue {p.currentRevenue} · Targets {p.targetAgencies.join(", ")}</div>
                    </div>
                    {readinessBadge(p.readinessScore)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.certifications.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <span className="text-gold-300">Goals:</span> {p.goals.join(" · ")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pairs.map((pair) => (
              <Card key={pair.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">
                        {pair.mentorName} <span className="text-muted-foreground">×</span> {pair.protegeName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{pair.mentorIndustry} · protégé stage: {pair.protegeStage}</div>
                    </div>
                    <Badge variant="success"><UserCheck className="h-3 w-3" /> Active</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Agreement {pair.agreementDate} → {pair.programEndDate}
                    {pair.jointVentureName ? ` · JV: ${pair.jointVentureName}` : ""}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {pair.focusAreas.map((f) => <Badge key={f} variant="secondary">{f}</Badge>)}
                  </div>
                  {pair.outcomes && (
                    <p className="mt-3 text-xs text-foreground leading-relaxed">
                      <span className="text-gold-300">Outcome:</span> {pair.outcomes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">SBA All Small Mentor-Protégé (ASMP)</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Open to any small business in SBA size standards. 6-year relationship max (renewable once). Mentor can own up to 40% of JV with protégé.</p>
                <a href="https://www.sba.gov/federal-contracting/contracting-assistance-programs/all-small-mentor-protege-program" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold-300 hover:underline text-xs">
                  SBA official <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">8(a) Mentor-Protégé</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Merged with ASMP in 2020 — protégé must hold active 8(a) certification. JV can pursue 8(a) set-asides if mentor otherwise wouldn't qualify.</p>
                <a href="https://www.sba.gov/federal-contracting/contracting-assistance-programs/8a-business-development-program" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold-300 hover:underline text-xs">
                  SBA 8(a) <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">DoD Mentor-Protégé</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Separate from SBA ASMP. Funded through DoD OSBP; mentor reimbursed for developmental assistance. 3-year term, renewable.</p>
                <a href="https://business.defense.gov/Programs/Mentor-Protege-Program/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold-300 hover:underline text-xs">
                  DoD OSBP <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={matchOpen} onOpenChange={setMatchOpen}>
        <DialogContent onClose={() => setMatchOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              AI Match
              {matchState.mocked && <Badge variant="warning">Mocked</Badge>}
            </DialogTitle>
            <DialogDescription>
              {matchTarget ? `${matchTarget.mentor.name} × ${matchTarget.protege.name}` : ""}
            </DialogDescription>
          </DialogHeader>
          {matchState.loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-gold-300">{matchState.score}</div>
                <div className="text-xs text-muted-foreground">match score (0-100)</div>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{matchState.rationale}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
