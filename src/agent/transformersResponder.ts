import type { Profile } from "../data/profile";
import type { AgentResponder, AgentHooks } from "./responder";
import { scriptedResponder } from "./scriptedResponder";

// Small instruction-tuned model that runs well in the browser.
// Loaded from CDN at runtime (not bundled) so the main bundle stays small
// and mobile browsers never download the heavy WASM/JS.
const MODEL_ID = "HuggingFaceTB/SmolLM2-360M-Instruct";
const CDN_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.1";

// Lazily loaded on first use and reused afterwards.
let pipelinePromise: Promise<any> | null = null;

// Mobile devices don't have enough memory to load even a small LLM.
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile|webOS/i.test(navigator.userAgent);
}

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

// Load transformers.js from CDN at runtime so nothing is bundled.
async function loadTransformers(): Promise<any> {
  return import(/* @vite-ignore */ CDN_URL);
}

async function getPipeline(hooks?: AgentHooks): Promise<any> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline, env } = await loadTransformers();

      // Allow running in the browser main thread (no worker required).
      env.allowLocalModels = false;

      hooks?.onProgress?.("downloading model… (first time only)");

      const generator = await pipeline("text-generation", MODEL_ID, {
        dtype: "q4",
        device: "auto",       // WebGPU if available, WASM otherwise
        progress_callback: (progress: any) => {
          if (progress.status === "progress" && progress.progress != null) {
            const pct = Math.round(progress.progress);
            hooks?.onProgress?.(`downloading model… ${pct}%`);
          }
        },
      });

      return generator;
    })();
  }
  return pipelinePromise;
}

async function fallback(reason: string, question: string, profile: Profile) {
  const scripted = await scriptedResponder.respond(question, profile);
  return `${reason}\n${scripted}`;
}

export const transformersResponder: AgentResponder = {
  async respond(question, profile, hooks) {
    if (isMobile()) {
      return scriptedResponder.respond(question, profile);
    }

    try {
      const generator = await getPipeline(hooks);
      hooks?.onProgress?.("thinking…");

      const messages = [
        { role: "system", content: systemPrompt(profile) },
        { role: "user", content: question },
      ];

      const output = await generator(messages, {
        max_new_tokens: 256,
        temperature: 0.7,
        do_sample: true,
        return_full_text: false,
        // Stream tokens back to the terminal
        callback_function: (tokens: any) => {
          if (tokens?.length) {
            const partial = generator.tokenizer.decode(tokens, {
              skip_special_tokens: true,
            });
            hooks?.onToken?.(partial);
          }
        },
      });

      const text =
        output?.[0]?.generated_text?.at(-1)?.content ??
        output?.[0]?.generated_text ??
        "";
      return (typeof text === "string" ? text : String(text)).trim() || "(no response)";
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Reset so a later attempt can retry
      pipelinePromise = null;
      return fallback(`(in-browser LLM error: ${msg})`, question, profile);
    }
  },
};
