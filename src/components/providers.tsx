"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Intent, PublicSession } from "@/lib/types";
import { mountSmooth } from "./smooth";

type ChalwadiContext = {
  session: PublicSession | null;
  intent: Intent;
  setIntent: (next: Intent, origin?: { x: number; y: number }) => void;
  openSignIn: () => void;
  signOut: () => Promise<void>;
};

const Chalwadi = createContext<ChalwadiContext | null>(null);

export function useChalwadi() {
  const value = useContext(Chalwadi);
  if (!value) throw new Error("Chalwadi context missing");
  return value;
}

export function Providers({
  initialSession,
  initialIntent,
  children,
}: {
  initialSession: PublicSession | null;
  initialIntent: Intent;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [intent, setIntentState] = useState<Intent>(initialIntent);
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const googleHost = useRef<HTMLDivElement>(null);
  const intentRef = useRef(intent);
  const pendingIntent = useRef<Intent | null>(null);
  const washToken = useRef(0);

  useEffect(() => {
    intentRef.current = intent;
  }, [intent]);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession?.name, initialSession?.email, initialSession?.provider]);

  useEffect(() => mountSmooth(), []);

  useEffect(() => {
    let gone = false;
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: { googleClientId?: string | null }) => {
        if (!gone) setClientId(data.googleClientId || null);
      })
      .catch(() => {
        if (!gone) setClientId(null);
      });
    return () => {
      gone = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const lenis = window.__chalwadiLenis;
    lenis?.stop();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !clientId) return;
    let cancelled = false;
    const mount = () => {
      if (cancelled || !googleHost.current || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          void acceptGoogle(response.credential);
        },
      });
      googleHost.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleHost.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 280,
      });
    };
    if (window.google) {
      mount();
      return () => {
        cancelled = true;
      };
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-gsi]");
    if (existing) {
      existing.addEventListener("load", mount);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", mount);
      };
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.dataset.gsi = "1";
    script.onload = mount;
    document.body.appendChild(script);
    return () => {
      cancelled = true;
    };
  }, [open, clientId]);

  function accept(next: PublicSession) {
    setSession(next);
    setOpen(false);
    setAuthError("");
    router.refresh();
  }

  async function acceptGoogle(credential: string) {
    setBusy(true);
    setAuthError("");
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const data = (await res.json().catch(() => ({}))) as PublicSession & { error?: string };
    setBusy(false);
    if (!res.ok || !data.name) {
      setAuthError(data.error || "Google did not accept that sign-in.");
      return;
    }
    accept({ name: data.name, email: data.email || "", provider: "google" });
  }

  async function acceptPreview(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setAuthError("");
    const res = await fetch("/api/auth/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: previewName }),
    });
    const data = (await res.json().catch(() => ({}))) as PublicSession & { error?: string };
    setBusy(false);
    if (!res.ok || !data.name) {
      setAuthError(data.error || "The preview entry did not open.");
      return;
    }
    accept({ name: data.name, email: "", provider: "preview" });
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setSession(null);
    router.refresh();
  }

  function setIntent(next: Intent, origin?: { x: number; y: number }) {
    if ((pendingIntent.current ?? intentRef.current) === next) return;
    pendingIntent.current = next;
    const apply = () => {
      document.documentElement.dataset.intent = next;
      document.cookie = `chalwadi_intent=${next}; path=/; max-age=31536000; samesite=lax`;
      intentRef.current = next;
      pendingIntent.current = null;
      setIntentState(next);
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      apply();
      return;
    }
    const token = ++washToken.current;
    document.querySelectorAll(".wash").forEach((node) => node.remove());
    const wash = document.createElement("div");
    wash.className = "wash";
    wash.style.background = next === "rent" ? "#10141c" : "#e6e0d4";
    wash.style.setProperty("--x", `${origin?.x ?? window.innerWidth * 0.72}px`);
    wash.style.setProperty("--y", `${origin?.y ?? 70}px`);
    document.body.appendChild(wash);
    requestAnimationFrame(() => wash.classList.add("go"));
    window.setTimeout(() => {
      if (washToken.current !== token) return;
      apply();
      window.setTimeout(() => {
        if (washToken.current === token) wash.remove();
      }, 80);
    }, 760);
  }

  return (
    <Chalwadi.Provider value={{ session, intent, setIntent, openSignIn: () => setOpen(true), signOut }}>
      {children}
      {open ? (
        <div className="dialog-back" onClick={() => setOpen(false)}>
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">Chalwadi Enterprise</p>
            <h2 id="sign-title">Sign in</h2>
            <p>The register, a saved house, and a new filing sit with your name.</p>
            {clientId ? <div ref={googleHost} className="google-host" /> : null}
            {clientId ? (
              <button type="button" className="text-button" onClick={() => setShowPreview((value) => !value)}>
                {showPreview ? "Hide preview identity" : "Use a preview identity"}
              </button>
            ) : (
              <p>Google sign-in switches on when a Google client id is connected. For this preview, enter a name and open the register.</p>
            )}
            {!clientId || showPreview ? (
              <form onSubmit={acceptPreview} className="preview-form">
                <label className="field">
                  <span>Name</span>
                  <input
                    value={previewName}
                    onChange={(event) => setPreviewName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    maxLength={60}
                  />
                </label>
                <button className="btn solid" type="submit" disabled={busy}>
                  {busy ? "Opening" : "Enter the register"}
                </button>
              </form>
            ) : null}
            {authError ? <p className="form-error">{authError}</p> : null}
            <button type="button" className="text-button" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </Chalwadi.Provider>
  );
}
