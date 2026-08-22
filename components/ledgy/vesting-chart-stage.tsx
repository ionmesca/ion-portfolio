"use client"

import { VestingChart } from "./vesting-chart"

/**
 * The Equity Dashboard panel's stage: the muted well the vesting card sits on,
 * centred, with a 16px inset so the card never touches the panel's rounded
 * corners on the mobile 4:5 card.
 *
 * Same shape as `thinking-stage.tsx`. The `@container` is what the card reads
 * for its desktop and mobile split, so the panel's own width decides the
 * layout rather than the viewport.
 */
export function VestingChartStage() {
  return (
    <div className="@container absolute inset-0 grid place-items-center bg-muted p-4">
      <VestingChart />
    </div>
  )
}
