"use client"

import * as React from "react"
import type { Chart as ChartType, ChartDataset, Plugin, ScriptableContext } from "chart.js"

import { prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

import {
  VESTING_AXIS,
  VESTING_DOMAIN,
  VESTING_SCOPES,
  formatCompactMoney,
  formatMonthLabel,
  getTooltipRows,
  type VestingScope,
  type VestingScopeId,
  type VestingTooltipRow,
} from "./vesting-data"

/**
 * The Equity Dashboard panel's vesting card: how far vesting has come, what is
 * next, and when it ends, for the whole portfolio or one instrument family.
 *
 * The card anatomy is hand-copied from Ledgy's `VestingCard` / `VestingChart`
 * and re-themed onto the portfolio tokens. Nothing is imported from Ledgy. The
 * only colours spelled literally are Ledgy's emeralds, which are the point of
 * the picture: #10b981 is the vested series, #047857 the vested figure.
 *
 * The drawing is Chart.js 4, lazy-imported inside an effect and registered
 * piece by piece, so none of it lands in the landing page's first load.
 */

/** Ledgy `status-vested`, emerald 500. The series colour. */
const EMERALD = "#10b981"
/** Ledgy `delta-pos`, emerald 700. Emerald 500 goes thin at 24px. */
const EMERALD_STRONG = "#047857"

const CHEVRON_PATH =
  "M313.5 239c9.4 9.4 9.4 24.6 0 33.9l-200 200c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l183-183-183-183c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l200 200z"

const { endMonth, startMonth, todayMonth, yMax } = VESTING_DOMAIN

const FIRST_SCOPE = VESTING_SCOPES[0] as VestingScope

const findScope = (id: VestingScopeId) =>
  VESTING_SCOPES.find((entry) => entry.id === id) ?? FIRST_SCOPE

type Rgb = [number, number, number]

/** Stone 500 and stone 950, used only if the canvas cannot parse an oklch token. */
const FALLBACK_MUTED: Rgb = [121, 113, 107]
const FALLBACK_FOREGROUND: Rgb = [12, 10, 9]

type Ink = { foreground: Rgb; mutedForeground: Rgb }

/**
 * Canvas cannot resolve `var(--muted-foreground)`, and the token is an oklch()
 * string, so paint one pixel with it and read the bytes back. That keeps the
 * chart on the real tokens in both themes instead of freezing a hex.
 */
function resolveInk(element: HTMLElement): Ink {
  const styles = getComputedStyle(element)
  let probe: CanvasRenderingContext2D | null = null
  try {
    probe = document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true })
  } catch {
    probe = null
  }

  const read = (name: string, fallback: Rgb): Rgb => {
    const value = styles.getPropertyValue(name).trim()
    if (!probe || value === "") return fallback
    try {
      probe.clearRect(0, 0, 1, 1)
      probe.fillStyle = "#000000"
      probe.fillStyle = value
      probe.fillRect(0, 0, 1, 1)
      const pixel = probe.getImageData(0, 0, 1, 1).data
      if (pixel[3] === 0) return fallback
      return [pixel[0] ?? 0, pixel[1] ?? 0, pixel[2] ?? 0]
    } catch {
      return fallback
    }
  }

  return {
    foreground: read("--foreground", FALLBACK_FOREGROUND),
    mutedForeground: read("--muted-foreground", FALLBACK_MUTED),
  }
}

const rgba = ([red, green, blue]: Rgb, alpha: number) =>
  `rgba(${red}, ${green}, ${blue}, ${alpha})`

/**
 * Fey's dot field. A 10px pitch of 1px dots, faded out at the floor and eased
 * off at the ceiling, so the plot sits on texture rather than on a grid.
 */
function maskAlpha(heightFraction: number) {
  if (heightFraction <= 0.35) return heightFraction / 0.35
  if (heightFraction <= 0.75) return 1
  return 1 - ((heightFraction - 0.75) / 0.25) * 0.85
}

type Geometry = {
  left: number
  top: number
  width: number
  height: number
  todayX: number
  todayY: number
}

const sameGeometry = (first: Geometry | null, second: Geometry) =>
  first !== null &&
  Math.abs(first.left - second.left) < 0.5 &&
  Math.abs(first.top - second.top) < 0.5 &&
  Math.abs(first.width - second.width) < 0.5 &&
  Math.abs(first.height - second.height) < 0.5 &&
  Math.abs(first.todayX - second.todayX) < 0.5 &&
  Math.abs(first.todayY - second.todayY) < 0.5

type HoverState = { month: number; x: number; y: number; rows: VestingTooltipRow[] }

/** Chart.js object data cannot hold a bare null, so a gap is a point with a null y. */
type LinePoint = { x: number; y: number | null }

/** Months across the domain, with today inserted so the split lands on the marker. */
function buildPoints(scope: VestingScope) {
  const months: number[] = []
  let todayInserted = false
  for (let month = startMonth; month <= endMonth; month += 1) {
    if (month > todayMonth && !todayInserted) {
      months.push(todayMonth)
      todayInserted = true
    }
    months.push(month)
  }

  return months.map((month) => ({
    month,
    value: scope.series[Math.min(Math.floor(month), scope.series.length - 1)] ?? 0,
  }))
}

/**
 * Two datasets over the same point list, each blanked outside its era, so the
 * hover still matches by index across both.
 */
function buildDatasets(scope: VestingScope, ink: Ink): ChartDataset<"line", LinePoint[]>[] {
  const points = buildPoints(scope)

  return [
    {
      backgroundColor: (context: ScriptableContext<"line">) => {
        const { chartArea, ctx } = context.chart
        if (!chartArea) return "transparent"
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.16)")
        gradient.addColorStop(1, "rgba(16, 185, 129, 0)")
        return gradient
      },
      borderColor: EMERALD,
      borderJoinStyle: "round",
      borderWidth: 1.5,
      data: points.map((point) => ({
        x: point.month,
        y: point.month <= todayMonth ? point.value : null,
      })),
      fill: "origin",
      label: "Vested",
      pointHoverRadius: 0,
      pointRadius: 0,
      spanGaps: false,
      stepped: "before",
      tension: 0,
    },
    {
      borderColor: rgba(ink.mutedForeground, 0.6),
      borderDash: [3, 4],
      borderJoinStyle: "round",
      borderWidth: 1.25,
      data: points.map((point) => ({
        x: point.month,
        y: point.month >= todayMonth ? point.value : null,
      })),
      fill: false,
      label: "Scheduled",
      pointHoverRadius: 0,
      pointRadius: 0,
      spanGaps: false,
      stepped: "before",
      tension: 0,
    },
  ]
}

function ScopeTabs({
  onSelect,
  value,
}: {
  onSelect: (id: VestingScopeId) => void
  value: VestingScopeId
}) {
  return (
    <div className="flex min-w-0 flex-wrap gap-1" role="tablist" aria-label="Vesting scope">
      {VESTING_SCOPES.map((scope) => {
        const isActive = scope.id === value
        return (
          <button
            key={scope.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(scope.id)}
            className={cn(
              "inline-flex h-7 cursor-pointer items-center justify-center rounded-[8px] px-2",
              "text-xs leading-4 font-medium text-secondary-foreground",
              "transition-[background-color,box-shadow] duration-150 ease-glide",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
              isActive ? "bg-card shadow-subtle" : "bg-transparent hover:bg-muted"
            )}
          >
            {scope.label}
          </button>
        )
      })}
    </div>
  )
}

function ChartTooltip({ hover, plotWidth }: { hover: HoverState; plotWidth: number }) {
  const isProjected = hover.month > todayMonth
  const clampedLeft = Math.min(Math.max(hover.x, 88), Math.max(plotWidth - 88, 88))

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-10 flex min-w-40 flex-col gap-1",
        "rounded-sm bg-card p-2.5 text-xs whitespace-nowrap shadow-overlay",
        "animate-in fade-in-0 duration-150 ease-glide motion-reduce:animate-none"
      )}
      style={{
        left: clampedLeft,
        top: Math.max(hover.y - 12, 0),
        transform: "translate(-50%, -100%)",
      }}
    >
      <span className="text-muted-foreground">
        {`Vested by ${formatMonthLabel(hover.month)}${isProjected ? " · projected" : ""}`}
      </span>
      {hover.rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {row.isTotal ? (
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: EMERALD }}
              />
            ) : null}
            {row.label}
          </span>
          <span className="font-medium text-foreground tabular-nums">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export function VestingChart() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const plotRef = React.useRef<HTMLDivElement>(null)
  const chartRef = React.useRef<ChartType<"line", LinePoint[]> | null>(null)
  const drawnScopeRef = React.useRef<VestingScopeId>("all")
  const inkRef = React.useRef<Ink>({
    foreground: FALLBACK_FOREGROUND,
    mutedForeground: FALLBACK_MUTED,
  })
  const geometryRef = React.useRef<Geometry | null>(null)
  const hoverRef = React.useRef<HoverState | null>(null)

  const [scopeId, setScopeId] = React.useState<VestingScopeId>("all")
  const [geometry, setGeometry] = React.useState<Geometry | null>(null)
  const [hover, setHover] = React.useState<HoverState | null>(null)
  const [figuresFaded, setFiguresFaded] = React.useState(false)
  const [shownScopeId, setShownScopeId] = React.useState<VestingScopeId>("all")

  const scope = findScope(scopeId)
  const shownScope = findScope(shownScopeId)

  /**
   * The figures cross-fade rather than cut, the same beat as Ledgy's lens swap:
   * down to 0.18 over 150ms, swap the text, back up.
   */
  React.useEffect(() => {
    if (scopeId === shownScopeId) return
    if (prefersReducedMotion()) {
      setShownScopeId(scopeId)
      return
    }
    setFiguresFaded(true)
    const timer = window.setTimeout(() => {
      setShownScopeId(scopeId)
      setFiguresFaded(false)
    }, 150)
    return () => window.clearTimeout(timer)
  }, [scopeId, shownScopeId])

  React.useEffect(() => {
    const canvas = canvasRef.current
    const plot = plotRef.current
    if (!canvas || !plot) return

    let cancelled = false
    let chart: ChartType<"line", LinePoint[]> | null = null
    const ink = resolveInk(plot)
    inkRef.current = ink
    const reduced = prefersReducedMotion()

    const publishGeometry = (instance: ChartType<"line", LinePoint[]>) => {
      const { chartArea, scales } = instance
      const xScale = scales.x
      const yScale = scales.y
      if (!chartArea || !xScale || !yScale) return
      const next: Geometry = {
        height: chartArea.bottom - chartArea.top,
        left: chartArea.left,
        todayX: xScale.getPixelForValue(todayMonth),
        todayY: yScale.getPixelForValue(findScope(drawnScopeRef.current).vestedValue),
        top: chartArea.top,
        width: chartArea.right - chartArea.left,
      }
      if (sameGeometry(geometryRef.current, next)) return
      geometryRef.current = next
      setGeometry(next)
    }

    const dotGrid: Plugin<"line"> = {
      id: "dotGrid",
      beforeDatasetsDraw(instance) {
        const { chartArea, ctx } = instance
        if (!chartArea) return
        const height = chartArea.bottom - chartArea.top
        if (height <= 0) return
        ctx.save()
        ctx.fillStyle = rgba(inkRef.current.mutedForeground, 1)
        for (let y = chartArea.top + 5; y < chartArea.bottom; y += 10) {
          const alpha = 0.32 * maskAlpha((chartArea.bottom - y) / height)
          if (alpha <= 0.005) continue
          ctx.globalAlpha = alpha
          for (let x = chartArea.left + 5; x < chartArea.right; x += 10) {
            ctx.fillRect(Math.round(x) - 0.5, Math.round(y) - 0.5, 1, 1)
          }
        }
        ctx.restore()
      },
    }

    const todayMarker: Plugin<"line"> = {
      id: "todayMarker",
      afterDatasetsDraw(instance) {
        const { chartArea, ctx, scales } = instance
        const xScale = scales.x
        if (!chartArea || !xScale) return
        ctx.save()
        ctx.lineWidth = 1
        ctx.setLineDash([3, 4])
        ctx.strokeStyle = rgba(inkRef.current.mutedForeground, 0.9)
        const markerX = Math.round(xScale.getPixelForValue(todayMonth)) + 0.5
        ctx.beginPath()
        ctx.moveTo(markerX, chartArea.top)
        ctx.lineTo(markerX, chartArea.bottom)
        ctx.stroke()

        const active = hoverRef.current
        if (active) {
          ctx.setLineDash([])
          ctx.strokeStyle = rgba(inkRef.current.foreground, 0.25)
          const guideX = Math.round(active.x + chartArea.left) + 0.5
          ctx.beginPath()
          ctx.moveTo(guideX, chartArea.top)
          ctx.lineTo(guideX, chartArea.bottom)
          ctx.stroke()
        }
        ctx.restore()
      },
    }

    const geometryReporter: Plugin<"line"> = {
      id: "geometryReporter",
      afterDraw(instance) {
        publishGeometry(instance as ChartType<"line", LinePoint[]>)
      },
    }

    void (async () => {
      const { Chart, Filler, LineController, LineElement, LinearScale, PointElement, Tooltip } =
        await import("chart.js")
      if (cancelled) return
      Chart.register(Filler, LineController, LineElement, LinearScale, PointElement, Tooltip)

      chart = new Chart<"line", LinePoint[]>(canvas, {
        data: { datasets: buildDatasets(findScope(drawnScopeRef.current), ink) },
        options: {
          animation: reduced ? false : { duration: 400, easing: "easeOutQuart" },
          interaction: { intersect: false, mode: "index" },
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: false,
              external: (context) => {
                const area = context.chart.chartArea
                const { tooltip } = context
                if (tooltip.opacity === 0 || !area) {
                  if (hoverRef.current !== null) {
                    hoverRef.current = null
                    setHover(null)
                  }
                  return
                }
                const point = tooltip.dataPoints[0]
                if (!point) return
                const month = Math.round(
                  typeof point.parsed.x === "number" ? point.parsed.x : todayMonth
                )
                const next: HoverState = {
                  month,
                  rows: getTooltipRows(findScope(drawnScopeRef.current), month),
                  x: point.element.x - area.left,
                  y: point.element.y - area.top,
                }
                if (
                  hoverRef.current !== null &&
                  hoverRef.current.month === next.month &&
                  Math.abs(hoverRef.current.y - next.y) < 0.5
                ) {
                  return
                }
                hoverRef.current = next
                setHover(next)
              },
            },
          },
          responsive: true,
          scales: {
            x: {
              display: false,
              grid: { display: false },
              max: endMonth,
              min: startMonth,
              type: "linear",
            },
            y: { display: false, grid: { display: false }, max: yMax, min: 0, type: "linear" },
          },
        },
        plugins: [dotGrid, todayMarker, geometryReporter],
        type: "line",
      })
      chartRef.current = chart
    })()

    return () => {
      cancelled = true
      chart?.destroy()
      chartRef.current = null
      hoverRef.current = null
      geometryRef.current = null
    }
  }, [])

  React.useEffect(() => {
    const chart = chartRef.current
    if (!chart || drawnScopeRef.current === scope.id) {
      drawnScopeRef.current = scope.id
      return
    }
    drawnScopeRef.current = scope.id
    chart.data.datasets = buildDatasets(scope, inkRef.current)
    hoverRef.current = null
    setHover(null)
    chart.update()
  }, [scope])

  const clearHover = React.useCallback(() => {
    if (hoverRef.current === null) return
    hoverRef.current = null
    setHover(null)
    const chart = chartRef.current
    if (!chart) return
    chart.setActiveElements([])
    chart.update("none")
  }, [])

  const linkLabel = shownScope.isComplete ? "See history" : "See full schedule"

  return (
    <section
      aria-label="Vesting"
      className="flex w-full max-w-[560px] min-w-0 flex-col gap-3 rounded-md bg-card p-4 shadow-subtle"
    >
      <header className="flex items-start justify-between gap-3">
        <ScopeTabs onSelect={setScopeId} value={scopeId} />
        {/*
          The link is a desktop affordance. Below the container breakpoint the
          three tabs already fill the header row, and the tabs are the live part
          of this panel, so the link steps aside rather than pushing them onto a
          second line. It opens no drawer here either way.
        */}
        <button
          type="button"
          className={cn(
            "hidden h-7 flex-none cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 @md:flex",
            "text-xs leading-4 font-medium text-secondary-foreground",
            "transition-colors duration-150 ease-glide hover:text-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          )}
        >
          {linkLabel}
          <svg aria-hidden="true" className="size-3" viewBox="0 0 320 512">
            <path d={CHEVRON_PATH} fill="currentColor" />
          </svg>
        </button>
      </header>

      <div
        className={cn(
          "flex items-start justify-between gap-2 @md:gap-4",
          "transition-opacity duration-150 ease-glide",
          figuresFaded ? "opacity-[0.18]" : "opacity-100"
        )}
      >
        {/*
          The two figures never wrap and never shrink; the sublines under them
          take a second line on the narrow card instead. Leaving the columns on
          their default `min-width: auto` is what floors the shrink at the
          figures, so "30% unvested" cannot break across two lines.
        */}
        <div className="flex flex-col gap-0.5">
          <span
            className="text-2xl leading-8 font-medium whitespace-nowrap tabular-nums"
            style={{ color: EMERALD_STRONG }}
          >
            {`${shownScope.vestedPercent}% vested`}
          </span>
          <span className="text-xs leading-4 text-muted-foreground">{shownScope.nextLine}</span>
        </div>
        {shownScope.isComplete ? null : (
          <div className="flex flex-col items-end gap-0.5 text-right">
            <span className="text-2xl leading-8 font-medium whitespace-nowrap text-muted-foreground tabular-nums">
              {`${shownScope.unvestedPercent}% unvested`}
            </span>
            <span className="text-xs leading-4 text-muted-foreground">{shownScope.endLine}</span>
          </div>
        )}
      </div>

      <div className="relative h-4 pr-12">
        {geometry === null ? null : (
          <span
            className="pointer-events-none absolute top-0 -translate-x-full pr-2 text-xs leading-4 whitespace-nowrap text-muted-foreground"
            style={{ left: geometry.todayX }}
          >
            Today
          </span>
        )}
      </div>

      {/*
        The gutter is padding on the outer box, so the inner box measures exactly
        the plot: the overlays and the axis row read the same rectangle.
        Hover is an extra, never the only way to the numbers: the figures above
        already state the position for touch and keyboard.
      */}
      <div className="pr-12">
        <div ref={plotRef} className="relative h-[200px] @md:h-[180px]" onMouseLeave={clearHover}>
          <canvas ref={canvasRef} role="img" aria-label="Vested and scheduled value over time" />

          {geometry === null ? null : (
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  backgroundColor: EMERALD,
                  boxShadow: "0 0 0 3px var(--card), 0 0 0 7px rgba(16, 185, 129, 0.16)",
                  left: geometry.todayX,
                  top: geometry.todayY,
                }}
              />
              <span
                className="pointer-events-none absolute top-1 text-xs leading-4 font-medium whitespace-nowrap text-foreground tabular-nums"
                style={{ left: geometry.todayX, transform: "translateX(calc(-100% - 8px))" }}
              >
                {formatCompactMoney(shownScope.vestedValue)}
              </span>
            </>
          )}

          {hover === null || geometry === null ? null : (
            <ChartTooltip hover={hover} plotWidth={geometry.width} />
          )}
        </div>
      </div>

      <div className="flex justify-between pr-12 text-xs leading-4 text-muted-foreground">
        <span>{VESTING_AXIS.start}</span>
        <span>{VESTING_AXIS.end}</span>
      </div>
    </section>
  )
}
