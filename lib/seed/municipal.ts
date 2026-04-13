import type { Municipality } from "@/lib/types";

/**
 * Top 15 U.S. metros by population / procurement spend. Annual spend and
 * veteran-preference flags are best-effort estimates sourced from public
 * procurement reports (2023-2024) — always verify the current RFP.
 *
 * Cities with documented veteran preference in local procurement:
 *   - New York City  — LL No. 144 / SDVOB preference (up to $1M discretionary)
 *   - Chicago        — Veteran-Owned Business (VBE) program, 5% bid preference
 *   - Los Angeles    — Local Small Business + veteran preference points
 *   - Houston        — Hire Houston First (veteran consideration)
 *   - Philadelphia   — Veteran-owned registry (no hard set-aside)
 *   - Dallas         — BIPS veteran preference on evaluation
 *   - Boston         — Veteran-Owned Business program
 *   - Seattle        — WMBE + vet preference points
 *   - Denver         — VOSB registration recognized
 *   - San Antonio    — SBEDA program includes veterans
 *   - Washington DC  — Local SBE gives veterans bonus points (CBE program)
 *
 * (No strong veteran preference: Phoenix, San Diego, Austin, Atlanta as of
 * last review — their programs focus on SBE / DBE without veteran bonus.)
 */
export const MUNICIPALITIES: Municipality[] = [
  {
    id: "muni-nyc",
    name: "New York City",
    state: "NY",
    population: 8_336_000,
    annualProcurementSpend: 38_000_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "SDVOB discretionary awards up to $1M (LL 144 of 2014); bid preference on competitive solicitations",
    administeringOffice: "NYC Mayor's Office of Contract Services (MOCS) / DSBS",
    certificationLink: "https://www.nyc.gov/site/sbs/businesses/mwbe-certification.page",
    procurementPortal: "https://www.nyc.gov/site/mocs/vendors/passport.page",
    opportunitySamples: [
      { title: "Citywide IT Modernization Services IDIQ", value: 240_000_000 },
      { title: "DCAS Facility O&M – Manhattan", value: 62_000_000 },
    ],
    topSpendCategories: ["541512", "561210", "236220", "541611"],
    notes: "NYC's SDVOB program mirrors the state Division of Service-Disabled Veterans' Business Development.",
  },
  {
    id: "muni-la",
    name: "Los Angeles",
    state: "CA",
    population: 3_898_000,
    annualProcurementSpend: 12_500_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "Local Small Business Enterprise preference; veteran-owned receives evaluation points",
    administeringOffice: "LA Bureau of Contract Administration (BCA)",
    certificationLink: "https://bca.lacity.gov/",
    procurementPortal: "https://labavn.org/",
    opportunitySamples: [
      { title: "LADWP Grid Resilience Engineering", value: 180_000_000 },
      { title: "LAX Terminal Modernization Subcontract", value: 95_000_000 },
    ],
    topSpendCategories: ["236220", "541330", "541512", "561210"],
  },
  {
    id: "muni-chi",
    name: "Chicago",
    state: "IL",
    population: 2_746_000,
    annualProcurementSpend: 9_800_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "Veteran-Owned Business Enterprise (VBE) — 5% bid preference on competitive procurements",
    administeringOffice: "Chicago Dept. of Procurement Services (DPS)",
    certificationLink: "https://www.chicago.gov/city/en/depts/dps/provdrs/cert.html",
    procurementPortal: "https://www.chicago.gov/city/en/depts/dps/provdrs/contract.html",
    opportunitySamples: [
      { title: "O'Hare Terminal 3 Construction", value: 410_000_000 },
      { title: "CPD Body-Worn Camera Refresh", value: 28_000_000 },
    ],
    topSpendCategories: ["236220", "541512", "561612", "541330"],
  },
  {
    id: "muni-hou",
    name: "Houston",
    state: "TX",
    population: 2_304_000,
    annualProcurementSpend: 6_200_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "Hire Houston First — local-vendor preference; veteran-owned recognized in tiebreak criteria",
    administeringOffice: "Houston Office of Business Opportunity",
    certificationLink: "https://www.houstontx.gov/obo/",
    procurementPortal: "https://purchasing.houstontx.gov/",
    opportunitySamples: [
      { title: "Water System Capital Program", value: 320_000_000 },
      { title: "Airport FOD Sweeper Fleet Refresh", value: 14_000_000 },
    ],
    topSpendCategories: ["236220", "541330", "237110"],
  },
  {
    id: "muni-phx",
    name: "Phoenix",
    state: "AZ",
    population: 1_608_000,
    annualProcurementSpend: 4_100_000_000,
    hasVeteranPreference: false,
    administeringOffice: "Phoenix Office of Procurement",
    procurementPortal: "https://solicitations.phoenix.gov/",
    opportunitySamples: [
      { title: "Sky Harbor Concourse Expansion", value: 210_000_000 },
      { title: "Light Rail Extension Design-Build", value: 540_000_000 },
    ],
    topSpendCategories: ["236220", "541330"],
    notes: "SBE program in place; veteran preference under consideration (not enacted as of 2025).",
  },
  {
    id: "muni-phl",
    name: "Philadelphia",
    state: "PA",
    population: 1_603_000,
    annualProcurementSpend: 3_800_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "Veteran-owned business registry recognized; evaluation bonus on discretionary awards",
    administeringOffice: "Philadelphia Office of Economic Opportunity",
    certificationLink: "https://www.phila.gov/oeo/",
    procurementPortal: "https://www.phila.gov/procurement/",
    opportunitySamples: [
      { title: "SEPTA-adjacent Corridor Rehab", value: 75_000_000 },
      { title: "City Hall IT Modernization", value: 22_000_000 },
    ],
    topSpendCategories: ["236220", "541512", "541611"],
  },
  {
    id: "muni-sat",
    name: "San Antonio",
    state: "TX",
    population: 1_434_000,
    annualProcurementSpend: 2_900_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "SBEDA program includes veteran-owned businesses (VOSB) as a recognized class with preference points",
    administeringOffice: "San Antonio SBEDA Program",
    certificationLink: "https://www.sanantonio.gov/EconomicDevelopment/SmallBusinessPrograms",
    procurementPortal: "https://www.sanantonio.gov/Purchasing",
    opportunitySamples: [
      { title: "JBSA-adjacent Workforce Training", value: 8_500_000 },
      { title: "Airport Facility Upgrades", value: 65_000_000 },
    ],
    topSpendCategories: ["236220", "541330", "611430"],
    notes: "Military City USA — highest veteran preference leverage in Texas.",
  },
  {
    id: "muni-sdg",
    name: "San Diego",
    state: "CA",
    population: 1_386_000,
    annualProcurementSpend: 2_400_000_000,
    hasVeteranPreference: false,
    administeringOffice: "San Diego Purchasing & Contracting",
    procurementPortal: "https://www.sandiego.gov/purchasing",
    opportunitySamples: [
      { title: "Pure Water San Diego Phase 2", value: 410_000_000 },
      { title: "Harbor Drive Bridge Replacement", value: 62_000_000 },
    ],
    topSpendCategories: ["237110", "236220", "541330"],
    notes: "Heavy federal-adjacent (Navy) market even without a dedicated city vet program.",
  },
  {
    id: "muni-dal",
    name: "Dallas",
    state: "TX",
    population: 1_304_000,
    annualProcurementSpend: 3_300_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "Business Inclusion & Procurement Services (BIPS) recognizes VOSB with evaluation bonus",
    administeringOffice: "Dallas Office of Procurement Services",
    certificationLink: "https://dallascityhall.com/departments/procurementservices/",
    procurementPortal: "https://dallascityhall.com/departments/procurementservices/Pages/contract_opportunities.aspx",
    opportunitySamples: [
      { title: "DFW Airport IT Refresh", value: 48_000_000 },
      { title: "Trinity River Corridor Construction", value: 180_000_000 },
    ],
    topSpendCategories: ["236220", "541512", "541330"],
  },
  {
    id: "muni-aus",
    name: "Austin",
    state: "TX",
    population: 961_000,
    annualProcurementSpend: 2_200_000_000,
    hasVeteranPreference: false,
    administeringOffice: "Austin Purchasing Office",
    procurementPortal: "https://www.austintexas.gov/department/purchasing",
    opportunitySamples: [
      { title: "Austin Energy Grid Hardening", value: 220_000_000 },
      { title: "Project Connect Rail Subcontracts", value: 95_000_000 },
    ],
    topSpendCategories: ["236220", "541330", "237130"],
    notes: "MBE/WBE program; no explicit veteran preference.",
  },
  {
    id: "muni-bos",
    name: "Boston",
    state: "MA",
    population: 650_000,
    annualProcurementSpend: 2_000_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "Veteran-Owned Business Enterprise (VBE) certification — evaluation preference",
    administeringOffice: "Boston Office of Economic Opportunity & Inclusion",
    certificationLink: "https://www.boston.gov/departments/economic-opportunity-and-inclusion",
    procurementPortal: "https://www.boston.gov/departments/purchasing",
    opportunitySamples: [
      { title: "BPS School Modernization", value: 140_000_000 },
      { title: "City IT Help Desk Services", value: 18_000_000 },
    ],
    topSpendCategories: ["236220", "541512", "541611"],
  },
  {
    id: "muni-sea",
    name: "Seattle",
    state: "WA",
    population: 749_000,
    annualProcurementSpend: 2_100_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "WMBE program includes veteran-owned preference points on competitive solicitations",
    administeringOffice: "Seattle Dept. of Finance & Admin Services (FAS)",
    certificationLink: "https://www.seattle.gov/city-purchasing-and-contracting",
    procurementPortal: "https://seattle.gov/purchasing-and-contracting/doing-business-with-the-city",
    opportunitySamples: [
      { title: "Seattle City Light Transmission Upgrades", value: 180_000_000 },
      { title: "SPD Body-Worn Camera Storage Cloud", value: 24_000_000 },
    ],
    topSpendCategories: ["236220", "541512", "541330"],
  },
  {
    id: "muni-den",
    name: "Denver",
    state: "CO",
    population: 716_000,
    annualProcurementSpend: 2_500_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "Division of Small Business Opportunity recognizes VOSB; evaluation bonus in solicitations",
    administeringOffice: "Denver Division of Small Business Opportunity (DSBO)",
    certificationLink: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Office-of-Economic-Development/Division-of-Small-Business-Opportunity",
    procurementPortal: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Department-of-Finance/Our-Divisions/Purchasing",
    opportunitySamples: [
      { title: "DEN Airport Concourse Expansion", value: 380_000_000 },
      { title: "National Western Center Build-Out", value: 210_000_000 },
    ],
    topSpendCategories: ["236220", "541330", "541512"],
  },
  {
    id: "muni-dc",
    name: "Washington, D.C.",
    state: "DC",
    population: 672_000,
    annualProcurementSpend: 5_400_000_000,
    hasVeteranPreference: true,
    preferenceDetail: "CBE program; veteran-owned adds bonus points (up to 2) on evaluated proposals",
    administeringOffice: "DC Department of Small & Local Business Development (DSLBD)",
    certificationLink: "https://dslbd.dc.gov/page/cbe-certification",
    procurementPortal: "https://contracting.dc.gov/",
    opportunitySamples: [
      { title: "DC Water Clean Rivers Capital Program", value: 260_000_000 },
      { title: "DCPS IT Modernization", value: 34_000_000 },
    ],
    topSpendCategories: ["236220", "541512", "541611"],
  },
  {
    id: "muni-atl",
    name: "Atlanta",
    state: "GA",
    population: 499_000,
    annualProcurementSpend: 2_100_000_000,
    hasVeteranPreference: false,
    administeringOffice: "Atlanta Office of Contract Compliance",
    procurementPortal: "https://www.atlantaga.gov/government/departments/procurement",
    opportunitySamples: [
      { title: "ATL Airport Concourse D Expansion", value: 540_000_000 },
      { title: "Watershed Mgmt Capital Program", value: 320_000_000 },
    ],
    topSpendCategories: ["236220", "237110", "541330"],
    notes: "EBO / M/FBE program; no explicit veteran preference as of last review.",
  },
];
