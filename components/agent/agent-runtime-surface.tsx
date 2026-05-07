"use client";

import { ConvexClientProvider } from "@/app/providers/convex-client-provider";
import { AgentProvider } from "@/components/agent/agent-provider";
import { AgentSurface } from "@/components/agent/agent-surface";

type AgentRuntimeSurfaceProps = {
  mode: "popover" | "page";
  className?: string;
};

export function AgentRuntimeSurface({
  mode,
  className,
}: AgentRuntimeSurfaceProps) {
  return (
    <ConvexClientProvider>
      <AgentProvider>
        <AgentSurface mode={mode} className={className} />
      </AgentProvider>
    </ConvexClientProvider>
  );
}
