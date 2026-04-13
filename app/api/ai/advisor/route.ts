import { getClient, hasAnthropic, ADVISOR_SYSTEM_PROMPT, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

interface IncomingMessage { role: "user" | "assistant"; content: string }

const MOCK_RESPONSES = [
  "Great question. Under FAR 19.14, SDVOSB set-asides allow contracting officers to restrict competition to SDVOSBs when there is a reasonable expectation of 2+ qualified offers at fair market price (the 'Rule of Two'). VA has its own enhanced authority under 38 U.S.C. 8127 ('Veterans First') which goes beyond the SBA rule.\n\nKey next steps:\n1. Verify your VetCert status is current.\n2. Confirm NAICS alignment with the solicitation's primary code.\n3. If pursuing as sub, review FAR 52.219-14 self-performance limits (50% of prime labor for services).",
  "For teaming strategy, focus on three axes: (1) NAICS complementarity — not overlap, (2) past performance fit for the evaluation criteria, and (3) geographic/facility alignment. A Mentor-Protégé JV under 13 CFR 128 gets you affiliation protection, but you must have SBA approval *before* bid submission.",
  "Agencies currently furthest behind on SDVOSB mandates in the VetAlliance dataset: HHS (1.9%), DoD (2.1%), DHS (2.4%), and SSA (1.4%). These are highest-leverage targets because leadership has measurable pressure to award to SDVOSBs to meet year-end small business goals. Aim your outreach at their OSDBU offices in Q3.",
];

export async function POST(req: Request) {
  const body = await req.json();
  const messages: IncomingMessage[] = body.messages || [];

  if (!hasAnthropic()) {
    const last = messages[messages.length - 1]?.content || "";
    const pick = MOCK_RESPONSES[Math.abs(last.length) % MOCK_RESPONSES.length];
    const reply = `[MOCKED — set ANTHROPIC_API_KEY for live Claude]\n\n${pick}`;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const chunks = reply.match(/.{1,20}/gs) || [reply];
        for (const c of chunks) {
          controller.enqueue(encoder.encode(c));
          await new Promise((r) => setTimeout(r, 25));
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const client = getClient();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const response = await client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: ADVISOR_SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Advisor error";
        controller.enqueue(encoder.encode(`\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
