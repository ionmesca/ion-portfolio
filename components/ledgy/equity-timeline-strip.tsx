import { cn } from "@/lib/utils"

import {
  EMERALD,
  HATCH,
  SLATE,
  percentOfDomain,
  type EquityInstrument,
  type EquityLens,
  type EquitySegment,
  type EquitySegmentKind,
} from "./equity-timeline-data"

/**
 * One instrument's strip: the row's whole schedule as coloured spans on the
 * card's shared time axis.
 *
 * There is no canvas and no chart library here. A segment is an absolutely
 * positioned span with a left and a width in PERCENT of the domain, which is
 * why the strip resizes with the card for free and why the Today line, the
 * scrub guide and every row line up without anything being measured.
 */

const SEGMENT_STYLE: Record<EquitySegmentKind, React.CSSProperties> = {
  // The hatch replaces the vested span it sits on, so its left edge is a cut,
  // not a cap: square there, rounded at the free end.
  onhold: { background: HATCH, borderRadius: "0 2px 2px 0" },
  // A conditional tail has no end cap on purpose. Nobody can say where that
  // value stops, so the bar stops claiming to know.
  conditions: {
    background: `linear-gradient(90deg, ${SLATE} 0 40%, transparent)`,
    borderRadius: 0,
  },
  unvested: { background: SLATE, borderRadius: 2 },
  vested: { background: EMERALD, borderRadius: 2 },
}

const SEGMENT_LABEL: Record<EquitySegmentKind, string> = {
  conditions: "conditional",
  onhold: "on hold",
  unvested: "unvested",
  vested: "vested",
}

export function EquityTimelineStrip({
  instrument,
  lens,
  onPickSegment,
  revealDelay,
  revealed,
  scrubbing,
  settled,
}: {
  instrument: EquityInstrument
  lens: EquityLens
  onPickSegment: (kind: EquitySegmentKind) => void
  /** Milliseconds this row waits behind the first one on the first reveal. */
  revealDelay: number
  revealed: boolean
  scrubbing: boolean
  /** True once the entrance is over, so hover fades stop inheriting its delay. */
  settled: boolean
}) {
  const { event } = instrument

  return (
    <div className="relative h-2">
      {/*
        The reveal wipes the SEGMENTS, never the dot or its date: a 4px circle
        squashed to nothing and stretched back reads as a glitch, so those two
        fade in afterwards instead.
      */}
      <div
        className="absolute inset-0 origin-left motion-reduce:transition-none"
        style={{
          transform: revealed ? "scaleX(1)" : "scaleX(0)",
          transition: "transform var(--duration-slow) var(--motion-glide)",
          transitionDelay: `${revealDelay}ms`,
        }}
      >
        {instrument.segments.map((segment: EquitySegment) => (
          <span
            key={segment.kind}
            aria-hidden="true"
            onClick={() => onPickSegment(segment.kind)}
            className="absolute top-0 h-2 cursor-pointer transition-opacity duration-150 ease-glide active:scale-[0.96]"
            style={{
              ...SEGMENT_STYLE[segment.kind],
              left: `${segment.left}%`,
              opacity: lens.keeps.includes(segment.kind) ? 1 : 0.2,
              width: `${segment.width}%`,
            }}
            title={`${instrument.name} ${SEGMENT_LABEL[segment.kind]}`}
          />
        ))}
      </div>

      {event === null ? null : (
        <div
          aria-hidden="true"
          className={cn("motion-reduce:transition-none")}
          style={{
            opacity: revealed && !scrubbing ? 1 : 0,
            transition: `opacity ${settled ? "var(--duration-fast)" : "var(--duration-base)"} var(--motion-glide)`,
            transitionDelay: settled ? "0ms" : `${revealDelay + 400}ms`,
          }}
        >
          <span
            className="absolute top-0.5 size-1 -translate-x-1/2 rounded-full"
            style={{
              backgroundColor: "color-mix(in oklab, var(--foreground) 80%, transparent)",
              left: `${percentOfDomain(event.month)}%`,
            }}
          />
          <span
            className="absolute top-3.5 -translate-x-1/2 text-[11px] leading-[14px] whitespace-nowrap text-muted-foreground tabular-nums"
            style={{ left: `${percentOfDomain(event.month)}%` }}
          >
            {event.label}
          </span>
        </div>
      )}
    </div>
  )
}
