"use client";

import { createContext, useContext } from "react";

type PortfolioContextType = {
  activeSlug: string;
  scrollToProject: (slug: string) => void;
};

export const PortfolioContext = createContext<PortfolioContextType>({
  activeSlug: "",
  scrollToProject: () => {},
});

export function usePortfolio() {
  return useContext(PortfolioContext);
}
