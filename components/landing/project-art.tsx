"use client"

import { LedgyAgentScreenCapture } from "@/components/ledgy/agent-screen-capture"
import { ThinkingStage } from "@/components/ledgy/thinking-stage"
import { VestingChartStage } from "@/components/ledgy/vesting-chart-stage"
import { SettleImage } from "@/components/ui/settle-in"
import type { ProjectMedia } from "@/lib/projects"

/**
 * One panel's picture: a still, the Agent home composition, the thinking mark,
 * or the Equity Dashboard vesting card.
 *
 * Stills go through SettleImage so they arrive on the spring rather than
 * popping over the muted stand-in.
 */

function isThinking(
  art: ProjectMedia
): art is Extract<ProjectMedia, { type: "thinking" }> {
  return art.type === "thinking"
}

function isLedgyAgentScreen(
  art: ProjectMedia
): art is Extract<ProjectMedia, { type: "ledgy-agent-screen" }> {
  return art.type === "ledgy-agent-screen"
}

function isVestingChart(
  art: ProjectMedia
): art is Extract<ProjectMedia, { type: "vesting-chart" }> {
  return art.type === "vesting-chart"
}

export function ProjectArt({
  art,
  priority,
  mobile,
  sizes,
}: {
  art: ProjectMedia
  priority?: boolean
  mobile?: boolean
  sizes: string
}) {
  if (isLedgyAgentScreen(art)) {
    return (
      <LedgyAgentScreenCapture
        backgroundSrc={art.backgroundSrc}
        captureSrc={art.captureSrc}
        alt={art.alt}
        mobileCrop={mobile}
      />
    )
  }

  if (isThinking(art)) {
    return <ThinkingStage theme={art.theme ?? "orb"} label={art.label} />
  }

  if (isVestingChart(art)) {
    return <VestingChartStage />
  }

  return (
    <SettleImage
      src={art.src}
      alt={art.alt}
      fill
      priority={priority}
      unoptimized={art.unoptimized ?? art.src.endsWith(".svg")}
      className="object-cover object-top"
      style={
        mobile && art.mobilePosition
          ? { objectPosition: art.mobilePosition }
          : undefined
      }
      sizes={sizes}
    />
  )
}
