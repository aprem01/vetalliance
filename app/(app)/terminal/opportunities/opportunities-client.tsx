"use client";
import { useMemo, useState } from "react";
import { OpportunityCard } from "@/components/opportunity-card";
import type { Opportunity } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { SearchX, LayoutGrid, Layers } from "lucide-react";
import { categorizeNAICS, SKILL_CATEGORIES, type SkillCategory } from "@/lib/naics-categories";

type GroupBy = "none" | "category" | "agency" | "setAside";

export function OpportunitiesClient({
  opportunities,
  mocked,
  source,
}: {
  opportunities: Opportunity[];
  mocked: boolean;
  source: string;
}) {
  const AGENCIES_UNIQUE = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.agency))),
    [opportunities]
  );
  const SETASIDES_UNIQUE = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.setAside))),
    [opportunities]
  );

  const [query, setQuery] = useState("");
  const [agency, setAgency] = useState("all");
  const [setAside, setSetAside] = useState("all");
  const [category, setCategory] = useState<"all" | SkillCategory>("all");
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<"score" | "deadline" | "value">("score");
  const [groupBy, setGroupBy] = useState<GroupBy>("category");

  const filtered = useMemo(() => {
    let list = opportunities.filter((o) => {
      if (agency !== "all" && o.agency !== agency) return false;
      if (setAside !== "all" && o.setAside !== setAside) return false;
      if (category !== "all" && categorizeNAICS(o.naics) !== category) return false;
      if (o.aiScore < minScore) return false;
      if (
        query &&
        !`${o.title} ${o.description} ${o.solicitationNumber}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      return true;
    });
    if (sort === "score") list = [...list].sort((a, b) => b.aiScore - a.aiScore);
    if (sort === "deadline")
      list = [...list].sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
    if (sort === "value") list = [...list].sort((a, b) => b.valueHigh - a.valueHigh);
    return list;
  }, [opportunities, query, agency, setAside, category, minScore, sort]);

  const categorySummary = useMemo(() => {
    const map = new Map<SkillCategory, { count: number; value: number }>();
    for (const c of SKILL_CATEGORIES) map.set(c, { count: 0, value: 0 });
    for (const o of opportunities) {
      const c = categorizeNAICS(o.naics);
      const cur = map.get(c)!;
      cur.count += 1;
      cur.value += o.valueHigh || 0;
    }
    return SKILL_CATEGORIES.map((name) => ({ name, ...map.get(name)! })).filter(
      (x) => x.count > 0
    );
  }, [opportunities]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;
    const getKey = (o: Opportunity): string => {
      if (groupBy === "category") return categorizeNAICS(o.naics);
      if (groupBy === "agency") return o.agency || "Unknown";
      if (groupBy === "setAside") return o.setAside || "Unknown";
      return "All";
    };
    const m = new Map<string, Opportunity[]>();
    for (const o of filtered) {
      const k = getKey(o);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(o);
    }
    return Array.from(m.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filtered, groupBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            {mocked
              ? "Showing seed data — set SAM_GOV_API_KEY for live SAM.gov results."
              : `Live from ${source}. AI-scored against your capability profile.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mocked && <Badge variant="outline">demo data</Badge>}
          <Badge>{filtered.length} results</Badge>
        </div>
      </div>

      {/* Category overview chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
            category === "all"
              ? "bg-gold-500/20 border-gold-500 text-gold-200"
              : "border-border text-muted-foreground hover:border-gold-500/60"
          }`}
        >
          All ({opportunities.length})
        </button>
        {categorySummary.map((c) => (
          <button
            key={c.name}
            onClick={() => setCategory(c.name)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
              category === c.name
                ? "bg-gold-500/20 border-gold-500 text-gold-200"
                : "border-border text-muted-foreground hover:border-gold-500/60"
            }`}
            title={`${c.count} opportunities · $${Math.round(c.value / 1_000_000).toLocaleString()}M total`}
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 rounded-lg border border-border bg-card p-4">
        <div className="md:col-span-2 space-y-1">
          <Label>Search</Label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, solicitation #, description…"
          />
        </div>
        <div className="space-y-1">
          <Label>Agency</Label>
          <Select value={agency} onChange={(e) => setAgency(e.target.value)}>
            <option value="all">All</option>
            {AGENCIES_UNIQUE.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Set-Aside</Label>
          <Select value={setAside} onChange={(e) => setSetAside(e.target.value)}>
            <option value="all">All</option>
            {SETASIDES_UNIQUE.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Group by</Label>
          <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}>
            <option value="none">None</option>
            <option value="category">Skill Category</option>
            <option value="agency">Agency</option>
            <option value="setAside">Set-Aside</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Sort by</Label>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as "score" | "deadline" | "value")}
          >
            <option value="score">AI Score</option>
            <option value="deadline">Deadline</option>
            <option value="value">Contract Value</option>
          </Select>
        </div>
        <div className="md:col-span-6 space-y-1">
          <Label>Min AI Score: {minScore}</Label>
          <input
            type="range"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full accent-gold-500"
          />
        </div>
      </div>

      {grouped ? (
        <div className="space-y-6">
          {grouped.map(([groupName, opps]) => {
            const totalValue = opps.reduce((s, o) => s + (o.valueHigh || 0), 0);
            return (
              <section key={groupName} className="space-y-3">
                <div className="flex items-center gap-3 border-b border-border pb-2">
                  <Layers className="h-4 w-4 text-gold-400" />
                  <h2 className="text-lg font-semibold text-foreground">{groupName}</h2>
                  <Badge variant="outline">{opps.length}</Badge>
                  <span className="text-xs text-muted-foreground">
                    ${Math.round(totalValue / 1_000_000).toLocaleString()}M total
                  </span>
                </div>
                <div className="space-y-3">
                  {opps.map((opp) => (
                    <OpportunityCard key={opp.id} opp={opp} />
                  ))}
                </div>
              </section>
            );
          })}
          {grouped.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No opportunities match your filters"
              description="Try widening the score threshold, switching the set-aside, or clearing the search."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setAgency("all");
                    setSetAside("all");
                    setCategory("all");
                    setMinScore(0);
                    setSort("score");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LayoutGrid className="h-3 w-3" />
            Flat list · {filtered.length} shown
          </div>
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
          {filtered.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No opportunities match your filters"
              description="Try widening the score threshold, switching the set-aside, or clearing the search."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setAgency("all");
                    setSetAside("all");
                    setCategory("all");
                    setMinScore(0);
                    setSort("score");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
