import { NextResponse } from "next/server";
import { generateAgencyNarrative, type AgencyPrediction } from "@/lib/analytics/predictions";
import { hasAnthropic } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { agency?: string; stats?: Partial<AgencyPrediction> };
    if (!body?.agency || !body?.stats) {
      return NextResponse.json({ error: "agency and stats required" }, { status: 400 });
    }
    if (!hasAnthropic()) {
      return NextResponse.json({
        narrative: undefined,
        mocked: true,
        note: "ANTHROPIC_API_KEY unset — no narrative generated.",
      });
    }
    const prediction: AgencyPrediction = {
      agency: body.agency,
      historical: body.stats.historical || [],
      avgCountPerQuarter: body.stats.avgCountPerQuarter ?? 0,
      stdevCount: body.stats.stdevCount ?? 0,
      avgAmountPerQuarter: body.stats.avgAmountPerQuarter ?? 0,
      expectedCountLow: body.stats.expectedCountLow ?? 0,
      expectedCountHigh: body.stats.expectedCountHigh ?? 0,
      expectedAmount: body.stats.expectedAmount ?? 0,
      dominantNaics: body.stats.dominantNaics || [],
      typicalMonths: body.stats.typicalMonths || [],
      incumbentExpirations: body.stats.incumbentExpirations || [],
      recommendation: body.stats.recommendation || "",
      mocked: false,
    };
    const narrative = await generateAgencyNarrative(prediction);
    return NextResponse.json({ narrative });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: message }, { status: 200 });
  }
}
