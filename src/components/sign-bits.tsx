"use client";

import { useChalwadi } from "./providers";

export function SignInButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { openSignIn } = useChalwadi();
  return (
    <button type="button" className={className ?? "btn"} onClick={openSignIn}>
      {children}
    </button>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  const { signOut } = useChalwadi();
  return (
    <button type="button" className={className ?? "btn"} onClick={() => void signOut()}>
      Sign out
    </button>
  );
}
