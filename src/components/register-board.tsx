"use client";

import { useMemo, useState } from "react";
import type { Intent, Listing } from "@/lib/types";
import { HouseCard } from "./house-card";
import { useChalwadi } from "./providers";

export function RegisterBoard({ listings, saved }: { listings: Listing[]; saved: string[] }) {
  const { intent, setIntent } = useChalwadi();
  const [side, setSide] = useState<"all" | Intent>("all");
  const [city, setCity] = useState("All");
  const [query, setQuery] = useState("");
  const [kept, setKept] = useState(() => new Set(saved));
  const cities = useMemo(() => ["All", ...Array.from(new Set(listings.map((item) => item.city)))], [listings]);
  const visible = listings.filter((item) => {
    if (side !== "all" && item.intent !== side) return false;
    if (city !== "All" && item.city !== city) return false;
    if (!query.trim()) return true;
    const hay = `${item.title} ${item.neighborhood} ${item.city}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  return (
    <main className="register">
      <header className="register-head">
        <p className="eyebrow">The register</p>
        <h1>Every house currently open.</h1>
        <p className="dek">
          {listings.length} live {listings.length === 1 ? "entry" : "entries"}, including houses filed from this desk. The room is {intent === "buy" ? "set for a sale" : "set for a let"}.
        </p>
        <div className="register-tools">
          <div className="chip-row" role="tablist" aria-label="Side of the book">
            {(["all", "buy", "rent"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={side === value ? "chip on" : "chip"}
                onClick={(event) => {
                  setSide(value);
                  if (value !== "all") setIntent(value, { x: event.clientX, y: event.clientY });
                }}
              >
                {value === "all" ? "Entire book" : value === "buy" ? "For sale" : "To let"}
              </button>
            ))}
          </div>
          <label className="search">
            <span className="sr">Search the register</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a house or a neighbourhood" />
          </label>
        </div>
        <div className="chip-row" aria-label="Cities">
          {cities.map((value) => (
            <button key={value} type="button" className={city === value ? "chip on" : "chip"} onClick={() => setCity(value)}>
              {value}
            </button>
          ))}
        </div>
      </header>
      {visible.length === 0 ? (
        <p className="empty">Nothing in that cut of the book.</p>
      ) : (
        <div className="register-grid">
          {visible.map((listing, index) => (
            <HouseCard
              key={listing.id}
              listing={listing}
              featured={index % 6 === 0}
              savable
              saved={kept.has(listing.id)}
              onSaved={(id, next) => {
                setKept((current) => {
                  const copy = new Set(current);
                  if (next) copy.add(id);
                  else copy.delete(id);
                  return copy;
                });
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
