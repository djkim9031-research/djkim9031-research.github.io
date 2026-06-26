import type { Profile } from "../data/profile";

// Optional callbacks a responder can use to stream status and partial output
// back to the terminal while it works (e.g. model download progress, tokens).
export interface AgentHooks {
  onProgress?: (status: string) => void;
  onToken?: (partial: string) => void;
}

// The terminal talks to the agent only through this interface. Swapping the
// implementation later (e.g. a fine-tuned model) needs no UI or command changes.
export interface AgentResponder {
  respond(question: string, profile: Profile, hooks?: AgentHooks): Promise<string>;
}

import { webllmResponder } from "./webllmResponder";

// Active responder: a real in-browser LLM (WebLLM) where WebGPU is available,
// falling back to the scripted answers otherwise.
export const responder: AgentResponder = webllmResponder;
