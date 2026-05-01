"use client";

import type { UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

export function MessageResponse({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <Streamdown
      className={cn(
        "prose prose-sm max-w-none text-inherit prose-p:my-2 prose-p:leading-6 prose-strong:text-inherit prose-a:text-inherit prose-a:underline prose-code:rounded prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.85em]",
        className
      )}
    >
      {children}
    </Streamdown>
  );
}

export function Message({
  message,
  className,
}: {
  message: UIMessage;
  className?: string;
}) {
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");

  return <MessageResponse className={className}>{text}</MessageResponse>;
}
