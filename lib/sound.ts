/**
 * Sound — one tick, synthesised, no assets.
 *
 * This is tick "A" (soft wood) from `docs/design/motion-lab.html`, ported
 * verbatim: a 2kHz triangle body sliding to 1.5kHz over 30ms, plus a quiet
 * 3kHz sine tap on the attack. Peaks at about 6% gain.
 *
 * The rules it enforces (motion-system-spec.md principle 7):
 *   - Commit actions only. Never on hover, never on open, never on page load.
 *     That rule lives at the CALL SITES; this module just plays the tick.
 *   - Desktop only. A touch-primary device gets silence.
 *   - Optional. No AudioContext means silence, never a thrown error.
 *
 * Deliberately dumb: no React context, no hooks, module-level state.
 */

type AudioContextCtor = typeof AudioContext

let ctorChecked = false
let AudioCtor: AudioContextCtor | null = null
let actx: AudioContext | null = null

/**
 * Master enable flag.
 *
 * Default ON. This is a ratified decision, not an oversight: the tick only ever
 * fires on a deliberate commit action on a desktop pointer device, which makes
 * it feedback rather than noise. The command palette's preferences surface will
 * own the user-facing toggle and call `setSoundEnabled` at boot — this module
 * stays the mechanism and holds no opinion about the UI.
 */
let soundEnabled = true

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
}

export function isSoundEnabled(): boolean {
  return soundEnabled
}

/**
 * Cache the AudioContext constructor lookup. The `ctorChecked` latch is set
 * AFTER the `window` guard on purpose: during SSR there is no window, and
 * latching there would cache "no audio" forever for the hydrated client too.
 */
function detect(): void {
  if (typeof window === "undefined") return
  if (ctorChecked) return
  ctorChecked = true

  try {
    AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioContextCtor })
        .webkitAudioContext ??
      null
  } catch {
    AudioCtor = null
  }
}

/**
 * Re-asked on every call rather than cached: a media-query match is cheap, and
 * the answer genuinely changes when an iPad gains a trackpad or a laptop folds
 * into tablet mode.
 */
function isDesktop(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches
  } catch {
    return false
  }
}

function ctx(): AudioContext | null {
  detect()
  if (actx) return actx
  if (!AudioCtor) return null
  try {
    actx = new AudioCtor()
  } catch {
    actx = null
  }
  return actx
}

/** True when a tick would actually be audible right now. */
export function canPlayTick(): boolean {
  detect()
  return !!AudioCtor && isDesktop()
}

/**
 * Play the commit tick. No-ops when sound is disabled, when the device is
 * touch-primary, or when WebAudio is unavailable.
 *
 * Fire-and-forget: resuming a parked context is asynchronous, so the tick may
 * land a frame after the call. Callers never await it.
 */
export function playTick(): void {
  if (!soundEnabled) return
  if (!canPlayTick()) return

  const c = ctx()
  if (!c) return

  void emitTick(c)
}

async function emitTick(c: AudioContext): Promise<void> {
  try {
    // A parked context freezes `currentTime`, so every note scheduled against
    // it would queue in the past and never sound. Chrome parks as "suspended"
    // until the first gesture; Safari parks as "interrupted" after a phone
    // call or a background tab. `!== "running"` covers both, plus whatever the
    // next browser invents.
    if (c.state !== "running") await c.resume()

    // 5ms of headroom. `currentTime` is the START of the last rendered audio
    // quantum, so scheduling exactly at it can land in the past and clip the
    // attack ramp off the front of the tick.
    const t = c.currentTime + 0.005

    // Each voice has its own gain envelope, and those connect straight to the
    // destination — a shared unity-gain node in between would only add a node.
    const out = c.destination

    // Body — 2kHz triangle falling to 1.5kHz, 30ms decay.
    const o1 = c.createOscillator()
    const g1 = c.createGain()
    o1.type = "triangle"
    o1.frequency.setValueAtTime(2000, t)
    o1.frequency.exponentialRampToValueAtTime(1500, t + 0.03)
    g1.gain.setValueAtTime(0.0001, t)
    g1.gain.exponentialRampToValueAtTime(0.06, t + 0.002)
    g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
    o1.connect(g1)
    g1.connect(out)
    o1.start(t)
    o1.stop(t + 0.06)

    // Tap — quiet 3kHz sine on the attack, 12ms.
    const o2 = c.createOscillator()
    const g2 = c.createGain()
    o2.type = "sine"
    o2.frequency.setValueAtTime(3000, t)
    g2.gain.setValueAtTime(0.0001, t)
    g2.gain.exponentialRampToValueAtTime(0.02, t + 0.001)
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.012)
    o2.connect(g2)
    g2.connect(out)
    o2.start(t)
    o2.stop(t + 0.04)
  } catch {
    /* silence is an acceptable outcome */
  }
}
