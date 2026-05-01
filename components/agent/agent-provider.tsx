"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

type AgentContextValue = ReturnType<typeof useChat<UIMessage>> & {
  isHydrating: boolean;
  sendText: (text: string) => Promise<void>;
  startNewConversation: () => Promise<void>;
};

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isHydrating, setIsHydrating] = useState(true);
  const transport = useMemo(
    () => new DefaultChatTransport<UIMessage>({ api: "/api/agent" }),
    []
  );

  const chat = useChat<UIMessage>({
    transport,
    experimental_throttle: 50,
  });
  const setChatMessages = chat.setMessages;

  useEffect(() => {
    let cancelled = false;

    async function hydrateMessages() {
      try {
        const response = await fetch("/api/agent/messages", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const data = (await response.json()) as { messages?: UIMessage[] };
        if (!cancelled && data.messages?.length) {
          setChatMessages(data.messages);
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    }

    hydrateMessages();
    return () => {
      cancelled = true;
    };
  }, [setChatMessages]);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      await chat.sendMessage({ text: trimmed });
    },
    [chat]
  );

  const startNewConversation = useCallback(async () => {
    const response = await fetch("/api/agent/thread", {
      method: "POST",
    });
    if (!response.ok) return;
    chat.setMessages([]);
  }, [chat]);

  const value = useMemo(
    () => ({
      ...chat,
      isHydrating,
      sendText,
      startNewConversation,
    }),
    [chat, isHydrating, sendText, startNewConversation]
  );

  return <AgentContext value={value}>{children}</AgentContext>;
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used inside AgentProvider.");
  }

  return context;
}
