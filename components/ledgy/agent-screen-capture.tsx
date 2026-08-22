import Image from "next/image"

import { cn } from "@/lib/utils"

export function LedgyAgentScreenCapture({
  backgroundSrc,
  captureSrc,
  alt,
  mobileCrop = false,
}: {
  backgroundSrc: string
  captureSrc: string
  alt: string
  mobileCrop?: boolean
}) {
  return (
    <div className="absolute inset-0 @container overflow-hidden">
      <Image
        src={backgroundSrc}
        alt=""
        fill
        priority
        unoptimized
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover object-top"
      />

      {/*
        Desktop centres the screen inside the glass. Mobile is a 4:5 crop, so
        the screen anchors bottom-left instead: the top and right keep the
        glass visible, the sidebar and headline stay in frame, and the bottom
        runs off the card just above the collapse-sidebar icon. Its corner is
        rounded-sm so it sits concentric inside the card's rounded-xl.
      */}
      <div
        className={cn(
          "absolute inset-0 flex",
          mobileCrop ? "items-end justify-start" : "items-center justify-center"
        )}
      >
        <div
          className={cn(
            "relative aspect-[16/10] max-w-none overflow-hidden shadow-raised",
            mobileCrop
              ? "ml-[4%] h-[68%] w-auto shrink-0 translate-y-[16%] rounded-sm"
              : "w-[84%] rounded-xl @3xl:w-[72%]"
          )}
        >
          <Image
            src={captureSrc}
            alt={alt}
            fill
            unoptimized
            sizes="(max-width: 767px) 84vw, 44vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}
