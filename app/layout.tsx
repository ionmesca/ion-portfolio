import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AgentProvider } from "@/components/agent/agent-provider";
import { ConvexClientProvider } from "./providers/convex-client-provider";
import { ThemeProvider } from "./providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ion Mesca — Design Engineer",
  description: "Design engineer building interfaces for AI products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-bg-surface text-text-primary flex flex-col h-screen" suppressHydrationWarning>
        <ConvexClientProvider>
          <ThemeProvider>
            <AgentProvider>{children}</AgentProvider>
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
