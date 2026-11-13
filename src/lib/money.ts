import type { Intent } from "./types";

export function formatPrice(intent: Intent, inr: number) {
  if (intent === "rent") {
    return `${inrWords(inr)} / month`;
  }
  if (inr >= 10000000) {
    const cr = inr / 10000000;
    const digits = cr >= 10 ? 1 : 2;
    return `₹${trim(cr.toFixed(digits))} Cr`;
  }
  if (inr >= 100000) {
    const lakhs = inr / 100000;
    const digits = lakhs >= 10 ? 1 : 2;
    return `₹${trim(lakhs.toFixed(digits))} L`;
  }
  return inrWords(inr);
}

function inrWords(inr: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(inr);
}

function trim(value: string) {
  return value.replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1");
}

export function formatArea(sqft: number) {
  return `${new Intl.NumberFormat("en-IN").format(sqft)} sq ft`;
}

export function rooms(beds: number, baths: number) {
  const bed = beds === 0 ? "Studio" : beds === 1 ? "1 bed" : `${beds} beds`;
  const bath = baths === 1 ? "1 bath" : `${baths} baths`;
  return `${bed} · ${bath}`;
}

export function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
