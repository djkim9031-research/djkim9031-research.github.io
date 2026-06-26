import type { Profile } from "../data/profile";

// The terminal talks to the agent only through this interface. Swapping the
// scripted responder for a real LLM later means implementing `respond` against
// a network call — no UI or command code has to change.
export interface AgentResponder {
  respond(question: string, profile: Profile): Promise<string>;
}

import { scriptedResponder } from "./scriptedResponder";

// The active responder. Point this at a different implementation to go live
// with a real model (see llmResponder.ts).
export const responder: AgentResponder = scriptedResponder;
