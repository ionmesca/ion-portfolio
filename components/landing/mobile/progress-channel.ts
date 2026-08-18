"use client"

import * as React from "react"

/* ============================================================================
   The progress channel — a mailbox between the scroll controller and the
   indicator's spring.

   WHY IT EXISTS. The indicator is code-split (mobile-indicator-lazy.tsx): the
   Motion runtime is not worth putting in the landing route's first-load JS for
   a bar that is invisible until you scroll. So the controller starts publishing
   progress BEFORE the thing that consumes it exists, and needs somewhere to put
   the number in the meantime.

   A ref and not state, because this is written on every animation frame of
   every scroll and none of those writes should re-render anything.

   THE FIRST DELIVERY IS THE SEED. `subscribe` hands the listener the last value
   published before it arrived, so an indicator that mounts on an already
   scrolled page starts its meter at the right fill instead of springing up to
   it from zero.
   ========================================================================== */

export type ProgressListener = (progress: number) => void

/** Installs a listener, seeds it with the last value, returns the unsubscribe. */
export type SubscribeToProgress = (listener: ProgressListener) => () => void

export function useProgressChannel() {
  const channel = React.useRef<{ value: number; listener: ProgressListener | null }>({
    value: 0,
    listener: null,
  })

  const publish = React.useCallback((progress: number) => {
    channel.current.value = progress
    channel.current.listener?.(progress)
  }, [])

  const subscribe = React.useCallback<SubscribeToProgress>((listener) => {
    channel.current.listener = listener
    listener(channel.current.value)
    return () => {
      if (channel.current.listener === listener) channel.current.listener = null
    }
  }, [])

  return [subscribe, publish] as const
}
