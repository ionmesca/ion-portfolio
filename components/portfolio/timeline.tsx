"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { PortfolioContext } from "./portfolio-context";
import { CompactProjectList } from "./compact-project-list";
import { InlineProjectDetail } from "./inline-project-detail";
import { InlineProjectGallery } from "./inline-project-gallery";
import type { ProjectMeta } from "@/lib/types";
import type { ReactNode } from "react";

const EASE_OUT = [0, 0, 0.2, 1] as const;
const DURATION = 0.3;

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
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const scrollPositionRef = useRef(0);

  // URL sync: read initial state from pathname
  useEffect(() => {
    const match = window.location.pathname.match(/^\/work\/([^/]+)$/);
    if (match && projects.some((p) => p.slug === match[1])) {
      setExpandedSlug(match[1]);
    }
  }, [projects]);

  // Listen for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/^\/work\/([^/]+)$/);
      if (match && projects.some((p) => p.slug === match[1])) {
        setExpandedSlug(match[1]);
      } else {
        setExpandedSlug(null);
      }
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
        {/* Sidebar — animates width */}
        <motion.aside
          className="hidden md:flex flex-col flex-shrink-0 border-r border-border-subtle overflow-hidden"
          animate={{ width: isExpanded ? 220 : 432 }}
          transition={{ duration: DURATION, ease: EASE_OUT }}
        >
          <div className="px-4 py-6">
            <span className="text-sm font-medium text-text-label">Projects</span>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="compact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <CompactProjectList />
                </motion.div>
              ) : (
                <motion.div
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-4 pb-6"
                >
                  {sidebar}
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </motion.aside>

        {/* Detail panel — slides in */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: DURATION, ease: EASE_OUT }}
              className="flex-shrink-0 overflow-hidden"
            >
              <InlineProjectDetail />
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
