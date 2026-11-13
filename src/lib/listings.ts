import "server-only";
import { randomBytes } from "node:crypto";
import { sql } from "./db";
import type { Filing } from "./filing";
import type { Listing, Note, OwnedListing } from "./types";

const SAMPLE: Array<Omit<Listing, "sample">> = [
  {
    id: "ch-north-avenue",
    intent: "buy",
    title: "North Avenue bungalow",
    neighborhood: "Koregaon Park",
    city: "Pune",
    priceInr: 64000000,
    beds: 4,
    baths: 4,
    areaSqft: 3200,
    description: "The teak stair is original. The kitchen was rebuilt in lime plaster last year, and the garden takes the morning sun. Sale papers are already in the file.",
    image: "/houses/north.jpg",
    sort: 1,
  },
  {
    id: "ch-sea-court",
    intent: "buy",
    title: "Sea Court",
    neighborhood: "Revdanda",
    city: "Alibaug",
    priceInr: 91000000,
    beds: 5,
    baths: 5,
    areaSqft: 4800,
    description: "Laterite walls, a court in the middle, and a path to a private strip of beach. The monsoon side is the one with the deep eaves.",
    image: "/houses/sea.jpg",
    sort: 2,
  },
  {
    id: "ch-pali-hill",
    intent: "rent",
    title: "Third floor, Pali Hill",
    neighborhood: "Pali Hill",
    city: "Mumbai",
    priceInr: 240000,
    beds: 3,
    baths: 3,
    areaSqft: 1680,
    description: "A quiet floor above the trees, let furnished. The building is old enough that the lift still has a gate. Six months or longer.",
    image: "/houses/pali.jpg",
    sort: 3,
  },
  {
    id: "ch-nilgiri",
    intent: "buy",
    title: "Nilgiri House",
    neighborhood: "Sadashivanagar",
    city: "Bengaluru",
    priceInr: 125000000,
    beds: 5,
    baths: 6,
    areaSqft: 6100,
    description: "A long plot on a shaded road. The house sits well back, with a rain court and a study that can close its own door. Walked twice.",
    image: "/houses/nilgiri.jpg",
    sort: 4,
  },
  {
    id: "ch-candolim",
    intent: "rent",
    title: "Candolim season let",
    neighborhood: "Candolim",
    city: "Goa",
    priceInr: 160000,
    beds: 3,
    baths: 3,
    areaSqft: 2100,
    description: "November to May, or the full year if you want the rain. A pool that is not shared, and a lane with no through-traffic.",
    image: "/houses/candolim.jpg",
    sort: 5,
  },
  {
    id: "ch-jubilee",
    intent: "buy",
    title: "Jubilee corner",
    neighborhood: "Jubilee Hills",
    city: "Hyderabad",
    priceInr: 78000000,
    beds: 4,
    baths: 4,
    areaSqft: 3900,
    description: "A corner plot and a frangipani older than the renovation. Four rooms, a winter terrace, and parking that fits two cars.",
    image: "/houses/jubilee.jpg",
    sort: 6,
  },
  {
    id: "ch-colaba",
    intent: "rent",
    title: "Colaba walk-up",
    neighborhood: "Colaba",
    city: "Mumbai",
    priceInr: 310000,
    beds: 2,
    baths: 2,
    areaSqft: 980,
    description: "Two rooms over a bakery. Bread at six in the morning is part of the let. Unfurnished, original floor, stairs instead of a lift.",
    image: "/houses/colaba.jpg",
    sort: 7,
  },
  {
    id: "ch-aundh",
    intent: "buy",
    title: "Aundh courtyard",
    neighborhood: "Aundh",
    city: "Pune",
    priceInr: 32000000,
    beds: 3,
    baths: 3,
    areaSqft: 1860,
    description: "A small house built around a court, for someone who wants Pune without a tower. One row, one lane, no podium.",
    image: "/houses/aundh.jpg",
    sort: 8,
  },
  {
    id: "ch-lavelle",
    intent: "rent",
    title: "Lavelle upper",
    neighborhood: "Lavelle Road",
    city: "Bengaluru",
    priceInr: 205000,
    beds: 3,
    baths: 3,
    areaSqft: 1540,
    description: "High enough to clear the plane trees. Let empty. A year is preferred, and the concierge still uses a book.",
    image: "/houses/lavelle.jpg",
    sort: 9,
  },
  {
    id: "ch-kalyani",
    intent: "buy",
    title: "Kalyani bungalow",
    neighborhood: "Kalyani Nagar",
    city: "Pune",
    priceInr: 55000000,
    beds: 4,
    baths: 4,
    areaSqft: 2800,
    description: "East-facing, with a neem on the boundary the next owner is asked to keep. The terrace was added in 2019 and detailed properly.",
    image: "/houses/kalyani.jpg",
    sort: 10,
  },
  {
    id: "ch-anjuna",
    intent: "rent",
    title: "Anjuna longhouse",
    neighborhood: "Anjuna",
    city: "Goa",
    priceInr: 125000,
    beds: 2,
    baths: 2,
    areaSqft: 1400,
    description: "One long room, a bedroom behind it, a short walk from the cliff. Built for a season of work, not a week of noise.",
    image: "/houses/anjuna.jpg",
    sort: 11,
  },
  {
    id: "ch-boat-club",
    intent: "buy",
    title: "Boat Club annexe",
    neighborhood: "Boat Club Road",
    city: "Pune",
    priceInr: 87000000,
    beds: 4,
    baths: 5,
    areaSqft: 4100,
    description: "Just off the club road. A formal front, a looser garden at the back, and an annexe that can be a studio or a parent's room.",
    image: "/houses/boat.jpg",
    sort: 12,
  },
];

let pending: Promise<void> | null = null;

function ready() {
  pending ??= seed().catch((error: unknown) => {
    pending = null;
    throw error;
  });
  return pending;
}

async function seed() {
  for (const row of SAMPLE) {
    await sql(
      `insert into listings (
        id, intent, title, neighborhood, city, price_inr, beds, baths, area_sqft,
        description, image, sample, status, sort
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,'live',$12)
      on conflict (id) do nothing`,
      [
        row.id,
        row.intent,
        row.title,
        row.neighborhood,
        row.city,
        row.priceInr,
        row.beds,
        row.baths,
        row.areaSqft,
        row.description,
        row.image,
        row.sort,
      ],
    );
  }
}

const PUBLIC_COLUMNS = `id, intent, title, neighborhood, city, price_inr, beds, baths, area_sqft, description, image, sample, sort`;

function mapListing(row: Record<string, unknown>): Listing {
  return {
    id: String(row.id),
    intent: row.intent === "rent" ? "rent" : "buy",
    title: String(row.title),
    neighborhood: String(row.neighborhood),
    city: String(row.city),
    priceInr: Number(row.price_inr),
    beds: Number(row.beds),
    baths: Number(row.baths),
    areaSqft: Number(row.area_sqft),
    description: String(row.description),
    image: String(row.image),
    sample: row.sample === true || row.sample === "t" || row.sample === "true",
    sort: Number(row.sort ?? 0),
  };
}

function asIso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

export function validId(id: string) {
  return /^ch-[a-z0-9-]{4,48}$/.test(id);
}

export async function listSamples() {
  await ready();
  const rows = await sql<Record<string, unknown>>(
    `select ${PUBLIC_COLUMNS} from listings where sample = true and status = 'live' order by sort asc`,
  );
  return rows.map(mapListing);
}

export async function listAll() {
  await ready();
  const rows = await sql<Record<string, unknown>>(
    `select ${PUBLIC_COLUMNS} from listings where status = 'live' order by sample asc, sort asc, created_at desc`,
  );
  return rows.map(mapListing);
}

export async function getListing(id: string) {
  if (!validId(id)) return null;
  await ready();
  const rows = await sql<Record<string, unknown>>(
    `select ${PUBLIC_COLUMNS}, owner_sub from listings where id = $1 and status = 'live'`,
    [id],
  );
  const row = rows[0];
  if (!row) return null;
  return { ...mapListing(row), ownerSub: row.owner_sub ? String(row.owner_sub) : null };
}

export async function createFiling(ownerSub: string, filing: Filing) {
  await ready();
  const countRows = await sql<{ n: number }>(`select count(*)::int as n from listings where owner_sub = $1`, [ownerSub]);
  if (Number(countRows[0]?.n ?? 0) >= 24) {
    return { ok: false as const, error: "This desk already holds 24 houses." };
  }
  const id = `ch-${randomBytes(5).toString("hex")}`;
  await sql(
    `insert into listings (
      id, intent, title, neighborhood, city, price_inr, beds, baths, area_sqft,
      description, image, sample, status, sort, owner_sub, owner_name, owner_phone, doc_type, doc_last4
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false,'live',0,$12,$13,$14,$15,$16)`,
    [
      id,
      filing.intent,
      filing.title,
      filing.neighborhood,
      filing.city,
      filing.priceInr,
      filing.beds,
      filing.baths,
      filing.areaSqft,
      filing.description,
      filing.image,
      ownerSub,
      filing.ownerName,
      filing.phone,
      filing.docType,
      filing.docLast4,
    ],
  );
  const listing = await getListing(id);
  if (!listing) return { ok: false as const, error: "The filing did not land. Try once more." };
  return { ok: true as const, listing };
}

export async function savedIds(ownerSub: string) {
  await ready();
  const rows = await sql<{ listing_id: string }>(`select listing_id from saved_homes where owner_sub = $1`, [ownerSub]);
  return rows.map((row) => row.listing_id);
}

export async function setSaved(ownerSub: string, listingId: string, saved: boolean) {
  if (!validId(listingId)) return false;
  await ready();
  const existing = await getListing(listingId);
  if (!existing) return false;
  if (saved) {
    await sql(
      `insert into saved_homes (owner_sub, listing_id) values ($1, $2) on conflict (owner_sub, listing_id) do nothing`,
      [ownerSub, listingId],
    );
  } else {
    await sql(`delete from saved_homes where owner_sub = $1 and listing_id = $2`, [ownerSub, listingId]);
  }
  return true;
}

export async function listSaved(ownerSub: string) {
  await ready();
  const rows = await sql<Record<string, unknown>>(
    `select ${PUBLIC_COLUMNS.split(", ").map((column) => `l.${column}`).join(", ")}
     from saved_homes s join listings l on l.id = s.listing_id
     where s.owner_sub = $1 and l.status = 'live'
     order by s.created_at desc`,
    [ownerSub],
  );
  return rows.map(mapListing);
}

export async function listOwned(ownerSub: string): Promise<OwnedListing[]> {
  await ready();
  const rows = await sql<Record<string, unknown>>(
    `select ${PUBLIC_COLUMNS}, owner_phone, doc_type, doc_last4, created_at
     from listings where owner_sub = $1 order by created_at desc`,
    [ownerSub],
  );
  return rows.map((row) => ({
    ...mapListing(row),
    phone: String(row.owner_phone ?? ""),
    docType: String(row.doc_type ?? ""),
    docLast4: String(row.doc_last4 ?? ""),
    createdAt: asIso(row.created_at),
  }));
}

export async function addInquiry(listingId: string, fromSub: string, fromName: string, note: string) {
  if (!validId(listingId)) return { ok: false as const, error: "That house is not on the register." };
  const clean = note.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);
  if (clean.length < 8) return { ok: false as const, error: "Write a note of at least a few words." };
  await ready();
  const listing = await getListing(listingId);
  if (!listing) return { ok: false as const, error: "That house is not on the register." };
  if (listing.ownerSub && listing.ownerSub === fromSub) {
    return { ok: false as const, error: "This one is already on your desk." };
  }
  const id = `nq-${randomBytes(5).toString("hex")}`;
  await sql(
    `insert into inquiries (id, listing_id, from_sub, from_name, note) values ($1, $2, $3, $4, $5)`,
    [id, listingId, fromSub, fromName.slice(0, 80), clean],
  );
  return { ok: true as const };
}

export async function notesSent(ownerSub: string): Promise<Note[]> {
  await ready();
  const rows = await sql<Record<string, unknown>>(
    `select i.id, i.listing_id, l.title as listing_title, i.from_name, i.note, i.created_at
     from inquiries i join listings l on l.id = i.listing_id
     where i.from_sub = $1 order by i.created_at desc`,
    [ownerSub],
  );
  return rows.map(mapNote);
}

export async function notesReceived(ownerSub: string): Promise<Note[]> {
  await ready();
  const rows = await sql<Record<string, unknown>>(
    `select i.id, i.listing_id, l.title as listing_title, i.from_name, i.note, i.created_at
     from inquiries i join listings l on l.id = i.listing_id
     where l.owner_sub = $1 order by i.created_at desc`,
    [ownerSub],
  );
  return rows.map(mapNote);
}

function mapNote(row: Record<string, unknown>): Note {
  return {
    id: String(row.id),
    listingId: String(row.listing_id),
    listingTitle: String(row.listing_title),
    fromName: String(row.from_name),
    note: String(row.note),
    createdAt: asIso(row.created_at),
  };
}
