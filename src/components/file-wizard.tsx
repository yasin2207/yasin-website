"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DOC_TYPES, LIMITS, parseFiling, type FilingInput } from "@/lib/filing";
import { formatPrice } from "@/lib/money";
import { PRESETS } from "@/lib/presets";
import type { Intent } from "@/lib/types";
import { useChalwadi } from "./providers";

const STEPS = [
  { id: "01", label: "Side" },
  { id: "02", label: "Name" },
  { id: "03", label: "Place" },
  { id: "04", label: "Measure" },
  { id: "05", label: "Note" },
  { id: "06", label: "Photograph" },
  { id: "07", label: "Verify" },
];

type Draft = {
  intent: Intent | null;
  title: string;
  neighborhood: string;
  city: string;
  price: string;
  beds: string;
  baths: string;
  area: string;
  description: string;
  image: string;
  ownerName: string;
  phone: string;
  docType: string;
  docLast4: string;
  authority: boolean;
};

const EMPTY: Draft = {
  intent: null,
  title: "",
  neighborhood: "",
  city: "",
  price: "",
  beds: "",
  baths: "",
  area: "",
  description: "",
  image: "",
  ownerName: "",
  phone: "",
  docType: "PAN",
  docLast4: "",
  authority: false,
};

export function FileWizard({ signedIn, name }: { signedIn: boolean; name: string }) {
  const { openSignIn } = useChalwadi();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filed, setFiled] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!name) return;
    setDraft((current) => (current.ownerName ? current : { ...current, ownerName: name }));
  }, [name]);

  function patch(partial: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...partial }));
    setError("");
  }

  function issue(index: number) {
    if (index === 0 && !draft.intent) return "Choose sale or let.";
    if (index === 1 && draft.title.trim().length < LIMITS.title[0]) return "Give the house a name.";
    if (index === 2 && (draft.city.trim().length < 2 || draft.neighborhood.trim().length < 2)) return "Add the city and the neighbourhood.";
    if (index === 3) {
      const price = Number(draft.price.replace(/[, ]/g, ""));
      const beds = Number(draft.beds);
      const baths = Number(draft.baths);
      const area = Number(draft.area);
      if (!draft.intent) return "Choose sale or let.";
      const bounds = draft.intent === "buy" ? LIMITS.buyPrice : LIMITS.rentPrice;
      if (!draft.price.trim() || !draft.beds.trim() || !draft.baths.trim() || !draft.area.trim()) {
        return "Fill the price, the rooms, and the area.";
      }
      if (!Number.isInteger(price) || price < bounds[0] || price > bounds[1]) {
        return draft.intent === "buy" ? "Enter a sale price in rupees, between 10 lakh and 200 crore." : "Enter a monthly rent in rupees.";
      }
      if (!Number.isInteger(beds) || beds < LIMITS.beds[0] || beds > LIMITS.beds[1]) return "Beds should be a whole number up to 12.";
      if (!Number.isInteger(baths) || baths < LIMITS.baths[0] || baths > LIMITS.baths[1]) return "Add at least one bath.";
      if (!Number.isInteger(area) || area < LIMITS.area[0] || area > LIMITS.area[1]) return "Area should be between 150 and 20,000 square feet.";
    }
    if (index === 4 && draft.description.trim().length < LIMITS.description[0]) return "Write a short note about the house, at least a sentence.";
    if (index === 5 && !draft.image) return "Choose a photograph from the set.";
    if (index === 6) {
      if (draft.ownerName.trim().length < 2) return "Add the name on the papers.";
      if (draft.phone.replace(/[^\d]/g, "").length < 10) return "Use a phone number with at least 10 digits.";
      if (draft.docLast4.replace(/[^A-Za-z0-9]/g, "").length !== 4) return "Enter the last four characters of that document.";
      if (!draft.authority) return "Confirm you have authority to file this house.";
    }
    return "";
  }

  function next() {
    const problem = issue(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  }

  async function submit() {
    const problem = issue(6);
    if (problem) {
      setError(problem);
      return;
    }
    if (!signedIn) {
      openSignIn();
      setError("Sign in, then the seal can land.");
      return;
    }
    const input: FilingInput = {
      intent: draft.intent,
      title: draft.title,
      neighborhood: draft.neighborhood,
      city: draft.city,
      price: draft.price,
      beds: draft.beds,
      baths: draft.baths,
      area: draft.area,
      description: draft.description,
      image: draft.image,
      ownerName: draft.ownerName,
      phone: draft.phone,
      docType: draft.docType,
      docLast4: draft.docLast4,
      authority: draft.authority,
    };
    const parsed = parseFiling(input);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setBusy(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; listing?: { id: string; title: string } };
    setBusy(false);
    if (res.status === 401) {
      openSignIn();
      setError("Sign in, then the seal can land.");
      return;
    }
    if (!res.ok || !data.listing) {
      setError(data.error || "The filing did not land.");
      return;
    }
    setFiled({ id: data.listing.id, title: data.listing.title });
  }

  const pricePreview = (() => {
    const price = Number(draft.price.replace(/[, ]/g, ""));
    if (!draft.intent || !Number.isInteger(price) || price <= 0) return "";
    return formatPrice(draft.intent, price);
  })();

  return (
    <main className="wizard">
      <aside className="step-index" aria-label="Filing steps">
        {STEPS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={index === step && !filed ? "on" : undefined}
            onClick={() => {
              if (filed || index > step) return;
              setStep(index);
              setError("");
            }}
          >
            <span>{item.id}</span> {item.label}
          </button>
        ))}
      </aside>
      {filed ? (
        <section className="step-pane stamped">
          <p className="eyebrow">Filed</p>
          <h2>{filed.title}</h2>
          <p>Reference {filed.id}. On this prototype the seal is immediate. A live desk would still call before the house is shown to anyone outside the firm.</p>
          <div className="stamp">Verified · Chalwadi</div>
          <div className="hero-actions">
            <Link className="btn solid" href={`/property/${filed.id}`}>
              Open the house
            </Link>
            <Link className="btn" href="/register">
              See the register
            </Link>
          </div>
        </section>
      ) : (
        <section className="step-pane" key={step}>
          {step === 0 ? (
            <>
              <h2 className="ask">Is this a sale or a let?</h2>
              <button type="button" className={draft.intent === "buy" ? "choice on" : "choice"} onClick={() => patch({ intent: "buy" })}>
                For sale
              </button>
              <button type="button" className={draft.intent === "rent" ? "choice on" : "choice"} onClick={() => patch({ intent: "rent" })}>
                To let
              </button>
            </>
          ) : null}
          {step === 1 ? (
            <>
              <h2 className="ask">What do we call it?</h2>
              <label className="field">
                <span>House name</span>
                <input value={draft.title} onChange={(event) => patch({ title: event.target.value })} maxLength={80} placeholder="North Avenue bungalow" />
              </label>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <h2 className="ask">Where does it stand?</h2>
              <label className="field">
                <span>Neighbourhood</span>
                <input value={draft.neighborhood} onChange={(event) => patch({ neighborhood: event.target.value })} maxLength={48} placeholder="Koregaon Park" />
              </label>
              <label className="field">
                <span>City</span>
                <input value={draft.city} onChange={(event) => patch({ city: event.target.value })} maxLength={48} placeholder="Pune" />
              </label>
            </>
          ) : null}
          {step === 3 ? (
            <>
              <h2 className="ask">{draft.intent === "rent" ? "Monthly rent, and the rooms." : "The price, and the rooms."}</h2>
              <div className="measure">
                <label className="field">
                  <span>{draft.intent === "rent" ? "Rent in rupees" : "Price in rupees"}</span>
                  <input inputMode="numeric" value={draft.price} onChange={(event) => patch({ price: event.target.value })} placeholder={draft.intent === "rent" ? "160000" : "64000000"} />
                </label>
                <label className="field">
                  <span>Beds</span>
                  <input inputMode="numeric" value={draft.beds} onChange={(event) => patch({ beds: event.target.value })} placeholder="3" />
                </label>
                <label className="field">
                  <span>Baths</span>
                  <input inputMode="numeric" value={draft.baths} onChange={(event) => patch({ baths: event.target.value })} placeholder="3" />
                </label>
                <label className="field">
                  <span>Square feet</span>
                  <input inputMode="numeric" value={draft.area} onChange={(event) => patch({ area: event.target.value })} placeholder="1800" />
                </label>
              </div>
              {pricePreview ? <p className="quiet">{pricePreview}</p> : null}
            </>
          ) : null}
          {step === 4 ? (
            <>
              <h2 className="ask">Two honest lines.</h2>
              <label className="field">
                <span>About the house</span>
                <textarea value={draft.description} onChange={(event) => patch({ description: event.target.value })} maxLength={700} placeholder="What a person would notice in the first ten minutes." />
              </label>
            </>
          ) : null}
          {step === 5 ? (
            <>
              <h2 className="ask">Choose a stand-in photograph.</h2>
              <p className="quiet">This prototype keeps a set of photographs. A live desk would take the pictures from the walk.</p>
              <div className="photo-pick">
                {PRESETS.map((preset) => (
                  <button key={preset.src} type="button" className={draft.image === preset.src ? "on" : undefined} onClick={() => patch({ image: preset.src })}>
                    <img src={preset.src} alt={preset.label} />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
          {step === 6 ? (
            <>
              <h2 className="ask">Who is filing it?</h2>
              <p className="quiet">We keep the last four characters only. The rest of the document stays off this copy.</p>
              {!signedIn ? <p className="quiet">You will sign in before the seal lands. The answers stay on this page.</p> : null}
              <div className="measure">
                <label className="field">
                  <span>Name on the papers</span>
                  <input value={draft.ownerName} onChange={(event) => patch({ ownerName: event.target.value })} maxLength={80} autoComplete="name" />
                </label>
                <label className="field">
                  <span>Phone</span>
                  <input value={draft.phone} onChange={(event) => patch({ phone: event.target.value })} inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" />
                </label>
                <label className="field">
                  <span>Document</span>
                  <select value={draft.docType} onChange={(event) => patch({ docType: event.target.value })}>
                    {DOC_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Last four</span>
                  <input value={draft.docLast4} onChange={(event) => patch({ docLast4: event.target.value })} maxLength={4} autoCapitalize="characters" />
                </label>
              </div>
              <label className="check">
                <input type="checkbox" checked={draft.authority} onChange={(event) => patch({ authority: event.target.checked })} />
                <span>I am the owner, or I have written authority to file this house.</span>
              </label>
            </>
          ) : null}
          {error ? <p className="form-error">{error}</p> : <p className="form-error" aria-hidden="true" />}
          <div className="wizard-nav">
            {step > 0 ? (
              <button type="button" className="btn" onClick={() => { setStep((value) => value - 1); setError(""); }}>
                Back
              </button>
            ) : (
              <span />
            )}
            {step < 6 ? (
              <button type="button" className="btn solid" onClick={next}>
                Continue
              </button>
            ) : (
              <button type="button" className="btn solid" onClick={() => void submit()} disabled={busy}>
                {busy ? "Sealing" : "Seal and file"}
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
