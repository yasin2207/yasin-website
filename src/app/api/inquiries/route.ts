import { readSession } from "@/lib/auth";
import { jsonError, limited, readJson, sameOrigin } from "@/lib/guard";
import { addInquiry, validId } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("That note has to come from this site.", 403);
  const session = await readSession();
  if (!session) return jsonError("Sign in to ask for a viewing.", 401);
  if (limited(`note:${session.sub}`, 30, 60 * 60 * 1000)) return jsonError("Too many notes. Wait a little.", 429);
  const body = await readJson(request, 4000);
  if (!body.ok) return body.response;
  const record = body.value && typeof body.value === "object" ? (body.value as { listingId?: unknown; note?: unknown }) : {};
  const listingId = typeof record.listingId === "string" ? record.listingId : "";
  const note = typeof record.note === "string" ? record.note : "";
  if (!validId(listingId)) return jsonError("That house is not on the register.", 400);
  const result = await addInquiry(listingId, session.sub, session.name, note);
  if (!result.ok) return jsonError(result.error, 400);
  return Response.json({ ok: true }, { status: 201, headers: { "cache-control": "no-store" } });
}
