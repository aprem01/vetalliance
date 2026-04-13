/**
 * USASpending.gov API client (no API key required).
 * Docs: https://api.usaspending.gov/
 *
 * All helpers fall back to seed data on error so the UI never crashes.
 */
import { AGENCIES as SEED_AGENCIES } from "@/lib/seed/agencies";
import { OPPORTUNITIES as SEED_OPPS } from "@/lib/seed/opportunities";

export const USASPENDING_API_BASE = "https://api.usaspending.gov/api/v2";

const SDVOSB_CODES = ["SDVOSBC", "SDVOSBS", "VSA", "VSS"];
const CONTRACT_AWARD_TYPES = ["A", "B", "C", "D"]; // Definitive contracts + IDV types

/** Return ISO date strings for the current federal fiscal year (Oct 1 – Sep 30). */
function currentFiscalYear(date = new Date()): { start: string; end: string; fy: number } {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth(); // 0-based
  // FY starts Oct 1. If we're in Oct/Nov/Dec, FY = calendar year + 1.
  const fy = m >= 9 ? y + 1 : y;
  return {
    start: `${fy - 1}-10-01`,
    end: `${fy}-09-30`,
    fy,
  };
}

function priorFiscalYear(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const fy = m >= 9 ? y + 1 : y;
  const priorFy = fy - 1;
  return {
    start: `${priorFy - 1}-10-01`,
    end: `${priorFy}-09-30`,
    fy: priorFy,
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${USASPENDING_API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`USASpending ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// fetchTopSDVOSBAwardingAgencies
// ---------------------------------------------------------------------------
export interface TopAgencyRow {
  id: number | string;
  name: string;
  code?: string;
  amount: number;
}

export async function fetchTopSDVOSBAwardingAgencies(limit = 15): Promise<{
  rows: TopAgencyRow[];
  mocked: boolean;
}> {
  const fy = currentFiscalYear();
  try {
    const data = await post<{ results: Array<{ id: number; name: string; code?: string; amount: number }> }>(
      "/search/spending_by_category/awarding_agency/",
      {
        filters: {
          time_period: [{ start_date: fy.start, end_date: fy.end }],
          set_aside_type_codes: SDVOSB_CODES,
          award_type_codes: CONTRACT_AWARD_TYPES,
        },
        limit,
        page: 1,
      }
    );
    return {
      rows: (data.results || []).map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        amount: Number(r.amount) || 0,
      })),
      mocked: false,
    };
  } catch (err) {
    console.warn("[usaspending] fetchTopSDVOSBAwardingAgencies fell back to seed:", (err as Error).message);
    return {
      rows: SEED_AGENCIES.slice(0, limit).map((a) => ({
        id: a.id,
        name: a.name,
        code: a.abbr,
        amount: Math.round(a.totalObligations * (a.sdvosbActual / 100)),
      })),
      mocked: true,
    };
  }
}

// ---------------------------------------------------------------------------
// fetchRecentSDVOSBAwards
// ---------------------------------------------------------------------------
export interface RecentAward {
  id: string;
  recipient: string;
  agency: string;
  subAgency?: string;
  amount: number;
  naics: string;
  naicsDescription?: string;
  popStart?: string;
  popEnd?: string;
  setAside?: string;
  description?: string;
}

export async function fetchRecentSDVOSBAwards(limit = 50): Promise<{
  awards: RecentAward[];
  mocked: boolean;
}> {
  const fy = currentFiscalYear();
  try {
    const data = await post<{
      results: Array<Record<string, unknown>>;
    }>("/search/spending_by_award/", {
      filters: {
        time_period: [{ start_date: fy.start, end_date: fy.end }],
        set_aside_type_codes: SDVOSB_CODES,
        award_type_codes: CONTRACT_AWARD_TYPES,
      },
      fields: [
        "Award ID",
        "Recipient Name",
        "Awarding Agency",
        "Awarding Sub Agency",
        "Award Amount",
        "NAICS",
        "naics_description",
        "Period of Performance Start Date",
        "Period of Performance Current End Date",
        "Description",
        "type_set_aside",
      ],
      sort: "Award Amount",
      order: "desc",
      limit,
      page: 1,
    });
    const awards: RecentAward[] = (data.results || []).map((r) => ({
      id: String(r["Award ID"] ?? r["generated_internal_id"] ?? cryptoRandom()),
      recipient: String(r["Recipient Name"] ?? "Unknown Recipient"),
      agency: String(r["Awarding Agency"] ?? "Unknown Agency"),
      subAgency: r["Awarding Sub Agency"] ? String(r["Awarding Sub Agency"]) : undefined,
      amount: Number(r["Award Amount"]) || 0,
      naics: String(r["NAICS"] ?? ""),
      naicsDescription: r["naics_description"] ? String(r["naics_description"]) : undefined,
      popStart: r["Period of Performance Start Date"] ? String(r["Period of Performance Start Date"]) : undefined,
      popEnd: r["Period of Performance Current End Date"] ? String(r["Period of Performance Current End Date"]) : undefined,
      setAside: r["type_set_aside"] ? String(r["type_set_aside"]) : undefined,
      description: r["Description"] ? String(r["Description"]) : undefined,
    }));
    return { awards, mocked: false };
  } catch (err) {
    console.warn("[usaspending] fetchRecentSDVOSBAwards fell back to seed:", (err as Error).message);
    const awards: RecentAward[] = SEED_OPPS.filter((o) => o.incumbent)
      .slice(0, limit)
      .map((o) => ({
        id: o.id,
        recipient: o.incumbent || "Unknown",
        agency: o.agency,
        subAgency: o.subAgency,
        amount: o.valueHigh,
        naics: o.naics,
        naicsDescription: o.naicsDescription,
        popEnd: o.deadline,
        setAside: o.setAside,
        description: o.description,
      }));
    return { awards, mocked: true };
  }
}

// ---------------------------------------------------------------------------
// fetchAwardYearTotals
// ---------------------------------------------------------------------------
export interface AwardYearTotals {
  ytdFy: number;
  ytdTotal: number;
  priorFy: number;
  priorTotal: number;
  mocked: boolean;
}

async function sumAwardsForPeriod(start: string, end: string): Promise<number> {
  const data = await post<{ results: Array<{ amount: number }> }>(
    "/search/spending_by_category/awarding_agency/",
    {
      filters: {
        time_period: [{ start_date: start, end_date: end }],
        set_aside_type_codes: SDVOSB_CODES,
        award_type_codes: CONTRACT_AWARD_TYPES,
      },
      limit: 100,
      page: 1,
    }
  );
  return (data.results || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}

export async function fetchAwardYearTotals(): Promise<AwardYearTotals> {
  const cur = currentFiscalYear();
  const prior = priorFiscalYear();
  try {
    const [ytd, priorTotal] = await Promise.all([
      sumAwardsForPeriod(cur.start, cur.end),
      sumAwardsForPeriod(prior.start, prior.end),
    ]);
    return {
      ytdFy: cur.fy,
      ytdTotal: ytd,
      priorFy: prior.fy,
      priorTotal,
      mocked: false,
    };
  } catch (err) {
    console.warn("[usaspending] fetchAwardYearTotals fell back to seed:", (err as Error).message);
    const sdvosbTotal = SEED_AGENCIES.reduce(
      (s, a) => s + a.totalObligations * (a.sdvosbActual / 100),
      0
    );
    return {
      ytdFy: cur.fy,
      ytdTotal: Math.round(sdvosbTotal * 0.55),
      priorFy: prior.fy,
      priorTotal: Math.round(sdvosbTotal),
      mocked: true,
    };
  }
}

// ---------------------------------------------------------------------------
// fetchSpendingByAgency — total (all set-asides) for a given agency, current FY.
// Used as the denominator for mandate utilization.
// ---------------------------------------------------------------------------
export interface AgencySpending {
  agency: string;
  total: number;
  mocked: boolean;
}

export async function fetchSpendingByAgency(agencyName: string): Promise<AgencySpending> {
  const fy = currentFiscalYear();
  try {
    const data = await post<{ results: Array<{ name: string; amount: number }> }>(
      "/search/spending_by_category/awarding_agency/",
      {
        filters: {
          time_period: [{ start_date: fy.start, end_date: fy.end }],
          award_type_codes: CONTRACT_AWARD_TYPES,
          agencies: [
            { type: "awarding", tier: "toptier", name: agencyName },
          ],
        },
        limit: 5,
        page: 1,
      }
    );
    const row =
      (data.results || []).find(
        (r) => r.name?.toLowerCase() === agencyName.toLowerCase()
      ) || (data.results || [])[0];
    return {
      agency: agencyName,
      total: row ? Number(row.amount) || 0 : 0,
      mocked: false,
    };
  } catch (err) {
    console.warn(
      `[usaspending] fetchSpendingByAgency(${agencyName}) fell back to seed:`,
      (err as Error).message
    );
    const seed = SEED_AGENCIES.find(
      (a) =>
        a.name.toLowerCase() === agencyName.toLowerCase() ||
        a.abbr.toLowerCase() === agencyName.toLowerCase()
    );
    return {
      agency: agencyName,
      total: seed ? seed.totalObligations : 0,
      mocked: true,
    };
  }
}

// ---------------------------------------------------------------------------
// Aggregate helper: combine top SDVOSB awards per agency with their total
// federal obligations to compute mandate utilization.
// Uses one category call + N agency totals — bounded by `limit`.
// ---------------------------------------------------------------------------
export interface AgencyMandateRow {
  id: string | number;
  name: string;
  abbr: string;
  sdvosbAwards: number;
  totalAwards: number;
  actualPct: number;
  mandatePct: number;
  onTrack: boolean;
  mocked: boolean;
}

export async function fetchAgencyMandateRows(limit = 15): Promise<{
  rows: AgencyMandateRow[];
  mocked: boolean;
}> {
  const top = await fetchTopSDVOSBAwardingAgencies(limit);
  if (top.mocked) {
    // Seed mode — zip with seed agencies so UI matches the pre-wire look.
    const rows: AgencyMandateRow[] = SEED_AGENCIES.slice(0, limit).map((a) => ({
      id: a.id,
      name: a.name,
      abbr: a.abbr,
      sdvosbAwards: Math.round(a.totalObligations * (a.sdvosbActual / 100)),
      totalAwards: a.totalObligations,
      actualPct: a.sdvosbActual,
      mandatePct: a.sdvosbMandate,
      onTrack: a.onTrack,
      mocked: true,
    }));
    return { rows, mocked: true };
  }

  // For each top agency, fetch its total obligations in parallel.
  const totals = await Promise.all(
    top.rows.map((r) => fetchSpendingByAgency(r.name).catch(() => null))
  );
  const rows: AgencyMandateRow[] = top.rows.map((r, i) => {
    const total = totals[i]?.total || 0;
    const actualPct = total > 0 ? (r.amount / total) * 100 : 0;
    const seed = SEED_AGENCIES.find(
      (a) => a.name.toLowerCase() === r.name.toLowerCase() || a.abbr.toLowerCase() === (r.code || "").toLowerCase()
    );
    const mandatePct = seed?.sdvosbMandate ?? 3; // SBA government-wide default
    return {
      id: r.id,
      name: r.name,
      abbr: seed?.abbr || deriveAbbr(r.name),
      sdvosbAwards: r.amount,
      totalAwards: total,
      actualPct: Number(actualPct.toFixed(2)),
      mandatePct,
      onTrack: actualPct >= mandatePct,
      mocked: false,
    };
  });
  return { rows, mocked: false };
}

function deriveAbbr(name: string): string {
  const cleaned = name.replace(/^Department of\s+/i, "").replace(/^U\.?S\.?\s+/i, "");
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 5);
}

function cryptoRandom(): string {
  return Math.random().toString(36).slice(2, 10);
}
