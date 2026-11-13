"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let users = 0;
let ticker: ((time: number) => void) | null = null;

export function mountSmooth() {
  if (typeof window === "undefined") return () => {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (reduce || !fine) return () => {};
  users += 1;
  if (!lenis) {
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      anchors: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const instance = lenis;
    ticker = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    window.__chalwadiLenis = lenis;
  }
  return () => {
    users = Math.max(0, users - 1);
    if (users === 0 && lenis) {
      if (ticker) gsap.ticker.remove(ticker);
      ticker = null;
      lenis.destroy();
      lenis = null;
      delete window.__chalwadiLenis;
    }
  };
}
