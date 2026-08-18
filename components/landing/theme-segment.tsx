"use client"

import * as React from "react"

import { ICON_STROKE, Monitor, Moon, Sun } from "@/lib/icons"
import { SPRING_CELL, useSpringStyle } from "@/lib/motion"
import { applyTheme, readTheme, subscribeSystemTheme, type Theme } from "@/lib/theme"
import { cn } from "@/lib/utils"

/**
 * ThemeSegment — the light / dark / system control.
 *
 * Figma "Theme segment control" (13:2608): 108 x 32 track, radius `md`, fill
 * `muted`, 4px padding, 2px gap, three 32 x 24 cells at a raw 8px radius
 * (concentric: 12 outer − 4 pad). The selected cell is a `card` thumb that
 * TRAVELS — one element sliding under the glyphs, not three fills toggling.
 *
 * Lifted out of `command-palette.tsx` unchanged, because the mobile menu sheet
 * shows the identical control in its Preferences group (Figma 20:856). Markup,
 * classes and the 34px travel step are byte-for-byte what the desktop palette
 * rendered before the move.
 */

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
]

/** Segment item 32 wide + the 2px gap — the thumb's travel per step. */
const SEGMENT_STEP = 34

/** How close to its cell counts as arrived, in px. The channel is 0–68px, not
 *  0–1, so the spring's default 0.002 epsilon would keep a rAF alive for a
 *  third of a second painting sub-pixel nothing. A twentieth of a pixel is
 *  already below what a 2x display can show. */
const THUMB_EPSILON = 0.05

export function ThemeSegment({
  value,
  onPick,
}: {
  value: Theme
  onPick: (theme: Theme) => void
}) {
  const index = Math.max(
    0,
    THEME_OPTIONS.findIndex((o) => o.value === value)
  )

  /* THE THUMB IS ON A SPRING (Ion, 2026-08-18).
     It used to tween `translateX` on `--duration-base` glide, set inline from
     `index`. Two things were wrong with that. The glide is an expo-out, so the
     thumb left fast and CREPT into its cell — at 34px of travel the last 3px
     took a third of the transition. And a CSS transition restarts: light →
     dark → light faster than 200ms threw the velocity away twice and the thumb
     lagged behind the pointer that was driving it.

     SPRING_CELL is interior.dev's own pill-indicator family, which is what
     this thumb is. The spring keeps position AND velocity across a retarget,
     so a fast reversal carries. The transform is written per frame straight to
     the node — there is no inline `style` any more, which is also what keeps
     React from fighting the spring for the same property on every re-render.
     Server and first client render both emit no transform; the driver paints
     the resting offset during the commit, before the first paint. */
  const attachThumb = useSpringStyle<HTMLSpanElement>(
    SPRING_CELL,
    index * SEGMENT_STEP,
    (el, x) => {
      el.style.transform = `translateX(${x}px)`
    },
    THUMB_EPSILON
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    e.stopPropagation()
    const delta = e.key === "ArrowRight" ? 1 : -1
    const next = (index + delta + THEME_OPTIONS.length) % THEME_OPTIONS.length
    onPick(THEME_OPTIONS[next].value)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      onKeyDown={onKeyDown}
      className="relative flex h-8 shrink-0 items-center gap-0.5 rounded-md bg-muted p-1"
    >
      <span
        ref={attachThumb}
        aria-hidden="true"
        data-slot="theme-thumb"
        className="palette-thumb absolute top-1 left-1 h-6 w-8 rounded-[8px] bg-card"
      />
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            tabIndex={selected ? 0 : -1}
            onClick={() => onPick(option.value)}
            className={cn(
              "relative z-10 grid h-6 w-8 place-items-center rounded-[8px]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-4",
                selected ? "text-foreground" : "text-muted-foreground"
              )}
              strokeWidth={ICON_STROKE}
            />
          </button>
        )
      })}
    </div>
  )
}

/* ----------------------------------------------------------------------------
   The theme state itself — ONE store for the whole page.

   It used to be `React.useState` inside this hook, which meant every caller
   owned a private copy. The desktop palette and the mobile sheet both mount on
   a tablet-width window, so a pick in one left the other's segment pointing at
   the old cell: two controls, one <html> class, two disagreeing opinions about
   what it says.

   A module-level store fixes that with no context plumbing. There is exactly
   one theme on a page, it is a document-level fact (a class on <html> plus a
   string in localStorage), and `useSyncExternalStore` is React's own way to
   read a fact that lives outside React. Callers are unchanged.
   ------------------------------------------------------------------------- */

let current: Theme = "system"
let hydrated = false
let stopSystem: (() => void) | null = null
const listeners = new Set<() => void>()

const emit = () => {
  for (const listener of listeners) listener()
}

/** `system` is the only value that has to keep resolving; the other two are
 *  settled. The OS listener therefore exists only while it can matter, and
 *  only while something is actually mounted to hear it. */
const watchSystem = () => {
  const want = current === "system" && listeners.size > 0
  if (want && !stopSystem) {
    stopSystem = subscribeSystemTheme(() => applyTheme("system"))
  } else if (!want && stopSystem) {
    stopSystem()
    stopSystem = null
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  watchSystem()
  return () => {
    listeners.delete(listener)
    watchSystem()
  }
}

const getSnapshot = () => current

/** The server knows nothing about localStorage, and neither does the first
 *  client render — which is the point: both say `system`, so hydration matches
 *  and the real preference arrives in the effect below. */
const getServerSnapshot = (): Theme => "system"

/** Pick a theme: paint it, store it, tell every mounted control. */
export function setTheme(next: Theme) {
  current = next
  applyTheme(next)
  watchSystem()
  emit()
}

export function useTheme() {
  const theme = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  // Read the stored preference once per page, after mount. The blocking script
  // in <head> has already painted it; this only teaches the controls what it
  // painted.
  React.useEffect(() => {
    if (hydrated) return
    hydrated = true
    const stored = readTheme()
    if (stored !== current) {
      current = stored
      emit()
    }
    watchSystem()
  }, [])

  const pickTheme = React.useCallback((next: Theme) => setTheme(next), [])

  return { theme, pickTheme }
}
