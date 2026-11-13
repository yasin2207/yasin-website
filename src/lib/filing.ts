import { PRESET_SRC } from "./presets";
import type { Intent } from "./types";

export const DOC_TYPES = ["Aadhaar", "PAN", "Passport", "Sale deed"] as const;

export const LIMITS = {
  title: [3, 80] as const,
  place: [2, 48] as const,
  buyPrice: [1000000, 2000000000] as const,
  rentPrice: [8000, 5000000] as const,
  beds: [0, 12] as const,
  baths: [1, 12] as const,
  area: [150, 20000] as const,
  description: [20, 700] as const,
};

export type FilingInput = {
  intent: unknown;
  title: unknown;
  neighborhood: unknown;
  city: unknown;
  price: unknown;
  beds: unknown;
  baths: unknown;
  area: unknown;
  description: unknown;
  image: unknown;
  ownerName: unknown;
  phone: unknown;
  docType: unknown;
  docLast4: unknown;
  authority: unknown;
};

export type Filing = {
  intent: Intent;
  title: string;
  neighborhood: string;
  city: string;
  priceInr: number;
  beds: number;
  baths: number;
  areaSqft: number;
  description: string;
  image: string;
  ownerName: string;
  phone: string;
  docType: string;
  docLast4: string;
};

export function parseFiling(input: FilingInput): { ok: true; value: Filing } | { ok: false; error: string } {
  if (input.authority !== true) {
    return { ok: false, error: "Confirm you have authority to file this house." };
  }
  if (input.intent !== "buy" && input.intent !== "rent") {
    return { ok: false, error: "Choose sale or let." };
  }
  const intent = input.intent;
  const title = clip(input.title, LIMITS.title[1]);
  if (title.length < LIMITS.title[0]) return { ok: false, error: "Give the house a name." };
  const neighborhood = clip(input.neighborhood, LIMITS.place[1]);
  const city = clip(input.city, LIMITS.place[1]);
  if (neighborhood.length < LIMITS.place[0] || city.length < LIMITS.place[0]) {
    return { ok: false, error: "Add the city and the neighbourhood." };
  }
  const priceBounds = intent === "buy" ? LIMITS.buyPrice : LIMITS.rentPrice;
  const price = whole(input.price);
  if (price === null || price < priceBounds[0] || price > priceBounds[1]) {
    return {
      ok: false,
      error: intent === "buy" ? "Enter a sale price in rupees, between 10 lakh and 200 crore." : "Enter a monthly rent in rupees.",
    };
  }
  const beds = whole(input.beds);
  const baths = whole(input.baths);
  const area = whole(input.area);
  if (beds === null || beds < LIMITS.beds[0] || beds > LIMITS.beds[1]) {
    return { ok: false, error: "Beds should be a whole number up to 12." };
  }
  if (baths === null || baths < LIMITS.baths[0] || baths > LIMITS.baths[1]) {
    return { ok: false, error: "Add at least one bath." };
  }
  if (area === null || area < LIMITS.area[0] || area > LIMITS.area[1]) {
    return { ok: false, error: "Area should be between 150 and 20,000 square feet." };
  }
  const description = clip(input.description, LIMITS.description[1]);
  if (description.length < LIMITS.description[0]) {
    return { ok: false, error: "Write a short note about the house, at least a sentence." };
  }
  const image = typeof input.image === "string" ? input.image : "";
  if (!PRESET_SRC.has(image)) return { ok: false, error: "Choose a photograph from the set." };
  const ownerName = clip(input.ownerName, 80);
  if (ownerName.length < 2) return { ok: false, error: "Add the name on the papers." };
  const phone = String(input.phone ?? "").replace(/[^\d]/g, "").slice(0, 15);
  if (phone.length < 10) return { ok: false, error: "Use a phone number with at least 10 digits." };
  const docType = typeof input.docType === "string" ? input.docType : "";
  if (!DOC_TYPES.includes(docType as (typeof DOC_TYPES)[number])) {
    return { ok: false, error: "Choose the document you are showing." };
  }
  const docLast4 = String(input.docLast4 ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 4);
  if (docLast4.length !== 4) return { ok: false, error: "Enter the last four characters of that document." };
  return {
    ok: true,
    value: {
      intent,
      title,
      neighborhood,
      city,
      priceInr: price,
      beds,
      baths,
      areaSqft: area,
      description,
      image,
      ownerName,
      phone,
      docType,
      docLast4: docLast4.toUpperCase(),
    },
  };
}

function clip(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function whole(value: unknown) {
  const text = typeof value === "number" && Number.isFinite(value) ? String(Math.trunc(value)) : typeof value === "string" ? value.replace(/[, ]/g, "") : "";
  if (!/^\d+$/.test(text)) return null;
  const number = Number(text);
  if (!Number.isSafeInteger(number)) return null;
  return number;
}
