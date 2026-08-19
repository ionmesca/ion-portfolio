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
 * Where the preference is remembered.
 *
 * Deliberately NOT `ion-theme`'s neighbour in spirit: the theme needs a
 * blocking script in <head> because a wrong first PAINT is visible, and sound
 * has no first paint to get wrong. So there is no init script here, no
 * `<html>` class, and no SSR story at all — just a string and a lazy read.
 *
 * Stored as `on` / `off` rather than `true` / `false` because those are the two
 * words the control shows, and a value you can read in devtools and understand
 * without opening this file is worth two characters.
 */
export const SOUND_STORAGE_KEY = "ion-sound"

/**
 * Master enable flag.
 *
 * Default OFF. The palette Sound row is hidden (Ion, 2026-08-19); ticks stay
 * off until that row comes back. A leftover `on` in storage is ignored.
 */
let soundEnabled = false

/**
 * Whether the flag above has been reconciled with storage yet.
 *
 * THE PALETTE IS NOT THE ONLY THING THAT TICKS. `useCopyToClipboard`
 * (lib/use-copy.ts) is the tick's only call site, and the collection pages'
 * install chip is one of its consumers — on `/stack` there is no command
 * palette mounted, so nothing would ever have called `setSoundEnabled` and a
 * reader who turned sound OFF would still hear the chip. The lazy read below
 * closes that: whichever comes first — the palette's boot wiring or the first
 * tick anywhere on the site — the flag ends up at the stored preference, and
 * both derive it from `readSoundPreference()` so they cannot disagree.
 */
let prefRead = false

/** The stored preference, or OFF when nothing is stored or storage throws. */
export function readSoundPreference(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) === "on"
  } catch {
    return false
  }
}

/** Set the flag for this page. Does NOT remember it — see `applySound`. */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
  prefRead = true
}

/**
 * Set it AND remember it — the mirror of `applyTheme` in lib/theme.ts, down to
 * the swallowed storage error: a session-only preference is better than a
 * thrown one (Safari private mode throws on `localStorage`).
 */
export function applySound(enabled: boolean): void {
  setSoundEnabled(enabled)
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "on" : "off")
  } catch {
    /* a session-only preference is better than a thrown error */
  }
}

export function isSoundEnabled(): boolean {
  return false
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
  if (!isSoundEnabled()) return
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
