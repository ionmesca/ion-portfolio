"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  Command,
  Contact,
  CornerDownLeft,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const contactEmail = "hello@ionmesca.com";

const quickLinks = [
  {
    label: "Work",
    href: "/#work",
    icon: BriefcaseBusiness,
  },
  {
    label: "Agent",
    href: "/agent",
    icon: Bot,
  },
  {
    label: "Email",
    href: `mailto:${contactEmail}`,
    icon: Mail,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ion-mesca/",
    icon: Contact,
  },
];

export function Identity() {
  const [isOpen, setIsOpen] = useState(false);
  const panelContentId = useId();
  const labelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const message = String(formData.get("message") || "").trim();
    const agentUrl = new URL("/agent", window.location.origin);

    if (message) {
      agentUrl.searchParams.set("q", message);
    }

    window.location.href = agentUrl.toString();
  }

  function openPanel({ focusMessage = false }: { focusMessage?: boolean } = {}) {
    setIsOpen(true);

    if (focusMessage) {
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }

  function handleTriggerClick() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    openPanel({ focusMessage: true });
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
          isOpen
            ? "h-[332px] w-[340px] shadow-card"
            : "h-10 w-[158px] shadow-none"
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
          <Image
            src="/ion.jpeg"
            alt="Ion Mesca"
            width={32}
            height={32}
            className="shrink-0 rounded-full"
            priority
          />
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

        <div className="p-1">
          <div
            id={panelContentId}
            aria-hidden={!isOpen}
            className={cn(
              "identity-panel-content px-3 pb-3 pt-4 transition-[opacity,filter,transform] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]",
              isOpen
                ? "translate-y-0 opacity-100 blur-0 delay-100"
                : "-translate-y-1 opacity-0 blur-md"
            )}
          >
            <form onSubmit={handleSubmit}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <label htmlFor="identity-message" className="identity-panel-secondary">
                  Talk to my agent
                </label>
                <button
                  type="submit"
                  tabIndex={isOpen ? 0 : -1}
                  aria-label="Ask agent"
                  className="identity-panel-control inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Command className="size-3" aria-hidden />
                  <CornerDownLeft className="size-3" aria-hidden />
                  <span>Ask</span>
                </button>
              </div>
              <textarea
                id="identity-message"
                ref={textareaRef}
                name="message"
                tabIndex={isOpen ? 0 : -1}
                rows={2}
                maxLength={1200}
                placeholder="Ask about my work, process, or fit..."
                className="identity-panel-field min-h-14 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-accent/60"
              />
            </form>

            <div className="identity-panel-divider mt-4 border-t py-2">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                const isExternal = item.href.startsWith("http");
                const isInternal = item.href.startsWith("/");

                return isInternal ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    tabIndex={isOpen ? 0 : -1}
                    className="identity-panel-row flex h-9 items-center justify-between rounded-lg px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span>{item.label}</span>
                    <Icon className="size-4" aria-hidden />
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    tabIndex={isOpen ? 0 : -1}
                    className="identity-panel-row flex h-9 items-center justify-between rounded-lg px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span>{item.label}</span>
                    <span className="flex items-center gap-2">
                      {isExternal ? (
                        <ArrowUpRight className="identity-panel-muted size-3.5" aria-hidden />
                      ) : null}
                      <Icon className="size-4" aria-hidden />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
