import { NextResponse } from "next/server";
import { scoreOpportunity } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await scoreOpportunity(body);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: message, mocked: true, score: 50, reasons: [], risks: [], recommendation: "" }, { status: 200 });
  }
}
