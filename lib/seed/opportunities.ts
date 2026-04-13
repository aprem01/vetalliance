import type { Opportunity, SetAside } from "../types";

const AGENCIES = ["VA", "DoD", "GSA", "DHS", "HHS", "DOE", "DOJ", "NASA", "USAF", "DON", "USACE", "USDA", "DOT", "SSA", "DOS"];
const SUBS: Record<string, string[]> = {
  VA: ["Veterans Health Administration", "Veterans Benefits Administration", "National Cemetery Administration"],
  DoD: ["Defense Logistics Agency", "Defense Health Agency", "Missile Defense Agency"],
  GSA: ["Federal Acquisition Service", "Public Buildings Service"],
  DHS: ["TSA", "CBP", "FEMA", "USCIS"],
  HHS: ["CDC", "CMS", "FDA", "NIH"],
  DOE: ["NNSA", "EERE"],
  DOJ: ["FBI", "DEA", "ATF"],
  NASA: ["Goddard", "JPL", "Johnson Space Center"],
  USAF: ["AFMC", "AFSPC"],
  DON: ["NAVSEA", "NAVAIR", "NAVFAC"],
  USACE: ["South Atlantic Division", "Great Lakes Division"],
  USDA: ["APHIS", "Forest Service"],
  DOT: ["FAA", "FHWA", "FTA"],
  SSA: ["HQ Operations"],
  DOS: ["Bureau of Consular Affairs", "Bureau of Diplomatic Security"],
};

const TITLE_TEMPLATES: [string, string, SetAside][] = [
  ["IT Support Services", "541512", "SDVOSB Set-Aside"],
  ["Cybersecurity Assessment", "541512", "SDVOSB Set-Aside"],
  ["Cloud Migration Services", "541512", "VOSB Set-Aside"],
  ["Medical Staffing Services", "621112", "SDVOSB Set-Aside"],
  ["Facilities Maintenance", "561210", "SDVOSB Set-Aside"],
  ["HVAC Repair and Installation", "238220", "SDVOSB Set-Aside"],
  ["General Construction", "236220", "SDVOSB Set-Aside"],
  ["Roofing Replacement", "238160", "VOSB Set-Aside"],
  ["Janitorial Services", "561720", "SDVOSB Set-Aside"],
  ["Engineering Consulting", "541330", "SDVOSB Set-Aside"],
  ["Environmental Remediation", "562910", "SDVOSB Set-Aside"],
  ["Software Development", "541511", "SDVOSB Set-Aside"],
  ["Data Analytics Platform", "541511", "Small Business"],
  ["Logistics and Supply Chain", "541614", "SDVOSB Set-Aside"],
  ["Telecommunications Services", "517311", "SDVOSB Set-Aside"],
  ["Training and Learning Services", "611430", "VOSB Set-Aside"],
  ["Research and Development", "541715", "Full & Open"],
  ["Aviation Maintenance", "488190", "SDVOSB Set-Aside"],
  ["Armed Security Services", "561612", "SDVOSB Set-Aside"],
  ["Landscaping Services", "561730", "SDVOSB Set-Aside"],
  ["Prosthetics and Orthotics", "339113", "SDVOSB Set-Aside"],
  ["Pharmaceutical Supplies", "446110", "VOSB Set-Aside"],
  ["Legal Support Services", "541110", "SDVOSB Set-Aside"],
  ["Financial Advisory", "541611", "SDVOSB Set-Aside"],
  ["Management Consulting", "541611", "SDVOSB Set-Aside"],
];

const NAICS_DESC: Record<string, string> = {
  "541512": "Computer Systems Design Services",
  "541511": "Custom Computer Programming Services",
  "621112": "Offices of Physicians",
  "561210": "Facilities Support Services",
  "238220": "Plumbing, Heating, AC Contractors",
  "236220": "Commercial and Institutional Building Construction",
  "238160": "Roofing Contractors",
  "561720": "Janitorial Services",
  "541330": "Engineering Services",
  "562910": "Remediation Services",
  "541614": "Process, Physical Distribution Consulting",
  "517311": "Wired Telecommunications Carriers",
  "611430": "Professional and Management Development Training",
  "541715": "R&D in Physical, Engineering, Life Sciences",
  "488190": "Other Support Activities for Air Transportation",
  "561612": "Security Guards and Patrol Services",
  "561730": "Landscaping Services",
  "339113": "Surgical Appliance and Supplies Manufacturing",
  "446110": "Pharmacies and Drug Stores",
  "541110": "Offices of Lawyers",
  "541611": "Administrative Management and General Management Consulting",
};

const LOCATIONS = [
  "Washington, DC", "Arlington, VA", "Norfolk, VA", "San Diego, CA", "Colorado Springs, CO",
  "Huntsville, AL", "Fort Worth, TX", "Jacksonville, FL", "Atlanta, GA", "Dayton, OH",
  "Seattle, WA", "Albuquerque, NM", "Honolulu, HI", "Tampa, FL", "Aberdeen, MD",
  "Fort Belvoir, VA", "Bethesda, MD", "Kansas City, MO", "Nationwide", "Remote/CONUS",
];

const INCUMBENTS = [
  "Leidos", "Booz Allen Hamilton", "SAIC", "General Dynamics IT", "CACI International",
  "ManTech", "ECS Federal", "Accenture Federal", "Guidehouse", "Peraton", undefined, undefined,
];

function pad(n: number, w = 4) { return String(n).padStart(w, "0"); }

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateAddDays(from: Date, days: number): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function generate(): Opportunity[] {
  const rand = mulberry32(42);
  const opps: Opportunity[] = [];
  const now = new Date("2026-04-12");

  for (let i = 0; i < 100; i++) {
    const [base, naics, setAside] = TITLE_TEMPLATES[Math.floor(rand() * TITLE_TEMPLATES.length)];
    const agency = AGENCIES[Math.floor(rand() * AGENCIES.length)];
    const subOptions = SUBS[agency] || [];
    const subAgency = subOptions[Math.floor(rand() * subOptions.length)];
    const regionSuffix = [" — VA Region " + (Math.floor(rand() * 10) + 1), "", " — Phase II", " — IDIQ", " — BPA Call", " — Task Order"][Math.floor(rand() * 6)];
    const title = `${base}${regionSuffix}`;
    const valueLow = Math.round((0.25 + rand() * 10) * 1_000_000);
    const valueHigh = valueLow + Math.round(rand() * 40_000_000);
    const deadlineDays = 5 + Math.floor(rand() * 205); // 5 to 210 days out
    const deadline = dateAddDays(now, deadlineDays);
    const posted = dateAddDays(now, -Math.floor(rand() * 30));
    const location = LOCATIONS[Math.floor(rand() * LOCATIONS.length)];
    const aiScore = Math.floor(40 + rand() * 59);
    const incumbent = INCUMBENTS[Math.floor(rand() * INCUMBENTS.length)];
    const status = (["Open", "Open", "Open", "Sources Sought", "Pre-Solicitation"] as const)[Math.floor(rand() * 5)];

    opps.push({
      id: `opp-${pad(i + 1)}`,
      title,
      agency,
      subAgency,
      setAside,
      naics,
      naicsDescription: NAICS_DESC[naics] || "Professional Services",
      valueLow,
      valueHigh,
      postedDate: posted,
      deadline,
      location,
      solicitationNumber: `${agency}-2026-${pad(1000 + i, 4)}`,
      description: `${subAgency || agency} seeks qualified ${setAside.replace(" Set-Aside", "")} firms to provide ${base.toLowerCase()}. Period of performance: 1 base year + 4 option years. Place of performance: ${location}.`,
      aiScore,
      incumbent,
      status,
    });
  }
  return opps;
}

export const OPPORTUNITIES: Opportunity[] = generate();
