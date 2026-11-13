"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

let opened = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!opened) {
      opened = true;
      return;
    }
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = ref.current;
    gsap.fromTo(
      node,
      { clipPath: "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0 0 0% 0)",
        duration: 0.85,
        ease: "power4.inOut",
        onComplete: () => {
          node.style.clipPath = "";
        },
      },
    );
  }, []);
  return (
    <div id="content" ref={ref}>
      {children}
    </div>
  );
}
