"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { LeakageReport } from "@/lib/analytics/leakage";

export interface AnalyticsData {
  mandateData: Array<{ name: string; mandate: number; actual: number }>;
  topAgencySpend: Array<{ name: string; amount: number }>;
  topNaics: Array<{ name: string; value: number }>;
  ytdTotal: number;
  priorTotal: number;
  ytdFy: number;
  priorFy: number;
  mocked: boolean;
  leakage: LeakageReport;
}

const COLORS = ["#C9A84C", "#D4B45E", "#E2C87A", "#A88A33", "#8FA0B8", "#1F3352"];

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const pipelineTrend = months.map((m, i) => ({
    month: m,
    pipeline: 3.2 + i * 1.4,
    wins: 0.4 + i * 0.3,
  }));

  const pctChange =
    data.priorTotal > 0
      ? ((data.ytdTotal - data.priorTotal) / data.priorTotal) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          {data.mocked
            ? "Market intelligence from seed data — USASpending fell back."
            : "Market intelligence live from USASpending.gov. Personal metrics from seed."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">YTD SDVOSB Awards (FY{data.ytdFy})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-300">{formatCurrency(data.ytdTotal)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              vs {formatCurrency(data.priorTotal)} in FY{data.priorFy} ({pctChange >= 0 ? "+" : ""}
              {pctChange.toFixed(1)}%)
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Awarding Agency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground truncate">
              {data.topAgencySpend[0]?.name || "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(data.topAgencySpend[0]?.amount || 0)} in SDVOSB awards
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Agencies Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data.topAgencySpend.length}</div>
            <div className="text-xs text-muted-foreground mt-1">top SDVOSB buyers this FY</div>
          </CardContent>
        </Card>
      </div>

      <LeakageSection report={data.leakage} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SDVOSB Mandate vs Actual</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.mandateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F3352" />
                <XAxis dataKey="name" stroke="#8FA0B8" fontSize={11} />
                <YAxis stroke="#8FA0B8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0F1E33", border: "1px solid #1F3352" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="mandate" fill="#1F3352" name="Mandate %" />
                <Bar dataKey="actual" fill="#C9A84C" name="Actual %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Agencies by SDVOSB Spend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topAgencySpend.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1F3352" />
                <XAxis
                  type="number"
                  stroke="#8FA0B8"
                  fontSize={11}
                  tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
                />
                <YAxis type="category" dataKey="name" stroke="#8FA0B8" fontSize={10} width={110} />
                <Tooltip
                  contentStyle={{ background: "#0F1E33", border: "1px solid #1F3352" }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Bar dataKey="amount" fill="#C9A84C" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Pipeline Trend ($M)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pipelineTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F3352" />
                <XAxis dataKey="month" stroke="#8FA0B8" fontSize={11} />
                <YAxis stroke="#8FA0B8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0F1E33", border: "1px solid #1F3352" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="pipeline" stroke="#C9A84C" strokeWidth={2} />
                <Line type="monotone" dataKey="wins" stroke="#34D399" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top NAICS (SDVOSB awards)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topNaics}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.topNaics.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0F1E33", border: "1px solid #1F3352" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LeakageSection({ report }: { report: LeakageReport }) {
  const { breakdown, topPrimes, subawardEndpointWorked, primesFromPrimeVolumeOnly } = report;
  const total = Math.max(breakdown.totalPrime, 1);
  const retainedPct = (breakdown.retained / total) * 100;
  const largePct = (breakdown.leakedLarge / total) * 100;
  const otherPct = (breakdown.leakedOther / total) * 100;
  const leakRatePct = (breakdown.leakageRate * 100).toFixed(1);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">Set-Aside Leakage</h2>
        <Badge variant={breakdown.measurement === "measured" ? "success" : "warning"}>
          {breakdown.measurement === "measured" ? "MEASURED" : "MODELED ESTIMATE"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          FY{breakdown.fy} · How much SDVOSB set-aside $ actually stays with SDVOSBs vs. leaks to non-SDVOSB subcontractors.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total SDVOSB Set-Aside Awards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(breakdown.totalPrime)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Prime awards (real, USASpending)</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estimated $ Reaching SDVOSBs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-300">
              {formatCurrency(breakdown.retained)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              After subcontract leakage ({breakdown.measurement})
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Leakage Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{leakRatePct}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(breakdown.totalLeaked)} leaking to non-SDVOSB subs
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Retained vs Leaked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-6 w-full overflow-hidden rounded-md border border-border">
            <div
              className="bg-emerald-500/60 flex items-center justify-center text-[10px] font-semibold text-emerald-50"
              style={{ width: `${retainedPct}%` }}
              title={`Retained: ${formatCurrency(breakdown.retained)}`}
            >
              {retainedPct > 12 ? `Retained ${retainedPct.toFixed(0)}%` : ""}
            </div>
            <div
              className="bg-red-500/60 flex items-center justify-center text-[10px] font-semibold text-red-50"
              style={{ width: `${largePct}%` }}
              title={`Leaked to large subs: ${formatCurrency(breakdown.leakedLarge)}`}
            >
              {largePct > 10 ? `Large subs ${largePct.toFixed(0)}%` : ""}
            </div>
            <div
              className="bg-amber-500/60 flex items-center justify-center text-[10px] font-semibold text-amber-50"
              style={{ width: `${otherPct}%` }}
              title={`Leaked to other: ${formatCurrency(breakdown.leakedOther)}`}
            >
              {otherPct > 6 ? `Other ${otherPct.toFixed(0)}%` : ""}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-sm bg-emerald-500/60" />
              Retained by SDVOSBs — {formatCurrency(breakdown.retained)}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-sm bg-red-500/60" />
              Leaked to Large Subs — {formatCurrency(breakdown.leakedLarge)}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-sm bg-amber-500/60" />
              Leaked to Other — {formatCurrency(breakdown.leakedOther)}
            </span>
          </div>
          {breakdown.measurement === "modeled" && (
            <div className="mt-3 text-[11px] text-amber-400">
              Modeled estimate — uses industry heuristic: ~37.5% of prime value is typically
              subcontracted, of which ~60% does not stay with SDVOSBs. Replace with measured values
              when USASpending subaward data is available.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Top Leakage Primes</CardTitle>
            <span className="text-[11px] text-muted-foreground">
              {subawardEndpointWorked
                ? "Subaward data live from USASpending."
                : "Subaward visibility limited — listed by SDVOSB prime award volume."}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {topPrimes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No prime-level data available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="py-2 text-left font-medium">Prime</th>
                    <th className="py-2 text-right font-medium">Prime Awards</th>
                    <th className="py-2 text-right font-medium">Subcontracted</th>
                    <th className="py-2 text-right font-medium">Leakage %</th>
                  </tr>
                </thead>
                <tbody>
                  {topPrimes.map((p) => (
                    <tr key={p.name} className="border-b border-border/40">
                      <td className="py-2 text-foreground">
                        {p.name}
                        {primesFromPrimeVolumeOnly && p.note && (
                          <div className="text-[10px] text-amber-400/80">{p.note}</div>
                        )}
                      </td>
                      <td className="py-2 text-right text-foreground">
                        {formatCurrency(p.primeAwards)}
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {p.subcontracted !== undefined ? formatCurrency(p.subcontracted) : "—"}
                      </td>
                      <td className="py-2 text-right">
                        {p.leakagePct !== undefined ? (
                          <span className="text-red-400">{(p.leakagePct * 100).toFixed(0)}%</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
