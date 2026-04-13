/**
 * SAM.gov Entity Management API client.
 *
 * Docs: https://open.gsa.gov/api/entity-api/
 * Endpoint: https://api.sam.gov/entity-information/v3/entities
 *
 * We use this as the source of truth for "verified SDVOSB / VOSB / 8(a) /
 * HUBZone / WOSB" status. CVE was absorbed into SBA VetCert in 2023 and
 * there's no public bulk verification API — but an entity's SAM.gov
 * registration exposes its certified business types, which is what
 * federal contracting officers actually rely on.
 *
 * Business-type codes used below (per SAM.gov "Entity Management Data Dictionary"):
 *   A5  Service-Disabled Veteran Owned Small Business (SDVOSB)
 *   QF  Veteran Owned Business / VOSB
 *   27  Self-Certified Small Disadvantaged Business (8(a)-adjacent pool)
 *   8A  8(a) Program Participant
 *   XX  HUBZone Certified
 *   A2  Woman-Owned Small Business (WOSB)
 *   A4  Economically Disadvantaged WOSB (EDWOSB)
 *   23  Minority Owned Business
 *
 * The exact codebook can shift; we check several common representations
 * (both codes and display names) to be resilient.
 */
import type { VerifiedEntity, VerifiedEntityPOC } from "@/lib/types";

export const SAM_ENTITY_API_BASE =
  "https://api.sam.gov/entity-information/v3/entities";

const SDVOSB_CODES = new Set(["A5"]);
const VOSB_CODES = new Set(["QF", "A5"]); // SDVOSB implies VOSB
const EIGHT_A_CODES = new Set(["8A", "27", "A6"]);
const HUBZONE_CODES = new Set(["XX", "HZ"]);
const WOSB_CODES = new Set(["A2", "A4", "27"]);

function matchesName(names: string[], needles: string[]): boolean {
  const lc = names.map((n) => n.toLowerCase());
  return needles.some((needle) => lc.some((n) => n.includes(needle)));
}

interface SamEntityRaw {
  entityRegistration?: {
    ueiSAM?: string;
    cageCode?: string;
    legalBusinessName?: string;
    registrationStatus?: string;
    registrationExpirationDate?: string;
  };
  coreData?: {
    physicalAddress?: {
      addressLine1?: string;
      city?: string;
      stateOrProvinceCode?: string;
      zipCode?: string;
      countryCode?: string;
    };
    generalInformation?: {
      entityStructureCode?: string;
    };
  };
  assertions?: {
    goodsAndServices?: {
      primaryNaics?: string;
      naicsList?: Array<{ naicsCode?: string; primaryNaics?: string | boolean }>;
    };
    disasterReliefData?: unknown;
  };
  pointsOfContact?: {
    governmentBusinessPOC?: {
      firstName?: string;
      lastName?: string;
      title?: string;
      email?: string;
      usPhone?: string;
    };
    electronicBusinessPOC?: {
      firstName?: string;
      lastName?: string;
      title?: string;
      email?: string;
      usPhone?: string;
    };
  };
  // Business types can live in a few places depending on API version.
  businessTypes?: {
    businessTypeList?: Array<{ businessTypeCode?: string; businessTypeDesc?: string }>;
    sbaBusinessTypeList?: Array<{ sbaBusinessTypeCode?: string; sbaBusinessTypeDesc?: string }>;
  };
}

function extractBusinessTypes(raw: SamEntityRaw): {
  codes: string[];
  names: string[];
} {
  const codes: string[] = [];
  const names: string[] = [];
  const bt = raw.businessTypes;
  if (bt?.businessTypeList) {
    for (const item of bt.businessTypeList) {
      if (item.businessTypeCode) codes.push(String(item.businessTypeCode).toUpperCase());
      if (item.businessTypeDesc) names.push(String(item.businessTypeDesc));
    }
  }
  if (bt?.sbaBusinessTypeList) {
    for (const item of bt.sbaBusinessTypeList) {
      if (item.sbaBusinessTypeCode) codes.push(String(item.sbaBusinessTypeCode).toUpperCase());
      if (item.sbaBusinessTypeDesc) names.push(String(item.sbaBusinessTypeDesc));
    }
  }
  return { codes, names };
}

function normalize(raw: SamEntityRaw): VerifiedEntity | null {
  const reg = raw.entityRegistration;
  if (!reg?.ueiSAM && !reg?.cageCode) return null;

  const { codes, names } = extractBusinessTypes(raw);

  const isSDVOSB =
    codes.some((c) => SDVOSB_CODES.has(c)) ||
    matchesName(names, ["service-disabled veteran", "service disabled veteran", "sdvosb"]);
  const isVOSB =
    codes.some((c) => VOSB_CODES.has(c)) ||
    matchesName(names, ["veteran owned", "veteran-owned", "vosb"]);
  const isEightA =
    codes.some((c) => EIGHT_A_CODES.has(c)) ||
    matchesName(names, ["8(a)", "8a program", "small disadvantaged"]);
  const isHUBZone =
    codes.some((c) => HUBZONE_CODES.has(c)) ||
    matchesName(names, ["hubzone", "hub zone"]);
  const isWOSB =
    codes.some((c) => WOSB_CODES.has(c)) ||
    matchesName(names, ["women owned", "woman owned", "women-owned", "wosb", "edwosb"]);

  const naicsListRaw = raw.assertions?.goodsAndServices?.naicsList ?? [];
  const naicsCodes = naicsListRaw
    .map((n) => (n?.naicsCode ? String(n.naicsCode) : ""))
    .filter(Boolean);
  const primaryNaics =
    raw.assertions?.goodsAndServices?.primaryNaics ||
    naicsListRaw.find((n) => n?.primaryNaics === "Y" || n?.primaryNaics === true)?.naicsCode ||
    naicsCodes[0];

  const pocRaw =
    raw.pointsOfContact?.governmentBusinessPOC ||
    raw.pointsOfContact?.electronicBusinessPOC;
  const poc: VerifiedEntityPOC | undefined = pocRaw
    ? {
        firstName: pocRaw.firstName,
        lastName: pocRaw.lastName,
        title: pocRaw.title,
        email: pocRaw.email,
        phone: pocRaw.usPhone,
      }
    : undefined;

  const addr = raw.coreData?.physicalAddress;

  return {
    uei: reg.ueiSAM || "",
    cage: reg.cageCode,
    legalBusinessName: reg.legalBusinessName || "Unknown Entity",
    physicalAddress: addr
      ? {
          line1: addr.addressLine1,
          city: addr.city,
          state: addr.stateOrProvinceCode,
          zip: addr.zipCode,
          country: addr.countryCode,
        }
      : undefined,
    registrationStatus: reg.registrationStatus || "Unknown",
    registrationExpirationDate: reg.registrationExpirationDate,
    naicsCodes,
    primaryNaics: primaryNaics ? String(primaryNaics) : undefined,
    businessTypeCodes: codes,
    isSDVOSB,
    isVOSB,
    isEightA,
    isHUBZone,
    isWOSB,
    poc,
    source: "sam.gov",
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchEntity(params: Record<string, string>): Promise<VerifiedEntity | null> {
  const apiKey = process.env.SAM_GOV_API_KEY;
  if (!apiKey) return null;

  const url = new URL(SAM_ENTITY_API_BASE);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set(
    "includeSections",
    "entityRegistration,coreData,assertions,pointsOfContact"
  );
  url.searchParams.set("samRegistered", "Yes");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) {
      console.warn(`[sam-entity] ${res.status} ${res.statusText}`);
      return null;
    }
    const json = await res.json();
    const entity = json?.entityData?.[0] || json?.entity?.[0] || json?.entityData || null;
    if (!entity) return null;
    // entityData can be an array or single object depending on query.
    const first = Array.isArray(entity) ? entity[0] : entity;
    return normalize(first as SamEntityRaw);
  } catch (err) {
    console.warn("[sam-entity] fetch failed:", (err as Error).message);
    return null;
  }
}

export async function fetchEntityByUEI(uei: string): Promise<VerifiedEntity | null> {
  const clean = (uei || "").trim().toUpperCase();
  if (!clean) return null;
  return fetchEntity({ ueiSAM: clean });
}

export async function fetchEntityByCAGE(cage: string): Promise<VerifiedEntity | null> {
  const clean = (cage || "").trim().toUpperCase();
  if (!clean) return null;
  return fetchEntity({ cageCode: clean });
}
