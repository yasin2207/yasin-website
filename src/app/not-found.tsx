import Link from "next/link";

export default function NotFound() {
  return (
    <main className="sheet">
      <p className="eyebrow">Missing</p>
      <h1>That page is not in the book.</h1>
      <Link className="btn" href="/">
        Back to the front
      </Link>
    </main>
  );
}
