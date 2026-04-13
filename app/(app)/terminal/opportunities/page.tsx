"use client";
import { useMemo, useState } from "react";
import { OpportunityCard } from "@/components/opportunity-card";
import { OPPORTUNITIES } from "@/lib/seed/opportunities";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const AGENCIES_UNIQUE = Array.from(new Set(OPPORTUNITIES.map((o) => o.agency)));
const SETASIDES_UNIQUE = Array.from(new Set(OPPORTUNITIES.map((o) => o.setAside)));

export default function OpportunitiesPage() {
  const [query, setQuery] = useState("");
  const [agency, setAgency] = useState("all");
  const [setAside, setSetAside] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<"score" | "deadline" | "value">("score");

  const filtered = useMemo(() => {
    let list = OPPORTUNITIES.filter((o) => {
      if (agency !== "all" && o.agency !== agency) return false;
      if (setAside !== "all" && o.setAside !== setAside) return false;
      if (o.aiScore < minScore) return false;
      if (query && !(`${o.title} ${o.description} ${o.solicitationNumber}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
    if (sort === "score") list = [...list].sort((a, b) => b.aiScore - a.aiScore);
    if (sort === "deadline") list = [...list].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    if (sort === "value") list = [...list].sort((a, b) => b.valueHigh - a.valueHigh);
    return list;
  }, [query, agency, setAside, minScore, sort]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Opportunities</h1>
          <p className="text-sm text-muted-foreground">Live feed. AI-scored against your capability profile.</p>
        </div>
        <Badge>{filtered.length} results</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 rounded-lg border border-border bg-card p-4">
        <div className="md:col-span-2 space-y-1">
          <Label>Search</Label>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title, solicitation #, description…" />
        </div>
        <div className="space-y-1">
          <Label>Agency</Label>
          <Select value={agency} onChange={(e) => setAgency(e.target.value)}>
            <option value="all">All</option>
            {AGENCIES_UNIQUE.map((a) => <option key={a}>{a}</option>)}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Set-Aside</Label>
          <Select value={setAside} onChange={(e) => setSetAside(e.target.value)}>
            <option value="all">All</option>
            {SETASIDES_UNIQUE.map((a) => <option key={a}>{a}</option>)}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Sort by</Label>
          <Select value={sort} onChange={(e) => setSort(e.target.value as "score" | "deadline" | "value")}>
            <option value="score">AI Score</option>
            <option value="deadline">Deadline</option>
            <option value="value">Contract Value</option>
          </Select>
        </div>
        <div className="md:col-span-5 space-y-1">
          <Label>Min AI Score: {minScore}</Label>
          <input type="range" min={0} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-full accent-gold-500" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((opp) => <OpportunityCard key={opp.id} opp={opp} />)}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No opportunities match these filters.</div>
        )}
      </div>
    </div>
  );
}
