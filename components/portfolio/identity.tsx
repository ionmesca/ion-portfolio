"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const IDENTITY_LABEL = "Ion Mesca";
const AGENT_LABEL = "Ask Agent Ion";

const loadAgentRuntimeSurface = () =>
  import("@/components/agent/agent-runtime-surface").then(
    (module) => module.AgentRuntimeSurface
  );

const AgentRuntimeSurface = dynamic(
  loadAgentRuntimeSurface,
  {
    ssr: false,
    loading: () => <AgentPanelLoading />,
  }
);

function AgentPanelLoading() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[22px] bg-bg-base text-text-primary"
      aria-label="Loading Ion's portfolio agent"
    >
      <div className="h-14 px-2 pt-2">
        <div aria-hidden className="relative w-[184px]" />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2 pt-5">
        <div className="h-10 rounded-xl bg-bg-surface" />
        <div className="h-10 rounded-xl bg-bg-surface" />
        <div className="h-10 rounded-xl bg-bg-surface" />
      </div>
      <div className="px-2 pb-2 pt-8">
        <div className="h-11 rounded-full border border-border-default bg-bg-base shadow-card" />
      </div>
    </div>
  );
}

export function Identity() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hasLoadedAgent, setHasLoadedAgent] = useState(false);
  const panelContentId = useId();
  const labelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isAgentMode = isOpen || isHovering;
  const isPreviewOpen = isOpen || isHovering;

  const prepareAgent = useCallback(() => {
    setHasLoadedAgent(true);
    void loadAgentRuntimeSurface();
  }, []);

  useEffect(() => {
    const prewarm = () => {
      void loadAgentRuntimeSurface();
    };
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(prewarm, { timeout: 1800 });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }

    const handle = window.setTimeout(prewarm, 1200);
    return () => window.clearTimeout(handle);
  }, []);

  function handleTriggerClick() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    prepareAgent();
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
      onFocusCapture={prepareAgent}
      onPointerEnter={() => {
        prepareAgent();
        setIsHovering(true);
      }}
      onPointerLeave={() => setIsHovering(false)}
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
        data-state={isPreviewOpen ? "open" : "closed"}
        className={cn(
          "identity-panel-surface absolute left-0 top-0 z-50 origin-top-left overflow-hidden rounded-3xl border transition-[width,height,box-shadow,background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isPreviewOpen ? "h-[560px] w-[520px] shadow-card" : "h-10 w-[184px] shadow-none"
        )}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={isPreviewOpen}
          aria-controls={panelContentId}
          aria-haspopup="dialog"
          onClick={handleTriggerClick}
          className={cn(
            "identity-trigger absolute left-0 top-0 z-[60] inline-flex h-10 w-[184px] items-center gap-2 overflow-hidden rounded-full py-1 pl-1 pr-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent"
          )}
          aria-label="Open Ion Mesca contact card"
        >
          <span className="relative shrink-0">
            <Image
              src={isAgentMode ? "/ion-agent-avatar.png" : "/ion-avatar.png"}
              alt="Ion Mesca"
              width={32}
              height={32}
              className="identity-avatar size-8 rounded-full object-cover"
              priority
            />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-bg-surface bg-success" />
          </span>
          <span
            id={labelId}
            className="identity-trigger-label relative h-6 min-w-0 flex-1 overflow-hidden text-base font-medium"
          >
            <span className="sr-only">{isAgentMode ? AGENT_LABEL : IDENTITY_LABEL}</span>
            {isAgentMode ? (
              <span
                aria-hidden
                className="identity-trigger-label-morph absolute inset-0 whitespace-nowrap"
              >
                <span className="identity-trigger-label-primary absolute inset-0 whitespace-nowrap">
                  {IDENTITY_LABEL.split("").map((letter, index) => (
                    <span
                      key={`identity-${letter}-${index}`}
                      className="identity-label-char inline-block animate-[identity-label-out_180ms_cubic-bezier(0.16,1,0.3,1)_both]"
                      style={{ animationDelay: `${120 + index * 10}ms` }}
                    >
                      {letter === " " ? "\u00a0" : letter}
                    </span>
                  ))}
                </span>
                <span className="identity-trigger-label-agent absolute inset-0 whitespace-nowrap">
                {AGENT_LABEL.split("").map((letter, index) => (
                  <span
                    key={`agent-${letter}-${index}`}
                    className="identity-label-char inline-block animate-[identity-label-in_200ms_cubic-bezier(0.16,1,0.3,1)_both]"
                    style={{ animationDelay: `${220 + index * 16}ms` }}
                  >
                    {letter === " " ? "\u00a0" : letter}
                  </span>
                ))}
                </span>
              </span>
            ) : (
              <span
                aria-hidden
                className="identity-trigger-label-primary absolute inset-0 whitespace-nowrap"
              >
                {IDENTITY_LABEL}
              </span>
            )}
          </span>
          <span
            className={cn(
              "identity-trigger-disclosure flex size-4 shrink-0 items-center justify-center text-text-tertiary transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isAgentMode && "pointer-events-none -translate-y-0.5 scale-95 opacity-0"
            )}
            aria-hidden
          >
            <ChevronsUpDown className="size-4" />
          </span>
        </button>

        <div className="h-full p-1">
          <div
            id={panelContentId}
            aria-hidden={!isPreviewOpen}
            className={cn(
              "identity-panel-content h-full transition-[opacity,filter,transform] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]",
              isPreviewOpen
                ? "translate-y-0 opacity-100 blur-0 delay-100"
                : "-translate-y-1 opacity-0 blur-md"
            )}
          >
            {hasLoadedAgent ? (
              <AgentRuntimeSurface mode="popover" className="rounded-[22px]" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
