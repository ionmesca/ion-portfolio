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

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "relative aspect-[16/10] max-w-none overflow-hidden rounded-xl shadow-raised",
            mobileCrop ? "h-[76%] w-auto" : "w-[84%] @3xl:w-[72%]"
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
