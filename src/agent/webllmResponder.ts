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

// When WebGPU isn't usable, answer from the built-in info but say why so the
// behavior is never a silent mystery.
async function fallback(reason: string, question: string, profile: Profile) {
  const scripted = await scriptedResponder.respond(question, profile);
  return `${reason}\n${scripted}`;
}

export const webllmResponder: AgentResponder = {
  async respond(question, profile, hooks) {
    if (typeof navigator === "undefined" || !("gpu" in navigator)) {
      return fallback(
        "(no WebGPU in this browser — the live LLM needs desktop Chrome/Edge. Built-in answer below.)",
        question,
        profile
      );
    }

    try {
      const gpu = (navigator as unknown as { gpu: { requestAdapter(): Promise<unknown> } }).gpu;
      const adapter = await gpu.requestAdapter();
      if (!adapter) {
        return fallback(
          "(WebGPU is present but no GPU adapter is available — enable hardware acceleration / Vulkan. Built-in answer below.)",
          question,
          profile
        );
      }

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
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // reset so a later attempt can retry the load
      enginePromise = null;
      return fallback(`(in-browser LLM error: ${msg})`, question, profile);
    }
  },
};
