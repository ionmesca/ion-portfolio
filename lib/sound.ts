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
let isDesktop = false
let actx: AudioContext | null = null

/**
 * Master enable flag. Default ON — the module is the mechanism, and whichever
 * screen owns the user preference is free to switch it off at boot.
 */
let soundEnabled = true

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
}

export function isSoundEnabled(): boolean {
  return soundEnabled
}

function detect(): void {
  if (ctorChecked) return
  ctorChecked = true

  if (typeof window === "undefined") return

  try {
    AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioContextCtor })
        .webkitAudioContext ??
      null
  } catch {
    AudioCtor = null
  }

  try {
    isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches
  } catch {
    isDesktop = false
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
  return !!AudioCtor && isDesktop
}

/**
 * Play the commit tick. No-ops when sound is disabled, when the device is
 * touch-primary, or when WebAudio is unavailable.
 */
export function playTick(): void {
  if (!soundEnabled) return
  if (!canPlayTick()) return

  const c = ctx()
  if (!c) return

  try {
    if (c.state === "suspended") void c.resume()
    const t = c.currentTime

    const out = c.createGain()
    out.gain.value = 1
    out.connect(c.destination)

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
