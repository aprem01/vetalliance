import { NextResponse } from "next/server";
import { generateDocument } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await generateDocument(body);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: message, mocked: true, content: "Document generation failed." }, { status: 200 });
  }
}
