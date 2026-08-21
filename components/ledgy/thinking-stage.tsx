"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control"
import { Play, RotateCcw } from "@/lib/icons"

import {
  ANSWER_SETTLE_MS,
  LedgyAgentTurnDemo,
  type AgentTurnScene,
} from "./agent-turn-demo"
import type { ThinkingTheme } from "./ledgy-thinking-mark"

const THINKING_MS = 3000
const TOOLS_MS = 3000
const PLAYBACK_MS = THINKING_MS + TOOLS_MS + ANSWER_SETTLE_MS

const SCENE_OPTIONS: { label: string; value: AgentTurnScene }[] = [
  { label: "Thinking", value: "thinking" },
  { label: "Tools", value: "tools" },
  { label: "Answer", value: "answer" },
]

function SceneSegment({
  onPick,
  value,
}: {
  onPick: (scene: AgentTurnScene) => void
  value: AgentTurnScene
}) {
  return (
    <SegmentedControl
      aria-label="Agent turn scene"
      value={value}
      onValueChange={(nextValue) => onPick(nextValue as AgentTurnScene)}
    >
      {SCENE_OPTIONS.map((option) => (
        <SegmentedControlItem key={option.value} value={option.value}>
            {option.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}

type PlaybackState = "manual" | "playing" | "complete"

function PlaybackControl({
  onPlay,
  runId,
  state,
}: {
  onPlay: () => void
  runId: number
  state: PlaybackState
}) {
  const label =
    state === "playing"
      ? "Restart animation"
      : state === "complete"
        ? "Replay animation"
        : "Play animation"
  const Icon = state === "manual" ? Play : RotateCcw

  return (
    <div className="relative size-10 @md:size-8">
      {state === "playing" ? (
        <svg
          key={runId}
          aria-hidden="true"
          viewBox="0 0 32 32"
          className="pointer-events-none absolute inset-0 z-20 size-full -rotate-90 text-muted-foreground"
          style={{ "--ledgy-playback-ms": `${PLAYBACK_MS}ms` } as React.CSSProperties}
        >
          <circle
            cx="16"
            cy="16"
            r="15"
            fill="none"
            stroke="var(--border)"
            strokeWidth="1.5"
          />
          <circle
            className="ledgy-playback-progress"
            cx="16"
            cy="16"
            r="15"
            fill="none"
            pathLength="1"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon-touch"
        aria-label={label}
        title={label}
        onClick={onPlay}
        className="relative z-10 @md:size-8"
      >
        <Icon />
      </Button>
    </div>
  )
}

export function ThinkingStage({
  theme = "orb",
  label = "Thinking",
}: {
  theme?: ThinkingTheme
  label?: string
}) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const timersRef = React.useRef<number[]>([])
  const hasAutoplayedRef = React.useRef(false)
  const [scene, setScene] = React.useState<AgentTurnScene>("thinking")
  const [answerRunId, setAnswerRunId] = React.useState(0)
  const [answerSettled, setAnswerSettled] = React.useState(false)
  const [turnRunId, setTurnRunId] = React.useState(0)
  const [playbackState, setPlaybackState] =
    React.useState<PlaybackState>("manual")

  const clearSequence = React.useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer)
    timersRef.current = []
  }, [])

  const playSequence = React.useCallback(() => {
    clearSequence()
    setTurnRunId((run) => run + 1)
    setScene("thinking")
    setAnswerSettled(false)
    setPlaybackState("playing")
    timersRef.current = [
      window.setTimeout(() => setScene("tools"), THINKING_MS),
      window.setTimeout(() => {
        setAnswerRunId((run) => run + 1)
        setScene("answer")
      }, THINKING_MS + TOOLS_MS),
    ]
  }, [clearSequence])

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || entry.intersectionRatio < 0.98 || hasAutoplayedRef.current) return
        hasAutoplayedRef.current = true
        playSequence()
        observer.disconnect()
      },
      { threshold: 0.98 }
    )
    observer.observe(stage)

    return () => {
      observer.disconnect()
      clearSequence()
    }
  }, [clearSequence, playSequence])

  const pickScene = (next: AgentTurnScene) => {
    clearSequence()
    setPlaybackState("manual")
    setAnswerSettled(false)
    if (next === "answer") setAnswerRunId((run) => run + 1)
    setScene(next)
  }

  const settleAnswer = React.useCallback(() => {
    setAnswerSettled(true)
    setPlaybackState("complete")
  }, [])

  return (
    <div ref={stageRef} className="@container absolute inset-0 bg-muted">
      <div className="absolute inset-x-0 top-0 bottom-16 grid place-items-center @md:bottom-14">
        <LedgyAgentTurnDemo
          key={turnRunId}
          answerRunId={answerRunId}
          answerSettled={answerSettled}
          onAnswerSettled={settleAnswer}
          scene={scene}
          theme={theme}
          thinkingLabel={label}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 p-3">
        <SceneSegment value={scene} onPick={pickScene} />
        <PlaybackControl
          runId={turnRunId}
          state={playbackState}
          onPlay={playSequence}
        />
      </div>
    </div>
  )
}
