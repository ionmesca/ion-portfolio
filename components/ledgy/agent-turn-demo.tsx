"use client"

import * as React from "react"

import { prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

import "./agent-turn-demo.css"

import { AnswerFacts } from "./answer-facts"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FileLinesIcon,
  SearchIcon,
} from "./ledgy-agent-icons"
import { LedgyThinkingMark, type ThinkingTheme } from "./ledgy-thinking-mark"
import { ShimmerText } from "./shimmer-text"

export type AgentTurnScene = "thinking" | "tools" | "answer"

const PROMPT =
  "How much of the option pool is still available? I need to know if we can make another grant."

const ANSWER =
  "Yes. 180,000 options are still available — 18% of the 1,000,000 pool. Curious has 154 stakeholders on the cap table. Another grant still fits, but the remaining pool is running low."
const ANSWER_WORDS = ANSWER.split(" ")
const ANSWER_START_DELAY_MS = 120
const ANSWER_WORD_DELAY_MS = 55
const ANSWER_WORD_SETTLE_MS = 420

export const ANSWER_SETTLE_MS =
  ANSWER_START_DELAY_MS +
  (ANSWER_WORDS.length - 1) * ANSWER_WORD_DELAY_MS +
  ANSWER_WORD_SETTLE_MS

const TOOLS = [
  { label: "Search Stakeholders", icon: SearchIcon },
  { label: "Get Equity Snapshot", icon: FileLinesIcon },
  { label: "Search Pools and Plans", icon: SearchIcon },
] as const

function StreamedAnswer({ onSettled }: { onSettled: () => void }) {
  const [visibleCount, setVisibleCount] = React.useState(0)

  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setVisibleCount(ANSWER_WORDS.length)
      const settledTimer = window.setTimeout(onSettled, 0)
      return () => window.clearTimeout(settledTimer)
    }

    let revealTimer = 0
    const reveal = () => {
      setVisibleCount((current) => {
        const next = Math.min(current + 1, ANSWER_WORDS.length)
        if (next < ANSWER_WORDS.length) {
          revealTimer = window.setTimeout(reveal, ANSWER_WORD_DELAY_MS)
        }
        return next
      })
    }

    revealTimer = window.setTimeout(reveal, ANSWER_START_DELAY_MS)
    const settledTimer = window.setTimeout(onSettled, ANSWER_SETTLE_MS)

    return () => {
      window.clearTimeout(revealTimer)
      window.clearTimeout(settledTimer)
    }
  }, [onSettled])

  return (
    <p
      className="text-xs leading-5 text-secondary-foreground @md:text-sm @md:leading-6"
      aria-label={ANSWER}
    >
      {ANSWER_WORDS.slice(0, visibleCount).map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <span className="ledgy-turn-word inline-block">{word}</span>{" "}
        </React.Fragment>
      ))}
    </p>
  )
}

function ToolRow({
  active,
  icon: Icon,
  label,
}: {
  active: boolean
  icon: typeof SearchIcon
  label: string
}) {
  return (
    <div className="ledgy-turn-tool flex min-h-8 items-center gap-2 py-1 text-xs @md:text-sm">
      <span className="grid size-4 shrink-0 place-items-center text-muted-foreground">
        <Icon className="size-3" />
      </span>
      <span className="text-secondary-foreground">
        {active ? <ShimmerText>{label}</ShimmerText> : label}
      </span>
    </div>
  )
}

function ThinkingHeader({
  label,
  theme,
}: {
  label: string
  theme: ThinkingTheme
}) {
  return (
    <LedgyThinkingMark
      label={label}
      labelSizePx={14}
      sizePx={20}
      theme={theme}
    />
  )
}

function TurnWorkDisclosure({
  answerSettled,
  scene,
  theme,
  thinkingLabel,
}: {
  answerSettled: boolean
  scene: AgentTurnScene
  theme: ThinkingTheme
  thinkingLabel: string
}) {
  const isWorking = scene !== "answer" || !answerSettled
  const hasBody = scene !== "thinking"
  const [expanded, setExpanded] = React.useState(false)
  const open = hasBody && (isWorking || expanded)

  const header = (
    <span className="relative inline-flex h-10 overflow-hidden">
      <span
        aria-hidden={!isWorking}
        className={cn(
          "flex h-10 w-max max-w-full items-center gap-2.5 whitespace-nowrap text-sm font-normal",
          "transition-transform duration-[480ms] ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none",
          isWorking ? "relative" : "pointer-events-none absolute top-0 left-0 -translate-y-full"
        )}
      >
        <ThinkingHeader label={thinkingLabel} theme={theme} />
      </span>
      <span
        aria-hidden={isWorking}
        className={cn(
          "flex h-10 w-max max-w-full items-center gap-2.5 whitespace-nowrap text-sm font-normal text-muted-foreground",
          "transition-transform duration-[480ms] ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none",
          isWorking
            ? "pointer-events-none absolute top-0 left-0 translate-y-full"
            : "relative"
        )}
      >
        <span>Worked for 6 seconds</span>
        {hasBody ? (
          open ? (
            <ChevronUpIcon className="size-3 text-muted-foreground/70" />
          ) : (
            <ChevronDownIcon className="size-3 text-muted-foreground/70" />
          )
        ) : null}
      </span>
    </span>
  )

  return (
    <div className="ledgy-turn-item ledgy-turn-disclosure w-full">
      {hasBody ? (
        <button
          type="button"
          aria-expanded={open}
          aria-label={isWorking ? thinkingLabel : "Worked for 6 seconds"}
          onClick={() => setExpanded((value) => !value)}
          className="group flex w-fit max-w-full cursor-pointer items-center rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {header}
        </button>
      ) : (
        header
      )}

      {hasBody ? (
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="ml-[9px] border-l border-border pl-2.5">
              {TOOLS.map((tool) => (
                <ToolRow
                  key={tool.label}
                  active={scene === "tools"}
                  icon={tool.icon}
                  label={tool.label}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function LedgyAgentTurnDemo({
  answerRunId,
  answerSettled,
  onAnswerSettled,
  scene,
  theme = "orb",
  thinkingLabel = "Thinking",
}: {
  answerRunId: number
  answerSettled: boolean
  onAnswerSettled: () => void
  scene: AgentTurnScene
  theme?: ThinkingTheme
  thinkingLabel?: string
}) {
  return (
    <div className="mx-auto flex h-[17rem] w-[calc(100%-1.5rem)] max-w-[34rem] flex-col justify-center text-left font-sans @md:w-[88%]">
      <div className="ledgy-turn-item w-full rounded-xl bg-border p-2.5 text-xs leading-5 text-secondary-foreground @md:p-3 @md:text-sm">
        {PROMPT}
      </div>

      <div className="mt-2 min-h-[9rem] px-2.5 @md:mt-3 @md:min-h-[10rem] @md:px-3">
        <TurnWorkDisclosure
          answerSettled={answerSettled}
          scene={scene}
          theme={theme}
          thinkingLabel={thinkingLabel}
        />
        {scene === "answer" ? (
          <div className="ledgy-turn-item mt-1.5 @md:mt-2">
            <StreamedAnswer key={answerRunId} onSettled={onAnswerSettled} />
            {answerSettled ? <AnswerFacts /> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
