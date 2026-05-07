"use client";

import { useState } from "react";
import Image from "next/image";
import { ProjectStageCard } from "./project-stage-card";
import { useManagedVideoPlayback } from "./use-managed-video";
import { cn } from "@/lib/utils";
import type { ProjectImage, ProjectMeta } from "@/lib/types";

function isStageImage(
  image: ProjectImage
): image is Extract<ProjectImage, { type: "stage" }> {
  return image.type === "stage";
}

function isComparisonImage(
  image: ProjectImage
): image is Extract<ProjectImage, { type: "comparison" }> {
  return image.type === "comparison";
}

function isVideoImage(
  image: ProjectImage
): image is Extract<ProjectImage, { type: "video" }> {
  return image.type === "video";
}

function ProjectVideo({
  image,
  className,
}: {
  image: Extract<ProjectImage, { type: "video" }>;
  className?: string;
}) {
  const videoRef = useManagedVideoPlayback();

  return (
    <figure
      className={cn(
        "relative w-full overflow-hidden rounded-[22px] bg-bg-surface shadow-card ring-1 ring-black/[0.06]",
        className
      )}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        poster={image.poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={image.alt}
      >
        {image.webm && <source src={image.webm} type="video/webm" />}
        <source src={image.src} type="video/mp4" />
      </video>
      {image.caption && (
        <figcaption className="absolute inset-x-3 bottom-3 rounded-lg bg-bg-base/90 px-3 py-2 text-[11px] leading-4 text-text-secondary shadow-card ring-1 ring-black/[0.05] backdrop-blur-md">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

function ProjectScreenshot({
  image,
  sizes,
  className,
}: {
  image: Extract<ProjectImage, { src: string }>;
  sizes: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "group/comparison relative w-full overflow-hidden rounded-[22px] bg-bg-surface shadow-card ring-1 ring-black/[0.06]",
        className
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        sizes={sizes}
      />
      {image.caption && (
        <figcaption className="absolute inset-x-3 bottom-3 rounded-lg bg-bg-base/90 px-3 py-2 text-[11px] leading-4 text-text-secondary shadow-card ring-1 ring-black/[0.05] backdrop-blur-md">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

function ComparisonImage({
  image,
  sizes,
  className,
}: {
  image: Extract<ProjectImage, { type: "comparison" }>;
  sizes: string;
  className?: string;
}) {
  const [active, setActive] = useState<"before" | "after">(
    image.defaultView ?? "after"
  );
  const activeImage = active === "before" ? image.before : image.after;

  return (
    <figure
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-bg-surface shadow-card ring-1 ring-black/[0.05]",
        className
      )}
    >
      <picture key={active} className="absolute inset-0 block">
        {activeImage.avif && (
          <source srcSet={activeImage.avif} type="image/avif" />
        )}
        {activeImage.webp && (
          <source srcSet={activeImage.webp} type="image/webp" />
        )}
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          className="size-full object-contain"
          sizes={sizes}
          decoding="async"
          fetchPriority="high"
        />
      </picture>

      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 rounded-full bg-bg-base/88 p-1 shadow-card ring-1 ring-black/[0.06] backdrop-blur-xl">
        {([image.before, image.after] as const).map((option) => {
          const value = option === image.before ? "before" : "after";
          const isActive = active === value;

          return (
            <button
              key={value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[12px] font-semibold leading-none transition-all duration-150 ease-out",
                isActive
                  ? "bg-text-primary text-bg-base shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </figure>
  );
}

export function ProjectMedia({
  project,
  image,
  sizes,
  className,
  plainAspectClass = "aspect-[3/2]",
  comparisonAspectClass = "aspect-video",
}: {
  project: ProjectMeta;
  image: ProjectImage;
  sizes: string;
  className?: string;
  plainAspectClass?: string;
  comparisonAspectClass?: string;
}) {
  if (isStageImage(image)) {
    return (
      <ProjectStageCard
        project={project}
        motion={image.motion ?? "frozen"}
        className={cn(image.aspect ?? "aspect-[4/3]", className)}
      />
    );
  }

  if (isComparisonImage(image)) {
    return (
      <ComparisonImage
        image={image}
        sizes={sizes}
        className={cn(comparisonAspectClass, className)}
      />
    );
  }

  if (isVideoImage(image)) {
    return (
      <ProjectVideo
        image={image}
        className={cn(image.aspect ?? "aspect-video", className)}
      />
    );
  }

  return (
    <ProjectScreenshot
      image={image}
      sizes={sizes}
      className={cn(plainAspectClass, className)}
    />
  );
}
