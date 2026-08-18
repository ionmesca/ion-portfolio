"use client"

import * as React from "react"
import Link from "next/link"

import { Kbd } from "@/components/ui/kbd"
import { Check, Copy, ICON_STROKE, Search, Sun } from "@/lib/icons"
import { createMorph, type Morph, type MorphRect } from "@/lib/morph"
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
     body      search 48 · Navigate 209 · Actions 201 · Preferences 81 ·
               footer 40  =  579
     rows      366 wide (inset 8), 32 tall, radius 12

   BEHAVIOUR LAW — docs/design/popover-lab.html demo 1: FLIP container on one
   rAF lerp with a JS bezier glide solver, 200ms in / 150ms out, content groups
   fade + rise + 2px blur at +25ms each, no scrim.
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

/** Lab constants, verbatim: 200ms in, 150ms out. */
const D_BASE = 200
const D_FAST = 150

const OPTION_DOM_ID = (id: string) => `palette-option-${id}`

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
  const inputRef = React.useRef<HTMLInputElement>(null)
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
  const [query, setQuery] = React.useState("")
  /* Theme state + the OS-flip subscription live in `theme-segment.tsx` now:
     the mobile menu sheet renders the same control and must stay in step. */
  const { theme, pickTheme } = useTheme()

  /* --- filtering ---------------------------------------------------------- */
  const groups = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PALETTE_GROUPS
    return PALETTE_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0)
  }, [query])

  const showPreferences = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return !q || "theme preferences".includes(q)
  }, [query])

  const options = React.useMemo(
    () => groups.flatMap((g) => g.items),
    [groups]
  )

  const [activeId, setActiveId] = React.useState<string | null>(
    PALETTE_GROUPS[0]?.items[0]?.id ?? null
  )

  // Keep the selection on something that exists. Filtering to nothing leaves
  // activeId null, which is what makes Enter a no-op rather than a surprise.
  React.useEffect(() => {
    setActiveId((current) =>
      current && options.some((o) => o.id === current)
        ? current
        : (options[0]?.id ?? null)
    )
  }, [options])

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

  const openPalette = React.useCallback(() => {
    if (openRef.current || !morphRef.current) return
    openRef.current = true
    setOpen(true)
    measureFace()
    morphRef.current.move(openRect(), reduced() ? 0 : D_BASE)
    // After the state flush, so the face is no longer inert.
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [measureFace, openRect, reduced])

  const closePalette = React.useCallback(() => {
    if (!openRef.current || !morphRef.current) return
    openRef.current = false
    setOpen(false)
    setQuery("")
    morphRef.current.move(closedRect(), reduced() ? 0 : D_FAST)
    triggerRef.current?.focus()
  }, [closedRect, reduced])

  const toggle = React.useCallback(() => {
    if (openRef.current) closePalette()
    else openPalette()
  }, [closePalette, openPalette])

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

  /* --- the panel re-fits itself as the list filters -------------------------
     Filtering changes the content height, so the panel follows it — the same
     retargetable engine, at the close duration.

     The latch matters: this effect also fires on the render that OPENS the
     palette, and without it that pass would retarget the 200ms open morph to
     150ms a few milliseconds in. (Measured: the open tween fitted D≈150ms
     before the latch was added.) The open move owns the first pass. */
  const refitRef = React.useRef(false)
  React.useEffect(() => {
    if (!open) {
      refitRef.current = false
      return
    }
    if (!refitRef.current) {
      refitRef.current = true
      return
    }
    if (!morphRef.current) return
    measureFace()
    morphRef.current.move(openRect(), reduced() ? 0 : D_FAST)
  }, [groups, showPreferences, measureFace, open, openRect, reduced])

  /* --- listbox navigation --------------------------------------------------- */

  const moveActive = React.useCallback(
    (delta: number) => {
      if (options.length === 0) return
      const at = options.findIndex((o) => o.id === activeId)
      const next = (at + delta + options.length) % options.length
      const id = options[next].id
      setActiveId(id)
      listRef.current
        ?.querySelector(`#${CSS.escape(OPTION_DOM_ID(id))}`)
        ?.scrollIntoView({ block: "nearest" })
    },
    [activeId, options]
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

    // Enter commits the active OPTION — but only from the search field. From
    // the esc keycap or a theme radio, Enter belongs to the control that has
    // focus, not to the list.
    if (e.key === "Enter" && e.target === inputRef.current) {
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
          className="palette-reveal pointer-events-none absolute top-0 flex items-center gap-1.5 whitespace-nowrap"
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
          {/* search — group 0 */}
          <div
            className="palette-group flex h-12 shrink-0 items-center gap-2 border-b border-border px-4"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            <Search
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={ICON_STROKE}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or jump to…"
              role="combobox"
              aria-expanded={open}
              aria-controls="palette-listbox"
              aria-activedescendant={
                activeId ? OPTION_DOM_ID(activeId) : undefined
              }
              aria-autocomplete="list"
              aria-label="Search commands"
              autoComplete="off"
              spellCheck={false}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div ref={listRef} role="listbox" id="palette-listbox" aria-label="Commands">
              {groups.map((group, index) => (
                <section
                  key={group.id}
                  role="group"
                  aria-labelledby={`palette-group-${group.id}`}
                  className={cn("palette-group", index === 0 && "pt-2")}
                  style={{ "--i": index + 1 } as React.CSSProperties}
                >
                  <div
                    id={`palette-group-${group.id}`}
                    className="px-4 pt-3 pb-1 text-xs text-muted-foreground"
                  >
                    {group.label}
                  </div>
                  <div className="px-2 pb-2">
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
                </section>
              ))}
            </div>

            {showPreferences && (
              <section
                aria-labelledby="palette-group-preferences"
                className="palette-group"
                style={
                  { "--i": groups.length + 1 } as React.CSSProperties
                }
              >
                <div
                  id="palette-group-preferences"
                  className="px-4 pt-3 pb-1 text-xs text-muted-foreground"
                >
                  Preferences
                </div>
                <div className="px-2 pb-2">
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
              </section>
            )}

            {groups.length === 0 && !showPreferences && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No matches
              </p>
            )}
          </div>

          {/* footer hints — last group */}
          <div
            className="palette-group flex h-10 shrink-0 items-center gap-3 border-t border-border px-3"
            style={
              { "--i": groups.length + 2 } as React.CSSProperties
            }
            aria-hidden="true"
          >
            <Hint keys="↑↓" word="navigate" />
            <Hint keys="↵" word="open" />
            <Hint keys="esc" word="close" />
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
        <span className="relative size-4 shrink-0">
          {/* icon swap — scale .6↔1 with 4px blur on the spring, per the
              motion contract's copy→check recipe */}
          <Copy
            data-on={!copied}
            className="icon-swap absolute inset-0 size-4 text-muted-foreground"
            strokeWidth={ICON_STROKE}
          />
          <Check
            data-on={copied}
            className="icon-swap absolute inset-0 size-4 text-muted-foreground"
            strokeWidth={ICON_STROKE}
          />
        </span>
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

function Hint({ keys, word }: { keys: string; word: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <Kbd className="text-small leading-[1.45]">{keys}</Kbd>
      <span className="text-xs text-muted-foreground">{word}</span>
    </span>
  )
}

/* ============================================================================
   Helpers
   ========================================================================== */

function focusableIn(root: HTMLElement | null): HTMLElement[] {
  if (!root) return []
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'input, button:not([tabindex="-1"]), [href]:not([tabindex="-1"])'
    )
  ).filter((el) => el.tabIndex !== -1 && !el.hasAttribute("inert"))
}

