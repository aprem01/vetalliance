import { NextResponse } from "next/server";
import { hasAnthropic, getClient, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

interface MatchBody {
  mentorProfile: {
    name: string;
    primaryNAICS: string;
    specialties?: string[];
    capacityLevel?: string;
    programsOffered?: string[];
  };
  protegeProfile: {
    name: string;
    certifications?: string[];
    primaryNAICS?: string;
    targetAgencies?: string[];
    goals?: string[];
    readinessScore?: number;
  };
}

// Tiny in-memory cache (per lambda instance) to avoid re-prompting on tab flicker.
const cache = new Map<string, { score: number; rationale: string; mocked: boolean }>();

function deterministicScore(b: MatchBody): number {
  let score = 40;
  if (b.mentorProfile.primaryNAICS && b.protegeProfile.primaryNAICS === b.mentorProfile.primaryNAICS) {
    score += 25;
  }
  if (b.mentorProfile.capacityLevel === "open") score += 15;
  else if (b.mentorProfile.capacityLevel === "limited") score += 7;
  if ((b.protegeProfile.readinessScore || 0) >= 70) score += 15;
  else if ((b.protegeProfile.readinessScore || 0) >= 50) score += 8;
  return Math.min(99, score);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MatchBody;
    const key = `${body.mentorProfile.name}|${body.protegeProfile.name}`;
    const hit = cache.get(key);
    if (hit) return NextResponse.json(hit);

    const score = deterministicScore(body);
    if (!hasAnthropic()) {
      const naicsMatch =
        body.mentorProfile.primaryNAICS === body.protegeProfile.primaryNAICS;
      const out = {
        score,
        rationale: `${body.mentorProfile.name} offers ${body.mentorProfile.specialties?.slice(0, 2).join(" / ") || "federal"} depth; ${body.protegeProfile.name} brings ${body.protegeProfile.certifications?.join(", ") || "veteran status"}. ${naicsMatch ? "Primary NAICS aligns." : "NAICS differs — confirm scope fit."}`,
        mocked: true,
      };
      cache.set(key, out);
      return NextResponse.json(out);
    }

    const msg = await getClient().messages.create({
      model: MODEL,
      max_tokens: 180,
      system: "You explain federal Mentor-Protégé match quality in 2 short sentences (<100 tokens). Concrete, action-oriented, no preamble.",
      messages: [
        {
          role: "user",
          content: `Mentor: ${JSON.stringify(body.mentorProfile)}\nProtégé: ${JSON.stringify(body.protegeProfile)}\nExplain fit briefly and recommend the single best next step.`,
        },
      ],
    });
    const textBlock = msg.content.find((b) => b.type === "text") as
      | { type: "text"; text: string }
      | undefined;
    const out = {
      score,
      rationale: textBlock?.text?.trim() ?? "",
      mocked: false,
    };
    cache.set(key, out);
    return NextResponse.json(out);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json(
      { score: 0, rationale: "Match rationale unavailable.", mocked: true, error: message },
      { status: 200 }
    );
  }
}
