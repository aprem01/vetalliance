/**
 * Predictive Alerts analytics.
 * Pulls historical SDVOSB awards across 3 FYs and computes per-agency forecasts.
 */
import { AGENCIES as SEED_AGENCIES } from "@/lib/seed/agencies";
import { OPPORTUNITIES as SEED_OPPS } from "@/lib/seed/opportunities";
import { hasAnthropic, getClient, MODEL } from "@/lib/anthropic";
import { USASPENDING_API_BASE } from "@/lib/external/usaspending";

const SDVOSB_CODES = ["SDVOSBC", "SDVOSBS", "VSA", "VSS"];
const CONTRACT_AWARD_TYPES = ["A", "B", "C", "D"];

export interface QuarterStat {
  fy: number;
  q: 1 | 2 | 3 | 4;
  awardCount: number;
  amount: number;
}

export interface AgencyPrediction {
  agency: string;
  code?: string;
  historical: QuarterStat[];
  avgCountPerQuarter: number;
  stdevCount: number;
  avgAmountPerQuarter: number;
  expectedCountLow: number;
  expectedCountHigh: number;
  expectedAmount: number;
  dominantNaics: Array<{ code: string; label?: string; count: number }>;
  typicalMonths: string[];
  incumbentExpirations: Array<{
    recipient: string;
    amount: number;
    popEnd: string;
  }>;
  recommendation: string;
  narrative?: string;
  mocked: boolean;
}

interface RawAward {
  agency: string;
  amount: number;
  naics: string;
  naicsDesc?: string;
  recipient: string;
  popStart?: string;
  popEnd?: string;
  actionDate?: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fyOfDate(d: Date): number {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  return m >= 9 ? y + 1 : y;
}
function fyQuarterOfDate(d: Date): 1 | 2 | 3 | 4 {
  const m = d.getUTCMonth(); // 0 = Jan
  // FY quarters: Q1=Oct-Dec, Q2=Jan-Mar, Q3=Apr-Jun, Q4=Jul-Sep
  if (m >= 9) return 1;
  if (m <= 2) return 2;
  if (m <= 5) return 3;
  return 4;
}
function currentFyQuarter(date = new Date()): { fy: number; q: 1 | 2 | 3 | 4 } {
  return { fy: fyOfDate(date), q: fyQuarterOfDate(date) };
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

async function fetchThreeYearAwards(): Promise<{ awards: RawAward[]; mocked: boolean }> {
  const now = new Date();
  const curFy = fyOfDate(now);
  // USASpending caps time_period ranges at 1 year per object — pass 3 separate FY windows.
  const periods = [curFy - 2, curFy - 1, curFy].map((y) => ({
    start_date: `${y - 1}-10-01`,
    end_date: `${y}-09-30`,
  }));
  try {
    const perFy = await Promise.all(
      periods.map(async (period) => {
        const res = await fetch(`${USASPENDING_API_BASE}/search/spending_by_award/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filters: {
              time_period: [period],
              set_aside_type_codes: SDVOSB_CODES,
              award_type_codes: CONTRACT_AWARD_TYPES,
            },
            fields: [
              "Award ID",
              "Recipient Name",
              "Awarding Agency",
              "Award Amount",
              "NAICS",
              "naics_description",
              "Period of Performance Start Date",
              "Period of Performance Current End Date",
              "Action Date",
            ],
            sort: "Award Amount",
            order: "desc",
            limit: 100,
            page: 1,
          }),
          next: { revalidate: 3600 },
        });
        if (!res.ok) throw new Error(`USASpending ${res.status}`);
        const json = (await res.json()) as { results: Array<Record<string, unknown>> };
        return json.results || [];
      })
    );
    const merged = perFy.flat();
    const awards: RawAward[] = merged.map((r) => ({
      agency: String(r["Awarding Agency"] ?? "Unknown"),
      amount: Number(r["Award Amount"]) || 0,
      naics: String(r["NAICS"] ?? ""),
      naicsDesc: r["naics_description"] ? String(r["naics_description"]) : undefined,
      recipient: String(r["Recipient Name"] ?? "Unknown"),
      popStart: r["Period of Performance Start Date"] ? String(r["Period of Performance Start Date"]) : undefined,
      popEnd: r["Period of Performance Current End Date"] ? String(r["Period of Performance Current End Date"]) : undefined,
      actionDate: r["Action Date"] ? String(r["Action Date"]) : undefined,
    }));
    return { awards, mocked: false };
  } catch (err) {
    console.warn("[predictions] fetchThreeYearAwards fallback:", (err as Error).message);
    // Seed fallback — synthesize from seed agencies.
    const now = new Date();
    const curFy = fyOfDate(now);
    const awards: RawAward[] = [];
    for (const ag of SEED_AGENCIES.slice(0, 12)) {
      const baseCount = Math.max(4, Math.round(ag.totalObligations / 5e9));
      for (let fy = curFy - 2; fy <= curFy; fy++) {
        for (let qi = 0; qi < 4; qi++) {
          const mo = [9, 0, 3, 6][qi];
          const cy = qi === 0 ? fy - 1 : fy;
          const count = Math.max(1, Math.round(baseCount * (0.6 + Math.random() * 0.9)));
          for (let k = 0; k < count; k++) {
            const amt = Math.round((ag.totalObligations * (ag.sdvosbActual / 100)) / (baseCount * 4) * (0.5 + Math.random()));
            const action = new Date(Date.UTC(cy, mo + (k % 3), 1 + (k % 25)));
            const popEnd = new Date(Date.UTC(cy + 1, mo + (k % 3), 1 + (k % 25)));
            awards.push({
              agency: ag.name,
              amount: amt,
              naics: ["541512", "541519", "541611", "541330", "236220"][k % 5],
              naicsDesc: ["IT Systems Design", "Computer Services", "Admin Mgmt", "Engineering", "Commercial Construction"][k % 5],
              recipient: `Seed Incumbent ${ag.abbr}-${k % 5 + 1}`,
              actionDate: action.toISOString().slice(0, 10),
              popEnd: popEnd.toISOString().slice(0, 10),
            });
          }
        }
      }
    }
    return { awards, mocked: true };
  }
}

export async function computeAgencyPredictions(topN = 10): Promise<{
  predictions: AgencyPrediction[];
  mocked: boolean;
  fyQuarter: { fy: number; q: 1 | 2 | 3 | 4 };
}> {
  const { awards, mocked } = await fetchThreeYearAwards();
  const fyQuarter = currentFyQuarter();

  // Group by agency
  const byAgency = new Map<string, RawAward[]>();
  for (const a of awards) {
    if (!a.agency) continue;
    const list = byAgency.get(a.agency) || [];
    list.push(a);
    byAgency.set(a.agency, list);
  }

  // Rank by total amount to pick topN
  const agenciesRanked = Array.from(byAgency.entries())
    .map(([name, list]) => ({ name, total: list.reduce((s, x) => s + x.amount, 0), list }))
    .sort((a, b) => b.total - a.total)
    .slice(0, topN);

  const predictions: AgencyPrediction[] = agenciesRanked.map(({ name, list }) => {
    // Quarterly stats
    const qMap = new Map<string, QuarterStat>();
    const monthCounts = new Array(12).fill(0);
    for (const a of list) {
      const ref = a.actionDate || a.popStart;
      if (!ref) continue;
      const d = new Date(ref);
      if (isNaN(d.getTime())) continue;
      const fy = fyOfDate(d);
      const q = fyQuarterOfDate(d);
      const key = `${fy}-${q}`;
      const existing = qMap.get(key) || { fy, q, awardCount: 0, amount: 0 };
      existing.awardCount += 1;
      existing.amount += a.amount;
      qMap.set(key, existing);
      monthCounts[d.getUTCMonth()] += 1;
    }
    const historical = Array.from(qMap.values()).sort(
      (a, b) => a.fy - b.fy || a.q - b.q
    );

    // Same-quarter history (e.g., only Q3s) for more apples-to-apples forecast
    const sameQuarter = historical.filter((h) => h.q === fyQuarter.q);
    const countsForForecast = sameQuarter.length >= 2
      ? sameQuarter.map((h) => h.awardCount)
      : historical.map((h) => h.awardCount);
    const amountsForForecast = sameQuarter.length >= 2
      ? sameQuarter.map((h) => h.amount)
      : historical.map((h) => h.amount);

    const avgCount = mean(countsForForecast);
    const sdCount = stdev(countsForForecast);
    const avgAmount = mean(amountsForForecast);
    const expectedCountLow = Math.max(0, Math.round(avgCount - sdCount));
    const expectedCountHigh = Math.round(avgCount + sdCount);

    // Dominant NAICS
    const naicsMap = new Map<string, { count: number; label?: string }>();
    for (const a of list) {
      if (!a.naics) continue;
      const entry = naicsMap.get(a.naics) || { count: 0, label: a.naicsDesc };
      entry.count += 1;
      if (!entry.label && a.naicsDesc) entry.label = a.naicsDesc;
      naicsMap.set(a.naics, entry);
    }
    const dominantNaics = Array.from(naicsMap.entries())
      .map(([code, v]) => ({ code, label: v.label, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Typical months (top 3)
    const typicalMonths = monthCounts
      .map((c, i) => ({ m: MONTH_NAMES[i], c }))
      .sort((a, b) => b.c - a.c)
      .slice(0, 3)
      .filter((x) => x.c > 0)
      .map((x) => x.m);

    // Incumbent expirations inside this/next quarter
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 180 * 24 * 3600 * 1000);
    const incumbentExpirations = list
      .filter((a) => {
        if (!a.popEnd) return false;
        const d = new Date(a.popEnd);
        return d >= now && d <= windowEnd;
      })
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 5)
      .map((a) => ({ recipient: a.recipient, amount: a.amount, popEnd: a.popEnd! }));

    const topNaicsLabel = dominantNaics[0]?.label || dominantNaics[0]?.code || "IT & services";
    const monthsLabel = typicalMonths.slice(0, 2).join("/") || "this quarter";
    const recommendation =
      incumbentExpirations.length > 0
        ? `Watch for re-compete solicitations in ${monthsLabel}; ${incumbentExpirations.length} incumbent POP end${incumbentExpirations.length === 1 ? "s" : ""} in the next 180 days.`
        : `Monitor ${topNaicsLabel} solicitations in ${monthsLabel}.`;

    return {
      agency: name,
      historical,
      avgCountPerQuarter: Number(avgCount.toFixed(1)),
      stdevCount: Number(sdCount.toFixed(1)),
      avgAmountPerQuarter: Math.round(avgAmount),
      expectedCountLow,
      expectedCountHigh,
      expectedAmount: Math.round(avgAmount),
      dominantNaics,
      typicalMonths,
      incumbentExpirations,
      recommendation,
      mocked,
    } satisfies AgencyPrediction;
  });

  return { predictions, mocked, fyQuarter };
}

// ---------- Claude narrative helper ----------
const narrativeCache = new Map<string, string>();

export async function generateAgencyNarrative(p: AgencyPrediction): Promise<string | undefined> {
  if (!hasAnthropic()) return undefined;
  const key = `${p.agency}:${p.expectedCountLow}-${p.expectedCountHigh}:${p.dominantNaics.map((n) => n.code).join(",")}`;
  const cached = narrativeCache.get(key);
  if (cached) return cached;

  try {
    const msg = await getClient().messages.create({
      model: MODEL,
      max_tokens: 120,
      system:
        "You write concise, analyst-grade forecasts for federal contracting. Output exactly 2 sentences, no preamble, no lists.",
      messages: [
        {
          role: "user",
          content: `Agency: ${p.agency}. Forecast SDVOSB awards this quarter: ${p.expectedCountLow}-${p.expectedCountHigh} awards (~$${Math.round(
            p.expectedAmount / 1_000_000
          )}M). Dominant NAICS: ${p.dominantNaics
            .map((n) => `${n.code} ${n.label || ""}`)
            .join("; ")}. Typical months: ${p.typicalMonths.join(
            ", "
          )}. Incumbent expirations in 180d: ${p.incumbentExpirations.length}. Write 2 sentences synthesizing the signal for a SDVOSB operator.`,
        },
      ],
    });
    const textBlock = msg.content.find((b) => b.type === "text") as
      | { type: "text"; text: string }
      | undefined;
    const text = textBlock?.text?.trim();
    if (text) narrativeCache.set(key, text);
    return text;
  } catch (err) {
    console.warn("[predictions] narrative failed:", (err as Error).message);
    return undefined;
  }
}
