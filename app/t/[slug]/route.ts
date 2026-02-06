import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function getTarget(req: NextRequest): string {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const fallback = "https://mar-ekon-demo.vercel.app/portal";
  if (!to) return fallback;
  try {
    const target = new URL(to);
    if (target.hostname.endsWith("vercel.app") || target.hostname === "mar-ekon-demo.vercel.app") {
      return target.toString();
    }
  } catch {
    // ignore
  }
  return fallback;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const target = getTarget(req);

  // Redirect to a confirmation gate (human click) so tracking is meaningful.
  const gate = new URL("https://mar-ekon-demo.vercel.app/start");
  gate.searchParams.set("slug", slug);
  gate.searchParams.set("to", url.searchParams.get("to") || "/portal");

  // Lead binding (AskelaConnect leadId)
  const leadId = url.searchParams.get("leadId");
  if (leadId) gate.searchParams.set("leadId", leadId);

  // Signed payload for AskelaConnect /api/public/track
  for (const k of ["event", "ts", "nonce", "sig"]) {
    const v = url.searchParams.get(k);
    if (v) gate.searchParams.set(k, v);
  }

  // Keep old click log as fallback
  console.log(JSON.stringify({ kind: "track_click", slug, ts: new Date().toISOString(), target }));

  return NextResponse.redirect(gate.toString(), 302);
}
