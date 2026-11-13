import { Gate } from "@/components/gate";
import { RegisterBoard } from "@/components/register-board";
import { readSession } from "@/lib/auth";
import { listAll, listSamples, savedIds } from "@/lib/listings";

export const dynamic = "force-dynamic";
export const metadata = { title: "The register" };

export default async function RegisterPage() {
  const session = await readSession();
  if (!session) {
    const samples = await listSamples();
    return (
      <Gate
        kicker="The register"
        title="It opens with your name."
        body="Sign in to see every house on the book, including the ones people have filed. The front page keeps a few samples in the window."
        images={samples.slice(0, 6).map((item) => item.image)}
      />
    );
  }
  const [listings, saved] = await Promise.all([listAll(), savedIds(session.sub)]);
  return <RegisterBoard listings={listings} saved={saved} />;
}
