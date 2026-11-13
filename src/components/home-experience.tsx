"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Intent, Listing } from "@/lib/types";
import { HouseCard } from "./house-card";
import { mountSmooth } from "./smooth";
import { useChalwadi } from "./providers";

const CITIES = ["Pune", "Mumbai", "Alibaug", "Goa", "Bengaluru", "Hyderabad", "Pune", "Mumbai"];

export function HomeExperience({ listings }: { listings: Listing[] }) {
  const { intent, setIntent } = useChalwadi();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const pinRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const shown = listings.filter((item) => item.intent === intent);
  const lead = shown[0] ?? listings[0];
  const orbitItems = shown.length >= 4 ? shown : listings;
  const shownKey = shown.map((item) => item.id).join("|");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 900px)").matches;
    if (reduce || !desktop) return;
    const release = mountSmooth();
    const ctx = gsap.context(() => {
      if (photoRef.current && heroRef.current) {
        gsap.to(photoRef.current, {
          yPercent: 8,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
      if (pinRef.current && trackRef.current) {
        const track = trackRef.current;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.75,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      }
      if (orbitRef.current && ringRef.current) {
        gsap.fromTo(
          ringRef.current,
          { rotateY: 0 },
          {
            rotateY: 360,
            ease: "none",
            scrollTrigger: {
              trigger: orbitRef.current,
              start: "top top",
              end: "+=140%",
              pin: true,
              scrub: 1,
            },
          },
        );
      }
    }, rootRef);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const timer = window.setTimeout(refresh, 600);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", refresh);
      ctx.revert();
      release();
    };
  }, [shownKey, orbitItems.length]);

  function choose(next: Intent, event: React.MouseEvent<HTMLButtonElement>) {
    setIntent(next, { x: event.clientX, y: event.clientY });
    const film = document.getElementById("film");
    if (!film) return;
    if (window.__chalwadiLenis) window.__chalwadiLenis.scrollTo(film, { offset: -12 });
    else film.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function magnet(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left - box.width / 2;
    const y = event.clientY - box.top - box.height / 2;
    event.currentTarget.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
  }

  if (!lead) {
    return (
      <main className="sheet">
        <h1>The register is empty.</h1>
      </main>
    );
  }

  return (
    <div ref={rootRef}>
      <section className="hero" ref={heroRef}>
        <div className="hero-copy">
          <p className="eyebrow">Deccan Gymkhana, Pune · since 2014</p>
          <h1>
            <span className="line">
              <span>Chalwadi</span>
            </span>
            <span className="line enterprise">
              <span>enterprise</span>
            </span>
          </h1>
          <p className="dek">
            A short register of houses for sale and houses to let. Every filing is walked, and the owner is checked, before the door is shown.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className={intent === "buy" ? "btn solid" : "btn"}
              onClick={(event) => choose("buy", event)}
              onPointerMove={magnet}
              onPointerLeave={(event) => {
                event.currentTarget.style.transform = "";
              }}
            >
              Houses for sale
            </button>
            <button
              type="button"
              className={intent === "rent" ? "btn solid" : "btn"}
              onClick={(event) => choose("rent", event)}
              onPointerMove={magnet}
              onPointerLeave={(event) => {
                event.currentTarget.style.transform = "";
              }}
            >
              Houses to let
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                const pool = shown.length ? shown : listings;
                const pick = pool[Math.floor(Math.random() * pool.length)];
                if (pick) router.push(`/property/${pick.id}`);
              }}
            >
              Open one at random
            </button>
          </div>
        </div>
        <figure className="hero-photo">
          <img key={lead.id} ref={photoRef} src={lead.image} alt={lead.title} />
          <figcaption>
            <span>
              {lead.neighborhood}, {lead.city}
            </span>
            <span>{lead.sample ? "Sample" : "Filed"}</span>
          </figcaption>
        </figure>
        <ol className="hero-index">
          <li>Buy</li>
          <li>Let</li>
          <li>Verify</li>
        </ol>
      </section>

      <section className="film" id="film" ref={pinRef}>
        <div className="film-sticky">
          <header className="film-head">
            <p className="eyebrow">{intent === "buy" ? "For sale" : "To let"} · scroll</p>
            <h2>
              {shown.length} {shown.length === 1 ? "house" : "houses"} on this side
            </h2>
          </header>
          <div className="track-window">
            <div className="track" ref={trackRef}>
              {shown.map((listing, index) => (
                <HouseCard key={listing.id} listing={listing} featured={index === 0} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="orbit" ref={orbitRef}>
        <div className="orbit-copy">
          <p className="eyebrow">Around the table</p>
          <h2>Hold the book and turn it.</h2>
          <p>Sale on the warm side. A let flips the room to night. The houses stay.</p>
        </div>
        <div className="stage">
          <p className="ring-center">the book</p>
          <div className="ring" ref={ringRef} style={{ ["--n" as string]: orbitItems.length }}>
            {orbitItems.map((listing, index) => (
              <Link key={listing.id} className="orb" href={`/property/${listing.id}`} style={{ ["--i" as string]: index }}>
                <img src={listing.image} alt="" />
                <span>{listing.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="essay">
        <div>
          <p className="eyebrow">The desk</p>
          <h2>Paper before the photograph.</h2>
          <p>
            Filing a house takes a name, a phone, and the last four characters of an identity document. On this prototype the seal lands as soon as the form is complete. A live desk would still telephone.
          </p>
          <Link className="btn" href="/file">
            File a house
          </Link>
        </div>
        <ol className="essay-list">
          <li>
            <span>01</span> Walk the house
          </li>
          <li>
            <span>02</span> Check the owner
          </li>
          <li>
            <span>03</span> Open it on the register
          </li>
        </ol>
        <svg className="seal-spin" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <path id="chalwadi-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
          </defs>
          <text>
            <textPath href="#chalwadi-circle">Chalwadi Enterprise · Pune · Buy · Let · Verify · </textPath>
          </text>
          <circle cx="100" cy="100" r="3" fill="currentColor" />
        </svg>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...CITIES, ...CITIES].map((city, index) => (
            <span key={`${city}-${index}`} className={index % 2 ? "ghost" : undefined}>
              {city}
            </span>
          ))}
        </div>
      </div>
      <div className="marquee reverse" aria-hidden="true">
        <div className="marquee-track">
          {[...CITIES, ...CITIES].map((city, index) => (
            <span key={`b-${city}-${index}`} className={index % 2 ? undefined : "ghost"}>
              {city}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
