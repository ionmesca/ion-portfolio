"use client";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { PortfolioContext } from "./portfolio-context";
import type { ReactNode } from "react";

export function Timeline({
  slugs,
  sidebar,
  cards,
}: {
  slugs: string[];
  sidebar: ReactNode;
  cards: ReactNode;
}) {
  const { activeSlug, containerRef, scrollToProject } = useScrollSpy(slugs);

  return (
    <PortfolioContext value={{ activeSlug, scrollToProject }}>
      <div className="flex h-[calc(100vh-44px)] md:h-full">
        {sidebar}
        <main
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
        >
          {cards}
        </main>
      </div>
    </PortfolioContext>
  );
}
