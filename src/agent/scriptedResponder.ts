import type { Profile } from "../data/profile";
import { faq, fallbackAnswer } from "../data/faq";
import type { AgentResponder } from "./responder";

// Rule-based stand-in for a language model. It scores each FAQ entry by how many
// of its keywords appear in the question and returns the highest-scoring answer,
// falling back to a generic prompt when nothing matches.
function bestMatch(question: string): string {
  const q = question.toLowerCase();
  let best: { score: number; answer: string } | null = null;

  for (const entry of faq) {
    const score = entry.keywords.reduce(
      (n, kw) => (q.includes(kw.toLowerCase()) ? n + 1 : n),
      0
    );
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: entry.answer };
    }
  }

  return best ? best.answer : fallbackAnswer;
}

export const scriptedResponder: AgentResponder = {
  async respond(question: string, _profile: Profile): Promise<string> {
    return bestMatch(question);
  },
};

// (the optional hooks parameter is accepted via the AgentResponder type but the
// scripted responder has nothing to stream, so it ignores it.)
