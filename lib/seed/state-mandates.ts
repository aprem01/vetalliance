/**
 * State-level veteran business mandate registry.
 * Facts researched from public state program pages. Update as programs evolve.
 */

export interface StateMandate {
  code: string;
  name: string;
  hasVeteranMandate: boolean;
  mandatePercent?: number;
  administeringAgency?: string;
  certificationName?: string;
  certificationLink?: string;
  opportunityPortal?: string;
  summary: string;
  effectiveDate?: string;
  notes?: string;
}

const ALL_STATES: Array<[string, string]> = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["FL", "Florida"], ["GA", "Georgia"],
  ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
  ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"], ["MO", "Missouri"],
  ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"],
  ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
  ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"],
  ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

const ACTIVE: Record<string, Omit<StateMandate, "code" | "name" | "hasVeteranMandate">> = {
  NY: {
    mandatePercent: 6.0,
    administeringAgency: "NY Office of General Services — Division of Service-Disabled Veterans' Business Development",
    certificationName: "NY SDVOB (Service-Disabled Veteran-Owned Business)",
    certificationLink: "https://ogs.ny.gov/veterans/how-get-certified-service-disabled-veteran-owned-business",
    opportunityPortal: "https://ogs.ny.gov/veterans",
    summary:
      "Nation's strongest state program. 6% SDVOB utilization goal across all NY state agencies and authorities under Article 17-B of the Executive Law.",
    effectiveDate: "2014-05-12",
    notes: "Recognized as the gold standard among state programs.",
  },
  CA: {
    mandatePercent: 3.0,
    administeringAgency: "California Department of General Services — Office of Small Business and DVBE Services",
    certificationName: "CA DVBE (Disabled Veteran Business Enterprise)",
    certificationLink: "https://www.dgs.ca.gov/PD/Services/Page-Content/Procurement-Division-Services-List-Folder/Certify-or-Re-Certify-as-a-DVBE",
    opportunityPortal: "https://caleprocure.ca.gov/",
    summary: "3% DVBE participation goal statewide — one of the longest-standing veteran preference programs in the nation.",
    effectiveDate: "1989-01-01",
    notes: "Enforced via Military & Veterans Code § 999.",
  },
  NJ: {
    mandatePercent: 3.0,
    administeringAgency: "NJ Department of Military and Veterans Affairs",
    certificationName: "NJ VOB / DVOB (Veteran-Owned / Disabled Veteran-Owned Business)",
    certificationLink: "https://www.nj.gov/military/veterans/business/",
    opportunityPortal: "https://www.njstart.gov/",
    summary: "3% SBE/VOB goal administered via NJSTART procurement portal.",
    effectiveDate: "2015-01-01",
  },
  TX: {
    mandatePercent: 5.0,
    administeringAgency: "Texas Comptroller of Public Accounts — HUB Program",
    certificationName: "Texas HUB (Historically Underutilized Business — Veteran Subcategory)",
    certificationLink: "https://comptroller.texas.gov/purchasing/vendor/hub/",
    opportunityPortal: "https://www.txsmartbuy.gov/",
    summary: "HUB program includes a veteran subcategory; state HB 3693 established SDVOSB procurement preference.",
    effectiveDate: "2013-09-01",
  },
  FL: {
    mandatePercent: 3.0,
    administeringAgency: "Florida Department of Management Services",
    certificationName: "FL Certified Veteran Business Enterprise (VBE)",
    certificationLink: "https://www.dms.myflorida.com/business_operations/state_purchasing/vendor_information/veteran_business_certification",
    opportunityPortal: "https://www.myfloridamarketplace.com/",
    summary: "Veteran Business Enterprise designation with evaluation credit and tie-breaker preference in state procurement.",
    effectiveDate: "2011-07-01",
  },
  IL: {
    mandatePercent: 3.0,
    administeringAgency: "Illinois Department of Central Management Services — BEP",
    certificationName: "IL BEP Veterans (Business Enterprise Program — Veterans)",
    certificationLink: "https://cms.illinois.gov/agency/bep.html",
    opportunityPortal: "https://www2.illinois.gov/cms/business/sell2/Pages/default.aspx",
    summary: "3% BEP goal for veteran-owned small businesses (VOSBs/SDVOSBs) on state spend.",
    effectiveDate: "2015-08-01",
  },
  OH: {
    mandatePercent: 5.0,
    administeringAgency: "Ohio Department of Administrative Services",
    certificationName: "Ohio Veteran-Friendly Business Enterprise (VBE) / EDGE",
    certificationLink: "https://das.ohio.gov/divisions-and-offices/equal-opportunity/vetfriendly",
    opportunityPortal: "https://procure.ohio.gov/",
    summary: "Veteran-Friendly Business Enterprise designation; EDGE program provides additional veteran preference.",
    effectiveDate: "2012-03-22",
  },
  PA: {
    mandatePercent: 3.0,
    administeringAgency: "PA Department of General Services — Bureau of Diversity, Inclusion, and Small Business Opportunities",
    certificationName: "PA VBE (Veteran Business Enterprise)",
    certificationLink: "https://www.dgs.pa.gov/Small%20Diverse%20Business%20Program/Pages/default.aspx",
    opportunityPortal: "https://www.emarketplace.state.pa.us/",
    summary: "Veteran Business Enterprise program within the Small Diverse Business (SDB) framework; 3% target.",
    effectiveDate: "2013-01-01",
  },
  VA: {
    mandatePercent: 3.0,
    administeringAgency: "Virginia Department of Small Business and Supplier Diversity (SBSD)",
    certificationName: "VA SWaM — Service-Disabled Veteran (SDV) Designation",
    certificationLink: "https://www.sbsd.virginia.gov/certification-division/",
    opportunityPortal: "https://eva.virginia.gov/",
    summary: "SWaM certification includes SDV category; Commonwealth procurement preference and setasides available.",
    effectiveDate: "2014-07-01",
  },
  NV: {
    mandatePercent: 3.0,
    administeringAgency: "Nevada Department of Administration — Purchasing Division",
    certificationName: "NV State Veteran Preference",
    certificationLink: "https://purchasing.nv.gov/",
    opportunityPortal: "https://nevadaepro.com/",
    summary: "SB 301 — State Veteran Preference: 5% price evaluation credit on bids from qualified veteran-owned businesses.",
    effectiveDate: "2015-10-01",
    notes: "Price preference applied at evaluation stage.",
  },
  NC: {
    mandatePercent: 0,
    administeringAgency: "NC Department of Administration — Division of Purchase & Contract (Veteran Business initiative)",
    certificationName: "NC Veteran-Owned Business (self-certification)",
    certificationLink: "https://ncadmin.nc.gov/businesses",
    opportunityPortal: "https://www.ips.state.nc.us/",
    summary: "DOA Veteran Business initiative promotes veteran participation; no hard percentage goal yet but outreach and tracking are active.",
    effectiveDate: "2018-01-01",
    notes: "No fixed statutory percentage — active outreach program.",
  },
};

export const STATE_MANDATES: StateMandate[] = ALL_STATES.map(([code, name]) => {
  const active = ACTIVE[code];
  if (active) {
    return {
      code,
      name,
      hasVeteranMandate: true,
      ...active,
    };
  }
  return {
    code,
    name,
    hasVeteranMandate: false,
    summary: "No active state-level veteran set-aside mandate.",
  };
});

export const ACTIVE_STATE_MANDATES = STATE_MANDATES.filter((s) => s.hasVeteranMandate);
