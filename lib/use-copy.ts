"use client"

import * as React from "react"

import { playTick } from "@/lib/sound"

/**
 * The copy → check moment, as one hook.
 *
 * The recipe was ratified in `docs/design/motion-lab.html` and first shipped in
 * the ⌘K palette's "Copy email" row: write to the clipboard, play Sound A,
 * swap the icon to a check and the label to "Copied", revert after 1.5s. The
 * collection pages' install chip is the second consumer, so the behaviour was
 * lifted out of `components/landing/command-palette.tsx` verbatim rather than
 * copied — one clock, one fallback, one sound rule, two call sites.
 *
 * What stayed behind in the palette: the MARKUP. The icon swap and the label
 * swap are two `.icon-swap` / `.label-swap` elements in the caller's own
 * layout (globals.css section 7), because the palette row and the install chip
 * are different boxes with different text. This hook owns the state and the
 * side effects only.
 *
 * Ruling carried over from the palette: a second copy inside the window
 * restarts the 1.5s, and the clock starts at the copy itself — a surface that
 * mounts mid-window shows "Copied" mid-flight and reverts on the original
 * schedule. That is true, and it needs no extra state to suppress.
 */

/** How long "Copied" stays up. motion-lab's number, unchanged. */
export const COPY_REVERT_MS = 1500

export type CopyState = {
  /** True for the 1.5s after a successful copy. */
  copied: boolean
  /** Writes `text` and, only if that worked, fires the feedback. */
  copy: (text: string) => Promise<void>
}

export function useCopyToClipboard(): CopyState {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = React.useCallback(async (text: string) => {
    let ok = false
    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      // The Clipboard API needs a secure context and a permission; the
      // textarea trick needs neither and is still the only path in some
      // embeddings.
      ok = legacyCopy(text)
    }
    // Nothing on the clipboard, nothing to celebrate: no tick, no check. A
    // check over a failed copy is the one lie this component could tell.
    if (!ok) return

    playTick()
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), COPY_REVERT_MS)
  }, [])

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  return { copied, copy }
}

/** execCommand is deprecated, not gone — and it is the only copy path that
 *  works without a secure context or a clipboard permission. */
function legacyCopy(text: string): boolean {
  try {
    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.opacity = "0"
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}
