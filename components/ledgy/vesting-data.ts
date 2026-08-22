/**
 * Vesting card data (mock).
 *
 * The Equity Dashboard panel shows one stakeholder's vesting breakdown. The
 * numbers here are invented but internally consistent: every percentage, every
 * subline and every tooltip row is derived from the same grant list, so nothing
 * on screen can drift out of agreement with the chart above it.
 *
 * Copied by hand from Ledgy's `dashboard-v2-prototype/vestingCardData.ts`
 * (grant names, unit labels, the compact money format). Nothing is imported.
 *
 * TIME. Months are integers counted from Feb 2020 (month 0) to Sept 2029
 * (month 115). Today is 22 Aug 2026, month 78.68. Keeping the axis in months
 * rather than Date objects means the chart scale is a plain LinearScale and the
 * data never re-derives from the clock, so the panel looks the same in every
 * screenshot.
 *
 * PERCENTAGES ARE VALUE, NOT UNITS. Ledgy counts vested units; this card counts
 * vested value, because the headline sits directly above a value chart and a
 * unit percentage would contradict the picture. Common Incentive shares carry
 * 2,000 units at no price, which is exactly where the two measures split.
 */

const CURRENCY = "€"

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
] as const

/** Month index for a calendar month, counted from Feb 2020. */
export function monthIndex(year: number, month: number) {
  return (year - 2020) * 12 + (month - 2)
}

export const VESTING_DOMAIN = {
  /** Feb 2020. */
  startMonth: 0,
  /** Sept 2029. */
  endMonth: monthIndex(2029, 9),
  /** 22 Aug 2026, the 22nd of a 31 day month. */
  todayMonth: monthIndex(2026, 8) + 21 / 31,
  /**
   * Fixed head-room above the committed total. Every scope shares it, so
   * switching tabs never rescales the picture.
   */
  yMax: 5_600_000,
  currencySymbol: CURRENCY,
} as const

export type VestingEvent = {
  /** Month index from Feb 2020. */
  month: number
  units: number
  value: number
}

export type VestingGrant = {
  name: string
  unitLabel: string
  events: VestingEvent[]
}

export type VestingScopeId = "all" | "options" | "shares"

export type VestingScope = {
  id: VestingScopeId
  label: string
  grants: VestingGrant[]
  /** Cumulative value at every month of the domain, index 0 is Feb 2020. */
  series: number[]
  /** Cumulative value at today. */
  vestedValue: number
  committedValue: number
  vestedPercent: number
  unvestedPercent: number
  /** The line under the left figure. */
  nextLine: string
  /** The line under the right figure, hidden when the schedule is finished. */
  endLine: string
  /** A finished schedule drops the right figure and reads "See history". */
  isComplete: boolean
}

const SHARE_PRICE = 3507.91

type GrantSeed = {
  name: string
  unitLabel: string
  units: number
  /** Value one unit adds when it vests: share price less the strike. */
  netValue: number
  kind: "option" | "share"
  /** Inclusive monthly window. Every grant vests in even monthly tranches. */
  from: [year: number, month: number]
  to: [year: number, month: number]
}

/**
 * The grants.
 *
 * Grant 133 vests from Jul 2021 rather than the spec's Sept 2025. With the
 * spec's own unit counts and prices the committed total lands on €5.29M, which
 * is the €5.3M the card is supposed to state, but the Sept 2025 start left only
 * €2.3M vested today, well short of the €3.7M the agreed mock draws at the
 * Today line. Moving the largest grant's start is the one change that puts both
 * numbers where the mock has them.
 *
 * THE RATIFIED TOTALS (docs/design/equity-timeline-spec.md). The equity
 * timeline card states four figures that are not up for derivation: Options
 * €4,681,864.51 over 1,335 options, Shares €403,409.74 over 2,115 shares,
 * €5,085,274.25 in total, 70% of it vested today. The share counts already
 * summed to 2,115; the option counts summed to 1,393, so Grant 133 drops from
 * 1,000 units to 942. Grant 133 rather than Grant 59 (which would have given a
 * tidier 100 + 135 + 100 + 1,000) because Grant 59 is fully vested and cutting
 * it takes the vested share down to 69%, while Grant 133 is 63% vested today
 * and cutting it leaves the card on 70.4%. Two netValues carry the cents; both
 * are commented where they sit.
 *
 * NO CLIFF JUMPS. The three share positions read as instant vests in Ledgy, and
 * drawn that way they put two vertical walls in the line: €52.6k at Jun 2021 and
 * €350.8k at Oct 2023, the second of them eight months of normal slope in one
 * step. Each is spread over the twelve months ending on its stated date, so the
 * cumulative line only ever climbs by a monthly tranche and the Shares scope
 * still finishes on 10 Oct 2023.
 */
const GRANT_SEEDS: GrantSeed[] = [
  {
    name: "Grant 83",
    unitLabel: "options",
    units: 100,
    netValue: SHARE_PRICE - 1.17,
    kind: "option",
    from: [2020, 2],
    to: [2024, 1],
  },
  {
    name: "Grant 59",
    unitLabel: "options",
    units: 193,
    netValue: SHARE_PRICE - 1.17,
    kind: "option",
    from: [2021, 4],
    to: [2025, 3],
  },
  {
    name: "Grant 131",
    unitLabel: "options",
    units: 100,
    netValue: SHARE_PRICE - 1.17,
    kind: "option",
    from: [2025, 10],
    to: [2029, 9],
  },
  {
    name: "Grant 133",
    unitLabel: "options",
    // 942, not the round 1,000 this grant used to carry. The four option
    // grants have to total the ratified 1,335 options (equity-timeline-spec)
    // and 100 + 193 + 100 is 393, so the largest grant absorbs the remainder.
    units: 942,
    // The residual that lands the Options committed total exactly on the
    // ratified EUR 4,681,864.51 once the other three grants are priced at
    // SHARE_PRICE - 1.17. Reads as a strike of 0.78 rather than the round 1.00.
    netValue: 3507.1291825902,
    kind: "option",
    from: [2021, 7],
    to: [2029, 9],
  },
  {
    name: "Common Incentive",
    unitLabel: "shares",
    units: 2000,
    netValue: 0,
    kind: "share",
    from: [2022, 11],
    to: [2023, 10],
  },
  {
    name: "Common",
    unitLabel: "shares",
    units: 15,
    // SHARE_PRICE plus six tenths of a cent, the whole of the EUR 0.09 gap
    // between 115 priced shares at SHARE_PRICE and the ratified Shares total
    // of EUR 403,409.74. It lands here rather than on Preferred E because
    // Preferred E has to stay on exactly EUR 350,791 for the On hold lens.
    netValue: SHARE_PRICE + 0.006,
    kind: "share",
    from: [2020, 7],
    to: [2021, 6],
  },
  {
    name: "Preferred E",
    unitLabel: "shares",
    units: 100,
    netValue: SHARE_PRICE,
    kind: "share",
    from: [2022, 11],
    to: [2023, 10],
  },
]

function buildGrant(seed: GrantSeed): VestingGrant & { kind: "option" | "share" } {
  const start = monthIndex(...seed.from)
  const end = monthIndex(...seed.to)
  const steps = end - start + 1
  const unitsPerStep = seed.units / steps

  return {
    kind: seed.kind,
    name: seed.name,
    unitLabel: seed.unitLabel,
    events: Array.from({ length: steps }, (_, step) => ({
      month: start + step,
      units: unitsPerStep,
      value: unitsPerStep * seed.netValue,
    })),
  }
}

const GRANTS = GRANT_SEEDS.map(buildGrant)

/** Cumulative value at every month of the domain. */
function buildSeries(grants: VestingGrant[]) {
  const series = new Array<number>(VESTING_DOMAIN.endMonth + 1).fill(0)

  for (const grant of grants) {
    for (const event of grant.events) {
      if (event.month < 0 || event.month >= series.length) continue
      series[event.month] += event.value
    }
  }

  let running = 0
  return series.map((added) => {
    running += added
    return running
  })
}

/**
 * `1 Sept 2026`, joined with non-breaking spaces so the narrow card breaks the
 * subline before the date rather than inside it.
 */
export function formatDayLabel(month: number, day: number) {
  const year = 2020 + Math.floor((month + 1) / 12)
  const name = MONTH_NAMES[(((month + 1) % 12) + 12) % 12]
  return `${day}\u00a0${name}\u00a0${year}`
}

/** `Jun 2023`, the tooltip's title. */
export function formatMonthLabel(month: number) {
  const rounded = Math.round(month)
  const year = 2020 + Math.floor((rounded + 1) / 12)
  const name = MONTH_NAMES[(((rounded + 1) % 12) + 12) % 12]
  return `${name} ${year}`
}

/** `€3.7M`, `€291.1k`. Ledgy's compact money, copied. */
export function formatCompactMoney(value: number) {
  const absolute = Math.abs(value)
  if (absolute >= 1_000_000) return `${CURRENCY}${(value / 1_000_000).toFixed(1)}M`
  if (absolute >= 1_000) return `${CURRENCY}${(value / 1_000).toFixed(1)}k`
  return `${CURRENCY}${Math.round(value)}`
}

/** `1,000 options`. Units always, money only where the grant carries a price. */
export function formatAmount(value: number, units: number, unitLabel: string) {
  const unitsLabel = `${Math.round(units).toLocaleString("en-US")} ${unitLabel}`
  return value > 0 ? `${formatCompactMoney(value)} · ${unitsLabel}` : unitsLabel
}

function buildScope({
  grants,
  id,
  label,
}: {
  grants: VestingGrant[]
  id: VestingScopeId
  label: string
}): VestingScope {
  const { todayMonth } = VESTING_DOMAIN
  const series = buildSeries(grants)
  const committedValue = series[series.length - 1] ?? 0
  const vestedValue = series[Math.floor(todayMonth)] ?? 0
  const vestedPercent = committedValue > 0 ? Math.round((vestedValue / committedValue) * 100) : 0
  const futureMonths = grants
    .flatMap((grant) => grant.events.map((event) => event.month))
    .filter((month) => month > todayMonth)
    .sort((first, second) => first - second)
  const lastMonth = grants.reduce(
    (latest, grant) =>
      grant.events.reduce((grantLatest, event) => Math.max(grantLatest, event.month), latest),
    0
  )
  const isComplete = futureMonths.length === 0
  const nextMonth = futureMonths[0]

  return {
    committedValue,
    endLine: `Fully vested ${formatDayLabel(lastMonth, 1)}`,
    grants,
    id,
    isComplete,
    label,
    nextLine: isComplete
      ? `Vesting completed on ${formatDayLabel(lastMonth, 10)}`
      : `Next vesting event ${formatDayLabel(nextMonth ?? lastMonth, 1)}`,
    series,
    unvestedPercent: 100 - vestedPercent,
    vestedPercent,
    vestedValue,
  }
}

export const VESTING_SCOPES: VestingScope[] = [
  buildScope({ grants: GRANTS, id: "all", label: "All instruments" }),
  buildScope({
    grants: GRANTS.filter((grant) => grant.kind === "option"),
    id: "options",
    label: "Options",
  }),
  buildScope({
    grants: GRANTS.filter((grant) => grant.kind === "share"),
    id: "shares",
    label: "Shares",
  }),
]

export const VESTING_AXIS = {
  start: formatMonthLabel(VESTING_DOMAIN.startMonth),
  end: formatMonthLabel(VESTING_DOMAIN.endMonth),
}

export type VestingTooltipRow = {
  label: string
  value: string
  isTotal?: boolean
}

/** One row per grant plus a Total, exactly as Ledgy's chart tooltip reads. */
export function getTooltipRows(scope: VestingScope, month: number): VestingTooltipRow[] {
  const perGrant = scope.grants
    .map((grant) => {
      const reached = grant.events.filter((event) => event.month <= month)
      return {
        unitLabel: grant.unitLabel,
        name: grant.name,
        units: reached.reduce((total, event) => total + event.units, 0),
        value: reached.reduce((total, event) => total + event.value, 0),
      }
    })
    .filter((entry) => entry.units > 0)

  if (perGrant.length === 0) return []

  const totals = perGrant.reduce(
    (total, entry) => ({ units: total.units + entry.units, value: total.value + entry.value }),
    { units: 0, value: 0 }
  )
  const unitLabel = perGrant.every((entry) => entry.unitLabel === perGrant[0]?.unitLabel)
    ? (perGrant[0]?.unitLabel ?? "units")
    : "units"

  return [
    ...perGrant.map((entry) => ({
      label: entry.name,
      value: formatAmount(entry.value, entry.units, entry.unitLabel),
    })),
    ...(perGrant.length === 1
      ? []
      : [
          {
            isTotal: true,
            label: "Total",
            value: formatAmount(totals.value, totals.units, unitLabel),
          },
        ]),
  ]
}
