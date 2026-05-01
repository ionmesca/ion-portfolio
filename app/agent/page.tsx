import { AgentSurface } from "@/components/agent/agent-surface";

export default function AgentPage() {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center p-4 md:p-8">
      <div className="h-[min(760px,calc(100vh-4rem))] w-full max-w-[720px]">
        <AgentSurface mode="page" />
      </div>
    </main>
  );
}
