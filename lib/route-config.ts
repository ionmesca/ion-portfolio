export type TabConfig = {
  id: string;
  label: string;
  href: string;
};

export type RouteConfig = {
  title: string;
  tabs?: TabConfig[];
};

export const routeConfig: Record<string, RouteConfig> = {
  "/": { title: "Home" },
  "/playground": { title: "Playground" },
  "/work": { title: "Work" },
  "/work/[slug]": {
    title: "Case Study",
    // Tabs removed — case studies now use scrollytelling with sticky rail
    // See docs/content-strategy for 6-section structure
  },
  "/lab": { title: "Lab" },
  "/lab/[slug]": { title: "Experiment" },
  "/stack": { title: "Stack" },
  "/writing": { title: "Writing" },
  "/writing/[slug]": { title: "Article" },
  "/agent": { title: "Agent" },
};

export function getRouteConfig(pathname: string): RouteConfig | undefined {
  // Direct match
  if (routeConfig[pathname]) {
    return routeConfig[pathname];
  }

  // Match dynamic routes
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 2) {
    const pattern = `/${segments[0]}/[slug]`;
    if (routeConfig[pattern]) {
      return routeConfig[pattern];
    }
  }

  return undefined;
}
