import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gate } from "@/components/gate";
import { HouseCard } from "@/components/house-card";
import { InquiryForm } from "@/components/inquiry-form";
import { SaveButton } from "@/components/save-button";
import { SignInButton } from "@/components/sign-bits";
import { readSession } from "@/lib/auth";
import { formatArea, formatPrice, rooms } from "@/lib/money";
import { getListing, listAll, listSamples, savedIds } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [session, listing] = await Promise.all([readSession(), getListing(id)]);
  if (!listing || (!listing.sample && !session)) return { title: "A house on the register" };
  return { title: listing.title, description: `${listing.neighborhood}, ${listing.city}` };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, listing] = await Promise.all([readSession(), getListing(id)]);
  if (!listing) notFound();
  if (!listing.sample && !session) {
    return (
      <Gate
        kicker="On the register"
        title="This house opens after you sign in."
        body="Filings from other people stay with the register. Sign in to read the house."
      />
    );
  }
  const [pool, saved] = await Promise.all([
    session ? listAll() : listSamples(),
    session ? savedIds(session.sub) : Promise.resolve([]),
  ]);
  const related = pool.filter((item) => item.id !== listing.id && item.intent === listing.intent).slice(0, 3);
  return (
    <article>
      <div className="property-hero">
        <img src={listing.image} alt={listing.title} />
        <div className="property-title">
          <p className="eyebrow">
            {listing.intent === "buy" ? "For sale" : "To let"} · {listing.city} · {listing.sample ? "Sample" : "Filed"}
          </p>
          <h1>{listing.title}</h1>
          <p className="price">{formatPrice(listing.intent, listing.priceInr)}</p>
        </div>
      </div>
      <div className="property-body">
        <div>
          <ul className="facts">
            <li>{rooms(listing.beds, listing.baths)}</li>
            <li>{formatArea(listing.areaSqft)}</li>
            <li>
              {listing.neighborhood}, {listing.city}
            </li>
          </ul>
          <p className="dek">{listing.description}</p>
          <p>
            <Link href="/register">Back to the register</Link>
          </p>
        </div>
        <div>
          {session ? (
            <SaveButton id={listing.id} saved={saved.includes(listing.id)} />
          ) : (
            <SignInButton className="btn">Sign in to keep this house</SignInButton>
          )}
          <InquiryForm id={listing.id} signedIn={Boolean(session)} />
        </div>
      </div>
      {related.length ? (
        <section className="related">
          <h2>Also on this side</h2>
          <div className="related-grid">
            {related.map((item) => (
              <HouseCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
