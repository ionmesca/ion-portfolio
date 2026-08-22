"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function SegmentedControl({
  className,
  onValueChange,
  value,
  ...props
}: Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "defaultValue" | "type" | "onValueChange" | "value"
> & {
  onValueChange: (value: string) => void
  value: string
}) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onValueChange(nextValue)
      }}
      data-slot="segmented-control"
      className={cn(
        "inline-flex h-10 w-fit shrink-0 select-none items-center rounded-md bg-secondary p-1 shadow-subtle @md:h-8",
        className
      )}
      {...props}
    />
  )
}

function SegmentedControlItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(
        "inline-flex h-8 min-w-0 shrink-0 cursor-pointer items-center justify-center rounded-sm px-3 text-small leading-none whitespace-nowrap text-muted-foreground outline-none",
        "transition-[background-color,box-shadow,color] duration-150 ease-glide",
        "hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        "data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-subtle",
        "@md:h-6",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlItem }
