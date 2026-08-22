"use client"

import * as React from "react"

import { prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

import {
  EQUITY_DOMAIN,
  EQUITY_INSTRUMENTS,
  EQUITY_LENSES,
  EQUITY_TOTALS,
  lensOfSegment,
  lensReadout,
  lensValueAt,
  moneyParts,
  moneyRounded,
  monthAtFraction,
  percentOfDomain,
  unitCount,
  valueAt,
  type EquityInstrument,
  type EquityLensId,
  type EquitySegmentKind,
} from "./equity-timeline-data"
import { EquityTimelineStrip } from "./equity-timeline-strip"
import { formatMonthLabel } from "./vesting-data"

/**
 * The Equity Dashboard panel's card: one holding, every instrument on one time
 * axis, Today cutting through all of it.
 *
 * THE CARD IS THE TOOLTIP. Ledgy's holdings card and vesting chart merged into
 * this one surface (docs/design/equity-timeline-spec.md). Rows are instruments,
 * each row is a strip, value lives in the number on the right and time lives in
 * the strip. Scrubbing the strip column rewrites the subline and the row values
 * in place instead of raising a floating panel over the picture, so the eye
 * never leaves the figures it came for.
 *
 * PLAIN DOM. No chart library: percent-positioned spans, a CSS transition per
 * lane, and pointer maths against one measured rectangle. The whole card is
 * ~4KB of JS and it lands in the landing page's own chunk.
 *
 * The only literal colours are Ledgy's emeralds and slate, which ARE the
 * picture; everything else is a portfolio token.
 */

const CHEVRON_PATH =
  "M313.5 239c9.4 9.4 9.4 24.6 0 33.9l-200 200c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l183-183-183-183c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l200 200z"

const { endMonth, startMonth, todayMonth } = EQUITY_DOMAIN

/** Rows enter 100ms apart; the dots and the Today line follow the last one. */
const ROW_STAGGER_MS = 100
const SWAP_MS = 150
/** Slow entrance + the last row's offset + the 200ms fade that follows it. */
const SETTLE_MS = 400 + (EQUITY_INSTRUMENTS.length - 1) * ROW_STAGGER_MS + 200
/** Ledgy's lens swap floor. The figures dip, they never disappear. */
const SWAP_OPACITY = 0.18
/** A finger leaving the strip lingers before the card snaps back to Today. */
const TOUCH_RELEASE_MS = 400
/** Closer than this to Today and the guide's month label would sit on it. */
const TODAY_CLEARANCE_PX = 40

/**
 * The three columns: name, strip, value.
 *
 * The spec's mobile pair (120px / 104px) was written for a wider card than the
 * panel actually gives it. The 4:5 panel is 358px, which leaves the strip 70px
 * of a nine-year axis and pushes the event dates out over the name column, so
 * the name column drops to 88px and the padding to 12px. Everything else —
 * type sizes, row heights, the desktop pair — is the spec's.
 */
const GRID =
  "grid grid-cols-[88px_1fr_104px] gap-2 @md:grid-cols-[176px_1fr_128px] @md:gap-4"

/* ────────────────────────────────────────────────────────────────────────── */

function LensTabs({
  onSelect,
  value,
}: {
  onSelect: (id: EquityLensId) => void
  value: EquityLensId
}) {
  const listRef = React.useRef<HTMLDivElement>(null)

  // Roving tab index: the tablist is ONE tab stop and the arrows walk it, which
  // is what a tablist owes a keyboard.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    const isEdge = event.key === "Home" || event.key === "End"
    if (step === 0 && !isEdge) return
    event.preventDefault()

    const index = EQUITY_LENSES.findIndex((lens) => lens.id === value)
    const next = isEdge
      ? event.key === "Home"
        ? 0
        : EQUITY_LENSES.length - 1
      : (index + step + EQUITY_LENSES.length) % EQUITY_LENSES.length
    const lens = EQUITY_LENSES[next]
    if (!lens) return
    onSelect(lens.id)
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Equity lens"
      className="flex flex-wrap gap-0.5 @md:gap-1"
      onKeyDown={handleKeyDown}
    >
      {EQUITY_LENSES.map((lens) => {
        const isActive = lens.id === value
        return (
          <button
            key={lens.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(lens.id)}
            className={cn(
              "inline-flex h-7 cursor-pointer items-center gap-1 rounded-[8px] px-1.5 @md:px-2",
              "text-xs leading-4 font-medium text-secondary-foreground",
              "transition-[background-color,box-shadow,scale] duration-150 ease-glide active:scale-[0.96]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
              isActive ? "bg-card shadow-subtle" : "bg-transparent hover:bg-muted"
            )}
          >
            <span
              aria-hidden="true"
              className="size-2 flex-none rounded-[2px]"
              style={{ background: lens.swatch }}
            />
            {lens.label}
            {/*
              The percent lives on the TAB, not in the subline (Ion, revision 2):
              stated once, on every lens at once, so switching lenses compares
              three shares instead of rewriting one sentence.
            */}
            {lens.id === "all" ? null : (
              <span className="font-normal text-muted-foreground">{lens.percent}%</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

type Readout = {
  /** Rendered as one string while scrubbing, split into euros and cents at rest. */
  value: string
  cents: string | null
  units: string
  isMuted: boolean
}

function readoutFor(
  instrument: EquityInstrument,
  lens: EquityLensId,
  month: number | null
): Readout {
  if (month === null) {
    const { units, value } = lensReadout(instrument, lens)
    const parts = moneyParts(value)
    return {
      cents: parts.cents,
      isMuted: value === 0,
      units: unitCount(units, instrument.unitLabel),
      value: parts.whole,
    }
  }

  const asOf = valueAt(instrument, month)

  // The Vested lens is net of the lock at THAT month too, so the row and the
  // headline above it stay one arithmetic all the way across the axis.
  if (lens === "vested") {
    const units = asOf.vestedUnits - asOf.onHoldUnits
    return {
      cents: null,
      isMuted: asOf.isFuture,
      units: `${unitCount(units, instrument.unitLabel)} vested${asOf.isFuture ? " by then" : ""}`,
      value: moneyRounded(asOf.vestedValue - asOf.onHoldValue),
    }
  }

  const units = asOf.isLocked
    ? `on hold until ${instrument.lock?.label ?? ""}`
    : asOf.isReleased
      ? "available"
      : `${unitCount(asOf.vestedUnits, instrument.unitLabel)} vested${asOf.isFuture ? " by then" : ""}`

  return {
    cents: null,
    isMuted: asOf.isFuture,
    units,
    value: moneyRounded(asOf.vestedValue),
  }
}

/* ────────────────────────────────────────────────────────────────────────── */

export function EquityTimeline() {
  const cardRef = React.useRef<HTMLElement>(null)
  const stripRef = React.useRef<HTMLDivElement>(null)
  const touchRef = React.useRef(false)
  const releaseRef = React.useRef<number | null>(null)

  const [lens, setLens] = React.useState<EquityLensId>("all")
  const [scrubMonth, setScrubMonth] = React.useState<number | null>(null)
  const [revealed, setRevealed] = React.useState(false)
  const [settled, setSettled] = React.useState(false)

  // The readout the card is CURRENTLY showing, which lags the one it is asked
  // for by one 150ms dip. Ledgy's useLensSwap, done with two states.
  const [shownLens, setShownLens] = React.useState<EquityLensId>("all")
  const [shownMonth, setShownMonth] = React.useState<number | null>(null)
  const [faded, setFaded] = React.useState(false)

  // The guide's last month, kept after the pointer leaves so the line and its
  // label fade out where they stood instead of snapping back to Today first.
  const [ghostMonth, setGhostMonth] = React.useState<number | null>(null)
  // Measured, because "40px from Today" is a pixel rule on a percent axis.
  const [columnWidth, setColumnWidth] = React.useState(0)

  React.useEffect(() => {
    if (scrubMonth !== null) setGhostMonth(scrubMonth)
  }, [scrubMonth])

  React.useEffect(() => {
    const column = stripRef.current
    if (!column) return
    const observer = new ResizeObserver(([entry]) => {
      setColumnWidth(entry?.contentRect.width ?? 0)
    })
    observer.observe(column)
    return () => observer.disconnect()
  }, [])

  /* -- first reveal ------------------------------------------------------- */
  React.useEffect(() => {
    const card = cardRef.current
    if (!card) return
    if (prefersReducedMotion()) {
      setRevealed(true)
      setSettled(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setRevealed(true)
        observer.disconnect()
      },
      { threshold: 0.2 }
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!revealed || settled) return
    const timer = window.setTimeout(() => setSettled(true), SETTLE_MS)
    return () => window.clearTimeout(timer)
  }, [revealed, settled])

  /* -- the readout dip ----------------------------------------------------
     Only a change of MODE dips: lens to lens, Today to scrub, scrub back to
     Today. Dragging the guide from one month to the next swaps the figures
     straight through, because a dip on every month would strobe. */
  React.useEffect(() => {
    const sameMode = (shownMonth === null) === (scrubMonth === null) && shownLens === lens
    if (sameMode) {
      if (shownMonth !== scrubMonth) setShownMonth(scrubMonth)
      return
    }
    if (prefersReducedMotion()) {
      setShownLens(lens)
      setShownMonth(scrubMonth)
      return
    }
    setFaded(true)
    const timer = window.setTimeout(() => {
      setShownLens(lens)
      setShownMonth(scrubMonth)
      setFaded(false)
    }, SWAP_MS)
    return () => window.clearTimeout(timer)
  }, [lens, scrubMonth, shownLens, shownMonth])

  /* -- the scrub ---------------------------------------------------------- */
  const clearRelease = () => {
    if (releaseRef.current === null) return
    window.clearTimeout(releaseRef.current)
    releaseRef.current = null
  }

  React.useEffect(() => clearRelease, [])

  const scrubTo = React.useCallback((clientX: number) => {
    const column = stripRef.current
    if (!column) return
    const rect = column.getBoundingClientRect()
    if (rect.width === 0) return
    setScrubMonth(monthAtFraction((clientX - rect.left) / rect.width))
  }, [])

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      if (touchRef.current) scrubTo(event.clientX)
      return
    }
    const column = stripRef.current
    if (!column) return
    const rect = column.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right) {
      setScrubMonth(null)
      return
    }
    scrubTo(event.clientX)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return
    clearRelease()
    touchRef.current = true
    scrubTo(event.clientX)
  }

  const endTouch = () => {
    if (!touchRef.current) return
    touchRef.current = false
    clearRelease()
    releaseRef.current = window.setTimeout(() => setScrubMonth(null), TOUCH_RELEASE_MS)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = scrubMonth ?? Math.round(todayMonth)
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault()
      const step = event.key === "ArrowRight" ? 1 : -1
      setScrubMonth(Math.min(Math.max(current + step, startMonth), endMonth))
      return
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      setScrubMonth(event.key === "Home" ? startMonth : endMonth)
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setScrubMonth(null)
    }
  }

  /* -- what the card says ------------------------------------------------- */
  const pickSegment = (kind: EquitySegmentKind) => {
    const next = lensOfSegment(kind)
    setLens((current) => (current === next ? "all" : next))
  }

  const activeLens =
    EQUITY_LENSES.find((entry) => entry.id === lens) ?? EQUITY_LENSES[0]
  const shownLensEntry =
    EQUITY_LENSES.find((entry) => entry.id === shownLens) ?? EQUITY_LENSES[0]

  /*
    THE HEADLINE FOLLOWS THE LENS (Ion, revision 2). Pick On hold and the 24px
    figure is what is locked, not the fortune it belongs to. Scrub, and it is
    that lens as of the hovered month, muted once the month is in the future,
    because a projection should not be printed in the same ink as a fact.
  */
  const headline =
    shownMonth === null
      ? {
          ...moneyParts(shownLensEntry?.value ?? EQUITY_TOTALS.committedValue),
          isMuted: false,
        }
      : {
          cents: null,
          isMuted: shownMonth > todayMonth,
          whole: moneyRounded(lensValueAt(shownLens, shownMonth)),
        }

  // ONE date fact, never a percent: the tabs already carry the percents.
  const subline =
    shownMonth === null
      ? (shownLensEntry?.subline ?? "")
      : shownMonth > todayMonth
        ? `Projected · ${formatMonthLabel(shownMonth)}`
        : `As of ${formatMonthLabel(shownMonth)}`

  const todayPercent = percentOfDomain(todayMonth)
  const guideMonth = scrubMonth ?? ghostMonth
  const guidePercent = guideMonth === null ? null : percentOfDomain(guideMonth)
  const guideShown = scrubMonth !== null
  // The two labels would collide, so Today gives way: the month you asked for
  // outranks the one you already know.
  const todayLabelHidden =
    guideShown &&
    guidePercent !== null &&
    (Math.abs(guidePercent - todayPercent) / 100) * columnWidth < TODAY_CLEARANCE_PX
  const swapStyle: React.CSSProperties = {
    opacity: faded ? SWAP_OPACITY : 1,
    transition: "opacity var(--duration-fast) var(--motion-glide)",
  }

  return (
    <section
      ref={cardRef}
      aria-label="Equity"
      className="flex w-full max-w-[640px] min-w-0 flex-col rounded-md bg-card shadow-subtle"
    >
      <header className="flex flex-col gap-2.5 p-3 @md:p-4">
        <LensTabs onSelect={setLens} value={lens} />
        <div className="flex flex-col gap-0.5" style={swapStyle}>
          <span
            className={cn(
              "text-2xl leading-8 font-medium whitespace-nowrap tabular-nums",
              headline.isMuted ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {headline.whole}
            {headline.cents === null ? null : (
              <span className="text-muted-foreground">{headline.cents}</span>
            )}
          </span>
          {/*
            ONE subline, never a list. It is the card's running commentary: the
            lens writes here, the scrub writes here, and it is polite-live so a
            screen reader hears the scrub without being interrupted mid-word.
          */}
          <span
            aria-live="polite"
            className="text-xs leading-4 text-muted-foreground tabular-nums"
          >
            {subline}
          </span>
        </div>
      </header>

      <div className="h-px bg-border" />

      <div className="flex flex-col px-3 pt-2.5 pb-3 @md:px-4">
        {/*
          Axis header and rows share one positioned box so the Today line and
          the scrub guide can be drawn ONCE, full height, in the strip column.
        */}
        <div
          className="relative flex flex-col"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={endTouch}
          onPointerCancel={endTouch}
          onPointerLeave={() => {
            if (!touchRef.current) setScrubMonth(null)
          }}
        >
          <div className={cn(GRID, "h-5")}>
            <span />
            <div ref={stripRef} className="relative">
              <span
                className="absolute -translate-x-1/2 text-xs leading-4 whitespace-nowrap text-muted-foreground motion-reduce:transition-none"
                style={{
                  left: `${todayPercent}%`,
                  opacity: todayLabelHidden ? 0 : 1,
                  transition: "opacity var(--duration-fast) var(--motion-glide)",
                }}
              >
                Today
              </span>
              {/*
                The hovered month rides the guide up here in the axis header,
                where Today lives, instead of floating over the strips. The axis
                footer is gone: two fixed dates that never changed were paying
                rent the moving one earns.
              */}
              <span
                aria-hidden="true"
                className="absolute -translate-x-1/2 text-xs leading-4 whitespace-nowrap text-muted-foreground tabular-nums motion-reduce:transition-none"
                style={{
                  left: `${guidePercent ?? todayPercent}%`,
                  opacity: guideShown ? 1 : 0,
                  transition: "opacity var(--duration-fast) var(--motion-glide)",
                }}
              >
                {guideMonth === null ? null : formatMonthLabel(guideMonth)}
              </span>
            </div>
            <span />
          </div>

          {EQUITY_INSTRUMENTS.map((instrument, index) => {
            const readout = readoutFor(instrument, shownLens, shownMonth)
            return (
              <div key={instrument.id} className={cn(GRID, "h-14 items-center")}>
                <div className="flex min-w-0 flex-col gap-0.5">
                  {/*
                    Phase 1 stops here: the row name is the door to the grant
                    drawer, so it is a button and it presses, but it opens
                    nothing yet and says so rather than lying about it.
                  */}
                  <button
                    type="button"
                    aria-disabled="true"
                    className={cn(
                      "inline-flex w-fit cursor-pointer items-center gap-1 text-left",
                      "text-sm leading-5 font-medium text-foreground",
                      "transition-transform duration-150 ease-glide active:scale-[0.96]",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    )}
                  >
                    {instrument.name}
                    <span className="sr-only"> — grant breakdown coming next</span>
                    <svg aria-hidden="true" className="size-3 flex-none" viewBox="0 0 320 512">
                      <path d={CHEVRON_PATH} fill="var(--muted-foreground)" />
                    </svg>
                  </button>
                  <span className="text-xs leading-4 text-muted-foreground tabular-nums">
                    {instrument.subline}
                  </span>
                </div>

                <EquityTimelineStrip
                  instrument={instrument}
                  lens={activeLens ?? EQUITY_LENSES[0]!}
                  onPickSegment={pickSegment}
                  revealDelay={index * ROW_STAGGER_MS}
                  revealed={revealed}
                  scrubbing={scrubMonth !== null}
                  settled={settled}
                />

                <div className="flex flex-col items-end text-right" style={swapStyle}>
                  <span
                    className={cn(
                      "text-base leading-6 font-medium whitespace-nowrap tabular-nums",
                      readout.isMuted ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {readout.value}
                    {readout.cents === null ? null : (
                      <span className="text-muted-foreground">{readout.cents}</span>
                    )}
                  </span>
                  <span className="text-xs leading-4 whitespace-nowrap text-muted-foreground tabular-nums">
                    {readout.units}
                  </span>
                </div>
              </div>
            )
          })}

          {/*
            The lines. Pointer-transparent, so a click still lands on the
            segment underneath, and the middle cell carries the keyboard scrub:
            focusable without being clickable is exactly what it needs to be.
          */}
          <div className={cn(GRID, "pointer-events-none absolute inset-0")}>
            <span />
            <div
              role="slider"
              tabIndex={0}
              aria-label="Scrub the equity timeline"
              aria-valuemin={startMonth}
              aria-valuemax={endMonth}
              aria-valuenow={scrubMonth ?? Math.round(todayMonth)}
              aria-valuetext={
                scrubMonth === null ? "Today" : formatMonthLabel(scrubMonth)
              }
              onKeyDown={handleKeyDown}
              className="relative rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <span
                aria-hidden="true"
                className="absolute top-5 bottom-0 border-l border-dashed border-ring motion-reduce:transition-none"
                style={{
                  left: `${todayPercent}%`,
                  opacity: revealed ? 1 : 0,
                  transition: `opacity ${settled ? "var(--duration-fast)" : "var(--duration-base)"} var(--motion-glide)`,
                  transitionDelay: settled ? "0ms" : `${SETTLE_MS - 200}ms`,
                }}
              />
              <span
                aria-hidden="true"
                className="absolute top-5 bottom-0 border-l motion-reduce:transition-none"
                style={{
                  borderColor: "color-mix(in oklab, var(--foreground) 35%, transparent)",
                  left: `${guidePercent ?? todayPercent}%`,
                  opacity: guideShown ? 1 : 0,
                  transition: "opacity var(--duration-fast) var(--motion-glide)",
                }}
              />
            </div>
            <span />
          </div>
        </div>
      </div>
    </section>
  )
}
