import type { ReactNode } from "react";
import { Header } from "./header";
import { FloatingDock } from "./floating-dock";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-24">
        {children}
      </main>
      <FloatingDock />
    </div>
  );
}
