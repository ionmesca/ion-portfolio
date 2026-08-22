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
        glass visible while the sidebar and composer stay in frame.
      */}
      <div
        className={cn(
          "absolute inset-0 flex",
          mobileCrop ? "items-end justify-start" : "items-center justify-center"
        )}
      >
        <div
          className={cn(
            "relative aspect-[16/10] max-w-none overflow-hidden rounded-xl shadow-raised",
            mobileCrop ? "mb-[6%] ml-[5%] h-[66%] w-auto shrink-0" : "w-[84%] @3xl:w-[72%]"
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
