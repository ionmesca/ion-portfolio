import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { THEME_INIT_SCRIPT } from "@/lib/theme";

import "./globals.css";

/**
 * Aeonik Pro, through `next/font/local`.
 *
 * Loading it here rather than with raw `@font-face` in globals.css buys three
 * things: the font file is preloaded from the same origin with a hashed,
 * immutable filename, the fallback is generated with matching metrics so the
 * swap does not shift the layout, and the whole thing is self-hosted with no
 * extra network round trip to resolve the CSS.
 *
 * Both cuts are variable (weight 100-900) and ship as woff2. `globals.css`
 * points `--font-sans` at `var(--font-aeonik)`.
 */
const aeonik = localFont({
  src: [
    {
      path: "../public/fonts/AeonikPro-VF.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/fonts/AeonikPro-Italic-VF.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-aeonik",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

// metadataBase is a PLACEHOLDER until the production domain is decided. It only
// resolves relative OG/twitter asset URLs, so it is harmless to be wrong now,
// but it must be corrected before launch.
const SITE_URL = "https://ionmesca.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ion Mesca — Design Engineer",
  description:
    "Design engineer building interfaces for AI products — from the token system up to the shipped screen.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Ion Mesca",
    title: "Ion Mesca — Design Engineer",
    description:
      "Design engineer building interfaces for AI products — from the token system up to the shipped screen.",
    // og image post-build — the card art is drawn once the landing page is final.
  },
  twitter: {
    card: "summary_large_image",
    title: "Ion Mesca — Design Engineer",
    description:
      "Design engineer building interfaces for AI products — from the token system up to the shipped screen.",
    // og image post-build.
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the script below writes `class="dark"` onto
    // <html> before React sees the document, so the server's markup and the
    // client's differ by design on exactly this one attribute.
    <html lang="en" className={aeonik.variable} suppressHydrationWarning>
      <head>
        {/* The no-FOUC theme script. It must be inline and BLOCKING — a
            deferred or bundled version resolves the theme after the first
            paint, which is the white flash it exists to prevent. The palette's
            Preferences group is the only thing that writes the stored value;
            see lib/theme.ts. */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
