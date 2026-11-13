import type { Metadata } from "next";
import { Fraunces, Syne } from "next/font/google";
import { cookies } from "next/headers";
import { BootSkip } from "@/components/boot";
import { Cursor } from "@/components/cursor";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Providers } from "@/components/providers";
import { readSession, toPublic } from "@/lib/auth";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-display" });
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: { default: "Chalwadi Enterprise", template: "%s · Chalwadi Enterprise" },
  description: "Buy a house or take a let from the Chalwadi Enterprise register. Owners file a home after a short verification.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  const jar = await cookies();
  const intent = jar.get("chalwadi_intent")?.value === "rent" ? "rent" : "buy";
  return (
    <html lang="en" data-intent={intent} className={`${syne.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!sessionStorage.getItem('chalwadi-boot')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('booting');setTimeout(function(){sessionStorage.setItem('chalwadi-boot','1');document.documentElement.classList.remove('booting')},1700)}}catch(e){}",
          }}
        />
        <div className="boot-gate">
          <p className="boot-word">Chalwadi</p>
          <div className="boot-line" />
          <BootSkip />
        </div>
        <svg className="grain-svg" aria-hidden="true">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          </filter>
        </svg>
        <div className="grain" />
        <a className="skip" href="#content">
          Skip to the houses
        </a>
        <Providers initialSession={session ? toPublic(session) : null} initialIntent={intent}>
          <Nav />
          {children}
          <Footer />
          <Cursor />
        </Providers>
      </body>
    </html>
  );
}
