import { FileWizard } from "@/components/file-wizard";
import { readSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "File a house" };

export default async function FilePage() {
  const session = await readSession();
  return <FileWizard signedIn={Boolean(session)} name={session?.name ?? ""} />;
}
