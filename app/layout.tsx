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

/**
 * The canonical origin. Domain ratified by Ion, 2026-08-18.
 *
 * EXPORTED, and imported by `app/sitemap.ts` and `app/robots.ts`, because those
 * two files must agree with `metadataBase` about what this site is called and
 * there is no honest way for them to guess it. An extra named export from a
 * layout is inert as far as the router is concerned — Next only reads the
 * default export and the metadata names.
 */
export const SITE_URL = "https://ionmesca.com";

const DESCRIPTION =
  "Design engineer building interfaces for AI products — from the token system up to the shipped screen.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ion Mesca — Design Engineer",
  description: DESCRIPTION,
  authors: [{ name: "Ion Mesca", url: SITE_URL }],
  creator: "Ion Mesca",

  /* THERE IS NO `title.template` YET, and its absence is deliberate. The
     template would be "%s — Ion Mesca", but /about and both /writing routes
     currently append that suffix to their own title strings by hand, so
     turning the template on today renders "About — Ion Mesca — Ion Mesca"
     on three live pages. Those files belong to another crew this pass; the
     switch is one commit that has to flip all of them at once. Flagged in the
     POR-37 report with the exact lines. */

  openGraph: {
    type: "website",
    siteName: "Ion Mesca",
    locale: "en_US",
    title: "Ion Mesca — Design Engineer",
    description: DESCRIPTION,
    /* NO `url`. It is inherited verbatim by every child route that does not
       replace the whole `openGraph` object, so a root value would tell a
       crawler that /stack, /agents and /about are all the home page. The
       per-page `alternates.canonical` carries that signal instead, and it is
       the stronger one. The card art is the `opengraph-image.png` file
       convention beside this file — Next writes the tag, which is why there is
       no `images` key here. */
  },

  twitter: {
    card: "summary_large_image",
    title: "Ion Mesca — Design Engineer",
    description: DESCRIPTION,
    /* No `images` and no `creator`: X falls back to og:image when
       twitter:image is absent, and there is no real @handle in the repo yet —
       the socials in components/landing/socials.ts are still bare root URLs.
       Flagged. */
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      /* Let Google show the OG card at full size in a rich result rather than
         cropping it to a thumbnail. */
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
