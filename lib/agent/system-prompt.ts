import fs from "node:fs";
import path from "node:path";

function loadSystemPrompt(): string {
  const promptPath = path.join(process.cwd(), "lib", "agent", "system-prompt.md");
  return fs.readFileSync(promptPath, "utf-8");
}

export const PORTFOLIO_AGENT_PROMPT = loadSystemPrompt();
export const DEFAULT_AGENT_MODEL = "google/gemini-3.1-flash-lite-preview";
