import Image from "next/image"

import { Kbd } from "@/components/ui/kbd"

/**
 * IdentityChip — the avatar + name + ⌘K keycap at the top of the rail.
 *
 * FROZEN GEOMETRY. Figma component 11:1602, instanced in the landing frame at
 * 11:1667. The ⌘K palette morph (a later phase) grows the command palette out
 * of this chip, so its internal offsets have to stay exactly where they are or
 * the morph's start frame will not line up with the resting header:
 *
 *   chip      170 x 42, padding 4 / 12 / 4 / 4, gap 12, radius lg (15), Subtle
 *   avatar    32 x 32 at (4, 5),  radius 10 raw — concentric: 15 outer − 5 inset
 *   name      71 x 20 at (48, 11), Subhead
 *   ⌘K keycap 27 x 23 at (131, 9.5), radius sm (9)
 *
 * The x offsets fall out of the flex box (4 + 32 + 12 = 48; 48 + 71 + 12 = 131)
 * and the y offsets out of `items-center`, so nothing here is positioned by
 * hand — but any change to the padding, the gap, or the name's type step moves
 * the morph's anchors.
 *
 * The chip is STATIC in this phase: the keycap is a label, not a control.
 * ⌘K does nothing yet.
 */
export function IdentityChip() {
  return (
    <div
      className="flex h-[42px] w-fit items-center gap-3 rounded-lg bg-card py-1 pr-3 pl-1 shadow-subtle"
      data-slot="identity-chip"
    >
      <Image
        src="/ion-avatar.png"
        alt="Ion Mesca"
        width={32}
        height={32}
        priority
        // 10px is a raw value, not a token step: the concentric inset of the
        // 15px outer radius minus the 5px the avatar is inset by. The Figma
        // layer name records the same derivation.
        className="size-8 rounded-[10px] object-cover"
      />
      <span className="text-subhead text-foreground">Ion Mesca</span>
      {/* Figma's Kbd instance sets its label at the 13px `Small` step, one
          step above the 12px the Kbd primitive defaults to — see the report.
          Overridden at the call site rather than by forking Kbd.
          `text-[length:...]` rather than `text-small`: `cn` runs tailwind-merge,
          which reads the bare `text-small` as a text-COLOUR utility, drops the
          primitive's `text-kbd-foreground` and leaves `text-xs` standing. The
          explicit length form is unambiguous. */}
      <Kbd className="text-[length:var(--text-small)] leading-[1.45]">⌘K</Kbd>
    </div>
  )
}
