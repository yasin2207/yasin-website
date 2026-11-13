import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { PublicSession } from "./types";

export type Session = PublicSession & { sub: string };

export const SESSION_COOKIE = "chalwadi_session";

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

const persistent = globalThis as unknown as { __chalwadiSecret?: string };

function secret() {
  const env = process.env.SESSION_SECRET?.trim() ?? "";
  if (env.length >= 16) return env;
  persistent.__chalwadiSecret ??= randomBytes(32).toString("hex");
  return persistent.__chalwadiSecret;
}

function sign(body: string) {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function seal(session: Session) {
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function openSession(token: string | undefined): Session | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body);
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!isSession(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const session = value as Session;
  return (
    (session.provider === "google" || session.provider === "preview") &&
    typeof session.sub === "string" &&
    session.sub.length > 3 &&
    session.sub.length < 140 &&
    typeof session.name === "string" &&
    session.name.length > 0 &&
    session.name.length < 80 &&
    typeof session.email === "string" &&
    session.email.length < 160
  );
}

export function toPublic(session: Session): PublicSession {
  return { name: session.name, email: session.email, provider: session.provider };
}

export async function readSession() {
  const jar = await cookies();
  return openSession(jar.get(SESSION_COOKIE)?.value);
}

export function sessionFromPreview(name: string): Session {
  const clean = name.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  return {
    sub: `preview:${randomBytes(16).toString("hex")}`,
    name: clean || "Preview resident",
    email: "",
    provider: "preview",
  };
}

export async function sessionFromGoogle(credential: string): Promise<Session | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
  if (!clientId || credential.length < 20 || credential.length > 4096) return null;
  const endpoint = new URL("https://oauth2.googleapis.com/tokeninfo");
  endpoint.searchParams.set("id_token", credential);
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as Record<string, unknown>;
  const aud = typeof data.aud === "string" ? data.aud : "";
  const iss = typeof data.iss === "string" ? data.iss : "";
  const sub = typeof data.sub === "string" ? data.sub : "";
  if (aud !== clientId) return null;
  if (iss !== "accounts.google.com" && iss !== "https://accounts.google.com") return null;
  if (!sub) return null;
  const email = typeof data.email === "string" ? data.email.slice(0, 120) : "";
  if (email && data.email_verified !== "true" && data.email_verified !== true) return null;
  const rawName = typeof data.name === "string" ? data.name : email || "Resident";
  const name = rawName.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 80) || "Resident";
  return { sub: `google:${sub}`.slice(0, 140), name, email, provider: "google" };
}
