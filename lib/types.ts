export type UserRole = "SDVOSB" | "VOSB" | "Prime" | "Agency";

export type SetAside =
  | "SDVOSB Set-Aside"
  | "VOSB Set-Aside"
  | "8(a)"
  | "WOSB"
  | "Small Business"
  | "Full & Open";

export interface Opportunity {
  id: string;
  title: string;
  agency: string;
  subAgency?: string;
  setAside: SetAside;
  naics: string;
  naicsDescription: string;
  valueLow: number;
  valueHigh: number;
  postedDate: string;
  deadline: string;
  location: string;
  solicitationNumber: string;
  description: string;
  aiScore: number;
  incumbent?: string;
  status: "Open" | "Sources Sought" | "Pre-Solicitation";
}

export interface Agency {
  id: string;
  name: string;
  abbr: string;
  sdvosbMandate: number;   // target %
  sdvosbActual: number;    // current %
  totalObligations: number;
  onTrack: boolean;
  contacts: number;
}

export interface Company {
  id: string;
  name: string;
  role: UserRole;
  uei: string;
  cage: string;
  naics: string[];
  certifications: string[];
  pastPerformance: number; // count
  revenue: string;
  employees: number;
  state: string;
  capabilities: string[];
  bio: string;
  verifiedAt?: string; // ISO date of last SAM.gov verification
}

// ---------------- SAM.gov Entity Verification ----------------
export interface VerifiedEntityPOC {
  firstName?: string;
  lastName?: string;
  title?: string;
  email?: string;
  phone?: string;
}

export interface VerifiedEntity {
  uei: string;
  cage?: string;
  legalBusinessName: string;
  physicalAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  registrationStatus: string;
  registrationExpirationDate?: string;
  naicsCodes: string[];
  primaryNaics?: string;
  businessTypeCodes: string[];
  isSDVOSB: boolean;
  isVOSB: boolean;
  isEightA: boolean;
  isHUBZone: boolean;
  isWOSB: boolean;
  poc?: VerifiedEntityPOC;
  source: "sam.gov" | "seed";
  fetchedAt: string;
}

// ---------------- Mentor-Protégé ----------------
export interface MentorProfile {
  id: string;
  name: string;
  primaryNAICS: string;
  yearsOfFederalExperience: number;
  specialties: string[];
  capacityLevel: "open" | "limited" | "full";
  programsOffered: Array<"ASMP" | "8(a) MP" | "DoD MP">;
  geography: string;
}

export interface ProtegeProfile {
  id: string;
  name: string;
  certifications: string[];
  currentRevenue: string;
  targetAgencies: string[];
  goals: string[];
  readinessScore: number; // 0-100
  primaryNAICS?: string;
}

export interface MentorProtegePair {
  id: string;
  mentorName: string;
  mentorUEI: string;
  mentorCapabilities: string[]; // NAICS list
  mentorIndustry: string;
  protegeName: string;
  protegeUEI: string;
  protegeStage: "New" | "Established";
  agreementDate: string;
  programEndDate: string;
  jointVentureName?: string;
  focusAreas: string[];
  outcomes?: string;
}

// ---------------- Municipal ----------------
export interface MunicipalOpportunitySample {
  title: string;
  value: number;
}

export interface Municipality {
  id: string;
  name: string;
  state: string;
  population: number;
  annualProcurementSpend: number; // in USD
  hasVeteranPreference: boolean;
  preferenceDetail?: string; // e.g. "5% bid preference" or "10 eval points"
  administeringOffice: string;
  certificationLink?: string;
  procurementPortal: string;
  opportunitySamples: MunicipalOpportunitySample[];
  topSpendCategories: string[]; // NAICS codes
  notes?: string;
}

export interface Prime {
  id: string;
  name: string;
  annualFederal: number;
  sdvosbSubGoal: number;
  sdvosbSubActual: number;
  activeContracts: number;
  pocEmail: string;
}

export interface TeamingRequest {
  id: string;
  requester: string;
  role: "Prime Seeking Sub" | "Sub Seeking Prime";
  opportunityTitle: string;
  agency: string;
  naics: string;
  neededCapabilities: string[];
  valueEstimate: number;
  deadline: string;
  postedAt: string;
}

export interface PipelineItem {
  id: string;
  opportunityTitle: string;
  agency: string;
  stage:
    | "Prospect"
    | "Outreach"
    | "NDA"
    | "Teaming Agreement"
    | "Proposal"
    | "Award";
  value: number;
  probability: number;
  nextAction: string;
}

export interface StateMarket {
  code: string;
  name: string;
  hasMandate: boolean;
  mandatePct?: number;
  mandateNote?: string;
  contractsValue: number;
}

export interface AdvisorMessage {
  role: "user" | "assistant";
  content: string;
}
