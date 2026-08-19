"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { IconSwap } from "@/components/ui/icon-swap"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetGrabber,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AtSign, Check, Copy, ICON_STROKE, Menu, Sun } from "@/lib/icons"
import { useCopyToClipboard } from "@/lib/use-copy"
import { cn } from "@/lib/utils"

import {
  CONTACT_EMAIL,
  PALETTE_GROUPS,
  type PaletteItem,
} from "../palette-items"
import { SocialsSegment } from "../socials-segment"
import { ThemeSegment, useTheme } from "../theme-segment"

/* ============================================================================
   MobileMenu — the bottom sheet behind the top bar's menu icon.

   Figma "Landing v3 — mobile menu" (20:635), sheet 20:693. It is the desktop
   ⌘K palette's content in a touch shape, and it is the ONLY menu on mobile:
   the desktop palette never mounts here (its gate is
   `(hover: hover) and (pointer: fine) and (min-width: 1024px)`).

   WHAT CHANGES FROM THE DESKTOP PALETTE, and why:

   - Trigger is an icon BUTTON with lucide `menu`, not `search` and not a
     keycap. Ion's ruling (pass 11 §B): on mobile the affordance is navigation.
   - ZERO shortcuts. Not the nav mnemonics, not ⌘⇧C, no footer hints. There is
     no keyboard to press them on.
   - Rows are 44 tall (Figma 20:749 …), the touch step, against 32 on desktop.
   - The scrim is KEPT. The morph family forbids scrims; POR-22 ratified the
     bottom sheet as the platform exception, so the overlay paints `scrim`.
   - The current route's row is `Selected` (Figma shows Home selected). On
     touch there is no hover to carry the highlight, so "where I am" is the
     only honest use of that state.
   - No identity header. The top bar already carries the avatar and name;
     repeating them in the sheet (Ion, 2026-08-19) was leftover desktop
     anatomy. Socials sit in the same muted track as Theme, not as rows.

   THE LEAN SHEET (Ion, 2026-08-18) — the desktop palette's cuts, applied here
   the same day and for the same reasons. "We forgot to clean up the menu on
   the phone."

     · the SEARCH ROW is gone, and the filtering, the empty state and the
       per-visit query reset with it. Ten rows you can already see did not need
       a search box on a 390px screen any more than on a 1512px one. (The
       POR-22 rule that mobile inputs must be `text-base` 16px so iOS does not
       zoom the viewport on focus still stands — there is simply no input left
       in this sheet to apply it to. Do not shrink one back in.)
     · the GROUP CAPTION ROWS are gone. The groups stay, still labelled for a
       screen reader, still visual clusters.
     · there was never a footer hint bar here to remove.

   THE SEAM is the desktop panel's: a 1px rule divides Actions from Navigate,
   and another divides the command list from the control block (Socials +
   Theme).
   ========================================================================== */

/** Figma 20:693: the sheet stops 76px below the top of the screen. */
const SHEET_TOP_GAP = 76

export function MobileMenu() {
  const [open, setOpen] = React.useState(false)
  const { copied, copy } = useCopyToClipboard()
  const { theme, pickTheme } = useTheme()
  const pathname = usePathname()

  /* The sheet used to reset its query on close, filter the groups, and hide
     Preferences when the query did not match it. All three went with the
     search row. "Copied" was never reset here and still is not — it belongs to
     `useCopyToClipboard`, whose ratified ruling is that the 1.5s clock starts
     at the copy itself and runs out on its own schedule. */

  // One clock, one fallback, one sound rule — lib/use-copy.ts, exactly as the
  // collection pages' install chip consumes it. A failed write shows nothing.
  const copyEmail = React.useCallback(() => {
    void copy(CONTACT_EMAIL)
  }, [copy])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Open menu"
          // The box is 32 (Figma 20:603) but a finger is not: the pseudo
          // element grows the hit area to 44 without moving a pixel of the
          // button. See the report — the frame draws 32 where the written
          // spec said 40.
          className={cn(
            "relative [&_svg]:text-muted-foreground",
            "before:absolute before:-inset-1.5 before:content-['']"
          )}
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        style={{ maxHeight: `calc(100svh - ${SHEET_TOP_GAP}px)` }}
        className="gap-0 pb-[max(24px,env(safe-area-inset-bottom))]"
      >
        <SheetGrabber onClick={() => setOpen(false)} />
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate the site, copy contact details, and set the theme.
        </SheetDescription>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {PALETTE_GROUPS.map((group, i) => (
            <React.Fragment key={group.id}>
              {i > 0 ? (
                <span
                  aria-hidden="true"
                  className="block h-px w-full bg-border"
                />
              ) : null}
              <div
                role="group"
                aria-label={group.label}
                className="px-2 py-2"
              >
                {group.items.map((item) => (
                  <MenuRow
                    key={item.id}
                    item={item}
                    copied={copied}
                    selected={item.href === pathname}
                    onCopy={copyEmail}
                  />
                ))}
              </div>
            </React.Fragment>
          ))}

          {/* The one rule inside the body. Socials and Theme are controls,
              not commands — the same seam ruling as the desktop panel. */}
          <span aria-hidden="true" className="block h-px w-full bg-border" />

          <div role="group" aria-label="Socials" className="px-2 pt-2">
            <div className="flex h-11 items-center gap-2 rounded-md pr-3 pl-2">
              <AtSign
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={ICON_STROKE}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                Socials
              </span>
              <SocialsSegment />
            </div>
          </div>

          <div role="group" aria-label="Preferences" className="px-2 pb-2">
            <div className="flex h-11 items-center gap-2 rounded-md pr-3 pl-2">
              <Sun
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={ICON_STROKE}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                Theme
              </span>
              <ThemeSegment value={theme} onPick={pickTheme} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ----------------------------------------------------------------------------
   A row. 44 tall, the same anatomy as the desktop palette row minus the
   shortcut slot — with the copy→check icon swap and the "Copied" label swap
   kept, because both are touch-friendly and both are system recipes.
   ------------------------------------------------------------------------- */

function MenuRow({
  item,
  copied,
  selected,
  onCopy,
}: {
  item: PaletteItem
  copied: boolean
  selected: boolean
  onCopy: () => void
}) {
  const Icon = item.icon

  const inner = (
    <>
      {item.action === "copy-email" ? (
        <IconSwap on={copied} from={Copy} to={Check} className="size-4" />
      ) : (
        <Icon className="size-4 shrink-0 text-muted-foreground" />
      )}

      {item.action === "copy-email" ? (
        <span className="relative min-w-0 flex-1 text-sm text-foreground">
          <span
            data-on={!copied}
            data-dir="out"
            aria-hidden={copied}
            className="label-swap block truncate"
          >
            {item.label}
          </span>
          <span
            data-on={copied}
            data-dir="in"
            aria-hidden={!copied}
            className="label-swap absolute inset-0 block truncate"
          >
            Copied
          </span>
        </span>
      ) : (
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
          {item.label}
        </span>
      )}
    </>
  )

  const className = cn(
    "palette-row flex h-11 w-full items-center gap-2 rounded-md pr-3 pl-2 text-left",
    "[&_svg]:[stroke-width:1.5]"
  )

  // The copy action is the one row that must NOT close the sheet: closing it
  // would take the "Copied" confirmation with it.
  if (item.action === "copy-email") {
    return (
      <button type="button" onClick={onCopy} className={className}>
        {inner}
      </button>
    )
  }

  // No `data-active` here: `selected` is `item.href === pathname` and an
  // external row has no `href`, so the attribute was always false.
  if (item.external !== undefined) {
    return (
      <SheetClose asChild>
        <a href={item.external} className={className}>
          {inner}
        </a>
      </SheetClose>
    )
  }

  return (
    <SheetClose asChild>
      <Link
        href={item.href ?? "#"}
        data-active={selected}
        aria-current={selected ? "page" : undefined}
        className={className}
      >
        {inner}
      </Link>
    </SheetClose>
  )
}
