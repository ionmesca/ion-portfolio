"use client"

import { useId, type CSSProperties } from "react"

import { cn } from "@/lib/utils"

import "./ledgy-thinking-mark.css"

/**
 * LedgyThinkingMark — copy-in from `@ledgy/library-ui`.
 *
 * SOURCE: ledgy-app/packages/library-ui/src/LedgyThinkingMark.tsx
 *         ledgy-app/packages/web/client/styles/animations.css
 *
 * This directory is the vendor surface for Ledgy primitives on this site,
 * the same model as `components/ui/` for shadcn: copy the source, drop the
 * product graph (`@ledgy-shared`, Font Awesome, React Aria), retheme at the
 * call site. Do not npm-link `@ledgy/library-ui` — it is a private workspace
 * package with a Ledgy-only peer set. The next homepage widgets land here
 * the same way.
 *
 * Product timing is not tunable. `sizePx` is the orb diameter; the label
 * is `sizePx / 1.5` so the orb reads one-and-a-half times the word.
 */

const THEME = {
  neutral: {
    orb: false,
    railColor: "var(--muted-foreground)",
    stripeColor: "var(--primary-hover)",
  },
  orb: {
    orb: true,
    railColor: "#e6e3fb",
    stripeColor: "#ffffff",
  },
} as const

const VIEW_SIZE = 480
const CENTER = VIEW_SIZE / 2
const RADIUS = 192
const LOGO_WIDTH = 36
const STRIPE_COUNT = 5
const MAX_STEPS = Math.ceil(STRIPE_COUNT / 2)
const STEP_WIDTH = LOGO_WIDTH / MAX_STEPS
const TAN_ANGLE = Math.tan((29.9 * Math.PI) / 180)
const STRIDE = STEP_WIDTH * TAN_ANGLE
const THICKNESS = STRIDE * 0.55

type Stripe = {
  lx: number
  refTop: number
  rx: number
}

const STRIPES: readonly Stripe[] = Array.from({ length: STRIPE_COUNT }, (_, lane) => {
  const steps = Math.min(lane + 1, STRIPE_COUNT - lane)
  const leftAligned = lane < MAX_STEPS
  return {
    lx: leftAligned ? 0 : LOGO_WIDTH - steps * STEP_WIDTH,
    refTop: STEP_WIDTH * TAN_ANGLE + lane * STRIDE,
    rx: leftAligned ? steps * STEP_WIDTH : LOGO_WIDTH,
  }
})

const MIN_Y = Math.min(...STRIPES.map((stripe) => stripe.refTop - stripe.rx * TAN_ANGLE))
const MAX_Y = Math.max(
  ...STRIPES.map((stripe) => stripe.refTop + THICKNESS - stripe.lx * TAN_ANGLE)
)
const SCALE = Math.min((2 * RADIUS) / LOGO_WIDTH, (2 * RADIUS) / (MAX_Y - MIN_Y))
const MARK_TRANSFORM = `translate(${CENTER - (LOGO_WIDTH * SCALE) / 2} ${
  CENTER - (SCALE * (MIN_Y + MAX_Y)) / 2
}) scale(${SCALE})`
const LANE_SHEAR = `matrix(1 ${-TAN_ANGLE} 0 1 0 0)`

const COVER = (RADIUS * 2.2) / SCALE
const RAIL_X1 = -COVER
const RAIL_X2 = LOGO_WIDTH + COVER
const RAIL_WEIGHT = 0.7
const FIRST_RAIL = STRIPES[0].refTop + THICKNESS / 2
const RAIL_MIN = Math.floor((-COVER - RAIL_X2 * TAN_ANGLE - FIRST_RAIL) / STRIDE)
const RAIL_MAX = Math.ceil((MAX_Y + COVER + COVER * TAN_ANGLE - FIRST_RAIL) / STRIDE)
const RAILS: readonly number[] = Array.from(
  { length: RAIL_MAX - RAIL_MIN + 1 },
  (_, index) => FIRST_RAIL + (RAIL_MIN + index) * STRIDE
)

const THINKING_CYCLE_SEC = 4.4 / 1.83
const CYCLE_DURATION = `${THINKING_CYCLE_SEC.toFixed(4)}s`
const TRAVEL = RADIUS / SCALE + LOGO_WIDTH * 1.1
const ENTER_STRETCH = LOGO_WIDTH * 0.12
const LANE_STAGGER = 0.07

/** In-product mark is 20px with `gap-2.5` (10px). Gap tracks the orb. */
const GAP_RATIO = 10 / 20
/** Orb diameter / word size. The mark leads; the label follows. */
const ORB_TO_TEXT = 1.5
/** Unitless. `1` clips the T cap, i-dots, and the g descender. */
const LABEL_LINE_HEIGHT = 1.25

const MARK_STYLE = {
  "--dash-travel": `${TRAVEL.toFixed(2)}px`,
  "--thinking-cycle-sec": CYCLE_DURATION,
} as CSSProperties

const DASH_STYLES: readonly CSSProperties[] = STRIPES.map((stripe, lane) => ({
  "--dash-stretch": ((stripe.rx - stripe.lx + 2 * ENTER_STRETCH) / (stripe.rx - stripe.lx)).toFixed(
    3
  ),
  animationDelay: `${((LANE_STAGGER * lane * THINKING_CYCLE_SEC) / (STRIPE_COUNT - 1)).toFixed(3)}s`,
})) as CSSProperties[]

const LABEL_STYLE = {
  "--shimmer-period": CYCLE_DURATION,
  "--shimmer-phase": "0.48",
} as CSSProperties

export type ThinkingTheme = keyof typeof THEME

export function LedgyThinkingMark({
  className,
  label,
  labelSizePx,
  sizePx = 24,
  theme = "neutral",
}: {
  className?: string
  label?: string
  labelSizePx?: number
  sizePx?: number
  theme?: ThinkingTheme
}) {
  const uid = useId()
  const clipId = `${uid}-clip`
  const orbBaseId = `${uid}-orb-base`
  const orbDeepId = `${uid}-orb-deep`
  const orbLightId = `${uid}-orb-light`
  const colors = THEME[theme]

  const mark = (
    <span
      className={cn(
        "inline-block shrink-0 overflow-hidden rounded-full",
        !label && className
      )}
      style={{ height: sizePx, width: sizePx }}
    >
      <svg
        aria-label="Loading"
        className="h-full w-full"
        role="img"
        style={MARK_STYLE}
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={CENTER} cy={CENTER} r={RADIUS} />
          </clipPath>
          {colors.orb ? (
            <>
              <linearGradient id={orbBaseId} x1="0%" x2="35%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#8478F3" />
                <stop offset="100%" stopColor="#5531EF" />
              </linearGradient>
              <radialGradient id={orbLightId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EAE7FC" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#EAE7FC" stopOpacity={0} />
              </radialGradient>
              <radialGradient id={orbDeepId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4720E6" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#4720E6" stopOpacity={0} />
              </radialGradient>
            </>
          ) : null}
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {colors.orb ? (
            <g>
              <rect fill={`url(#${orbBaseId})`} height={VIEW_SIZE} width={VIEW_SIZE} x={0} y={0} />
              <circle
                cx={CENTER + RADIUS * 0.55}
                cy={CENTER - RADIUS * 0.62}
                fill={`url(#${orbLightId})`}
                r={RADIUS * 1.15}
              />
              <circle
                cx={CENTER - RADIUS * 0.5}
                cy={CENTER + RADIUS * 0.75}
                fill={`url(#${orbDeepId})`}
                r={RADIUS * 1.2}
              />
            </g>
          ) : null}
          <g transform={`${MARK_TRANSFORM} ${LANE_SHEAR}`}>
            <g className="ledgy-thinking-rails" stroke={colors.railColor}>
              {RAILS.map((rail) => (
                <line
                  key={rail}
                  strokeWidth={RAIL_WEIGHT}
                  vectorEffect="non-scaling-stroke"
                  x1={RAIL_X1}
                  x2={RAIL_X2}
                  y1={rail}
                  y2={rail}
                />
              ))}
            </g>
            <g fill={colors.stripeColor}>
              {STRIPES.map((stripe, lane) => (
                <rect
                  key={stripe.refTop}
                  className="ledgy-thinking-dash"
                  height={THICKNESS}
                  style={DASH_STYLES[lane]}
                  width={stripe.rx - stripe.lx}
                  x={stripe.lx}
                  y={stripe.refTop}
                />
              ))}
            </g>
          </g>
        </g>
      </svg>
    </span>
  )

  if (!label) return mark

  const fontSize = labelSizePx ?? sizePx / ORB_TO_TEXT

  return (
    <span
      className={cn("inline-flex items-center overflow-visible", className)}
      style={{ gap: sizePx * GAP_RATIO }}
    >
      {mark}
      <span
        className="ledgy-shimmer-text"
        style={{
          ...LABEL_STYLE,
          fontSize,
          lineHeight: LABEL_LINE_HEIGHT,
          overflow: "visible",
        }}
      >
        {label}
      </span>
    </span>
  )
}
