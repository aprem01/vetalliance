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
