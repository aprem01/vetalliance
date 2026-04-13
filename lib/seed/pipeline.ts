import type { PipelineItem } from "../types";

export const PIPELINE: PipelineItem[] = [
  { id: "pi1", opportunityTitle: "VA EHRM Data Integration Task Order", agency: "VA", stage: "Prospect", value: 14_000_000, probability: 25, nextAction: "Research incumbent staffing" },
  { id: "pi2", opportunityTitle: "DoD Zero Trust Arch Phase II", agency: "DoD", stage: "Prospect", value: 28_000_000, probability: 30, nextAction: "RFI due 4/22" },
  { id: "pi3", opportunityTitle: "DHS CISA Threat Intel", agency: "DHS", stage: "Outreach", value: 9_500_000, probability: 40, nextAction: "Email ManTech OSBP" },
  { id: "pi4", opportunityTitle: "GSA Schedule IT Services BPA", agency: "GSA", stage: "Outreach", value: 6_200_000, probability: 45, nextAction: "Call scheduled 4/18" },
  { id: "pi5", opportunityTitle: "NASA Goddard Ground Systems", agency: "NASA", stage: "NDA", value: 12_800_000, probability: 55, nextAction: "NDA under legal review" },
  { id: "pi6", opportunityTitle: "Air Force Cloud One Enhancement", agency: "USAF", stage: "NDA", value: 7_300_000, probability: 50, nextAction: "Return NDA by 4/16" },
  { id: "pi7", opportunityTitle: "VA Medical Center Construction", agency: "VA", stage: "Teaming Agreement", value: 18_000_000, probability: 70, nextAction: "TA redlines sent" },
  { id: "pi8", opportunityTitle: "Army Corps Facility Maintenance", agency: "USACE", stage: "Proposal", value: 5_400_000, probability: 75, nextAction: "Past perf writeup" },
  { id: "pi9", opportunityTitle: "USAF Logistics Modernization", agency: "USAF", stage: "Proposal", value: 11_200_000, probability: 65, nextAction: "Pricing review 4/14" },
  { id: "pi10", opportunityTitle: "HHS CMS Payment Integrity", agency: "HHS", stage: "Award", value: 8_800_000, probability: 95, nextAction: "Kickoff call 4/20" },
];
