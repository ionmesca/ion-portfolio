"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import type { UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { MessageResponse } from "@/components/ai-elements/message";
import { useAgent } from "@/components/agent/agent-provider";
import { requestOpenProject } from "@/lib/agent/project-actions";
import { cn } from "@/lib/utils";

const suggestedPrompts = [
  "What's distinctive about Ion's approach to design?",
  "What do his peers say about him?",
  "What's the biggest design problem he's solved?",
];

type AgentSurfaceMode = "popover" | "page";

export function AgentSurface({
  mode,
  className,
}: {
  mode: AgentSurfaceMode;
  className?: string;
}) {
  const agent = useAgent();
  const [input, setInput] = useState("");
  const hasMessages = agent.messages.length > 0;
  const isBusy = agent.status === "streaming" || agent.status === "submitted";
  const showHeaderAvatar = mode === "page";

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input;
    setInput("");
    await agent.sendText(message);
  }

  async function submitPrompt(prompt: string) {
    await agent.sendText(prompt);
  }

  async function newConversation() {
    if (
      !hasMessages ||
      window.confirm(
        "Start a new conversation? Your current thread will stay accessible to Ion but you'll see a fresh start."
      )
    ) {
      await agent.startNewConversation();
    }
  }

  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden bg-bg-base text-text-primary",
        mode === "page"
          ? "h-full rounded-3xl border border-border-default shadow-card"
          : "h-full",
        className
      )}
      aria-label="Ion's portfolio agent"
    >
      <header className="flex h-14 shrink-0 items-center justify-between px-4 pt-1">
        <div className={cn("flex items-center gap-2", !showHeaderAvatar && "pl-10")}>
          {showHeaderAvatar ? (
            <span className="relative flex size-8 shrink-0">
              <Image
                src="/ion.jpeg"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-bg-base bg-success" />
            </span>
          ) : null}
          <div className="leading-none">
            <p className="text-sm font-medium">
              {agent.isHydrating ? "Warming up" : "Ion, in context"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={newConversation}
            aria-label="New conversation"
          >
            <Plus />
          </Button>
          {mode === "popover" ? (
            <Button asChild size="icon-sm" variant="ghost" aria-label="Open full agent page">
              <Link href="/agent">
                <ArrowUpRight />
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="ghost">
              <Link href="/">
                <ArrowLeft />
                Portfolio
              </Link>
            </Button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
        {!hasMessages ? (
          <EmptyState onPrompt={submitPrompt} />
        ) : (
          <div className="flex flex-col gap-4">
            {agent.messages.map((message) => (
              <AgentMessage key={message.id} message={message} />
            ))}
            {isBusy ? (
              <div className="flex items-center gap-2 text-xs text-text-tertiary">
                <Loader2 className="size-3 animate-spin" />
                Thinking through the evidence
              </div>
            ) : null}
            {agent.error ? (
              <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-text-secondary">
                Generation interrupted. Try again in a moment.
              </div>
            ) : null}
          </div>
        )}
      </div>

      <form
        onSubmit={submitMessage}
        className="shrink-0 px-4 pb-4 pt-2"
      >
        <div className="flex min-h-11 items-end gap-1 rounded-full border border-border-default bg-bg-surface px-3 py-1.5 transition-colors focus-within:border-border-strong">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.currentTarget.form?.requestSubmit();
              }
            }}
            disabled={isBusy}
            rows={1}
            maxLength={1200}
            placeholder="Ask about Ion's work..."
            className="max-h-24 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-sm leading-5 outline-none placeholder:text-text-tertiary disabled:opacity-60"
          />
          <Button
            type="submit"
            size="icon-sm"
            disabled={isBusy || !input.trim()}
            aria-label="Send message"
            className="mb-0.5 rounded-full"
          >
            <Send />
          </Button>
        </div>
      </form>

      {mode === "page" ? (
        <div className="px-3 pb-3 text-right font-mono text-[10px] text-text-tertiary">
          model: server-controlled · tested prompt suite pending
        </div>
      ) : null}
    </section>
  );
}

function EmptyState({ onPrompt }: { onPrompt: (prompt: string) => void }) {
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div>
        <p className="typo-label text-text-label">Agent</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          I&apos;m an agent Ion designed to talk about his work and route you to
          the relevant case studies. A few places to start:
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPrompt(prompt)}
            className="group flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-surface px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            <span>{prompt}</span>
            <ArrowUpRight className="size-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

function AgentMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] rounded-2xl px-3 py-2 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border-subtle bg-bg-surface text-text-secondary"
        )}
      >
        <MessageParts parts={message.parts} isUser={isUser} />
      </div>
    </div>
  );
}

function MessageParts({
  parts,
  isUser,
}: {
  parts: UIMessage["parts"];
  isUser: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {parts.map((part, index) => (
        <MessagePart key={`${part.type}-${index}`} part={part} isUser={isUser} />
      ))}
    </div>
  );
}

function MessagePart({
  part,
  isUser,
}: {
  part: UIMessage["parts"][number];
  isUser: boolean;
}) {
  if (part.type === "text") {
    return (
      <MessageResponse className={isUser ? "text-primary-foreground" : ""}>
        {part.text}
      </MessageResponse>
    );
  }

  if (part.type === "reasoning") {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-base px-3 py-2 text-xs italic text-text-tertiary">
        {part.text}
      </div>
    );
  }

  if (part.type.startsWith("tool-")) {
    return <ToolPart part={part as unknown as ToolPartShape} />;
  }

  return null;
}

type ToolPartShape = {
  type: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function ToolPart({ part }: { part: ToolPartShape }) {
  const toolName = part.type.replace("tool-", "");

  if (toolName === "openProject" && part.state === "output-available") {
    const output = part.output as {
      slug?: string;
      anchor?: string;
      label?: string;
      reason?: string;
    };
    if (!output.slug) return null;

    return (
      <button
        type="button"
        onClick={() =>
          requestOpenProject({ slug: output.slug!, anchor: output.anchor })
        }
        className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-accent-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ExternalLink className="size-3" />
        {output.label ?? `Open ${output.slug}`}
      </button>
    );
  }

  if (toolName === "sendIonANote" && part.state === "output-available") {
    return <PermissionCard output={part.output} />;
  }

  if (toolName === "searchPortfolio") {
    const count = Array.isArray(part.output) ? part.output.length : undefined;
    return (
      <details className="rounded-lg border border-border-subtle bg-bg-base px-3 py-2 text-xs text-text-tertiary">
        <summary className="flex cursor-pointer items-center gap-2 text-text-secondary">
          <Search className="size-3" />
          {part.state === "output-available"
            ? `Searched portfolio${count !== undefined ? ` · ${count} sources` : ""}`
            : "Searching portfolio"}
        </summary>
        {part.state === "output-available" && Array.isArray(part.output) ? (
          <div className="mt-2 flex flex-col gap-2">
            {part.output.map((source, index) => {
              const item = source as {
                title?: string;
                body?: string;
                projectSlug?: string;
              };
              return (
                <div key={`${item.title}-${index}`}>
                  <p className="font-medium text-text-secondary">
                    [{index + 1}] {item.title}
                  </p>
                  <p className="mt-1 line-clamp-3">{item.body}</p>
                  {item.projectSlug ? (
                    <button
                      type="button"
                      onClick={() => requestOpenProject({ slug: item.projectSlug! })}
                      className="mt-1 text-text-secondary underline underline-offset-4"
                    >
                      Open related project
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </details>
    );
  }

  if (part.state === "output-error") {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-text-secondary">
        Tool error: {part.errorText ?? "Something went wrong."}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-text-tertiary">
      <Loader2 className="size-3 animate-spin" />
      {toolName}
    </div>
  );
}

function PermissionCard({ output }: { output: unknown }) {
  const initial = output as {
    subject?: string;
    summary?: string;
    replyTo?: string;
  };
  const [subject, setSubject] = useState(initial.subject ?? "");
  const [summary, setSummary] = useState(initial.summary ?? "");
  const [replyTo, setReplyTo] = useState(initial.replyTo ?? "");
  const [state, setState] = useState<"preview" | "sending" | "sent" | "denied">(
    "preview"
  );

  async function sendNote() {
    setState("sending");
    const response = await fetch("/api/agent/note", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subject, summary, replyTo }),
    });
    const data = (await response.json()) as { sent?: boolean };
    setState(data.sent ? "sent" : "preview");
  }

  if (state === "denied") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-base px-3 py-2 text-xs text-text-tertiary">
        <X className="size-3" />
        Note draft cancelled
      </div>
    );
  }

  if (state === "sent") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-text-secondary">
        <Check className="size-3" />
        Sent to Ion
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-bg-base p-3 text-xs">
      <p className="font-medium text-text-primary">Send Ion a note?</p>
      <label className="mt-3 block text-text-tertiary">
        Subject
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="mt-1 h-8 w-full rounded-md border border-border-default bg-bg-surface px-2 text-text-primary outline-none focus:border-border-strong"
        />
      </label>
      <label className="mt-2 block text-text-tertiary">
        Summary
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={4}
          className="mt-1 w-full resize-none rounded-md border border-border-default bg-bg-surface px-2 py-2 text-text-primary outline-none focus:border-border-strong"
        />
      </label>
      <label className="mt-2 block text-text-tertiary">
        Reply email
        <input
          value={replyTo}
          onChange={(event) => setReplyTo(event.target.value)}
          placeholder="Optional"
          className="mt-1 h-8 w-full rounded-md border border-border-default bg-bg-surface px-2 text-text-primary outline-none focus:border-border-strong"
        />
      </label>
      <div className="mt-3 flex justify-end gap-2">
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() => setState("denied")}
          disabled={state === "sending"}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="xs"
          onClick={sendNote}
          disabled={state === "sending"}
        >
          {state === "sending" ? "Sending" : "Approve and send"}
        </Button>
      </div>
    </div>
  );
}
