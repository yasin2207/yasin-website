"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="sheet">
      <p className="eyebrow">Chalwadi Enterprise</p>
      <h1>The page did not open.</h1>
      <button className="btn" type="button" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
