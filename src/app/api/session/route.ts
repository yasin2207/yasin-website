import { readSession, toPublic } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession();
  return Response.json(
    { session: session ? toPublic(session) : null },
    { headers: { "cache-control": "private, no-store" } },
  );
}
