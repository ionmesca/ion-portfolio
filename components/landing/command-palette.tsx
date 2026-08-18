"use client"

import * as React from "react"
import Link from "next/link"

import { IconSwap } from "@/components/ui/icon-swap"
import { Kbd } from "@/components/ui/kbd"
import { Check, Copy, ICON_STROKE, Sun } from "@/lib/icons"
import { D_SLOW } from "@/lib/motion"
import { createMorph, type Morph, type MorphRect } from "@/lib/morph"
import { useHoverCorridor } from "@/lib/morph-preview"
import { useCopyToClipboard } from "@/lib/use-copy"
import { cn } from "@/lib/utils"

import { IdentityChip } from "./identity-chip"
import { ThemeSegment, useTheme } from "./theme-segment"
import {
  CONTACT_EMAIL,
  PALETTE_GROUPS,
  type PaletteItem,
} from "./palette-items"

/* ============================================================================
   THE ⌘K MORPH PALETTE

   The identity chip IS the palette. One surface: at rest it is the chip, open
   it is the panel. It is absolutely positioned inside a slot that holds its
   place in the flow, so growing it never reflows the page.

   THE ZERO-JUMP LAW (POR-32, Ion 2026-08-18 — "morph is the way")
   ---------------------------------------------------------------
   The avatar, the name and the keycap exist ONCE and are placed ONCE. The
   panel's header is not a new header; it is the chip's own row, left exactly
   where the flex box put it. The container grows right and down around it.

   That is why the atoms are measured from the LIVE DOM rather than positioned
   from the Figma coordinates: the chip renders ~171px wide in the browser
   against 170 in Figma (glyph metrics), and a hardcoded x would put the panel
   header a pixel off its own resting chip. `measure()` reads the flex layout
   once and freezes it; after that nothing can move the atoms, because nothing
   lays them out any more.

   The only header motion is opacity — ⌘K crossfades into `esc` — plus the
   keycap slot's slide along x to the panel's right edge, which rides the
   morph's own clock through the engine's `p` channel.

   GEOMETRY LAW — Figma 13:2673, hand-edited by Ion, extracted read-only to
   scratchpad/mk-palette-tree.json:

     panel     382 wide, radius 15 (SAME as the chip — radius never animates),
               fill `popover`, effect `Overlay`
     header    the chip's own row + a 1px `border` rule under it
     avail     inline in the header row at x 194, fades in
     esc       right edge at panel − 12
     rows      366 wide (inset 8), 32 tall, radius 12

   THE LEAN PANEL (Ion, 2026-08-18). Four things were cut from the frame and
   none of them is coming back:

     · the SEARCH ROW. "Search or jump to" over ten rows you can already see
       is a search box for a haystack with no needles in it. The input, the
       filtering, the empty state and the panel's re-fit went with it.
     · the GROUP LABEL ROWS (Navigate / Actions / Preferences). The groups
       stay; the captions were naming what the icons already say.
     · the FOOTER HINT BAR (↑↓ / ↵ / esc). A legend for three keys everyone
       already owns.
     · therefore ~170px of height: body was 579, it is 409.

   THE SEAM — flagged taste call. Removing the caption rows took 32px of air
   out of each cluster with it, and 8px of padding is not a cluster boundary.
   Navigate and Actions are now separated by RHYTHM (8 + 8 = 16px of padding
   against 0 between rows inside a group), because they are the same kind of
   thing — commands. Preferences is separated by the 1px full-bleed `border`
   rule, because it is not: it holds a control, it sits outside the listbox
   and outside the ↑/↓ ring. The frame's own vocabulary for "a different kind
   of region starts here" is exactly that rule — it is what already sits under
   the header — so it is reused once, where it is true, rather than three
   times, which would have made a 451px panel read as a table.

     body      Navigate 176 · Actions 176 · rule 1 · Preferences 56  =  409
     panel     42 header + 409  =  451

   BEHAVIOUR LAW — a FLIP container on one rAF lerp with a JS bezier glide
   solver, 400ms symmetric, no scrim. The content does not animate: it rides
   the container's own `p` channel through `--morph-p` and is revealed by the
   growing clip. Feel reference: Colin Lienard's menu (Ion, "really smooth"),
   which docs/design/popover-lab.html demo 1 no longer outranks on timing —
   the lab's geometry law still stands unchanged.

   U2, RESOLVED. The morph clock is 400ms and it is NOT the preview family's
   200. That is not an inconsistency, it is the family's rule: duration scales
   with the distance the surface travels. The small preview cards move ~260px
   of box and take `--duration-base` 200; this one grows from a 171x42 chip to
   a 382x451 panel — an order of magnitude more area — and takes
   `--duration-slow` 400. Same easing, same engine, same law.

   HOVER OPENS IT (Ion, 2026-08-18, reversing the click-only ruling). The chip
   answers a hovering pointer on the popover family's own corridor — INTENT
   150ms in, GRACE 140ms out — through `useHoverCorridor`, which was factored
   out of `lib/morph-preview.ts` for this and which the previews now share.
   There is no third copy of those timers and no second pair of numbers.
   ========================================================================== */

/** Figma 13:2673 panel width. The one hardcoded dimension: it is a design
 *  decision, not something the DOM can be asked for. */
const PANEL_W = 382

/** The esc keycap's inset from the panel's right edge (Figma: 341 + 29 = 370
 *  = 382 − 12). */
const PANEL_PAD_X = 12

/** The availability line's x inside the header row (Figma 20:997). It is a
 *  free position — nothing else in the header may move to accommodate it. */
const AVAIL_X = 194

/** Never let the panel grow past the viewport; the list scrolls instead. */
const VIEWPORT_MARGIN = 24
const MIN_PANEL_H = 240

/**
 * The morph's clock — 400ms, symmetric.
 *
 * It was the lab's 200 in / 150 out. Measured on that build: `--ease-glide`
 * is an expo-out, so 90% of the growth landed in the first 60ms and the eye
 * read it as a panel appearing, not a box growing. 400ms on the same easing
 * doubles the readable growth to ~120ms without touching the token, which is
 * what Ion sanctioned after ratifying Colin Lienard's menu as the feel
 * reference ("really smooth"). His is 400ms, and his close is the same
 * transition reversed rather than a separate fast-out — so ours is symmetric
 * too. `--duration-slow` is 400: this is a sanctioned step, not a new number.
 *
 * A long close is only tolerable because the engine retargets: pressing ⌘K
 * during a close does not wait for it, it turns it around from where it is.
 *
 * BOTH RUNGS ARE `D_SLOW` (lib/motion.ts), which is the JS mirror of
 * `--duration-slow`. Two names for one number, and they stay two names because
 * the open clock and the close clock are separate rulings that happen to agree
 * — the symmetry is the decision, not an accident to be collapsed.
 */
const OPEN_MS = D_SLOW
const CLOSE_MS = D_SLOW

const OPTION_DOM_ID = (id: string) => `palette-option-${id}`

/**
 * Every row, in ring order.
 *
 * A module constant now, not a memo. It was derived from a filtered copy of
 * the groups; with the search row gone the list is a fact about the file that
 * imports it and can never change at runtime, which also retires the effect
 * that used to keep the selection pointing at something that still existed.
 */
const OPTIONS = PALETTE_GROUPS.flatMap((group) => group.items)

type ChipRect = { w: number; h: number }

export function CommandPalette() {
  /* --- refs into the DOM the morph owns ---------------------------------- */
  const slotRef = React.useRef<HTMLDivElement>(null)
  const surfaceRef = React.useRef<HTMLDivElement>(null)
  const faceRef = React.useRef<HTMLDivElement>(null)
  const ruleRef = React.useRef<HTMLSpanElement>(null)
  const availRef = React.useRef<HTMLSpanElement>(null)
  const keycapRef = React.useRef<HTMLSpanElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const morphRef = React.useRef<Morph | null>(null)
  const chipRef = React.useRef<ChipRect>({ w: 0, h: 0 })
  const radiusRef = React.useRef(15)
  /** Where the keycap slot sits closed (x0) and open (x1), and its frozen y. */
  const travelRef = React.useRef({ x0: 0, x1: 0, y: 0 })
  /** The panel's natural content height, remeasured whenever the list filters. */
  const faceHRef = React.useRef(0)

  /* --- state ------------------------------------------------------------- */
  const [enabled, setEnabled] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const openRef = React.useRef(false)
  /**
   * PINNED — the panel is staying until it is dismissed.
   *
   * A hover-opened panel closes when the pointer leaves it. Anything that is a
   * DECISION rather than a drift pins it, and a pinned panel ignores the
   * pointer entirely: only Escape, the esc keycap or a click outside will
   * close it. Three things pin — clicking the chip, pressing ⌘K, and clicking
   * anywhere inside the open panel (you reached in; you meant to stay).
   *
   * A ref and not state: nothing on screen renders differently, and a pointer
   * crossing the chip must not cost a render.
   */
  const pinnedRef = React.useRef(false)
  /* Theme state + the OS-flip subscription live in `theme-segment.tsx` now:
     the mobile menu sheet renders the same control and must stay in step. */
  const { theme, pickTheme } = useTheme()

  const [activeId, setActiveId] = React.useState<string | null>(
    OPTIONS[0]?.id ?? null
  )

  /* --- desktop gate -------------------------------------------------------
     None of this exists on mobile — zero shortcuts there, and the mobile phase
     ships its own menu. Until the gate opens, the component renders exactly
     today's static chip and attaches nothing, which also keeps the server
     render and the first client render identical.

     The width term is the mobile phase's one amendment to the original touch
     gate. Below `lg` the whole desktop rail — this chip included — is
     `display: none` and the mobile sheet is the menu, so a fine-pointer window
     narrower than 1024 must not answer ⌘K with an invisible dialog. 1024px is
     Tailwind's `lg`, which is the same number the layout split uses. */
  React.useEffect(() => {
    let mq: MediaQueryList
    try {
      mq = window.matchMedia(
        "(hover: hover) and (pointer: fine) and (min-width: 1024px)"
      )
    } catch {
      return
    }
    const sync = () => setEnabled(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  const reduced = React.useCallback(() => {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    } catch {
      return false
    }
  }, [])

  /* --- geometry ----------------------------------------------------------- */

  const closedRect = React.useCallback(
    (): MorphRect => ({
      x: 0,
      y: 0,
      w: chipRef.current.w,
      h: chipRef.current.h,
      r: radiusRef.current,
      p: 0,
    }),
    []
  )

  /** The panel grows RIGHT and DOWN out of the chip's own corner. */
  const openRect = React.useCallback((): MorphRect => {
    const top = slotRef.current?.getBoundingClientRect().top ?? 0
    const room = window.innerHeight - top - VIEWPORT_MARGIN
    const natural = chipRef.current.h + faceHRef.current
    const h = Math.min(natural, Math.max(MIN_PANEL_H, room))
    return { x: 0, y: 0, w: PANEL_W, h, r: radiusRef.current, p: 1 }
  }, [])

  /** Read the face's natural height, then pin it. The content keeps its final
   *  size for the whole morph — the container grows OVER it, it does not
   *  squash — so this must run before any move(). */
  const measureFace = React.useCallback(() => {
    const face = faceRef.current
    if (!face) return
    face.style.height = "auto"
    faceHRef.current = face.getBoundingClientRect().height
    const h = openRect().h - chipRef.current.h
    face.style.height = `${h}px`
  }, [openRect])

  /**
   * Measure the chip's live flex layout, then freeze it.
   *
   * Idempotent: it thaws first, so it can be re-run when the webfont settles
   * or the window resizes. Never runs while the palette is open — the frozen
   * atoms are the open state's header.
   */
  /**
   * Undo everything `measure()` wrote — the atoms' absolute positions, the
   * surface's own box, and the pixel sizes pinned onto the slot, the trigger,
   * the availability line, the rule and the face.
   *
   * Two callers. `measure()` runs it first so what it reads is the browser's
   * own flex layout rather than last time's freeze. The mount effect runs it
   * on the way out: below `lg` (or on a touch window) this component keeps
   * rendering, and a chip left frozen at desktop pixel sizes is a chip that no
   * longer answers the layout it now lives in.
   */
  const thaw = React.useCallback(() => {
    const slot = slotRef.current
    const surface = surfaceRef.current
    const face = faceRef.current
    const rule = ruleRef.current
    const avail = availRef.current
    const keycap = keycapRef.current
    const trigger = triggerRef.current
    if (!surface) return

    const avatar = surface.querySelector<HTMLElement>('[data-slot="chip-avatar"]')
    const name = surface.querySelector<HTMLElement>('[data-slot="chip-name"]')

    for (const el of [avatar, name, keycap]) {
      if (!el) continue
      el.style.position = ""
      el.style.left = ""
      el.style.top = ""
      el.style.transform = ""
    }
    surface.style.position = ""
    surface.style.left = ""
    surface.style.top = ""
    surface.style.width = ""
    surface.style.height = ""
    surface.style.transform = ""
    surface.style.borderRadius = ""
    if (slot) {
      slot.style.width = ""
      slot.style.height = ""
    }
    if (trigger) {
      trigger.style.width = ""
      trigger.style.height = ""
    }
    if (avail) avail.style.height = ""
    if (rule) rule.style.top = ""
    if (face) {
      face.style.top = ""
      face.style.height = ""
    }
  }, [])

  const measure = React.useCallback(() => {
    const slot = slotRef.current
    const surface = surfaceRef.current
    const face = faceRef.current
    const rule = ruleRef.current
    const avail = availRef.current
    const keycap = keycapRef.current
    const trigger = triggerRef.current
    if (!slot || !surface || !face || !rule || !avail || !keycap || !trigger)
      return

    const avatar = surface.querySelector<HTMLElement>('[data-slot="chip-avatar"]')
    const name = surface.querySelector<HTMLElement>('[data-slot="chip-name"]')
    const esc = surface.querySelector<HTMLElement>('[data-slot="palette-esc"]')
    if (!avatar || !name || !esc) return

    const atoms = [avatar, name, keycap]

    // 1 — thaw. Put the atoms back into the flex row and let the surface hug
    //     them again, so what we measure is the browser's own chip.
    thaw()

    // 2 — read. One layout pass, everything relative to the surface's box.
    const s = surface.getBoundingClientRect()
    radiusRef.current =
      parseFloat(getComputedStyle(surface).borderTopLeftRadius) || 15
    chipRef.current = { w: s.width, h: s.height }

    const rects = atoms.map((el) => {
      const r = el.getBoundingClientRect()
      // NOT rounded: the sub-pixel value is what the flex box produced, and
      // reproducing it exactly is the difference between a 0.0px zero-jump
      // delta and a 0.4px one.
      return { x: r.left - s.left, y: r.top - s.top }
    })
    const escW = esc.getBoundingClientRect().width

    // 3 — freeze. From here the atoms are out of flow and nothing lays them
    //     out again, so nothing can move them.
    atoms.forEach((el, i) => {
      el.style.position = "absolute"
      el.style.left = "0"
      el.style.top = "0"
      el.style.transform = `translate3d(${rects[i].x}px,${rects[i].y}px,0)`
    })

    travelRef.current = {
      x0: rects[2].x,
      x1: PANEL_W - PANEL_PAD_X - escW,
      y: rects[2].y,
    }

    slot.style.width = `${chipRef.current.w}px`
    slot.style.height = `${chipRef.current.h}px`
    surface.style.position = "absolute"
    surface.style.left = "0"
    surface.style.top = "0"

    trigger.style.width = `${chipRef.current.w}px`
    trigger.style.height = `${chipRef.current.h}px`

    // The availability line and the header rule are laid out against the
    // frozen header row, never against each other.
    avail.style.height = `${chipRef.current.h}px`
    rule.style.top = `${chipRef.current.h - 1}px`
    face.style.top = `${chipRef.current.h}px`

    measureFace()

    morphRef.current?.snap(openRef.current ? openRect() : closedRect())
  }, [closedRect, measureFace, openRect, thaw])

  /* --- mount: build the engine, measure, keep measuring when it matters ----
     A plain effect, not a layout effect: freezing the atoms where the flex box
     already put them is a visual no-op, so there is nothing to hide from the
     first paint — and `useLayoutEffect` in a component that also renders on
     the server only buys a warning. */
  React.useEffect(() => {
    if (!enabled) return
    const surface = surfaceRef.current
    if (!surface) return

    morphRef.current = createMorph(surface, (cur) => {
      const el = keycapRef.current
      if (!el) return
      const { x0, x1, y } = travelRef.current
      // The keycap rides the container's own clock. Same interpolation, same
      // frame — which is why an interrupted open never desynchronises it.
      el.style.transform = `translate3d(${x0 + (x1 - x0) * cur.p}px,${y}px,0)`
    })

    measure()

    // Aeonik arrives with `display: swap`. The metric-matched fallback keeps
    // the layout from shifting, but the name's width still moves a hair, so
    // the freeze is re-taken once the real font is in.
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled && !openRef.current) measure()
    })

    const onResize = () => {
      if (openRef.current) {
        measureFace()
        morphRef.current?.snap(openRect())
      } else {
        measure()
      }
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelled = true
      window.removeEventListener("resize", onResize)
      morphRef.current?.cancel()
      morphRef.current = null
      // The gate can close under a running chip — a window dragged narrow, a
      // hybrid laptop switched to touch. Everything `measure()` froze is
      // handed back before the engine goes away.
      thaw()
    }
  }, [enabled, measure, measureFace, openRect, thaw])

  /* --- open / close --------------------------------------------------------- */

  const openPalette = React.useCallback(
    (pin: boolean) => {
      if (openRef.current || !morphRef.current) return
      openRef.current = true
      pinnedRef.current = pin
      setOpen(true)
      measureFace()
      morphRef.current.move(openRect(), reduced() ? 0 : OPEN_MS)
      // The trigger is about to become inert; drop its focus ring NOW rather
      // than letting it stay painted until the list takes focus a frame later.
      // It is a 42px black rounded rect sitting inside the growing panel, and
      // after a keyboard close (which returns focus here, focus-visible and
      // all) it flashed on every single reopen.
      triggerRef.current?.blur()
      // After the state flush, so the face is no longer inert.
      //
      // THE LISTBOX IS THE FOCUS TARGET now that the search input is gone. It
      // is a real tab stop while open (`tabIndex={open ? 0 : -1}`) and it
      // reports its selection through `aria-activedescendant`, which is the
      // same listbox contract the input used to hold on the list's behalf —
      // arrow keys have to reach a handler on the first press, including on a
      // panel that a pointer opened.
      // `preventScroll` is the whole ballgame — see the surface's overflow.
      requestAnimationFrame(() => listRef.current?.focus({ preventScroll: true }))
    },
    [measureFace, openRect, reduced]
  )

  const closePalette = React.useCallback(() => {
    if (!openRef.current || !morphRef.current) return
    openRef.current = false
    pinnedRef.current = false
    setOpen(false)
    morphRef.current.move(closedRect(), reduced() ? 0 : CLOSE_MS)
    // Only take focus back if we still hold it. A hover-close is not a
    // keyboard event and must not move the caret out of wherever the reader
    // actually is; an Escape close is, and has to hand the ring back to the
    // chip it was launched from.
    if (
      surfaceRef.current &&
      document.activeElement instanceof Node &&
      surfaceRef.current.contains(document.activeElement)
    ) {
      triggerRef.current?.focus({ preventScroll: true })
    }
  }, [closedRect, reduced])

  const toggle = React.useCallback(() => {
    if (openRef.current) closePalette()
    else openPalette(true)
  }, [closePalette, openPalette])

  /* --- the hover corridor ---------------------------------------------------
     ONE pair of handlers on the SURFACE, not two pairs on a chip and a panel,
     because the chip and the panel are the same element — that is the whole
     zero-jump law. So there is no gap to cross, no corridor geometry to solve,
     and `hold()` is only ever needed for a re-entry during the grace window.

     The clock is `useHoverCorridor` (lib/morph-preview.ts): INTENT 150 in,
     GRACE 140 out, the same two numbers the social previews and the collection
     rows answer to. */
  const corridor = useHoverCorridor()

  const onSurfacePointerEnter = React.useCallback(() => {
    if (!enabled) return
    // Re-entering during the grace window: drop the pending close. Nothing to
    // reopen — it never closed.
    if (openRef.current) {
      corridor.hold()
      return
    }
    corridor.serve(() => openPalette(false))
  }, [corridor, enabled, openPalette])

  const onSurfacePointerLeave = React.useCallback(() => {
    if (!enabled) return
    if (pinnedRef.current) {
      corridor.cancel()
      return
    }
    corridor.release(closePalette)
  }, [closePalette, corridor, enabled])

  /** Reaching into the panel is a decision. From here the pointer is free to
   *  leave; only Escape, the esc keycap or an outside click will close it. */
  const pin = React.useCallback(() => {
    if (openRef.current) pinnedRef.current = true
  }, [])

  /* --- copy email ----------------------------------------------------------
     A commit action: the one place in the palette that earns Sound A, and the
     one place catalog ruling #4's text swap is adopted. The row's icon becomes
     a check and its label becomes "Copied" for the same 1.5s window.

     The clipboard write, the tick, the 1.5s clock and the legacy fallback all
     live in `useCopyToClipboard` (lib/use-copy.ts) — the collection pages'
     install chip is the second consumer of exactly this moment.

     ⌘⇧C works with the palette CLOSED, where there is no surface to show any
     of that — the tick alone is the feedback. RULING: the `copied` state is
     still set, and its clock starts at the copy, so reopening inside the
     window shows the Copied state mid-flight and it reverts on the original
     schedule. It is true (you did just copy) and it needs no extra state to
     suppress. A second copy restarts the 1.5s. */
  const { copied, copy } = useCopyToClipboard()

  const copyEmail = React.useCallback(
    () => copy(CONTACT_EMAIL),
    [copy]
  )

  /* --- global keyboard ------------------------------------------------------ */
  React.useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && key === "c") {
        e.preventDefault()
        void copyEmail()
        return
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && key === "k") {
        e.preventDefault()
        toggle()
        return
      }
      if (key === "escape" && openRef.current) {
        e.preventDefault()
        closePalette()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [closePalette, copyEmail, enabled, toggle])

  /* --- outside click -------------------------------------------------------
     No scrim: the page stays visible and looks clickable, and clicking it
     dismisses. */
  React.useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const surface = surfaceRef.current
      if (surface && e.target instanceof Node && surface.contains(e.target))
        return
      closePalette()
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [closePalette, open])

  /* The panel used to re-fit itself as the list filtered — a second, shorter
     move on the same engine, latched so it could not retarget the open morph
     it was racing. Nothing filters any more, so the panel has exactly one
     height and the whole mechanism went with the search row. `measureFace()`
     still runs on open and on resize; that is all it was ever for. */

  /* --- listbox navigation --------------------------------------------------- */

  const moveActive = React.useCallback(
    (delta: number) => {
      const at = OPTIONS.findIndex((o) => o.id === activeId)
      const next = (at + delta + OPTIONS.length) % OPTIONS.length
      const id = OPTIONS[next].id
      setActiveId(id)
      listRef.current
        ?.querySelector(`#${CSS.escape(OPTION_DOM_ID(id))}`)
        ?.scrollIntoView({ block: "nearest" })
    },
    [activeId]
  )

  /**
   * What a row does when it is chosen — by pointer OR by Enter, because Enter
   * reaches the row through a synthetic `.click()`. Navigation itself is left
   * to the element: a Link's own click handler is what keeps an internal route
   * client-side, and a copy is not a navigation, so it does not dismiss.
   */
  const onRowClick = React.useCallback(
    (item: PaletteItem) => {
      if (item.action === "copy-email") {
        void copyEmail()
        return
      }
      closePalette()
    },
    [closePalette, copyEmail]
  )

  const onSurfaceKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return

    if (e.key === "Tab") {
      const focusables = focusableIn(surfaceRef.current)
      if (focusables.length === 0) return
      e.preventDefault()
      const at = focusables.indexOf(document.activeElement as HTMLElement)
      const next =
        (at + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length
      focusables[next].focus()
      return
    }

    // The theme segment owns its own left/right ring; up/down still belong to
    // the list even while the segment holds focus.
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      moveActive(e.key === "ArrowDown" ? 1 : -1)
      return
    }

    // Enter commits the active OPTION — but only from the LISTBOX. From the
    // esc keycap or a theme radio, Enter belongs to the control that has
    // focus, not to the list. (It used to read `inputRef`; the listbox is the
    // focus holder now, and the test is the same test.)
    if (e.key === "Enter" && e.target === listRef.current) {
      if (!activeId) return
      e.preventDefault()
      document.getElementById(OPTION_DOM_ID(activeId))?.click()
    }
  }

  /* --- render ---------------------------------------------------------------- */

  const keycap = (
    <span
      ref={keycapRef}
      data-slot="palette-keycap"
      className="relative inline-flex shrink-0"
    >
      <Kbd data-slot="palette-cmd" className="palette-keycap text-small leading-[1.45]">
        ⌘K
      </Kbd>
      <button
        type="button"
        data-slot="palette-esc"
        tabIndex={open ? 0 : -1}
        // Closed, it is a crossfade partner sitting invisible under ⌘K.
        // `tabIndex` alone keeps it off the tab ring but leaves it in the
        // accessibility tree, so a screen reader read "Close command palette"
        // off a chip that was not open.
        aria-hidden={!open}
        aria-label="Close command palette"
        onClick={closePalette}
        // inline-flex, not the default inline: an inline box would take the
        // line's leading and stand 2.4px taller than the keycap it wraps,
        // which the esc hit area would inherit.
        className={cn(
          "palette-keycap palette-esc absolute top-0 left-0 inline-flex rounded-sm",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        )}
      >
        <Kbd className="text-small leading-[1.45]">esc</Kbd>
      </button>
    </span>
  )

  return (
    <div
      ref={slotRef}
      data-slot="palette-slot"
      className="relative z-40 h-[42px] w-fit"
    >
      <div
        ref={surfaceRef}
        data-slot="palette-surface"
        data-open={open}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label={open ? "Command palette" : undefined}
        onKeyDown={onSurfaceKeyDown}
        // The chip and the panel are one element, so ONE enter/leave pair
        // covers the whole corridor — see the hover block above.
        onPointerEnter={onSurfacePointerEnter}
        onPointerLeave={onSurfacePointerLeave}
        // `pointerdown`, not `click`: it fires before anything the click might
        // do, so a row that navigates or a theme radio that re-renders cannot
        // get in front of the pin.
        onPointerDown={pin}
        // The surface must never scroll — see `pinScroll` in lib/morph.ts.
        // `overflow-hidden` (not `clip`): `clip` is the semantically right
        // answer, but it drops this box out of the slot's `z-40` stacking and
        // the landing intro paints straight over the open panel. Measured, not
        // assumed. So the box stays a scroll container and the engine holds
        // its scroll at 0 instead.
        onScroll={(e) => {
          e.currentTarget.scrollLeft = 0
          e.currentTarget.scrollTop = 0
        }}
        className={cn(
          "palette-surface relative w-fit overflow-hidden rounded-lg text-left",
          // `popover` and `card` resolve to the same value in both themes, so
          // the chip's fill and the panel's fill are one colour and there is
          // nothing to crossfade.
          "bg-card shadow-subtle"
        )}
      >
        {/* the chip's own row — measured once, then frozen where it landed */}
        <IdentityChip className="bg-transparent shadow-none" keycap={keycap} />

        {/* availability — it fades into space the panel opened up, so it
            displaces nothing that was already there */}
        <span
          ref={availRef}
          data-slot="palette-availability"
          aria-hidden={!open}
          className="palette-availability pointer-events-none absolute top-0 flex items-center gap-1.5 whitespace-nowrap"
          style={{ left: AVAIL_X }}
        >
          <span className="grid size-2 place-items-center rounded-full bg-status-available/20">
            <span className="size-[5px] rounded-full bg-status-available" />
          </span>
          <span className="text-xs text-muted-foreground">
            Available from October
          </span>
        </span>

        {/* the rule under the header row */}
        <span
          ref={ruleRef}
          aria-hidden="true"
          className="palette-reveal absolute left-0 h-px w-full bg-border"
        />

        {/* the chip's click target: the chip rect only (sized by `measure`),
            and inert once the chip has become the header — from then on the
            esc keycap is the dismiss, which is literally the affordance you
            pressed to open it.

            Rendered only on the desktop gate: on a touch device the chip is
            not a control, so it must not be a button. */}
        {enabled && (
          <button
            ref={triggerRef}
            type="button"
            data-slot="palette-trigger"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label="Open command palette"
            tabIndex={open ? -1 : 0}
            onClick={toggle}
            className={cn(
              "absolute top-0 left-0 z-10 rounded-lg",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
              open && "pointer-events-none"
            )}
          />
        )}

        {/* ---- the panel body ------------------------------------------- */}
        <div
          ref={faceRef}
          inert={!open}
          data-slot="palette-face"
          className="absolute left-0 flex w-[382px] flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* THE LISTBOX HOLDS FOCUS. The search input used to, and reported
                the list's selection on its behalf through
                `aria-activedescendant`; with the input gone the attribute
                moves onto the listbox itself, which is where the ARIA pattern
                puts it when there is no textbox. The rows stay `tabIndex={-1}`
                pointer targets — DOM focus never leaves this element, so
                arrow-keying down ten rows is one focus event, not ten. */}
            <div
              ref={listRef}
              role="listbox"
              id="palette-listbox"
              aria-label="Commands"
              aria-activedescendant={
                open && activeId ? OPTION_DOM_ID(activeId) : undefined
              }
              tabIndex={open ? 0 : -1}
              className="outline-none"
            >
              {PALETTE_GROUPS.map((group) => (
                /* No caption row, but still a GROUP: `aria-label` carries what
                   the deleted text row carried, so a screen reader still hears
                   "Navigate" without a sighted reader being told what five
                   labelled icons already say. `py-2` on every cluster is the
                   seam — 8 + 8 against 0 between rows inside one. */
                <div
                  key={group.id}
                  role="group"
                  aria-label={group.label}
                  className="palette-group px-2 py-2"
                >
                  {group.items.map((item) => (
                    <Row
                      key={item.id}
                      item={item}
                      active={item.id === activeId}
                      copied={copied}
                      onPointerEnter={() => setActiveId(item.id)}
                      onClick={() => onRowClick(item)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* The one rule inside the body. Preferences is not a command —
                see the seam note in the header comment. */}
            <span
              aria-hidden="true"
              className="palette-reveal block h-px w-full bg-border"
            />

            <div
              role="group"
              aria-label="Preferences"
              className="palette-group px-2 py-2"
            >
              <div className="flex h-10 items-center gap-2 rounded-md pr-3 pl-2">
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
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   Pieces
   ========================================================================== */

function Row({
  item,
  active,
  copied,
  onPointerEnter,
  onClick,
}: {
  item: PaletteItem
  active: boolean
  copied: boolean
  onPointerEnter: () => void
  onClick: () => void
}) {
  const Icon = item.icon

  const inner = (
    <>
      {item.action === "copy-email" ? (
        /* copy → check: scale .6↔1 with a 4px blur, on a REAL spring since
           2026-08-18 — the recipe and its driver both live in
           `components/ui/icon-swap.tsx` now, shared with the install chip and
           the mobile menu. */
        <IconSwap on={copied} from={Copy} to={Check} className="size-4" />
      ) : (
        <Icon className="size-4 shrink-0 text-muted-foreground" />
      )}
      {item.action === "copy-email" ? (
        /* Text states swap, per catalog ruling #4 — the "Copied" state is the
           one place the pattern is adopted. Re-cut as a STACKED crossfade,
           exactly as motion-lab.html re-cut it: the original recipe animates
           the element's width, and a label that resizes mid-swap is a layout
           shift inside a fixed-width row. "Copy email" stays in flow and owns
           the box; "Copied" rides on top of it and never touches the layout. */
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
      {item.shortcut && (
        <span className="text-small shrink-0 text-muted-foreground">
          {item.shortcut}
        </span>
      )}
    </>
  )

  const className = cn(
    "palette-row flex h-8 w-full items-center gap-2 rounded-md pr-3 pl-2 text-left",
    "[&_svg]:[stroke-width:1.5]"
  )

  const shared = {
    id: OPTION_DOM_ID(item.id),
    role: "option" as const,
    "aria-selected": active,
    "data-active": active,
    // Focus stays on the search input; the listbox is driven by
    // aria-activedescendant, so the rows are pointer targets, not tab stops.
    tabIndex: -1,
    onPointerEnter,
    onClick,
    className,
  }

  if (item.action) {
    return (
      <button type="button" {...shared}>
        {inner}
      </button>
    )
  }

  if (item.external !== undefined) {
    return (
      <a href={item.external} {...shared}>
        {inner}
      </a>
    )
  }

  return (
    <Link href={item.href ?? "#"} {...shared}>
      {inner}
    </Link>
  )
}

/* ============================================================================
   Helpers
   ========================================================================== */

/**
 * The Tab ring inside the open panel.
 *
 * `input` was the first selector; there is no input any more, and the LISTBOX
 * took its place in the ring — it is the element that holds focus and answers
 * the arrow keys. The rest is unchanged: rows are `tabIndex={-1}` pointer
 * targets reached by ↑/↓, so the ring is the listbox, the esc keycap and
 * whichever theme radio is currently selected.
 */
function focusableIn(root: HTMLElement | null): HTMLElement[] {
  if (!root) return []
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      '[role="listbox"], button:not([tabindex="-1"]), [href]:not([tabindex="-1"])'
    )
  ).filter((el) => el.tabIndex !== -1 && !el.hasAttribute("inert"))
}

