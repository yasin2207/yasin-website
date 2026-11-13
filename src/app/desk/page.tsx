import Link from "next/link";
import { Gate } from "@/components/gate";
import { SignOutButton } from "@/components/sign-bits";
import { readSession } from "@/lib/auth";
import { formatPrice, formatWhen } from "@/lib/money";
import { listOwned, listSaved, notesReceived, notesSent } from "@/lib/listings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your desk" };

export default async function DeskPage() {
  const session = await readSession();
  if (!session) {
    return (
      <Gate
        kicker="Your desk"
        title="The desk knows your name."
        body="Sign in to see the houses you filed, the ones you saved, and the notes that moved."
      />
    );
  }
  const [owned, saved, sent, received] = await Promise.all([
    listOwned(session.sub),
    listSaved(session.sub),
    notesSent(session.sub),
    notesReceived(session.sub),
  ]);
  return (
    <main className="desk">
      <p className="eyebrow">Your desk</p>
      <h1>{session.name}</h1>
      <p className="dek">
        {session.provider === "google"
          ? session.email || "Signed in with Google."
          : "Preview identity. It stands in until Google sign-in is connected. Filings stay with this app."}
      </p>
      <SignOutButton />
      <div className="desk-grid">
        <section>
          <h2>Filed houses</h2>
          {owned.length === 0 ? (
            <p className="quiet">The desk is clear. <Link href="/file">File a house.</Link></p>
          ) : (
            <ul>
              {owned.map((house) => (
                <li key={house.id}>
                  <Link href={`/property/${house.id}`}><strong>{house.title}</strong></Link>
                  <p className="meta">{house.neighborhood}, {house.city} · {formatPrice(house.intent, house.priceInr)}</p>
                  <p className="meta">{house.docType} ····{house.docLast4} · {house.phone}</p>
                  <time dateTime={house.createdAt}>{formatWhen(house.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2>Saved</h2>
          {saved.length === 0 ? <p className="quiet">Nothing kept yet.</p> : (
            <ul>
              {saved.map((house) => (
                <li key={house.id}>
                  <Link href={`/property/${house.id}`}><strong>{house.title}</strong></Link>
                  <p className="meta">{house.neighborhood}, {house.city}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2>Notes you sent</h2>
          {sent.length === 0 ? <p className="quiet">No notes yet.</p> : (
            <ul>
              {sent.map((note) => (
                <li key={note.id}>
                  <Link href={`/property/${note.listingId}`}><strong>{note.listingTitle}</strong></Link>
                  <p>{note.note}</p>
                  <time dateTime={note.createdAt}>{formatWhen(note.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2>Notes on your houses</h2>
          {received.length === 0 ? <p className="quiet">No one has written yet.</p> : (
            <ul>
              {received.map((note) => (
                <li key={note.id}>
                  <strong>{note.listingTitle}</strong>
                  <p className="meta">{note.fromName}</p>
                  <p>{note.note}</p>
                  <time dateTime={note.createdAt}>{formatWhen(note.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
