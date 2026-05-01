"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { PortfolioContext } from "./portfolio-context";
import { InlineProjectDetail } from "./inline-project-detail";
import { InlineProjectGallery } from "./inline-project-gallery";
import { ResizableRail } from "./resizable-rail";
import type { ProjectMeta } from "@/lib/types";
import type { ReactNode } from "react";

const EASE_OUT = [0, 0, 0.2, 1] as const;
const DURATION = 0.3;

function getProjectSlugFromPath(projects: ProjectMeta[]) {
  if (typeof window === "undefined") {
    return null;
  }

  const match = window.location.pathname.match(/^\/work\/([^/]+)$/);
  if (match && projects.some((p) => p.slug === match[1])) {
    return match[1];
  }

  return null;
}

export function Timeline({
  projects,
  sidebar,
  cards,
}: {
  projects: ProjectMeta[];
  sidebar: ReactNode;
  cards: ReactNode;
}) {
  const slugs = projects.map((p) => p.slug);
  const { activeSlug, containerRef, scrollToProject } = useScrollSpy(slugs);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(() =>
    getProjectSlugFromPath(projects)
  );
  const scrollPositionRef = useRef(0);

  // Listen for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setExpandedSlug(getProjectSlugFromPath(projects));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [projects]);

  const expandProject = useCallback(
    (slug: string) => {
      // Save scroll position before expanding
      if (containerRef.current) {
        scrollPositionRef.current = containerRef.current.scrollTop;
      }
      setExpandedSlug(slug);
      window.history.pushState(null, "", `/work/${slug}`);
    },
    [containerRef]
  );

  const collapseProject = useCallback(() => {
    setExpandedSlug(null);
    window.history.pushState(null, "", "/");
    // Restore scroll position after collapse
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = scrollPositionRef.current;
      }
    });
  }, [containerRef]);

  const isExpanded = expandedSlug !== null;

  return (
    <PortfolioContext value={{
      activeSlug,
      scrollToProject,
      expandedSlug,
      expandProject,
      collapseProject,
      allProjects: projects,
    }}>
      <div className="flex h-[calc(100vh-44px)] md:h-full">
        <ResizableRail storageKey="ion-portfolio-overview-rail-width">
          <motion.div className="px-4 pb-5 pt-6">
            <motion.div
              aria-hidden={isExpanded}
              initial={false}
              animate={{
                height: isExpanded ? 0 : "auto",
                marginBottom: isExpanded ? 0 : 28,
                opacity: isExpanded ? 0 : 1,
                filter: isExpanded ? "blur(8px)" : "blur(0px)",
                y: isExpanded ? -10 : 0,
              }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className={isExpanded ? "pointer-events-none overflow-hidden" : "overflow-visible"}
            >
              <h1 className="text-lg font-semibold leading-6 text-text-primary">
                Lead Product Designer at{" "}
                <span className="ledgy-capability relative inline-flex cursor-help">
                  <span className="ledgy-capability-trigger decoration-text-tertiary/60 underline decoration-dotted underline-offset-4">
                    Ledgy
                  </span>
                  <span
                    aria-hidden
                    className="ledgy-capability-tooltip pointer-events-none absolute right-0 top-full z-50 mt-2 w-[240px] rounded-xl bg-text-primary px-3 py-2 font-mono text-[12px] leading-5 text-bg-base shadow-card"
                  >
                    0-&gt;1 design function, equity workflows, design systems, AI feedback ops
                  </span>
                </span>
              </h1>
              <p className="text-lg font-semibold leading-6 text-text-label">
                Building AI-native software for complex work
              </p>
            </motion.div>
            <span className="text-sm font-medium text-text-label">Projects</span>
          </motion.div>
          <nav className="flex-1 overflow-y-auto px-4 pb-6">
            {sidebar}
          </nav>
        </ResizableRail>

        {/* Detail panel — slides in */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: DURATION, ease: EASE_OUT }}
              className="h-full flex-shrink-0"
            >
              <ResizableRail
                defaultWidth={360}
                minWidth={300}
                maxWidth={560}
                resizeLabel="Resize project details"
                storageKey="ion-portfolio-inline-detail-width"
              >
                <InlineProjectDetail />
              </ResizableRail>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main area — heroes or gallery, crossfade without flicker */}
        <div className="flex-1 relative overflow-hidden">
          <motion.main
            ref={!isExpanded ? containerRef : undefined}
            animate={{ opacity: isExpanded ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-y-auto p-4 flex flex-col gap-4"
            style={{ pointerEvents: isExpanded ? "none" : "auto" }}
          >
            {cards}
          </motion.main>
          <motion.div
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-y-auto"
            style={{ pointerEvents: isExpanded ? "auto" : "none" }}
          >
            {isExpanded && <InlineProjectGallery />}
          </motion.div>
        </div>
      </div>
    </PortfolioContext>
  );
}
