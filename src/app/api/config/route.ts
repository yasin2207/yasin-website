export const dynamic = "force-dynamic";

export function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() || null;
  return Response.json(
    { googleClientId },
    { headers: { "cache-control": "no-store" } },
  );
}
