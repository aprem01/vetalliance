/**
 * Set-Aside Leakage analytics.
 * Measures how much SDVOSB prime award $ leaks back out via subcontracts.
 *
 * Strategy:
 *  1. Try subaward endpoint for real leakage numbers.
 *  2. Fall back to a modeled heuristic: ~37.5% subcontracted, ~60% of that
 *     leaves SDVOSB hands. Label clearly as modeled.
 */
import { USASPENDING_API_BASE, fetchAwardYearTotals } from "@/lib/external/usaspending";

const SDVOSB_CODES = ["SDVOSBC", "SDVOSBS", "VSA", "VSS"];
const CONTRACT_AWARD_TYPES = ["A", "B", "C", "D"];

// Heuristic constants (documented in UI).
const HEURISTIC_SUBCONTRACT_RATE = 0.375;
const HEURISTIC_NON_SDVOSB_RATE = 0.6;

export interface LeakageBreakdown {
  totalPrime: number;
  retained: number;
  leakedLarge: number;
  leakedOther: number;
  totalLeaked: number;
  leakageRate: number; // 0..1
  measurement: "measured" | "modeled";
  fy: number;
  priorFy: number;
  priorTotal: number;
}

export interface TopLeakagePrime {
  name: string;
  primeAwards: number;
  subcontracted?: number;
  leakagePct?: number; // 0..1
  note?: string;
}

export interface LeakageReport {
  breakdown: LeakageBreakdown;
  topPrimes: TopLeakagePrime[];
  subawardEndpointWorked: boolean;
  primesFromPrimeVolumeOnly: boolean;
  mocked: boolean;
}

function fy(date = new Date()): { fy: number; start: string; end: string } {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const curFy = m >= 9 ? y + 1 : y;
  return {
    fy: curFy,
    start: `${curFy - 1}-10-01`,
    end: `${curFy}-09-30`,
  };
}

async function fetchTopSDVOSBPrimes(limit = 10): Promise<{
  rows: Array<{ name: string; amount: number }>;
  ok: boolean;
}> {
  const { start, end } = fy();
  try {
    const res = await fetch(
      `${USASPENDING_API_BASE}/search/spending_by_category/recipient/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: {
            time_period: [{ start_date: start, end_date: end }],
            set_aside_type_codes: SDVOSB_CODES,
            award_type_codes: CONTRACT_AWARD_TYPES,
          },
          limit,
          page: 1,
        }),
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) throw new Error(`primes ${res.status}`);
    const json = (await res.json()) as {
      results: Array<{ name: string; amount: number }>;
    };
    return {
      rows: (json.results || []).map((r) => ({
        name: r.name,
        amount: Number(r.amount) || 0,
      })),
      ok: true,
    };
  } catch (err) {
    console.warn("[leakage] fetchTopSDVOSBPrimes fallback:", (err as Error).message);
    return { rows: [], ok: false };
  }
}

async function trySubawardLeakage(primeNames: string[]): Promise<{
  worked: boolean;
  byPrime: Map<string, number>;
  totalSub: number;
  totalNonSdvosbSub: number;
}> {
  // Try the subaward search endpoint. Per USASpending: POST /search/spending_by_subaward/
  // Schema can vary; we treat any 200 JSON with results[] as a success.
  const { start, end } = fy();
  const byPrime = new Map<string, number>();
  let totalSub = 0;
  let totalNonSdvosbSub = 0;
  let worked = false;

  try {
    const res = await fetch(
      `${USASPENDING_API_BASE}/search/spending_by_subaward/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: {
            time_period: [{ start_date: start, end_date: end }],
            prime_award_type_codes: CONTRACT_AWARD_TYPES,
            set_aside_type_codes: SDVOSB_CODES,
          },
          fields: [
            "Sub-Award Amount",
            "Prime Recipient Name",
            "Sub-Recipient Name",
            "Sub-Award Type",
          ],
          sort: "Sub-Award Amount",
          order: "desc",
          limit: 100,
          page: 1,
        }),
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) throw new Error(`sub ${res.status}`);
    const json = (await res.json()) as {
      results?: Array<Record<string, unknown>>;
    };
    if (!json.results) throw new Error("no results field");
    worked = true;
    for (const r of json.results) {
      const amt = Number(r["Sub-Award Amount"]) || 0;
      const prime = String(r["Prime Recipient Name"] ?? "Unknown");
      totalSub += amt;
      byPrime.set(prime, (byPrime.get(prime) || 0) + amt);
      // We don't know sub recipient business type here; assume ~HEURISTIC_NON_SDVOSB_RATE.
      totalNonSdvosbSub += amt * HEURISTIC_NON_SDVOSB_RATE;
    }
  } catch (err) {
    console.warn("[leakage] subaward endpoint unavailable:", (err as Error).message);
    worked = false;
  }
  return { worked, byPrime, totalSub, totalNonSdvosbSub };
}

export async function computeLeakageReport(): Promise<LeakageReport> {
  const totals = await fetchAwardYearTotals();
  const totalPrime = totals.ytdTotal;

  const primes = await fetchTopSDVOSBPrimes(10);
  const sub = await trySubawardLeakage(primes.rows.map((r) => r.name));

  let breakdown: LeakageBreakdown;
  let topPrimes: TopLeakagePrime[];

  if (sub.worked && sub.totalSub > 0) {
    const leakedLarge = sub.totalNonSdvosbSub;
    const leakedOther = Math.max(0, sub.totalSub - leakedLarge);
    const retained = Math.max(0, totalPrime - leakedLarge);
    breakdown = {
      totalPrime,
      retained,
      leakedLarge,
      leakedOther,
      totalLeaked: leakedLarge,
      leakageRate: totalPrime > 0 ? leakedLarge / totalPrime : 0,
      measurement: "measured",
      fy: totals.ytdFy,
      priorFy: totals.priorFy,
      priorTotal: totals.priorTotal,
    };
    topPrimes = Array.from(sub.byPrime.entries())
      .map(([name, subAmt]) => {
        const primeAwards =
          primes.rows.find((p) => p.name === name)?.amount || subAmt * 2.7;
        const leakagePct =
          primeAwards > 0 ? Math.min(1, (subAmt * HEURISTIC_NON_SDVOSB_RATE) / primeAwards) : 0;
        return { name, primeAwards, subcontracted: subAmt, leakagePct };
      })
      .sort((a, b) => (b.leakagePct || 0) - (a.leakagePct || 0))
      .slice(0, 10);
    return {
      breakdown,
      topPrimes,
      subawardEndpointWorked: true,
      primesFromPrimeVolumeOnly: false,
      mocked: totals.mocked,
    };
  }

  // Heuristic fallback
  const modeledSub = totalPrime * HEURISTIC_SUBCONTRACT_RATE;
  const leakedLarge = modeledSub * HEURISTIC_NON_SDVOSB_RATE;
  const leakedOther = modeledSub * (1 - HEURISTIC_NON_SDVOSB_RATE) * 0.3;
  const retained = Math.max(0, totalPrime - leakedLarge);
  breakdown = {
    totalPrime,
    retained,
    leakedLarge,
    leakedOther,
    totalLeaked: leakedLarge,
    leakageRate: totalPrime > 0 ? leakedLarge / totalPrime : 0,
    measurement: "modeled",
    fy: totals.ytdFy,
    priorFy: totals.priorFy,
    priorTotal: totals.priorTotal,
  };
  topPrimes = primes.rows.slice(0, 10).map((r) => ({
    name: r.name,
    primeAwards: r.amount,
    note: "Subaward visibility limited — ranked by SDVOSB prime award volume.",
  }));
  return {
    breakdown,
    topPrimes,
    subawardEndpointWorked: false,
    primesFromPrimeVolumeOnly: true,
    mocked: totals.mocked || !primes.ok,
  };
}
