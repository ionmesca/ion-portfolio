import fs from "node:fs";
import path from "node:path";

export function loadSystemPrompt(): string {
  const promptPath = path.join(process.cwd(), "lib", "agent", "system-prompt.md");
  return fs.readFileSync(promptPath, "utf-8");
}

export const DEFAULT_AGENT_MODEL = "google/gemini-3.1-flash-lite-preview";
