"use client";

import type { KeyboardEvent } from "react";
import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { AgentSurface } from "@/components/agent/agent-surface";
import { cn } from "@/lib/utils";

export function Identity() {
  const [isOpen, setIsOpen] = useState(false);
  const panelContentId = useId();
  const labelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleTriggerClick() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div
      className="identity-root relative h-10 w-[184px]"
      onKeyDown={handleKeyDown}
    >
      <div
        aria-hidden
        onPointerDown={() => setIsOpen(false)}
        className={cn(
          "identity-overlay fixed inset-0 z-40 bg-black/20 opacity-0 transition-opacity duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "pointer-events-none opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        role={isOpen ? "dialog" : undefined}
        aria-labelledby={isOpen ? labelId : undefined}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "identity-panel-surface absolute left-0 top-0 z-50 origin-top-left overflow-hidden rounded-3xl border transition-[width,height,box-shadow,background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "h-[560px] w-[520px] shadow-card" : "h-10 w-[158px] shadow-none"
        )}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelContentId}
          aria-haspopup="dialog"
          onClick={handleTriggerClick}
          className={cn(
            "identity-trigger absolute left-0 top-0 z-[60] inline-flex h-10 items-center gap-2 rounded-full py-1 pl-1 pr-2 text-left outline-none transition-[opacity,filter,transform] duration-150 ease-[cubic-bezier(0.25,1,0.5,1)] focus-visible:ring-2 focus-visible:ring-accent",
            isOpen
              ? "-translate-y-0.5 opacity-0 blur-md"
              : "translate-y-0 opacity-100 blur-0"
          )}
          aria-label="Open Ion Mesca contact card"
        >
          <span className="relative shrink-0">
            <Image
              src="/ion.jpeg"
              alt="Ion Mesca"
              width={32}
              height={32}
              className="rounded-full"
              priority
            />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-bg-surface bg-success" />
          </span>
          <span id={labelId} className="whitespace-nowrap text-base font-medium">
            Ion Mesca
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-text-tertiary transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isOpen && "rotate-180"
            )}
            aria-hidden
          />
        </button>

        <div className="h-full p-1">
          <div
            id={panelContentId}
            aria-hidden={!isOpen}
            className={cn(
              "identity-panel-content h-full transition-[opacity,filter,transform] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]",
              isOpen
                ? "translate-y-0 opacity-100 blur-0 delay-100"
                : "-translate-y-1 opacity-0 blur-md"
            )}
          >
            <AgentSurface mode="popover" className="rounded-[22px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
