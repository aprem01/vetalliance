import {
  fetchAgencyMandateRows,
  fetchAwardYearTotals,
  fetchRecentSDVOSBAwards,
} from "@/lib/external/usaspending";
import { computeLeakageReport } from "@/lib/analytics/leakage";
import { AnalyticsClient, type AnalyticsData } from "./analytics-client";

export const revalidate = 3600;

export default async function AnalyticsPage() {
  const [mandate, totals, awardsResp, leakage] = await Promise.all([
    fetchAgencyMandateRows(10),
    fetchAwardYearTotals(),
    fetchRecentSDVOSBAwards(100),
    computeLeakageReport(),
  ]);

  const mandateData = mandate.rows.slice(0, 10).map((r) => ({
    name: r.abbr,
    mandate: r.mandatePct,
    actual: Number(r.actualPct.toFixed(1)),
  }));

  const topAgencySpend = mandate.rows
    .map((r) => ({ name: r.abbr, amount: r.sdvosbAwards }))
    .sort((a, b) => b.amount - a.amount);

  // Top NAICS by dollar volume from recent awards
  const naicsMap: Record<string, number> = {};
  for (const a of awardsResp.awards) {
    if (!a.naics) continue;
    naicsMap[a.naics] = (naicsMap[a.naics] || 0) + (a.amount || 0);
  }
  const topNaics = Object.entries(naicsMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const data: AnalyticsData = {
    mandateData,
    topAgencySpend,
    topNaics,
    ytdTotal: totals.ytdTotal,
    priorTotal: totals.priorTotal,
    ytdFy: totals.ytdFy,
    priorFy: totals.priorFy,
    mocked: mandate.mocked || totals.mocked || awardsResp.mocked,
    leakage,
  };

  return <AnalyticsClient data={data} />;
}
