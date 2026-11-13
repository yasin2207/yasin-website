import { NextResponse } from "next/server";
import { seal, sessionCookieOptions, SESSION_COOKIE, sessionFromGoogle, toPublic } from "@/lib/auth";
import { callerKey, jsonError, limited, readJson, sameOrigin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Sign-in has to come from this site.", 403);
  if (limited(`google:${callerKey(request)}`, 30, 60 * 60 * 1000)) {
    return jsonError("Too many sign-in attempts. Wait a little and try again.", 429);
  }
  const body = await readJson(request, 8000);
  if (!body.ok) return body.response;
  const credential =
    body.value && typeof body.value === "object" && "credential" in body.value
      ? String((body.value as { credential: unknown }).credential ?? "")
      : "";
  const session = await sessionFromGoogle(credential);
  if (!session) return jsonError("Google did not accept that sign-in.", 401);
  const res = NextResponse.json(toPublic(session), { headers: { "cache-control": "no-store" } });
  res.cookies.set(SESSION_COOKIE, seal(session), sessionCookieOptions);
  return res;
}
