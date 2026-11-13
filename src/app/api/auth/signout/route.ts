import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { jsonError, sameOrigin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Sign-out has to come from this site.", 403);
  const res = NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  res.cookies.set(SESSION_COOKIE, "", { ...{ httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" }, maxAge: 0 });
  return res;
}
