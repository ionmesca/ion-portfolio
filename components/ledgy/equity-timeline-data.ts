/**
 * Equity timeline data — the merged holdings-and-vesting card.
 *
 * `vesting-data.ts` owns the grants; this file owns the two INSTRUMENT rows the
 * card draws (Options, Shares), the strip geometry on the shared time axis, the
 * lock on Preferred E, and the as-of readouts the scrub asks for. Nothing here
 * invents a number: every figure is a sum over the same grant events the old
 * chart plotted, so the headline, the sublines, the row values and the strips
 * cannot disagree with each other.
 *
 * TIME IS A PERCENT. The card has no scale object. Feb 2020 is 0%, Sept 2029 is
 * 100%, and every segment, guide and dot is `percentOfDomain(month)`. That is
 * what lets the strips be plain absolutely-positioned spans instead of a canvas.
 *
 * VALUE, NOT UNITS. Percentages are shares of committed VALUE, matching the
 * headline the card sits under. Common Incentive's 2,000 unpriced shares are
 * exactly where the two measures split, which is why the Shares row can read
 * 2,115 shares and €403,409.74 at the same time.
 */

import {
  VESTING_DOMAIN,
  VESTING_SCOPES,
  formatDayLabel,
  formatMonthLabel,
  monthIndex,
  type VestingGrant,
} from "./vesting-data"

/** Ledgy `status-vested`, emerald 500. The vested colour, everywhere. */
export const EMERALD = "#10b981"
/** Ledgy `delta-pos`, emerald 700. The scrub percentage, which emerald 500 loses. */
export const EMERALD_STRONG = "#047857"
/** Ledgy `status-unvested`, slate 300. */
export const SLATE = "#cbd5e1"
/** Ledgy's on-hold hatch. Emerald at two densities, 45 degrees. */
export const HATCH =
  "repeating-linear-gradient(45deg, #10b981 0 2px, rgba(16,185,129,0.28) 2px 5px)"

const { endMonth, startMonth, todayMonth } = VESTING_DOMAIN

export const EQUITY_DOMAIN = { endMonth, startMonth, todayMonth } as const

/** Where a month sits on the strip, 0 at Feb 2020 and 100 at Sept 2029. */
export function percentOfDomain(month: number) {
  return ((month - startMonth) / (endMonth - startMonth)) * 100
}

/** The nearest whole month to a 0–1 position across the strip column. */
export function monthAtFraction(fraction: number) {
  const clamped = Math.min(Math.max(fraction, 0), 1)
  return Math.round(startMonth + clamped * (endMonth - startMonth))
}

/* ────────────────────────────────────────────────────────────────────────────
   LOCKS

   A lock is a holding period bolted onto a grant AFTER it has vested: the
   shares are earned, they are simply not the holder's to move yet. It is the
   only fact in the card that the grant list cannot state, so it lives here.
   ──────────────────────────────────────────────────────────────────────────── */

type Lock = {
  grantName: string
  /** The last vest of the locked grant. */
  startMonth: number
  endMonth: number
  label: string
}

const PREFERRED_E_LOCK: Lock = {
  endMonth: monthIndex(2027, 3) + 11 / 31,
  grantName: "Preferred E",
  label: formatDayLabel(monthIndex(2027, 3), 12),
  startMonth: monthIndex(2023, 10),
}

/**
 * Grants whose remaining tranches depend on a performance or a liquidity
 * condition. Empty today, and deliberately so: the card draws a fading tail on
 * the unvested segment when a row has one, and that branch is kept live and
 * unexercised rather than deleted, because conditions are the next thing this
 * data gains.
 */
const CONDITIONAL_GRANTS: readonly string[] = []

/* ────────────────────────────────────────────────────────────────────────────
   INSTRUMENTS
   ──────────────────────────────────────────────────────────────────────────── */

export type EquitySegmentKind = "vested" | "unvested" | "onhold" | "conditions"

export type EquitySegment = {
  kind: EquitySegmentKind
  /** Percent of the domain. */
  left: number
  width: number
}

export type EquityInstrumentId = "options" | "shares"

export type EquityInstrument = {
  id: EquityInstrumentId
  name: string
  /** `4 grants`, `3 share classes`. */
  subline: string
  unitLabel: string
  committedValue: number
  committedUnits: number
  vestedValue: number
  vestedUnits: number
  unvestedValue: number
  unvestedUnits: number
  onHoldValue: number
  onHoldUnits: number
  /** Painted in order; the hatch is last so it covers the vested span it replaces. */
  segments: EquitySegment[]
  /** The nearest upcoming dated event, drawn as one dot on the bar. */
  event: { month: number; label: string } | null
  lock: Lock | null
}

type Reached = { units: number; value: number }

function reached(grants: VestingGrant[], month: number): Reached {
  let units = 0
  let value = 0
  for (const grant of grants) {
    for (const event of grant.events) {
      if (event.month > month) continue
      units += event.units
      value += event.value
    }
  }
  return { units, value }
}

function grantsOf(scopeId: "options" | "shares") {
  return VESTING_SCOPES.find((scope) => scope.id === scopeId)?.grants ?? []
}

function firstMonth(grants: VestingGrant[]) {
  let earliest: number = endMonth
  for (const grant of grants) {
    for (const event of grant.events) earliest = Math.min(earliest, event.month)
  }
  return earliest
}

function lastMonth(grants: VestingGrant[]) {
  let latest: number = startMonth
  for (const grant of grants) {
    for (const event of grant.events) latest = Math.max(latest, event.month)
  }
  return latest
}

/** The first tranche that has not landed yet, or null on a finished schedule. */
function nextEventMonth(grants: VestingGrant[]) {
  const future = grants
    .flatMap((grant) => grant.events.map((event) => event.month))
    .filter((month) => month > todayMonth)
    .sort((first, second) => first - second)
  return future[0] ?? null
}

function buildSegments({
  grants,
  hasConditions,
  lock,
  vestedValue,
  unvestedValue,
}: {
  grants: VestingGrant[]
  hasConditions: boolean
  lock: Lock | null
  vestedValue: number
  unvestedValue: number
}): EquitySegment[] {
  const segments: EquitySegment[] = []
  const start = firstMonth(grants)
  const end = lastMonth(grants)

  // Vested: the earliest grant start up to Today, or up to the last tranche if
  // the schedule finished before Today. Clipping at the last tranche is what
  // keeps the Shares strip from claiming three years it never earned.
  if (vestedValue > 0) {
    const vestedEnd = Math.min(todayMonth, end)
    segments.push({
      kind: "vested",
      left: percentOfDomain(start),
      width: percentOfDomain(vestedEnd) - percentOfDomain(start),
    })
  }

  if (unvestedValue > 0) {
    const left = percentOfDomain(todayMonth)
    const width = percentOfDomain(end) - left
    segments.push({ kind: "unvested", left, width })

    // Conditions eat the tail of the unvested span: the last 14% fades out
    // with no end cap, because nobody can say where that value stops.
    if (hasConditions) {
      segments.push({ kind: "conditions", left: left + width * 0.86, width: width * 0.14 })
    }
  }

  // Last, so it paints over the vested span it replaces.
  if (lock) {
    segments.push({
      kind: "onhold",
      left: percentOfDomain(lock.startMonth),
      width: percentOfDomain(lock.endMonth) - percentOfDomain(lock.startMonth),
    })
  }

  return segments
}

function buildInstrument({
  id,
  name,
  subline,
  unitLabel,
  lock,
}: {
  id: EquityInstrumentId
  name: string
  subline: string
  unitLabel: string
  lock: Lock | null
}): EquityInstrument {
  const grants = grantsOf(id)
  const committed = reached(grants, endMonth)
  const vested = reached(grants, todayMonth)
  const lockedGrant = lock
    ? grants.find((grant) => grant.name === lock.grantName)
    : undefined
  const locked = lockedGrant ? reached([lockedGrant], endMonth) : { units: 0, value: 0 }
  const hasConditions = grants.some((grant) => CONDITIONAL_GRANTS.includes(grant.name))
  const next = nextEventMonth(grants)

  // One dot per row: the lock end if there is one still to come, otherwise the
  // next tranche. A row never carries two dates.
  const event =
    lock && lock.endMonth > todayMonth
      ? { label: lock.label, month: lock.endMonth }
      : next === null
        ? null
        : { label: formatDayLabel(next, 1), month: next }

  return {
    committedUnits: committed.units,
    committedValue: committed.value,
    event,
    id,
    lock,
    name,
    onHoldUnits: lock ? locked.units : 0,
    onHoldValue: lock ? locked.value : 0,
    segments: buildSegments({
      grants,
      hasConditions,
      lock,
      unvestedValue: committed.value - vested.value,
      vestedValue: vested.value,
    }),
    subline,
    unitLabel,
    unvestedUnits: committed.units - vested.units,
    unvestedValue: committed.value - vested.value,
    vestedUnits: vested.units,
    vestedValue: vested.value,
  }
}

export const EQUITY_INSTRUMENTS: EquityInstrument[] = [
  buildInstrument({
    id: "options",
    lock: null,
    name: "Options",
    subline: `${grantsOf("options").length} grants`,
    unitLabel: "options",
  }),
  buildInstrument({
    id: "shares",
    lock: PREFERRED_E_LOCK,
    name: "Shares",
    subline: `${grantsOf("shares").length} share classes`,
    unitLabel: "shares",
  }),
]

const sumOver = (read: (row: EquityInstrument) => number) =>
  EQUITY_INSTRUMENTS.reduce((total, row) => total + read(row), 0)

/**
 * THE THREE LENSES PARTITION THE TOTAL (Ion, 22 Aug, following Ledgy's
 * `lenses.ts`). On hold is carved OUT of vested, never stacked beside it: a
 * locked share is vested value the holder cannot touch, so counting it in both
 * places makes the tabs read 107% of a fortune that is only 100% large.
 *
 * `vestedValue` stays GROSS here — it is what has actually vested, lock or no
 * lock — and `netVestedValue` is the Vested lens's share of the partition.
 */
export const EQUITY_TOTALS = {
  committedValue: sumOver((row) => row.committedValue),
  onHoldValue: sumOver((row) => row.onHoldValue),
  unvestedValue: sumOver((row) => row.unvestedValue),
  vestedValue: sumOver((row) => row.vestedValue),
  netVestedValue: sumOver((row) => row.vestedValue - row.onHoldValue),
}

/**
 * Gross vested against the total. The All equity swatch alone reads this: the
 * conic splits emerald from slate, and the hatch is emerald, so the locked
 * slice belongs on the vested side of that pie.
 */
export const EQUITY_VESTED_PERCENT = Math.round(
  (EQUITY_TOTALS.vestedValue / EQUITY_TOTALS.committedValue) * 100
)

/**
 * The three tab percents, allocated by largest remainder so they read 100
 * together. Rounded on their own they say 64 + 7 + 30 = 101, because net vested
 * lands on 63.5 and rounds up; the half point goes to the two shares with the
 * bigger remainders instead, and Vested reads 63.
 */
const LENS_PERCENTS = (() => {
  const shares = [
    EQUITY_TOTALS.netVestedValue,
    EQUITY_TOTALS.onHoldValue,
    EQUITY_TOTALS.unvestedValue,
  ].map((value) => (value / EQUITY_TOTALS.committedValue) * 100)

  const whole = shares.map((share) => Math.floor(share))
  let left = 100 - whole.reduce((total, share) => total + share, 0)
  const byRemainder = shares
    .map((share, index) => ({ index, remainder: share - Math.floor(share) }))
    .sort((first, second) => second.remainder - first.remainder)

  for (const entry of byRemainder) {
    if (left <= 0) break
    whole[entry.index] = (whole[entry.index] ?? 0) + 1
    left -= 1
  }

  return { onhold: whole[1] ?? 0, unvested: whole[2] ?? 0, vested: whole[0] ?? 0 }
})()

/* ────────────────────────────────────────────────────────────────────────────
   THE SCRUB
   ──────────────────────────────────────────────────────────────────────────── */

export type EquityAsOf = {
  vestedValue: number
  vestedUnits: number
  onHoldValue: number
  onHoldUnits: number
  isFuture: boolean
  isLocked: boolean
  isReleased: boolean
}

/** What one instrument was, or will be, worth at a whole month. */
export function valueAt(instrument: EquityInstrument, month: number): EquityAsOf {
  const { units, value } = reached(grantsOf(instrument.id), month)
  const lock = instrument.lock
  const isLocked = lock !== null && month >= lock.startMonth && month < lock.endMonth
  return {
    isFuture: month > todayMonth,
    isLocked,
    isReleased: lock !== null && month >= lock.endMonth,
    onHoldUnits: isLocked ? instrument.onHoldUnits : 0,
    onHoldValue: isLocked ? instrument.onHoldValue : 0,
    vestedUnits: units,
    vestedValue: value,
  }
}

/**
 * What a lens is worth at a month, for the scrubbed headline.
 *
 * All equity reads the VESTED figure rather than the committed one, because the
 * rows underneath all state what had landed by that month and a headline that
 * repeated the unchanging total would contradict every number below it.
 */
export function lensValueAt(lens: EquityLensId, month: number) {
  let total = 0
  for (const instrument of EQUITY_INSTRUMENTS) {
    const asOf = valueAt(instrument, month)
    if (lens === "unvested") total += instrument.committedValue - asOf.vestedValue
    else if (lens === "onhold") total += asOf.onHoldValue
    else if (lens === "vested") total += asOf.vestedValue - asOf.onHoldValue
    else total += asOf.vestedValue
  }
  return total
}

/* ────────────────────────────────────────────────────────────────────────────
   LENSES
   ──────────────────────────────────────────────────────────────────────────── */

export type EquityLensId = "all" | "vested" | "onhold" | "unvested"

export type EquityLens = {
  id: EquityLensId
  label: string
  /** The 8px swatch on the tab. */
  swatch: string
  /** The segment kinds this lens keeps at full opacity. */
  keeps: EquitySegmentKind[]
  value: number
  /** Share of the committed total. The tab carries it, so the subline need not. */
  percent: number
  /** The one date fact this lens states under the headline. */
  subline: string
}

/** Sept 2029, the month the last tranche lands. Two sublines state it. */
const LAST_VEST_LABEL = formatMonthLabel(endMonth)

export const EQUITY_LENSES: EquityLens[] = (
  [
    {
      id: "all",
      keeps: ["vested", "unvested", "onhold", "conditions"],
      label: "All equity",
      percent: 100,
      subline: `Fully vested ${LAST_VEST_LABEL}`,
      swatch: `conic-gradient(${EMERALD} 0 ${EQUITY_VESTED_PERCENT}%, ${SLATE} ${EQUITY_VESTED_PERCENT}% 100%)`,
      value: EQUITY_TOTALS.committedValue,
    },
    {
      id: "vested",
      keeps: ["vested"],
      label: "Vested",
      percent: LENS_PERCENTS.vested,
      subline: "As of today",
      swatch: EMERALD,
      value: EQUITY_TOTALS.netVestedValue,
    },
    {
      id: "onhold",
      keeps: ["onhold"],
      label: "On hold",
      percent: LENS_PERCENTS.onhold,
      subline: `Until ${PREFERRED_E_LOCK.label}`,
      swatch: HATCH,
      value: EQUITY_TOTALS.onHoldValue,
    },
    {
      id: "unvested",
      keeps: ["unvested", "conditions"],
      label: "Unvested",
      percent: LENS_PERCENTS.unvested,
      subline: `Vests by ${LAST_VEST_LABEL}`,
      swatch: SLATE,
      value: EQUITY_TOTALS.unvestedValue,
    },
  ] satisfies EquityLens[]
  // A lens with nothing in it is HIDDEN, never disabled: On hold simply stops
  // existing on a holding with no lock, the way it does in Ledgy.
).filter((lens) => lens.value > 0)

/** The lens a segment belongs to, for the click-a-segment shortcut. */
export function lensOfSegment(kind: EquitySegmentKind): EquityLensId {
  if (kind === "vested") return "vested"
  if (kind === "onhold") return "onhold"
  return "unvested"
}

/** What the value and units columns read under a lens, with no scrub running. */
export function lensReadout(instrument: EquityInstrument, lens: EquityLensId) {
  // Net of the lock: under Vested, the Shares row states the 2,015 shares the
  // holder could sell this afternoon, not the 2,115 they own.
  if (lens === "vested")
    return {
      units: instrument.vestedUnits - instrument.onHoldUnits,
      value: instrument.vestedValue - instrument.onHoldValue,
    }
  if (lens === "onhold") return { units: instrument.onHoldUnits, value: instrument.onHoldValue }
  if (lens === "unvested")
    return { units: instrument.unvestedUnits, value: instrument.unvestedValue }
  return { units: instrument.committedUnits, value: instrument.committedValue }
}

/* ────────────────────────────────────────────────────────────────────────────
   FORMAT
   ──────────────────────────────────────────────────────────────────────────── */

const { currencySymbol } = VESTING_DOMAIN

/**
 * `€5,085,274.` and `25`, split so the card can mute the cents. Two spans and
 * not one, because the decimals are the least important thing on the card and
 * a 24px figure that shouts them reads as a price tag.
 */
export function moneyParts(value: number) {
  const [whole = "0", cents = "00"] = value
    .toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    .split(".")
  return { cents, whole: `${currencySymbol}${whole}.` }
}

/** `€2,614,400`. The scrub reads a moment, not a statement; cents are noise. */
export function moneyRounded(value: number) {
  return `${currencySymbol}${Math.round(value).toLocaleString("en-US")}`
}

/** `1,335 options`. */
export function unitCount(units: number, unitLabel: string) {
  return `${Math.round(units).toLocaleString("en-US")} ${unitLabel}`
}

