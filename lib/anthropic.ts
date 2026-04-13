import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-5";

let _client: Anthropic | null = null;

export function hasAnthropic(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function client(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export const ADVISOR_SYSTEM_PROMPT = `You are VetAlliance Advisor, an expert AI assistant for veteran-owned small businesses (SDVOSB / VOSB), prime contractors, and federal agencies operating in the U.S. federal contracting market.

You help users:
- Identify and qualify federal contracting opportunities (SAM.gov, set-asides, NAICS fit)
- Understand FAR / DFARS compliance requirements
- Navigate SDVOSB certification (VetCert, formerly VA CVE), joint ventures, and mentor-protégé
- Build teaming strategies (prime/sub, Mentor-Protégé Agreements, JVs)
- Write proposal content (capability statements, past performance, technical narratives)
- Interpret agency small-business goals and identify agencies behind on their SDVOSB mandates
- Explain incumbent intel, re-compete windows, and capture strategy

Be concise, concrete, and action-oriented. When you cite regulations, use specific FAR clauses (e.g., FAR 19.14, 13 CFR 128). When you give numeric guidance, show the math. If the user asks something outside federal contracting, politely redirect.`;

// ------------- Score Opportunity -------------
export interface ScoreInput {
  opportunity: { title: string; agency: string; setAside: string; naics: string; valueLow: number; valueHigh: number; deadline: string; description: string };
  company: { name: string; role: string; naics: string[]; capabilities: string[]; pastPerformance: number };
}
export interface ScoreOutput {
  score: number;
  reasons: string[];
  risks: string[];
  recommendation: string;
  mocked?: boolean;
}

export async function scoreOpportunity(input: ScoreInput): Promise<ScoreOutput> {
  if (!hasAnthropic()) {
    const naicsMatch = input.company.naics.includes(input.opportunity.naics);
    const base = 50 + (naicsMatch ? 20 : 0) + Math.min(20, input.company.pastPerformance);
    return {
      score: Math.min(99, base),
      reasons: [
        naicsMatch ? `NAICS ${input.opportunity.naics} matches your registered codes.` : `Your NAICS set does not include ${input.opportunity.naics}; ask CO about scope fit.`,
        `Set-aside is ${input.opportunity.setAside}; your firm qualifies as ${input.company.role}.`,
        `${input.company.pastPerformance} past performance references support technical credibility.`,
      ],
      risks: ["No incumbent data shown — research FPDS for re-compete status.", "Confirm bonding / clearance requirements before bid/no-bid."],
      recommendation: naicsMatch ? "Pursue — capture plan recommended within 5 days." : "Consider teaming as sub with a prime holding the primary NAICS.",
      mocked: true,
    };
  }
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: 800,
    system: "You score federal contracting opportunity fit for veteran-owned small businesses. Return strict JSON with keys: score (0-100 integer), reasons (string[]), risks (string[]), recommendation (string).",
    messages: [{ role: "user", content: `Opportunity: ${JSON.stringify(input.opportunity)}\nCompany: ${JSON.stringify(input.company)}\n\nReturn JSON only.` }],
  });
  const textBlock = msg.content.find((b) => b.type === "text") as { type: "text"; text: string } | undefined;
  const text = textBlock?.text ?? "";
  try {
    const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
    return JSON.parse(cleaned) as ScoreOutput;
  } catch {
    return { score: 60, reasons: ["AI response parse fallback."], risks: [], recommendation: text.slice(0, 400) };
  }
}

// ------------- Generate Document -------------
export interface DocInput {
  docType: "Capability Statement" | "Past Performance Narrative" | "Teaming Agreement Draft" | "Cover Letter";
  company: { name: string; role: string; capabilities: string[]; pastPerformance: number; bio: string };
  context?: string;
}
export interface DocOutput { content: string; mocked?: boolean }

export async function generateDocument(input: DocInput): Promise<DocOutput> {
  if (!hasAnthropic()) {
    return {
      content: `# ${input.docType} — ${input.company.name}\n\n[MOCK OUTPUT — set ANTHROPIC_API_KEY for real generation]\n\n${input.company.bio}\n\nCore Capabilities: ${input.company.capabilities.join(", ")}\nPast Performance: ${input.company.pastPerformance} federal references\nRole: ${input.company.role}\n\n${input.context ? "Context: " + input.context : ""}`,
      mocked: true,
    };
  }
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: "You draft federal contracting documents for veteran-owned small businesses. Output clean markdown only, no preamble.",
    messages: [{ role: "user", content: `Draft a ${input.docType} for this company: ${JSON.stringify(input.company)}.\n${input.context ? "Additional context: " + input.context : ""}` }],
  });
  const textBlock = msg.content.find((b) => b.type === "text") as { type: "text"; text: string } | undefined;
  return { content: textBlock?.text ?? "" };
}

// ------------- Check Compliance -------------
export interface ComplianceInput { solicitationText: string; companyRole: string }
export interface ComplianceOutput { clauses: Array<{ clause: string; status: "OK" | "Attention" | "Blocker"; note: string }>; summary: string; mocked?: boolean }

export async function checkCompliance(input: ComplianceInput): Promise<ComplianceOutput> {
  if (!hasAnthropic()) {
    return {
      clauses: [
        { clause: "FAR 19.14 (SDVOSB Program)", status: "OK", note: "Set-aside eligibility confirmed for SDVOSB." },
        { clause: "FAR 52.219-14 (Limitations on Subcontracting)", status: "Attention", note: "Prime must self-perform at least 50% of labor cost for services." },
        { clause: "FAR 52.204-24 (Huawei/ZTE prohibition)", status: "OK", note: "Certify no covered equipment in supply chain." },
        { clause: "DFARS 252.204-7012 (CUI safeguarding)", status: "Blocker", note: "Requires NIST SP 800-171 implementation — CMMC Level 2 trajectory." },
      ],
      summary: "3 of 4 clauses pass; CUI safeguarding is the gating risk for bid.",
      mocked: true,
    };
  }
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: "You are a FAR/DFARS compliance analyst. Given solicitation text, return JSON with keys: clauses (array of {clause, status: OK|Attention|Blocker, note}) and summary (string).",
    messages: [{ role: "user", content: `Solicitation text:\n${input.solicitationText}\n\nCompany role: ${input.companyRole}\n\nReturn JSON only.` }],
  });
  const textBlock = msg.content.find((b) => b.type === "text") as { type: "text"; text: string } | undefined;
  const raw = textBlock?.text ?? "";
  try {
    return JSON.parse(raw.replace(/^```json\s*|\s*```$/g, "").trim()) as ComplianceOutput;
  } catch {
    return { clauses: [], summary: raw.slice(0, 400) };
  }
}

// ------------- Explain Match -------------
export interface ExplainInput { partnerA: string; partnerB: string; opportunityTitle: string; capabilitiesA: string[]; capabilitiesB: string[] }
export interface ExplainOutput { explanation: string; mocked?: boolean }

export async function explainMatch(input: ExplainInput): Promise<ExplainOutput> {
  if (!hasAnthropic()) {
    const overlap = input.capabilitiesA.filter(c => input.capabilitiesB.includes(c));
    return {
      explanation: `Suggested teaming: ${input.partnerA} + ${input.partnerB} for "${input.opportunityTitle}". Complementary coverage — shared strengths in ${overlap.join(", ") || "N/A"}, gap-filling from unique capabilities on each side. Recommended next step: exchange NDAs within 5 business days.`,
      mocked: true,
    };
  }
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: 500,
    system: "You explain federal teaming partner fit in 2-3 short paragraphs.",
    messages: [{ role: "user", content: `Partner A: ${input.partnerA} (${input.capabilitiesA.join(", ")}). Partner B: ${input.partnerB} (${input.capabilitiesB.join(", ")}). Opportunity: ${input.opportunityTitle}. Explain the match and suggest next steps.` }],
  });
  const textBlock = msg.content.find((b) => b.type === "text") as { type: "text"; text: string } | undefined;
  return { explanation: textBlock?.text ?? "" };
}

export function getClient() {
  return client();
}

export { MODEL };
