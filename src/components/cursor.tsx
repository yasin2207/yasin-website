"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce || !dot.current || !ring.current) return;
    document.body.classList.add("has-cursor");
    const dotEl = dot.current;
    const ringEl = ring.current;
    const xTo = gsap.quickTo(ringEl, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(ringEl, "y", { duration: 0.45, ease: "power3.out" });
    const scaleTo = gsap.quickTo(ringEl, "scale", { duration: 0.35, ease: "power3.out" });
    const move = (event: PointerEvent) => {
      gsap.set(dotEl, { x: event.clientX - 3, y: event.clientY - 3, opacity: 1 });
      xTo(event.clientX - 18);
      yTo(event.clientY - 18);
      gsap.set(ringEl, { opacity: 1 });
      const target = event.target instanceof Element ? event.target : null;
      scaleTo(target?.closest("a, button") ? 1.65 : 1);
    };
    const hide = () => {
      gsap.set([dotEl, ringEl], { opacity: 0 });
    };
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", hide);
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}
