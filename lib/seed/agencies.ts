import type { Agency } from "../types";

export const AGENCIES: Agency[] = [
  { id: "a1", name: "Department of Veterans Affairs", abbr: "VA", sdvosbMandate: 15, sdvosbActual: 22.4, totalObligations: 34_200_000_000, onTrack: true, contacts: 412 },
  { id: "a2", name: "Department of Defense", abbr: "DoD", sdvosbMandate: 3, sdvosbActual: 2.1, totalObligations: 412_000_000_000, onTrack: false, contacts: 1240 },
  { id: "a3", name: "General Services Administration", abbr: "GSA", sdvosbMandate: 3, sdvosbActual: 4.8, totalObligations: 24_500_000_000, onTrack: true, contacts: 188 },
  { id: "a4", name: "Department of Homeland Security", abbr: "DHS", sdvosbMandate: 3, sdvosbActual: 2.4, totalObligations: 21_800_000_000, onTrack: false, contacts: 221 },
  { id: "a5", name: "Department of Health and Human Services", abbr: "HHS", sdvosbMandate: 3, sdvosbActual: 1.9, totalObligations: 28_600_000_000, onTrack: false, contacts: 309 },
  { id: "a6", name: "Department of Energy", abbr: "DOE", sdvosbMandate: 3, sdvosbActual: 2.7, totalObligations: 18_100_000_000, onTrack: false, contacts: 142 },
  { id: "a7", name: "Department of Justice", abbr: "DOJ", sdvosbMandate: 3, sdvosbActual: 3.6, totalObligations: 9_400_000_000, onTrack: true, contacts: 98 },
  { id: "a8", name: "Department of State", abbr: "DOS", sdvosbMandate: 3, sdvosbActual: 2.2, totalObligations: 8_200_000_000, onTrack: false, contacts: 76 },
  { id: "a9", name: "NASA", abbr: "NASA", sdvosbMandate: 3, sdvosbActual: 5.1, totalObligations: 14_900_000_000, onTrack: true, contacts: 102 },
  { id: "a10", name: "Department of Transportation", abbr: "DOT", sdvosbMandate: 3, sdvosbActual: 2.8, totalObligations: 7_700_000_000, onTrack: false, contacts: 84 },
  { id: "a11", name: "Department of Agriculture", abbr: "USDA", sdvosbMandate: 3, sdvosbActual: 3.2, totalObligations: 6_900_000_000, onTrack: true, contacts: 73 },
  { id: "a12", name: "Social Security Administration", abbr: "SSA", sdvosbMandate: 3, sdvosbActual: 1.4, totalObligations: 3_300_000_000, onTrack: false, contacts: 41 },
  { id: "a13", name: "Army Corps of Engineers", abbr: "USACE", sdvosbMandate: 3, sdvosbActual: 3.9, totalObligations: 12_100_000_000, onTrack: true, contacts: 156 },
  { id: "a14", name: "Air Force", abbr: "USAF", sdvosbMandate: 3, sdvosbActual: 2.3, totalObligations: 88_400_000_000, onTrack: false, contacts: 487 },
  { id: "a15", name: "Navy / Marine Corps", abbr: "DON", sdvosbMandate: 3, sdvosbActual: 2.5, totalObligations: 96_700_000_000, onTrack: false, contacts: 512 },
];
