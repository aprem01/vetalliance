import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "@/components/opportunity-card";
import { fetchActiveOpportunities } from "@/lib/external/sam";
import { fetchAgencyMandateRows } from "@/lib/external/usaspending";
import { TEAMING_REQUESTS } from "@/lib/seed/teaming-requests";
import { PIPELINE } from "@/lib/seed/pipeline";
import type { PipelineItem } from "@/lib/types";
import { formatCurrency, daysUntil } from "@/lib/utils";
import {
  Target,
  TrendingDown,
  Handshake,
  DollarSign,
  KanbanSquare,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Flame,
} from "lucide-react";

export const revalidate = 1800;

const PIPELINE_STAGES: PipelineItem["stage"][] = [
  "Prospect",
  "Outreach",
  "NDA",
  "Teaming Agreement",
  "Proposal",
  "Award",
];

const ADVISOR_THREADS = [
  { id: "a1", q: "Summarize VA EHRM data integration fit", when: "2h ago" },
  { id: "a2", q: "Draft capability statement for NAICS 541512", when: "yesterday" },
  { id: "a3", q: "Which agencies are furthest behind 3% goal?", when: "2d ago" },
];

export default async function DashboardPage() {
  const [oppsResp, mandateResp] = await Promise.all([
    fetchActiveOpportunities({ limit: 100 }),
    fetchAgencyMandateRows(15),
  ]);

  const opportunities = oppsResp.opportunities;
  const behindAgencies = mandateResp.rows
    .filter((r) => !r.onTrack)
    .sort((a, b) => (a.actualPct - a.mandatePct) - (b.actualPct - b.mandatePct))
    .slice(0, 3);

  const topOpps = [...opportunities]
    .sort((a, b) => {
      const dA = daysUntil(a.deadline);
      const dB = daysUntil(b.deadline);
      const urgencyA = dA <= 30 ? 1 : 0;
      const urgencyB = dB <= 30 ? 1 : 0;
      if (urgencyA !== urgencyB) return urgencyB - urgencyA;
      return b.aiScore - a.aiScore;
    })
    .slice(0, 5);

  const pipelineValue = PIPELINE.reduce((s, p) => s + p.value, 0);
  const pipelineWeighted = PIPELINE.reduce(
    (s, p) => s + p.value * (p.probability / 100),
    0
  );

  const stats = [
    {
      label: "Opportunities Matching Your Profile",
      value: opportunities.length,
      sub: oppsResp.mocked ? "seed data" : "live from SAM.gov",
      icon: Target,
    },
    {
      label: "Agencies Behind Mandate",
      value: mandateResp.rows.filter((r) => !r.onTrack).length,
      sub: "HIGH OPPORTUNITY",
      icon: TrendingDown,
      accent: true,
    },
    {
      label: "Active Teaming Requests",
      value: TEAMING_REQUESTS.length,
      sub: "across Prime/Sub queue",
      icon: Handshake,
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      sub: `weighted ${formatCurrency(pipelineWeighted)}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Command Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your federal contracting pipeline, live across SAM.gov and USASpending.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {oppsResp.mocked && <Badge variant="outline">SAM demo data</Badge>}
          {mandateResp.mocked && <Badge variant="outline">USASpending demo</Badge>}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(({ label, value, sub, icon: Icon, accent }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-gold-400" />
                <Badge
                  variant={accent ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {sub}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground mt-3">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-gold-400" />
              <h2 className="text-lg font-semibold text-foreground">
                Top 5 Opportunities for You
              </h2>
            </div>
            <Link href="/terminal/opportunities">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {topOpps.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2 className="text-lg font-semibold text-foreground">Mandate Alerts</h2>
            </div>
            <Link href="/terminal/agencies">
              <Button variant="ghost" size="sm">
                Tracker <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {behindAgencies.map((a) => {
              const gap = Number((a.mandatePct - a.actualPct).toFixed(1));
              return (
                <Card key={a.id} className="border-amber-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {a.abbr}
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                          {a.name}
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-[10px] shrink-0">
                        -{gap}%
                      </Badge>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-navy-700 overflow-hidden">
                      <div
                        className="h-1.5 bg-amber-500"
                        style={{
                          width: `${Math.min(100, (a.actualPct / Math.max(a.mandatePct, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        {a.actualPct.toFixed(1)}% actual · {a.mandatePct}% goal
                      </span>
                      <span className="text-gold-300">
                        {formatCurrency(a.sdvosbAwards)} SDVOSB
                      </span>
                    </div>
                    <Link
                      href="/terminal/agencies"
                      className="mt-3 inline-flex items-center gap-1 text-[11px] text-gold-300 hover:text-gold-200"
                    >
                      View in tracker <ArrowRight className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
            {behindAgencies.length === 0 && (
              <Card>
                <CardContent className="p-4 text-xs text-muted-foreground text-center">
                  All tracked agencies are at or above SDVOSB goal.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <KanbanSquare className="h-4 w-4 text-gold-400" />
                Pipeline Snapshot
              </CardTitle>
              <Link href="/teaming/pipeline">
                <Button variant="ghost" size="sm">
                  Open board <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {PIPELINE_STAGES.map((stage) => {
                const count = PIPELINE.filter((p) => p.stage === stage).length;
                const weighted = PIPELINE.filter((p) => p.stage === stage).reduce(
                  (s, p) => s + p.value * (p.probability / 100),
                  0
                );
                return (
                  <div
                    key={stage}
                    className="rounded-md border border-border bg-navy-950 px-2 py-3 text-center"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                      {stage}
                    </div>
                    <div className="text-xl font-bold text-foreground mt-1">{count}</div>
                    <div className="text-[10px] text-gold-300 mt-0.5">
                      {formatCurrency(weighted)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-gold-400" />
                Recent Advisor Threads
              </CardTitle>
              <Link href="/advisor">
                <Button variant="ghost" size="sm">
                  Open <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {ADVISOR_THREADS.map((t) => (
              <Link
                key={t.id}
                href="/advisor"
                className="block rounded-md border border-border bg-navy-950 px-3 py-2 hover:border-gold-500/40 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="h-3 w-3 text-gold-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-foreground truncate">{t.q}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {t.when}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
