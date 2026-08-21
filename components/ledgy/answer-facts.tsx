import * as React from "react"

const POOL_TICKS = 30
const POOL_REMAINING_TICKS = 5
const STAKEHOLDER_RING_RADIUS = 16
const STAKEHOLDER_RING_SEPARATOR_PERCENTAGE =
  (1 / (2 * Math.PI * STAKEHOLDER_RING_RADIUS)) * 100

/**
 * Chart colours come from the real Ledgy home and cap-table components.
 * They are product content inside the portfolio mock, so they deliberately do
 * not use the portfolio's neutral interaction tokens.
 */
const LEDGY_CHART = {
  poolAvailable: "#f0b100",
  poolUsed: "#cad5e2",
  primary500: "#4920f5",
  primary400: "#755bec",
  primary300: "#9a86f0",
  primary200: "#c1b5f5",
} as const

const STAKEHOLDER_GROUPS = [
  { label: "Employees", count: 76, color: LEDGY_CHART.primary500 },
  { label: "Investors", count: 42, color: LEDGY_CHART.primary400 },
  { label: "Founders", count: 22, color: LEDGY_CHART.primary300 },
  { label: "Advisors", count: 14, color: LEDGY_CHART.primary200 },
] as const

type TooltipRow = {
  color: string
  label: string
  value: string
}

const POOL_TOOLTIP_ROWS: TooltipRow[] = [
  { color: LEDGY_CHART.poolAvailable, label: "Available", value: "180,000 (18%)" },
  { color: LEDGY_CHART.poolUsed, label: "Used", value: "820,000 (82%)" },
]

const STAKEHOLDER_TOOLTIP_ROWS: TooltipRow[] = STAKEHOLDER_GROUPS.map((group) => ({
  color: group.color,
  label: group.label,
  value: `${group.count} (${Math.round((group.count / 154) * 100)}%)`,
}))

function ChartTooltip({
  ariaLabel,
  children,
  rows,
}: {
  ariaLabel: string
  children: React.ReactNode
  rows: TooltipRow[]
}) {
  const tooltipId = React.useId()
  const [isFocused, setIsFocused] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const isOpen = isFocused || isHovered

  return (
    <span
      aria-describedby={tooltipId}
      aria-label={ariaLabel}
      className="group/chart ledgy-answer-chart relative inline-flex shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      tabIndex={0}
    >
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className="ledgy-answer-tooltip pointer-events-none absolute right-0 bottom-[calc(100%+6px)] z-30 min-w-44 rounded-md bg-card px-2.5 py-2 text-xs text-card-foreground shadow-overlay [transition:opacity_120ms_var(--motion-glide),translate_120ms_var(--motion-glide)]"
        style={{ opacity: isOpen ? 1 : 0, translate: isOpen ? "0 0" : "0 4px" }}
      >
        <span className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <span key={row.label} className="flex items-center gap-3 whitespace-nowrap">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2"
                  style={{ backgroundColor: row.color }}
                />
                <span className="text-muted-foreground">{row.label}</span>
              </span>
              <span className="ml-auto font-medium text-card-foreground tabular-nums">
                {row.value}
              </span>
            </span>
          ))}
        </span>
      </span>
    </span>
  )
}

function PoolRatioBar() {
  return (
    <ChartTooltip
      ariaLabel="Pool breakdown"
      rows={POOL_TOOLTIP_ROWS}
    >
      <svg
        aria-hidden="true"
        className="h-3 w-20 @md:w-28"
        preserveAspectRatio="none"
        viewBox="0 0 118 12"
      >
        {Array.from({ length: POOL_TICKS }, (_, index) => (
          <rect
            key={index}
            fill={
              index < POOL_REMAINING_TICKS
                ? LEDGY_CHART.poolAvailable
                : LEDGY_CHART.poolUsed
            }
            height="12"
            width="2"
            x={index * 4}
            y="0"
          />
        ))}
      </svg>
    </ChartTooltip>
  )
}

function StakeholderGroupRing() {
  const total = STAKEHOLDER_GROUPS.reduce((sum, group) => sum + group.count, 0)
  const segments = STAKEHOLDER_GROUPS.map((group, index) => ({
    ...group,
    offset:
      -STAKEHOLDER_GROUPS.slice(0, index).reduce(
        (sum, precedingGroup) => sum + (precedingGroup.count / total) * 100,
        0
      ),
    percentage: (group.count / total) * 100,
  }))

  return (
    <ChartTooltip
      ariaLabel="Stakeholder breakdown by group"
      rows={STAKEHOLDER_TOOLTIP_ROWS}
    >
      <svg
        aria-hidden="true"
        className="ledgy-stakeholder-ring size-11 shrink-0 -rotate-90"
        viewBox="0 0 44 44"
      >
        {segments.map((group) => {
          const dashLength = Math.max(
            group.percentage - STAKEHOLDER_RING_SEPARATOR_PERCENTAGE,
            0
          )

          return (
            <circle
              key={group.label}
              className="ledgy-stakeholder-segment"
              cx="22"
              cy="22"
              fill="none"
              pathLength="100"
              r={STAKEHOLDER_RING_RADIUS}
              stroke={group.color}
              strokeDasharray={`${dashLength} ${100 - dashLength}`}
              strokeDashoffset={group.offset}
              strokeWidth="6"
            />
          )
        })}
      </svg>
    </ChartTooltip>
  )
}

export function AnswerFacts() {
  return (
    <dl className="mt-2 grid grid-cols-2 gap-2 @md:mt-3">
      <div className="ledgy-answer-fact flex min-h-[5.5rem] flex-col rounded-md border border-border bg-card p-3">
        <dt className="text-sm text-muted-foreground">Remaining pool</dt>
        <dd className="mt-auto flex min-h-11 items-end justify-between gap-3 pt-2">
          <span className="text-lg font-medium text-secondary-foreground">18%</span>
          <PoolRatioBar />
        </dd>
      </div>

      <div className="ledgy-answer-fact flex min-h-[5.5rem] flex-col rounded-md border border-border bg-card p-3">
        <dt className="text-sm text-muted-foreground">Stakeholders</dt>
        <dd className="mt-auto flex min-h-11 items-end justify-between gap-3 pt-2">
          <span className="text-lg font-medium text-secondary-foreground">154</span>
          <StakeholderGroupRing />
        </dd>
      </div>
    </dl>
  )
}
