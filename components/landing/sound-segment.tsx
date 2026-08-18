"use client"

import * as React from "react"

import { ICON_STROKE, Volume2, VolumeOff } from "@/lib/icons"
import { SPRING_CELL, useSpringStyle } from "@/lib/motion"
import { applySound, playTick, readSoundPreference } from "@/lib/sound"
import { cn } from "@/lib/utils"

/**
 * SoundSegment — the On / Off control for the commit tick.
 *
 * A SIBLING OF `theme-segment.tsx`, NOT A REUSE OF IT. That was the first
 * thing tried and it does not survive contact: `ThemeSegment` closes over
 * `THEME_OPTIONS`, types its value as `Theme`, sizes its track for three cells
 * and labels its radiogroup "Theme". There is no prop seam to widen — every one
 * of those is a literal in the file — and the file is ratified and not this
 * pass's to edit. So the LANGUAGE is reused instead: the same track, the same
 * padding, the same cell geometry, the same travelling `card` thumb on the same
 * spring, the same roving tabindex, the same ←/→ ring. What differs is the one
 * thing that has to: two cells instead of three.
 *
 * Geometry, derived from the theme segment's ratified numbers rather than
 * invented: 4px padding + 2 cells of 32 + one 2px gap = 74 x 32 track, radius
 * `md`, fill `muted`, cells at a raw 8px radius (concentric: 12 outer − 4 pad).
 */

const SOUND_OPTIONS = [
  { value: true, label: "On", icon: Volume2 },
  { value: false, label: "Off", icon: VolumeOff },
]

/** Segment item 32 wide + the 2px gap — the thumb's travel per step. The same
 *  step the theme segment uses, because it is the same cell. */
const SEGMENT_STEP = 34

/** How close to its cell counts as arrived, in px. See theme-segment.tsx: the
 *  channel is pixels, not 0–1, so the spring's default epsilon would keep a rAF
 *  alive painting sub-pixel nothing. */
const THUMB_EPSILON = 0.05

export function SoundSegment({
  value,
  onPick,
}: {
  value: boolean
  onPick: (enabled: boolean) => void
}) {
  const index = SOUND_OPTIONS.findIndex((o) => o.value === value)

  /* The thumb is on SPRING_CELL — interior.dev's pill-indicator family, which
     is what this is — for the reasons theme-segment.tsx sets out at length: a
     CSS transition restarts on a fast reversal and throws the velocity away,
     and a spring carries it. The transform is written per frame straight to the
     node, so React never fights the spring for the same property. */
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
    // The palette surface treats ←/→ as the compact icon row's ring and
    // swallows them for everything else; stopping propagation here is what
    // keeps this control's own ring intact, exactly as the theme row does.
    e.stopPropagation()
    const delta = e.key === "ArrowRight" ? 1 : -1
    const next = (index + delta + SOUND_OPTIONS.length) % SOUND_OPTIONS.length
    onPick(SOUND_OPTIONS[next].value)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Sound"
      onKeyDown={onKeyDown}
      className="relative flex h-8 shrink-0 items-center gap-0.5 rounded-md bg-muted p-1"
    >
      {/* Same thumb as the theme segment, including the dark-mode ring POR-34
          restored: in dark the thumb is `card` (stone-900) on a `muted` track
          (stone-800), so without Subtle's white-18% ring the selected cell
          reads as a hole rather than the one lifted cell. */}
      <span
        ref={attachThumb}
        aria-hidden="true"
        data-slot="sound-thumb"
        className="palette-thumb absolute top-1 left-1 h-6 w-8 rounded-[8px] bg-card dark:[box-shadow:var(--elevation-subtle)]"
      />
      {SOUND_OPTIONS.map((option) => {
        const Icon = option.icon
        const selected = option.value === value
        return (
          <button
            key={option.label}
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
   The sound state itself — ONE store for the whole page.

   Shaped like the theme store in `theme-segment.tsx` and for the same reason:
   the preference is a fact that lives OUTSIDE React (a module flag in
   lib/sound.ts plus a string in localStorage), and `useSyncExternalStore` is
   React's own way to read one of those.

   It is simpler than the theme store in exactly two ways, both because sound
   has no first paint to get wrong: there is no blocking <head> script and no
   third `system` value to keep re-resolving, so there is no OS subscription
   either. The server and the first client render both say ON — the default —
   and the stored preference arrives in the effect below.
   ------------------------------------------------------------------------- */

let current = true
let hydrated = false
const listeners = new Set<() => void>()

const emit = () => {
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => current

/** ON, matching lib/sound.ts's default, so hydration cannot mismatch. */
const getServerSnapshot = () => true

/**
 * Pick a setting: arm the mechanism, remember it, tell every mounted control.
 *
 * TURNING IT ON TICKS ONCE. A toggle whose whole subject is a sound has to
 * make that sound, or the reader is asked to take the setting on faith — and
 * this is the one moment a tick outside a commit action is not a violation of
 * principle 7, because flipping the switch IS the commit. Turning it off is
 * silent for the obvious reason. The tick is fired here rather than inside
 * lib/sound.ts on purpose: that module is the mechanism and holds no opinion
 * about the UI, and "confirm the switch" is an opinion about the UI.
 *
 * Order matters — `applySound(true)` has to arm the flag before `playTick()`
 * asks it, or the confirmation would be swallowed by the setting it confirms.
 */
export function setSound(next: boolean) {
  current = next
  applySound(next)
  if (next) playTick()
  emit()
}

export function useSound() {
  const sound = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  // The boot wiring. Read the stored preference once per page, after mount,
  // and hand it to the mechanism — `applySound` rather than a bare setter, so
  // the flag and the stored string can never drift apart.
  React.useEffect(() => {
    if (hydrated) return
    hydrated = true
    const stored = readSoundPreference()
    applySound(stored)
    if (stored !== current) {
      current = stored
      emit()
    }
  }, [])

  const pickSound = React.useCallback((next: boolean) => setSound(next), [])

  return { sound, pickSound }
}
