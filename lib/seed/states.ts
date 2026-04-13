import type { StateMarket } from "../types";

const BASE: Omit<StateMarket, "hasMandate" | "mandatePct" | "mandateNote" | "contractsValue">[] = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
  ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
  ["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
  ["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
  ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
  ["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
].map(([code, name]) => ({ code, name }));

const MANDATES: Record<string, { pct: number; note: string }> = {
  TX: { pct: 5, note: "HB 3693 — 5% SDVOSB set-aside for state contracts." },
  FL: { pct: 3, note: "Florida VBE preference — 3% evaluation credit." },
  VA: { pct: 4, note: "SWaM / SDV preference — 4% target for Commonwealth spend." },
  OH: { pct: 3, note: "EDGE + Veteran-Friendly Business Enterprise preferences." },
  NY: { pct: 6, note: "NY Service-Disabled Veteran-Owned Business Act — 6% statewide goal." },
};

export const STATES: StateMarket[] = BASE.map((s) => {
  const m = MANDATES[s.code];
  return {
    ...s,
    hasMandate: Boolean(m),
    mandatePct: m?.pct,
    mandateNote: m?.note,
    contractsValue: Math.round((m ? 1_200_000_000 : 380_000_000) * (0.6 + Math.random() * 1.3)),
  };
});
