export type SkillCategory =
  | "IT & Cybersecurity"
  | "Construction"
  | "Engineering"
  | "Professional Services"
  | "Medical & Healthcare"
  | "Research & Development"
  | "Facilities & Maintenance"
  | "Logistics & Transportation"
  | "Manufacturing"
  | "Training & Education"
  | "Security Services"
  | "Other";

const PREFIX_RULES: { prefix: string; category: SkillCategory }[] = [
  { prefix: "5415", category: "IT & Cybersecurity" },
  { prefix: "51821", category: "IT & Cybersecurity" },
  { prefix: "54169", category: "IT & Cybersecurity" },
  { prefix: "236", category: "Construction" },
  { prefix: "237", category: "Construction" },
  { prefix: "238", category: "Construction" },
  { prefix: "5413", category: "Engineering" },
  { prefix: "5414", category: "Engineering" },
  { prefix: "5416", category: "Professional Services" },
  { prefix: "5418", category: "Professional Services" },
  { prefix: "5419", category: "Professional Services" },
  { prefix: "5411", category: "Professional Services" },
  { prefix: "5412", category: "Professional Services" },
  { prefix: "621", category: "Medical & Healthcare" },
  { prefix: "622", category: "Medical & Healthcare" },
  { prefix: "623", category: "Medical & Healthcare" },
  { prefix: "33911", category: "Medical & Healthcare" },
  { prefix: "32541", category: "Medical & Healthcare" },
  { prefix: "5417", category: "Research & Development" },
  { prefix: "5612", category: "Facilities & Maintenance" },
  { prefix: "5617", category: "Facilities & Maintenance" },
  { prefix: "484", category: "Logistics & Transportation" },
  { prefix: "488", category: "Logistics & Transportation" },
  { prefix: "492", category: "Logistics & Transportation" },
  { prefix: "493", category: "Logistics & Transportation" },
  { prefix: "481", category: "Logistics & Transportation" },
  { prefix: "31", category: "Manufacturing" },
  { prefix: "32", category: "Manufacturing" },
  { prefix: "33", category: "Manufacturing" },
  { prefix: "611", category: "Training & Education" },
  { prefix: "5616", category: "Security Services" },
];

export function categorizeNAICS(naics: string | undefined | null): SkillCategory {
  if (!naics) return "Other";
  const code = String(naics);
  const match = PREFIX_RULES.find((r) => code.startsWith(r.prefix));
  return match?.category ?? "Other";
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  "IT & Cybersecurity",
  "Construction",
  "Engineering",
  "Professional Services",
  "Medical & Healthcare",
  "Research & Development",
  "Facilities & Maintenance",
  "Logistics & Transportation",
  "Manufacturing",
  "Training & Education",
  "Security Services",
  "Other",
];
