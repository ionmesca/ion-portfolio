"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollSpy(slugs: string[]) {
  const [activeSlug, setActiveSlug] = useState<string>(slugs[0] ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = (entry.target as HTMLElement).dataset.project;
            if (slug) setActiveSlug(slug);
          }
        }
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    const cards = container.querySelectorAll("[data-project]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [slugs]);

  const scrollToProject = (slug: string) => {
    const container = containerRef.current;
    if (!container) return;
    const card = container.querySelector(`[data-project="${slug}"]`);
    card?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return { activeSlug, containerRef, scrollToProject };
}
