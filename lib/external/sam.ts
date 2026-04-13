/**
 * SAM.gov Opportunities API client.
 * Docs: https://open.gsa.gov/api/get-opportunities-public-api/
 * Register for an API key: https://sam.gov/content/api
 *
 * If SAM_GOV_API_KEY is unset, returns seed data with mocked: true.
 */
import type { Opportunity, SetAside } from "@/lib/types";
import { OPPORTUNITIES as SEED_OPPS } from "@/lib/seed/opportunities";

export const SAM_GOV_API_BASE = "https://api.sam.gov/opportunities/v2/search";

type SetAsideCode = "SDVOSBC" | "VSA";

const SET_ASIDE_MAP: Record<string, SetAside> = {
  SDVOSBC: "SDVOSB Set-Aside",
  SDVOSBS: "SDVOSB Set-Aside",
  VSA: "VOSB Set-Aside",
  VSS: "VOSB Set-Aside",
  "8A": "8(a)",
  WOSB: "WOSB",
  SBA: "Small Business",
};

export interface FetchOpportunitiesOptions {
  naics?: string;
  setAside?: SetAsideCode | SetAsideCode[];
  limit?: number;
  /** Days back from today to search. Default 30. SAM caps at 1 year. */
  daysBack?: number;
}

export interface FetchOpportunitiesResult {
  opportunities: Opportunity[];
  mocked: boolean;
  source: "sam.gov" | "seed";
}

function formatDate(d: Date): string {
  // SAM.gov expects MM/dd/yyyy
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/**
 * Fetch active opportunities from SAM.gov. If SAM_GOV_API_KEY is not set,
 * returns seed data flagged as mocked.
 */
export async function fetchActiveOpportunities(
  opts: FetchOpportunitiesOptions = {}
): Promise<FetchOpportunitiesResult> {
  const apiKey = process.env.SAM_GOV_API_KEY;
  const limit = opts.limit ?? 50;

  if (!apiKey) {
    return {
      opportunities: SEED_OPPS.slice(0, limit),
      mocked: true,
      source: "seed",
    };
  }

  const daysBack = opts.daysBack ?? 30;
  const to = new Date();
  const from = new Date(to.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const postedFrom = formatDate(from);
  const postedTo = formatDate(to);

  const setAsides: SetAsideCode[] = Array.isArray(opts.setAside)
    ? opts.setAside
    : opts.setAside
    ? [opts.setAside]
    : ["SDVOSBC", "VSA"];

  try {
    // SAM.gov accepts one typeOfSetAside at a time — run requests in parallel and merge.
    const perCallLimit = Math.max(10, Math.ceil(limit / setAsides.length));
    const responses = await Promise.all(
      setAsides.map(async (code) => {
        const url = new URL(SAM_GOV_API_BASE);
        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("postedFrom", postedFrom);
        url.searchParams.set("postedTo", postedTo);
        url.searchParams.set("limit", String(perCallLimit));
        url.searchParams.set("typeOfSetAside", code);
        if (opts.naics) url.searchParams.set("ncode", opts.naics);
        const res = await fetch(url.toString(), {
          next: { revalidate: 1800 },
        });
        if (!res.ok) {
          throw new Error(`SAM.gov ${code} failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
    );

    const merged: Opportunity[] = [];
    const seen = new Set<string>();
    for (const resp of responses) {
      const items: unknown[] = resp?.opportunitiesData || resp?.data || [];
      for (const raw of items) {
        const mapped = mapSamOpportunity(raw as Record<string, unknown>);
        if (!mapped) continue;
        if (seen.has(mapped.id)) continue;
        seen.add(mapped.id);
        merged.push(mapped);
        if (merged.length >= limit) break;
      }
      if (merged.length >= limit) break;
    }

    if (merged.length === 0) {
      // No live results — surface seed so UI isn't empty.
      return {
        opportunities: SEED_OPPS.slice(0, limit),
        mocked: true,
        source: "seed",
      };
    }

    return { opportunities: merged, mocked: false, source: "sam.gov" };
  } catch (err) {
    console.warn("[sam.gov] fetchActiveOpportunities fell back to seed:", (err as Error).message);
    return {
      opportunities: SEED_OPPS.slice(0, limit),
      mocked: true,
      source: "seed",
    };
  }
}

function mapSamOpportunity(raw: Record<string, unknown>): Opportunity | null {
  const noticeId = raw.noticeId ? String(raw.noticeId) : "";
  const solicitationNumber = raw.solicitationNumber
    ? String(raw.solicitationNumber)
    : noticeId;
  const title = raw.title ? String(raw.title) : "Untitled";
  if (!noticeId && !solicitationNumber) return null;

  const fullParentPath = raw.fullParentPathName ? String(raw.fullParentPathName) : "";
  const [agency, ...subParts] = fullParentPath.split(".").map((p) => p.trim());
  const subAgency = subParts.join(" / ") || undefined;

  const setAsideCode = raw.typeOfSetAside ? String(raw.typeOfSetAside).toUpperCase() : "";
  const setAside: SetAside = SET_ASIDE_MAP[setAsideCode] || "Full & Open";

  const naics = raw.naicsCode ? String(raw.naicsCode) : "";
  const award = raw.award as Record<string, unknown> | undefined;
  const amount = award?.amount ? Number(award.amount) : 0;

  const pop = raw.placeOfPerformance as Record<string, unknown> | undefined;
  const popCity = pop?.city && typeof pop.city === "object" ? (pop.city as Record<string, unknown>).name : undefined;
  const popState = pop?.state && typeof pop.state === "object" ? (pop.state as Record<string, unknown>).code : undefined;
  const location =
    popCity && popState
      ? `${popCity}, ${popState}`
      : popState
      ? String(popState)
      : "Multiple Locations";

  const deadlineRaw = raw.responseDeadLine ? String(raw.responseDeadLine) : "";
  const deadline = deadlineRaw ? deadlineRaw.slice(0, 10) : "";
  const postedRaw = raw.postedDate ? String(raw.postedDate) : "";
  const postedDate = postedRaw.slice(0, 10);

  const typeStr = raw.type ? String(raw.type).toLowerCase() : "";
  const status: Opportunity["status"] = typeStr.includes("sources sought")
    ? "Sources Sought"
    : typeStr.includes("presolicitation") || typeStr.includes("pre-solicitation")
    ? "Pre-Solicitation"
    : "Open";

  const description = raw.description ? String(raw.description).slice(0, 500) : `${title} — see SAM.gov for details.`;

  return {
    id: noticeId || solicitationNumber,
    title,
    agency: agency || "Unknown Agency",
    subAgency,
    setAside,
    naics,
    naicsDescription: raw.classificationCode ? String(raw.classificationCode) : "",
    valueLow: amount > 0 ? Math.round(amount * 0.75) : 0,
    valueHigh: amount,
    postedDate,
    deadline,
    location,
    solicitationNumber,
    description,
    aiScore: 0, // scored later by AI layer
    status,
  };
}
