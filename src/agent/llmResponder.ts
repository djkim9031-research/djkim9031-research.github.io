import type { Profile } from "../data/profile";
import type { AgentResponder } from "./responder";

// Template for wiring in a real model later. Two common ways to host this:
//
//   1. Serverless proxy (recommended): deploy a small function that holds the
//      API key server-side and forwards prompts. Set ENDPOINT to its URL.
//   2. Bring-your-own-key: read a key the visitor saved to localStorage and
//      call the provider directly from the browser.
//
// To activate, implement respond() below and point `responder` (in
// responder.ts) at this object instead of the scripted one.

const ENDPOINT = ""; // e.g. "https://your-proxy.example.com/api/chat"

function systemPrompt(profile: Profile): string {
  return [
    `You are an assistant embedded in ${profile.name}'s personal terminal site.`,
    "Answer questions about them concisely and in first person, using only the",
    "profile data provided. If you don't know, say so.",
    `Profile: ${JSON.stringify(profile)}`,
  ].join(" ");
}

export const llmResponder: AgentResponder = {
  async respond(question: string, profile: Profile): Promise<string> {
    if (!ENDPOINT) {
      return "The live agent isn't configured yet.";
    }
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: systemPrompt(profile), question }),
    });
    if (!res.ok) return "The agent is unavailable right now.";
    const data = await res.json();
    return data.answer ?? "No response.";
  },
};
