import "server-only";

const hits = new Map<string, number[]>();

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "cache-control": "no-store" } });
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwarded || request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function callerKey(request: Request) {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return fwd.slice(0, 80);
}

export function limited(key: string, max: number, windowMs: number) {
  if (hits.size > 4000) hits.clear();
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export async function readJson(request: Request, max = 12000) {
  const raw = await request.text();
  if (raw.length > max) return { ok: false as const, response: jsonError("That request is too large.", 413) };
  try {
    return { ok: true as const, value: raw ? (JSON.parse(raw) as unknown) : {} };
  } catch {
    return { ok: false as const, response: jsonError("The request was not readable.", 400) };
  }
}
