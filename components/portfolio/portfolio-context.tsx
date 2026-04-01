"use client";

import { createContext, useContext } from "react";
import type { ProjectMeta } from "@/lib/types";

type PortfolioContextType = {
  activeSlug: string;
  scrollToProject: (slug: string) => void;
  expandedSlug: string | null;
  expandProject: (slug: string) => void;
  collapseProject: () => void;
  allProjects: ProjectMeta[];
};

export const PortfolioContext = createContext<PortfolioContextType>({
  activeSlug: "",
  scrollToProject: () => {},
  expandedSlug: null,
  expandProject: () => {},
  collapseProject: () => {},
  allProjects: [],
});

export function usePortfolio() {
  return useContext(PortfolioContext);
}
