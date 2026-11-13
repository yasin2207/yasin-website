"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Intent } from "@/lib/types";
import { useChalwadi } from "./providers";

export function Nav() {
  const pathname = usePathname();
  const { session, intent, setIntent, openSignIn, signOut } = useChalwadi();
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const lenis = window.__chalwadiLenis;
    lenis?.stop();
    return () => lenis?.start();
  }, [menu]);

  function pick(next: Intent, event: React.MouseEvent<HTMLAnchorElement>) {
    setIntent(next, { x: event.clientX, y: event.clientY });
    setMenu(false);
    if (pathname === "/") {
      const film = document.getElementById("film");
      if (film && window.__chalwadiLenis) window.__chalwadiLenis.scrollTo(film, { offset: -12 });
    }
  }

  return (
    <>
      <header className={solid || menu ? "nav solid" : "nav"}>
        <Link href="/" className="mark">
          <strong>Chalwadi</strong>
          <em>Enterprise</em>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/" aria-current={intent === "buy" && pathname === "/" ? "page" : undefined} onClick={(event) => pick("buy", event)}>
            Buy
          </Link>
          <Link href="/" aria-current={intent === "rent" && pathname === "/" ? "page" : undefined} onClick={(event) => pick("rent", event)}>
            Let
          </Link>
          <Link href="/register" aria-current={pathname === "/register" ? "page" : undefined}>
            Register
          </Link>
          <Link href="/file" aria-current={pathname === "/file" ? "page" : undefined}>
            File a house
          </Link>
          {session ? (
            <>
              <Link href="/desk" className="nav-name" aria-current={pathname === "/desk" ? "page" : undefined}>
                {session.name}
              </Link>
              <button type="button" onClick={() => void signOut()}>
                Sign out
              </button>
            </>
          ) : (
            <button type="button" onClick={openSignIn}>
              Sign in
            </button>
          )}
        </nav>
        <button type="button" className="nav-burger" aria-expanded={menu} onClick={() => setMenu((value) => !value)}>
          {menu ? "Close" : "Menu"}
        </button>
      </header>
      <div className={menu ? "menu open" : "menu"} inert={!menu}>
        <Link href="/" onClick={(event) => pick("buy", event)}>Buy</Link>
        <Link href="/" onClick={(event) => pick("rent", event)}>Let</Link>
        <Link href="/register">Register</Link>
        <Link href="/file">File a house</Link>
        {session ? <Link href="/desk">{session.name}</Link> : <button type="button" onClick={() => { setMenu(false); openSignIn(); }}>Sign in</button>}
      </div>
    </>
  );
}
