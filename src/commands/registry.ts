import { profile } from "../data/profile";
import { responder } from "../agent/responder";
import {
  blank,
  dim,
  g,
  head,
  line,
  link,
  span,
  text,
  type OutputBlock,
} from "../output";

export interface CommandContext {
  clear: () => void;
}

export interface Command {
  name: string;
  description: string;
  hidden?: boolean;
  run(
    args: string[],
    raw: string,
    ctx: CommandContext
  ): OutputBlock | Promise<OutputBlock>;
}

function aboutBlock(): OutputBlock {
  const out: OutputBlock = [
    line(head(profile.name), span("  "), dim(profile.tagline)),
    blank(),
  ];
  for (const l of profile.about) out.push(text(l));
  return out;
}

function professionBlock(): OutputBlock {
  return [line(g("focus: "), span(profile.profession))];
}

function projectsBlock(): OutputBlock {
  const out: OutputBlock = [];
  profile.projects.forEach((p, i) => {
    if (i > 0) out.push(blank());
    out.push(line(g("◆ "), head(p.title)));
    out.push(text("  " + p.desc));
    if (p.tech.length) out.push(line(dim("  tech: " + p.tech.join(", "))));
    if (p.link) out.push(line(span("  "), link(p.link, p.link)));
  });
  return out;
}

function experienceBlock(): OutputBlock {
  const out: OutputBlock = [];
  profile.experience.forEach((e, i) => {
    if (i > 0) out.push(blank());
    out.push(line(head(e.role), dim("  @ " + e.org)));
    out.push(line(dim("  " + e.period)));
    out.push(text("  " + e.summary));
  });
  return out;
}

function skillsBlock(): OutputBlock {
  return profile.skills.map((s) =>
    line(g(s.group.padEnd(14)), span(s.items.join(", ")))
  );
}

function contactBlock(): OutputBlock {
  const c = profile.contact;
  const out: OutputBlock = [];
  if (c.email) out.push(line(g("email    "), link(c.email, "mailto:" + c.email)));
  if (c.github) out.push(line(g("github   "), link(c.github, c.github)));
  if (c.linkedin) out.push(line(g("linkedin "), link(c.linkedin, c.linkedin)));
  if (c.website) out.push(line(g("web      "), link(c.website, c.website)));
  if (out.length === 0) out.push(text("// TODO: add contact details"));
  return out;
}

function resumeBlock(): OutputBlock {
  if (profile.resumeUrl) {
    return [line(g("resume: "), link(profile.resumeUrl, profile.resumeUrl))];
  }
  return [text("No resume linked yet. Set `resumeUrl` in src/data/profile.ts.")];
}

function stripQuotes(s: string): string {
  return s.trim().replace(/^["']|["']$/g, "");
}

// Order here is the order shown by `help` and `ls`.
const commandList: Command[] = [
  {
    name: "help",
    description: "list available commands",
    run: () => {
      const out: OutputBlock = [text("available commands:"), blank()];
      for (const c of commandList) {
        if (c.hidden) continue;
        out.push(line(g("  " + c.name.padEnd(12)), span(c.description)));
      }
      out.push(blank());
      out.push(line(dim("tip: "), span('try '), g('ask "what do you do?"')));
      return out;
    },
  },
  { name: "about", description: "who I am", run: aboutBlock },
  {
    name: "whoami",
    description: "alias for about",
    hidden: true,
    run: aboutBlock,
  },
  { name: "profession", description: "what I work on", run: professionBlock },
  { name: "projects", description: "selected projects", run: projectsBlock },
  { name: "experience", description: "work history", run: experienceBlock },
  { name: "skills", description: "tools & technologies", run: skillsBlock },
  { name: "contact", description: "how to reach me", run: contactBlock },
  { name: "resume", description: "link to my resume", run: resumeBlock },
  {
    name: "ls",
    description: "list sections",
    run: () => [
      line(
        ...["about", "projects", "experience", "skills", "contact", "resume"]
          .map((s) => g(s + "  "))
      ),
    ],
  },
  {
    name: "ask",
    description: 'ask the agent, e.g. ask "what do you do?"',
    run: async (_args, raw): Promise<OutputBlock> => {
      const question = stripQuotes(raw);
      if (!question) {
        return [text('usage: ask "<your question>"')];
      }
      const answer = await responder.respond(question, profile);
      return [line(g("[agent] "), span(answer, "agent"))];
    },
  },
  {
    name: "clear",
    description: "clear the screen",
    run: (_args, _raw, ctx) => {
      ctx.clear();
      return [];
    },
  },
];

export const commands: Record<string, Command> = Object.fromEntries(
  commandList.map((c) => [c.name, c])
);

export function runCommand(
  input: string,
  ctx: CommandContext
): OutputBlock | Promise<OutputBlock> {
  const trimmed = input.trim();
  if (!trimmed) return [];
  const [name, ...args] = trimmed.split(/\s+/);
  const raw = trimmed.slice(name.length).trim();
  const cmd = commands[name];
  if (!cmd) {
    return [
      line(
        span("command not found: ", "error"),
        span(name, "error"),
        dim(" — type "),
        g("help")
      ),
    ];
  }
  return cmd.run(args, raw, ctx);
}
