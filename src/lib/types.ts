export type Intent = "buy" | "rent";

export type Listing = {
  id: string;
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
  sample: boolean;
  sort: number;
};

export type PublicSession = {
  name: string;
  email: string;
  provider: "google" | "preview";
};

export type OwnedListing = Listing & {
  phone: string;
  docType: string;
  docLast4: string;
  createdAt: string;
};

export type Note = {
  id: string;
  listingId: string;
  listingTitle: string;
  fromName: string;
  note: string;
  createdAt: string;
};
