import { NextResponse } from "next/server";
import { fetchEntityByUEI, fetchEntityByCAGE } from "@/lib/external/sam-entity";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { uei?: string; cage?: string };
    const hasKey = Boolean(process.env.SAM_GOV_API_KEY);
    if (!hasKey) {
      return NextResponse.json({
        entity: null,
        available: false,
        reason: "SAM_GOV_API_KEY not configured — verification unavailable.",
      });
    }
    let entity = null;
    if (body?.uei) entity = await fetchEntityByUEI(body.uei);
    if (!entity && body?.cage) entity = await fetchEntityByCAGE(body.cage);
    return NextResponse.json({
      entity,
      available: true,
      reason: entity ? null : "No matching entity found in SAM.gov.",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json(
      { entity: null, available: false, reason: message },
      { status: 200 }
    );
  }
}
