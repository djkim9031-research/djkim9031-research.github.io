// Knowledge base for the `ask` command. The scripted responder scores each
// entry by how many of its keywords appear in the question and returns the best
// match. Add entries as you flesh out your story — order does not matter.

export interface FaqEntry {
  keywords: string[];
  answer: string;
}

export const faq: FaqEntry[] = [
  {
    keywords: ["who", "you", "name", "introduce", "yourself"],
    answer: "// TODO: a short self-introduction.",
  },
  {
    keywords: ["do", "work", "job", "profession", "role", "focus"],
    answer: "// TODO: describe what you do.",
  },
  {
    keywords: ["project", "projects", "built", "build", "made"],
    answer: "// TODO: highlight a project or two. Tip: try the `projects` command.",
  },
  {
    keywords: ["skill", "skills", "tech", "stack", "language", "tools"],
    answer: "// TODO: summarize your skills. Tip: try the `skills` command.",
  },
  {
    keywords: ["contact", "email", "reach", "hire", "available"],
    answer: "// TODO: how to reach you. Tip: try the `contact` command.",
  },
];

export const fallbackAnswer =
  "I don't have an answer for that yet. Try `help` for commands, or ask about " +
  "my work, projects, skills, or how to get in touch.";
