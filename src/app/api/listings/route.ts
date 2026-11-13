import { readSession } from "@/lib/auth";
import { parseFiling } from "@/lib/filing";
import { callerKey, jsonError, limited, readJson, sameOrigin } from "@/lib/guard";
import { createFiling, listAll, listSamples } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession();
  const listings = session ? await listAll() : await listSamples();
  return Response.json({ listings }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Filings have to come from this site.", 403);
  const session = await readSession();
  if (!session) return jsonError("Sign in before filing a house.", 401);
  if (limited(`file:${session.sub}:${callerKey(request)}`, 8, 60 * 60 * 1000)) {
    return jsonError("Too many filings in a short time.", 429);
  }
  const body = await readJson(request, 12000);
  if (!body.ok) return body.response;
  if (!body.value || typeof body.value !== "object") return jsonError("The filing is incomplete.", 400);
  const parsed = parseFiling(body.value as Parameters<typeof parseFiling>[0]);
  if (!parsed.ok) return jsonError(parsed.error, 400);
  const created = await createFiling(session.sub, parsed.value);
  if (!created.ok) return jsonError(created.error, 400);
  const { ownerSub: _owner, ...listing } = created.listing;
  return Response.json({ listing }, { status: 201, headers: { "cache-control": "no-store" } });
}
