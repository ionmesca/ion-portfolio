import type { Metadata } from "next";
import { ThemeProvider } from "./providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ion Mesca — Design Engineer",
  description: "Design engineer building interfaces for AI products",
};

export default function RootLayout({
  children,
  detail,
}: {
  children: React.ReactNode;
  detail: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-bg-surface text-text-primary flex flex-col h-screen" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          {detail}
        </ThemeProvider>
      </body>
    </html>
  );
}
