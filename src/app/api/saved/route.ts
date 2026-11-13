import { readSession } from "@/lib/auth";
import { jsonError, limited, readJson, sameOrigin } from "@/lib/guard";
import { setSaved, validId } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("That request has to come from this site.", 403);
  const session = await readSession();
  if (!session) return jsonError("Sign in to keep a house on your desk.", 401);
  if (limited(`save:${session.sub}`, 60, 60 * 60 * 1000)) return jsonError("Too many saves. Wait a little.", 429);
  const body = await readJson(request, 2000);
  if (!body.ok) return body.response;
  const record = body.value && typeof body.value === "object" ? (body.value as { listingId?: unknown; saved?: unknown }) : {};
  const listingId = typeof record.listingId === "string" ? record.listingId : "";
  if (!validId(listingId) || typeof record.saved !== "boolean") {
    return jsonError("Say which house, and whether to keep it.", 400);
  }
  const ok = await setSaved(session.sub, listingId, record.saved);
  if (!ok) return jsonError("That house is not on the register.", 404);
  return Response.json({ saved: record.saved }, { headers: { "cache-control": "no-store" } });
}
