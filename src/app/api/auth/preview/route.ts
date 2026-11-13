import { NextResponse } from "next/server";
import { seal, sessionCookieOptions, SESSION_COOKIE, sessionFromPreview, toPublic } from "@/lib/auth";
import { callerKey, jsonError, limited, readJson, sameOrigin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Sign-in has to come from this site.", 403);
  if (limited(`preview:${callerKey(request)}`, 20, 60 * 60 * 1000)) {
    return jsonError("Too many preview entries. Wait a little and try again.", 429);
  }
  const body = await readJson(request, 2000);
  if (!body.ok) return body.response;
  const name = body.value && typeof body.value === "object" && "name" in body.value ? String((body.value as { name: unknown }).name ?? "") : "";
  const session = sessionFromPreview(name);
  const res = NextResponse.json(toPublic(session), { headers: { "cache-control": "no-store" } });
  res.cookies.set(SESSION_COOKIE, seal(session), sessionCookieOptions);
  return res;
}
