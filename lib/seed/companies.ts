import type { Company } from "../types";

const NAMES = [
  "Arlington Defense Solutions LLC", "Patriot Cyber Group", "Liberty Federal Services", "Valor Systems Inc",
  "Sentinel Strategic Group", "Freedom Logistics Partners", "Eagle Crest Technologies", "Minuteman Engineering",
  "Semper Digital LLC", "Bravo Federal Consulting", "Anchor Point Solutions", "Pathfinder Federal LLC",
  "Gallant Shield Security", "Rally Point Systems", "Ironclad Federal Group", "Tidewater Defense Works",
  "Summit Vet Consulting", "Blackhawk Intel Services", "Meridian Vet Construction", "Keystone Ops Group",
  "Trident Federal Inc", "Granite Peak IT", "Stars and Stripes Tech", "Checkpoint Federal Services",
  "Ridgeline Cyber", "Bulwark Defense LLC", "Old Glory Consulting", "Veterans Analytics Corp",
  "Citadel Federal Group", "First Watch Solutions", "Longbow IT Services", "Dogtag Digital",
  "Honor Guard Engineering", "Battle Ready Cloud", "Steadfast Federal LLC", "Rangers Federal Group",
  "Forward Deployed Solutions", "Outpost Analytics", "Command Post Consulting", "Redline Cyber Group",
  "Echo Delta Federal", "November Oscar Systems", "Yankee Federal IT", "Foxtrot Logistics",
  "Kilo Federal Solutions", "Juliet Vet Group", "Tango Federal Services", "Zulu Cyber LLC",
  "Sierra Vet Consulting", "Bravo Tango Engineering",
];

const STATES = ["VA", "MD", "DC", "TX", "CA", "FL", "GA", "AL", "CO", "OH", "WA", "NC", "PA", "NY", "MA"];
const NAICS_POOL = ["541512", "541511", "541611", "541330", "561210", "236220", "561720", "561612", "541715", "541614"];
const CAP_POOL = [
  "Cloud Migration", "Cybersecurity", "DevSecOps", "Data Analytics", "AI/ML", "Network Engineering",
  "Construction Management", "Facilities O&M", "Medical Staffing", "Training & Simulation",
  "Logistics", "Supply Chain", "Program Management", "Systems Engineering", "Health IT",
];
const CERT_POOL = ["SDVOSB", "VOSB", "8(a)", "ISO 9001", "CMMI Level 3", "FedRAMP Moderate", "CMMC Level 2", "TS/SCI"];

function pad(n: number, w = 4) { return String(n).padStart(w, "0"); }
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function generate(): Company[] {
  const rand = mulberry32(7);
  return NAMES.map((name, i) => {
    const roleRoll = rand();
    const role: Company["role"] = roleRoll < 0.7 ? "SDVOSB" : "VOSB";
    const uei = Array.from({ length: 12 }, () => "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"[Math.floor(rand() * 32)]).join("");
    const cage = pad(Math.floor(rand() * 99999), 5);
    const revenueBase = [1_200_000, 3_400_000, 7_800_000, 12_500_000, 24_000_000][Math.floor(rand() * 5)];
    return {
      id: `co-${pad(i + 1)}`,
      name,
      role,
      uei,
      cage,
      naics: pick(rand, NAICS_POOL, 2 + Math.floor(rand() * 3)),
      certifications: [role, ...pick(rand, CERT_POOL.filter(c => c !== role), 1 + Math.floor(rand() * 3))],
      pastPerformance: 3 + Math.floor(rand() * 42),
      revenue: `$${(revenueBase / 1_000_000).toFixed(1)}M`,
      employees: 8 + Math.floor(rand() * 180),
      state: STATES[Math.floor(rand() * STATES.length)],
      capabilities: pick(rand, CAP_POOL, 3 + Math.floor(rand() * 3)),
      bio: `${name} is a ${role} providing ${pick(rand, CAP_POOL, 2).join(" and ").toLowerCase()} services to federal agencies. Founded by combat veterans with deep mission experience.`,
    };
  });
}

export const COMPANIES: Company[] = generate();
