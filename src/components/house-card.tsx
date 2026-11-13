"use client";

import Link from "next/link";
import { useRef } from "react";
import { formatPrice } from "@/lib/money";
import type { Listing } from "@/lib/types";
import { SaveButton } from "./save-button";

export function HouseCard({
  listing,
  featured = false,
  savable = false,
  saved = false,
  onSaved,
}: {
  listing: Listing;
  featured?: boolean;
  savable?: boolean;
  saved?: boolean;
  onSaved?: (id: string, saved: boolean) => void;
}) {
  const ref = useRef<HTMLElement>(null);

  function move(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = ref.current.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    ref.current.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 7}deg)`;
  }

  return (
    <article
      ref={ref}
      className={featured ? "house-card featured" : "house-card"}
      onPointerMove={move}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      <Link href={`/property/${listing.id}`} className="house-link">
        <div className="card-photo">
          <img src={listing.image} alt={`${listing.title}, ${listing.neighborhood}`} />
          <span className="sample-tag">{listing.sample ? "Sample" : "Filed"}</span>
        </div>
        <div className="card-foot">
          <div>
            <h3>{listing.title}</h3>
            <p>
              {listing.neighborhood}, {listing.city}
            </p>
          </div>
          <strong>{formatPrice(listing.intent, listing.priceInr)}</strong>
        </div>
      </Link>
      {savable ? <SaveButton id={listing.id} saved={saved} onChange={(next) => onSaved?.(listing.id, next)} /> : null}
    </article>
  );
}
