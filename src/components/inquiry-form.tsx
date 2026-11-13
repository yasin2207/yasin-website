"use client";

import { useState } from "react";
import { SignInButton } from "./sign-bits";

export function InquiryForm({ id, signedIn }: { id: string; signedIn: boolean }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <div className="ask-block">
        <p>Sign in to ask for a viewing. The note goes to the desk that holds the house.</p>
        <SignInButton className="btn solid">Sign in</SignInButton>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="ask-block">
        <p className="eyebrow">Sent</p>
        <p>The note is on the desk. Someone will answer with a time.</p>
      </div>
    );
  }

  return (
    <form
      className="ask-block"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        const res = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ listingId: id, note }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setBusy(false);
        if (!res.ok) {
          setError(data.error || "The note did not send.");
          return;
        }
        setSent(true);
      }}
    >
      <label className="field">
        <span>Ask for a viewing</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          required
          placeholder="A Saturday morning, or the name of the person coming."
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn solid" type="submit" disabled={busy}>
        {busy ? "Sending" : "Send the note"}
      </button>
    </form>
  );
}
