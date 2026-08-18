"use client"

import * as React from "react"

import { ICON_STROKE, Monitor, Moon, Sun } from "@/lib/icons"
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
        aria-hidden="true"
        className="palette-thumb absolute top-1 left-1 h-6 w-8 rounded-[8px] bg-card"
        style={{ transform: `translateX(${index * SEGMENT_STEP}px)` }}
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

/**
 * The theme state itself: read the stored preference after mount (the blocking
 * script in <head> already painted it), keep `system` resolving as the OS
 * flips, and write through `applyTheme` on every pick.
 *
 * Shared by the desktop palette and the mobile sheet so both stay in step with
 * one another and with localStorage.
 */
export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>("system")

  React.useEffect(() => {
    setTheme(readTheme())
  }, [])

  React.useEffect(() => {
    if (theme !== "system") return
    return subscribeSystemTheme(() => applyTheme("system"))
  }, [theme])

  const pickTheme = React.useCallback((next: Theme) => {
    setTheme(next)
    applyTheme(next)
  }, [])

  return { theme, pickTheme }
}
