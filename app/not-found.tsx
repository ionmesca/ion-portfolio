import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@/lib/icons"

/**
 * 404 — the page that is not there.
 *
 * It belongs to the letter/collection family, not to Next's default: the same
 * three type steps those pages open with (`text-2xl` title, `text-sm` muted
 * line — components/collections/collection-list.tsx and
 * components/letter/prose.tsx `TitleBlock`), and the same back button the rail
 * draws on every one of them (`secondary`, `ArrowLeft`, the label naming the
 * DESTINATION rather than the gesture — components/nav/section-rail.tsx).
 *
 * IT IS CENTRED, and the reading pages are not. They open at the frame's 136px
 * top offset because a reading column continues below the fold. This page is
 * four lines that end where they start, and top-aligning them would hang them
 * off an otherwise empty screen. Judgement call, flagged in the report.
 *
 * ── WHY THE MARKUP IS NESTED THE WAY IT IS ─────────────────────────────────
 *
 * The page entrance (app/globals.css section 6, applied by app/template.tsx)
 * is a STRUCTURAL selector, not a class anyone opts into:
 *
 *   main > div > :first-child          step 0
 *   main > div > :first-child ~ * > *  steps 1..n
 *
 * So the shape below is not decoration. The title group is `:first-child` and
 * arrives first; the supporting line and the button are the second wrapper's
 * children and follow at 50ms and 100ms. Flatten this into one column and the
 * selector stops matching — the page then renders settled, with no entrance
 * and nothing broken, because that choreography fails safe by design.
 */
export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="flex w-full max-w-[440px] flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">404</p>
          <h1 className="text-2xl text-foreground">This page doesn&rsquo;t exist.</h1>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            The link may be old, or the page may have moved. Everything else is
            where it was.
          </p>

          {/* The wrapper is the entrance's step, not a layout device — a bare
              button would stretch to the column's width inside a flex column.

              h-10 below lg, h-8 from lg: the same split the mobile landing
              makes (components/landing/mobile/mobile-landing.tsx uses the
              Button set's 40px `touch` size for "Book a call"), and the rail's
              32px back button above it. A `size` variant cannot be responsive,
              so the height is overridden at the call site; tailwind-merge drops
              the variant's `h-8` for the base `h-10` and keeps the `lg:` one.
              This is the ONLY class the button takes — never a transition or
              duration utility, per the note in components/ui/button.tsx. */}
          <div>
            <Button variant="secondary" className="h-10 lg:h-8" asChild>
              <Link href="/">
                <ArrowLeft />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
