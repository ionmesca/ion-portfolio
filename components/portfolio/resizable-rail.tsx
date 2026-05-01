"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";

const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 280;
const MAX_WIDTH = 520;
const STEP = 16;

function clampWidth(width: number, minWidth: number, maxWidth: number) {
  return Math.min(maxWidth, Math.max(minWidth, width));
}

export function ResizableRail({
  children,
  className,
  defaultWidth = DEFAULT_WIDTH,
  hideBelowMd = true,
  maxWidth = MAX_WIDTH,
  minWidth = MIN_WIDTH,
  resizeLabel = "Resize project rail",
  storageKey = "ion-portfolio-rail-width",
}: {
  children: ReactNode;
  className?: string;
  defaultWidth?: number;
  hideBelowMd?: boolean;
  maxWidth?: number;
  minWidth?: number;
  resizeLabel?: string;
  storageKey?: string;
}) {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, width: defaultWidth });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedWidth = window.localStorage.getItem(storageKey);
      if (storedWidth) {
        setWidth(clampWidth(Number(storedWidth), minWidth, maxWidth));
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [maxWidth, minWidth, storageKey]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const nextWidth =
        dragStartRef.current.width + event.clientX - dragStartRef.current.x;
      setWidth(clampWidth(nextWidth, minWidth, maxWidth));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, maxWidth, minWidth]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(Math.round(width)));
  }, [storageKey, width]);

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragStartRef.current = { x: event.clientX, width };
      setIsDragging(true);
    },
    [width]
  );

  const adjustWidth = useCallback((nextWidth: number) => {
    setWidth(clampWidth(nextWidth, minWidth, maxWidth));
  }, [maxWidth, minWidth]);

  return (
    <div
      className={cn(
        "relative h-full flex-shrink-0",
        hideBelowMd ? "hidden md:flex" : "flex"
      )}
      style={{ width }}
    >
      <aside
        className={cn(
          "flex h-full w-full flex-col overflow-hidden border-r border-border-subtle",
          className
        )}
      >
        {children}
      </aside>
      <div
        role="separator"
        aria-label={resizeLabel}
        aria-orientation="vertical"
        aria-valuemin={minWidth}
        aria-valuemax={maxWidth}
        aria-valuenow={Math.round(width)}
        data-dragging={isDragging ? "true" : undefined}
        tabIndex={0}
        onPointerDown={startDrag}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            adjustWidth(width - STEP);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            adjustWidth(width + STEP);
          }
          if (event.key === "Home") {
            event.preventDefault();
            adjustWidth(MIN_WIDTH);
          }
          if (event.key === "End") {
            event.preventDefault();
            adjustWidth(MAX_WIDTH);
          }
        }}
        className={cn(
          "group/resize absolute -right-1.5 top-0 z-30 h-full w-3 cursor-col-resize outline-none"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-[calc(50%-4px)] top-1/2 h-14 w-0.5 -translate-x-1/2 -translate-y-1/2 scale-y-75 rounded-full bg-text-muted opacity-0 transition-[opacity,transform] duration-150 ease-out",
            "group-hover/resize:scale-y-100 group-hover/resize:opacity-70 group-focus-visible/resize:scale-y-100 group-focus-visible/resize:opacity-70",
            isDragging && "scale-y-100 opacity-70"
          )}
        />
      </div>
    </div>
  );
}
