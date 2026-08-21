"use client"

import { LedgyAgentScreenCapture } from "@/components/ledgy/agent-screen-capture"
import { ThinkingStage } from "@/components/ledgy/thinking-stage"
import { SettleImage } from "@/components/ui/settle-in"
import {
  createSpring,
  prefersReducedMotion,
  SETTLE_SCALE,
  SPRING_SETTLE,
  type SpringDriver,
} from "@/lib/motion"
import type { ProjectMedia } from "@/lib/projects"

/**
 * One panel's picture — still, a silent loop, or the thinking mark.
 *
 * Stills go through SettleImage so they arrive on the spring rather than
 * popping over the muted stand-in. Video is a different animal: the muted
 * well is the stand-in until the first decoded frame, then the same spring
 * as a still. Autoplay is muted + playsInline (Next's videos guide);
 * reduced motion keeps the well and never starts the loop.
 *
 * LAZY. The third panel of the column and everything below it do not fetch
 * until they approach the viewport. Leaving pauses a loop so a stack of
 * them is not decoding offscreen.
 */

function isVideo(
  art: ProjectMedia
): art is Extract<ProjectMedia, { type: "video" }> {
  return art.type === "video"
}

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

function bindVideo(lazy: boolean) {
  return (el: HTMLVideoElement | null): (() => void) | undefined => {
    if (!el) return
    el.muted = true
    el.defaultMuted = true

    const reduced = prefersReducedMotion()
    if (reduced) return

    let driver: SpringDriver | null = null
    let io: IntersectionObserver | null = null
    let started = false

    const release = () => {
      el.style.opacity = ""
      el.style.transform = ""
      el.style.willChange = ""
    }

    const tryPlay = () => {
      void el.play().catch(() => {
        /* Autoplay can still be refused; the well stays up. */
      })
    }

    const arrive = () => {
      el.removeEventListener("loadeddata", arrive)
      if (started) {
        tryPlay()
        return
      }
      started = true
      el.style.willChange = "opacity, transform"
      driver = createSpring(SPRING_SETTLE, (p) => {
        if (p >= 1) {
          release()
          return
        }
        el.style.opacity = p.toFixed(4)
        el.style.transform = `scale(${(SETTLE_SCALE + (1 - SETTLE_SCALE) * p).toFixed(5)})`
      })
      driver.set(1)
      tryPlay()
    }

    if (!lazy) {
      tryPlay()
      return () => driver?.stop()
    }

    el.style.opacity = "0"
    el.style.transform = `scale(${SETTLE_SCALE})`

    io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          if (el.readyState >= 2) arrive()
          else {
            el.preload = "auto"
            el.addEventListener("loadeddata", arrive)
            el.load()
          }
        } else {
          el.pause()
        }
      },
      { rootMargin: "160px 0px", threshold: 0.01 }
    )
    io.observe(el)

    return () => {
      io?.disconnect()
      el.removeEventListener("loadeddata", arrive)
      driver?.stop()
      release()
    }
  }
}

export function ProjectArt({
  art,
  priority,
  lazy,
  mobile,
  sizes,
}: {
  art: ProjectMedia
  priority?: boolean
  lazy?: boolean
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

  if (isVideo(art)) {
    const hold = Boolean(lazy) && !priority
    return (
      <video
        ref={bindVideo(hold)}
        className="absolute inset-0 size-full object-cover object-top"
        autoPlay={!hold}
        muted
        loop
        playsInline
        preload={hold ? "none" : "auto"}
        poster={art.poster}
        aria-label={art.alt}
      >
        {art.webm ? <source src={art.webm} type="video/webm" /> : null}
        <source src={art.src} type="video/mp4" />
      </video>
    )
  }

  return (
    <SettleImage
      src={art.src}
      alt={art.alt}
      fill
      priority={priority}
      loading={lazy && !priority ? "lazy" : undefined}
      unoptimized={art.unoptimized ?? art.src.endsWith(".svg")}
      className="object-cover object-top"
      sizes={sizes}
    />
  )
}
