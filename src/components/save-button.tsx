"use client";

import { useState } from "react";

export function SaveButton({
  id,
  saved,
  onChange,
}: {
  id: string;
  saved: boolean;
  onChange?: (saved: boolean) => void;
}) {
  const [on, setOn] = useState(saved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const next = !on;
    setBusy(true);
    const res = await fetch("/api/saved", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listingId: id, saved: next }),
    });
    setBusy(false);
    if (!res.ok) return;
    setOn(next);
    onChange?.(next);
  }

  return (
    <button type="button" className={on ? "save on" : "save"} aria-pressed={on} disabled={busy} onClick={toggle}>
      {on ? "Saved" : "Save"}
    </button>
  );
}
