import { HomeExperience } from "@/components/home-experience";
import { readSession } from "@/lib/auth";
import { listAll, listSamples } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readSession();
  const listings = session ? await listAll() : await listSamples();
  return <HomeExperience listings={listings} />;
}
