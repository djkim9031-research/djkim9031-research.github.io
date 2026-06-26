import type { Profile } from "../data/profile";
import type { AgentResponder, AgentHooks } from "./responder";
import { scriptedResponder } from "./scriptedResponder";

// Model to run in the browser. Bump to "Llama-3.2-3B-Instruct-q4f16_1-MLC" for
// higher quality at the cost of a larger download.
const MODEL = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

// Loaded lazily on first use and reused afterwards. Typed loosely so the heavy
// package is only pulled in via dynamic import, not the main bundle.
let enginePromise: Promise<any> | null = null;

function systemPrompt(profile: Profile): string {
  const facts = {
    name: profile.name,
    profession: profile.profession,
    about: profile.about.join(" "),
    experience: profile.experience,
    education: profile.education,
    skills: profile.skills,
    contact: profile.contact,
  };
  return [
    `You are a helpful AI assistant embedded in ${profile.name}'s personal terminal website.`,
    "Answer any question helpfully and concisely — a few sentences, since this is a terminal.",
    `If the user asks about ${profile.name} or this site, answer in the first person using these facts:`,
    JSON.stringify(facts),
  ].join(" ");
}

async function getEngine(hooks?: AgentHooks): Promise<any> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const webllm = await import("@mlc-ai/web-llm");
      return webllm.CreateMLCEngine(MODEL, {
        initProgressCallback: (report) => {
          const pct = Math.round((report.progress ?? 0) * 100);
          hooks?.onProgress?.(`loading model… ${pct}% (first time only)`);
        },
      });
    })();
  }
  return enginePromise;
}

export const webllmResponder: AgentResponder = {
  async respond(question, profile, hooks) {
    const hasGPU =
      typeof navigator !== "undefined" && "gpu" in navigator;
    if (!hasGPU) {
      hooks?.onProgress?.(
        "(in-browser LLM needs WebGPU — using built-in answers instead)"
      );
      return scriptedResponder.respond(question, profile);
    }

    try {
      const engine = await getEngine(hooks);
      hooks?.onProgress?.("thinking…");

      const stream = await engine.chat.completions.create({
        stream: true,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt(profile) },
          { role: "user", content: question },
        ],
      });

      let full = "";
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          full += delta;
          hooks?.onToken?.(full);
        }
      }
      return full.trim() || "(no response)";
    } catch {
      hooks?.onProgress?.("(couldn't load the in-browser LLM — using built-in answers)");
      return scriptedResponder.respond(question, profile);
    }
  },
};
