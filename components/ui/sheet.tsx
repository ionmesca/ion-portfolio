"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { Close } from "@/lib/icons"
import { cn } from "@/lib/utils"

/**
 * Sheet — radix Dialog, restyled onto the design system.
 *
 * RESTYLED, NOT HAND-ROLLED. The shipped shadcn file used raw values that the
 * token contract forbids (`bg-black/50` scrim, `bg-background` surface, a
 * hardcoded 300/500ms `transition ease-in-out`, `border-t`). Every one of them
 * is now a token, and the geometry follows the Figma bottom sheet:
 *
 *   Figma "Menu sheet" 20:693 — full width, anchored bottom, radius `xl` (21)
 *   on the TOP corners only, fill `popover`, effect `Modal`, clipsContent,
 *   24px bottom padding. No border: the Modal elevation's 1px ring layer is
 *   the edge.
 *
 * SCRIM. The morph family has no scrim, but the sheet is not a morph — POR-22
 * ratified the scrim as a platform exception for mobile, so the overlay paints
 * the `scrim` role (black 20% light / 50% dark).
 *
 * MOTION. motion-system-spec.md: panels move on `--duration-base` in and
 * `--duration-fast` out, both on `--motion-glide`. Written as explicit
 * animation-duration/-timing-function rather than `transition`, because the
 * enter/exit here are tw-animate-css keyframes.
 *
 * The `side` variants other than `bottom` are kept for future call sites and
 * carry the same token treatment; only `bottom` is used today.
 */

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

const SHEET_MOTION = [
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=open]:[animation-duration:var(--duration-base)]",
  "data-[state=closed]:[animation-duration:var(--duration-fast)]",
  "[animation-timing-function:var(--motion-glide)]",
].join(" ")

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-scrim",
        SHEET_MOTION,
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden bg-popover text-popover-foreground shadow-modal",
          SHEET_MOTION,
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 rounded-l-xl data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 rounded-r-xl data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 h-auto rounded-b-xl data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto rounded-t-xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            className={cn(
              "absolute top-4 right-4 grid size-8 place-items-center rounded-md text-muted-foreground",
              "[transition:color_var(--duration-fast)_var(--motion-glide)]",
              "hover:text-foreground hover:[transition-duration:0ms]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            )}
          >
            <Close className="size-4" strokeWidth={1.5} />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex items-center gap-3 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-subhead text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * Grabber — the 32 x 4 handle at the top of a bottom sheet (Figma 20:695).
 *
 * `stone-300` is a documented allowance, not an escape: the handle is a
 * physical affordance rather than a semantic surface, and no role in the
 * contract sits between `border` (too faint at 4px) and `muted-foreground`
 * (too loud). The dark counterpart is its mirror on the ramp.
 */
function SheetGrabber({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-grabber"
      aria-hidden="true"
      className={cn("flex shrink-0 justify-center pt-2", className)}
      {...props}
    >
      <span className="h-1 w-8 rounded-full bg-stone-300 dark:bg-stone-600" />
    </div>
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetGrabber,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
