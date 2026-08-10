"use client";
import { useEffect, useRef } from "react";

/** Revelado por IntersectionObserver: sin listeners de scroll, sin reflows. */
export default function Reveal({
  children, delay = 0, className = "", as: Tag = "div",
}: { children: React.ReactNode; delay?: number; className?: string; as?: React.ElementType }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
