import { profile } from "../data/profile";
import { responder } from "../agent/responder";
import {
  sections,
  getSection,
  getPost,
  postsIn,
} from "../data/blog";
import { HOME, type BlogSectionId, type NavState } from "../nav";
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
  nav: NavState;
  go: (next: Partial<NavState>) => void;
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

function educationBlock(): OutputBlock {
  const out: OutputBlock = [];
  profile.education.forEach((e, i) => {
    if (i > 0) out.push(blank());
    out.push(line(head(e.school)));
    out.push(
      line(dim("  " + e.degree + (e.period ? "  ·  " + e.period : "")))
    );
  });
  return out;
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

// ---- blog navigation ----

function resolveSection(tok: string): BlogSectionId | null {
  const t = tok.toLowerCase();
  const s = sections.find(
    (s) => s.id === t || s.id.startsWith(t) || s.label.toLowerCase().includes(t)
  );
  return s ? s.id : null;
}

function resolveCategory(sectionId: BlogSectionId, tok: string): string | null {
  const t = tok.toLowerCase();
  const c = getSection(sectionId)?.categories.find(
    (c) => c.id === t || c.id.startsWith(t) || c.label.toLowerCase() === t
  );
  return c ? c.id : null;
}

function sectionListBlock(): OutputBlock {
  const out: OutputBlock = [text("blog sections:"), blank()];
  for (const s of sections) {
    out.push(line(g("  " + s.id.padEnd(12)), span(s.label)));
  }
  out.push(blank());
  out.push(
    line(dim("navigate: "), g("blog <section> [category]"), dim(" or "), g("cd <name>"))
  );
  return out;
}

function categoryListBlock(sectionId: BlogSectionId): OutputBlock {
  const s = getSection(sectionId);
  if (!s) return [line(span("unknown section", "error"))];
  if (s.categories.length === 0) {
    return [line(head(s.label)), blank(), ...postListBlock(sectionId, null)];
  }
  const out: OutputBlock = [line(head(s.label)), blank(), text("categories:")];
  for (const c of s.categories) {
    const n = postsIn(sectionId, c.id).length;
    out.push(line(g("  " + c.id.padEnd(12)), span(c.label), dim("  (" + n + ")")));
  }
  out.push(blank());
  out.push(line(dim("open a category: "), g("cd <category>")));
  return out;
}

function postListBlock(
  sectionId: BlogSectionId,
  categoryId: string | null
): OutputBlock {
  const ps = postsIn(sectionId, categoryId);
  if (ps.length === 0) return [dimLine("no posts here yet — check back soon.")];
  const out: OutputBlock = [];
  for (const p of ps) {
    out.push(line(g("  " + p.slug.padEnd(16)), span(p.title)));
  }
  out.push(blank());
  out.push(line(dim("read a post: "), g("open <slug>")));
  return out;
}

function postBlock(slug: string): OutputBlock {
  const p = getPost(slug);
  if (!p) return [line(span("no such post: ", "error"), span(slug, "error"))];
  const out: OutputBlock = [line(head(p.title))];
  if (p.date) out.push(line(dim(p.date)));
  out.push(blank());
  for (const para of p.body ?? []) out.push(text(para));
  return out;
}

function dimLine(s: string): OutputBlock[number] {
  return line(dim(s));
}

function listForBlog(nav: NavState): OutputBlock {
  if (!nav.section) return sectionListBlock();
  const s = getSection(nav.section);
  if (nav.category || !s || s.categories.length === 0) {
    return postListBlock(nav.section, nav.category);
  }
  return categoryListBlock(nav.section);
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
  { name: "education", description: "academic background", run: educationBlock },
  { name: "skills", description: "tools & technologies", run: skillsBlock },
  { name: "contact", description: "how to reach me", run: contactBlock },
  { name: "resume", description: "link to my resume", run: resumeBlock },
  {
    name: "blog",
    description: "open the blog (e.g. blog technical ai)",
    run: (args, _raw, ctx) => {
      const [secTok, catTok] = args;
      if (!secTok) {
        ctx.go({ view: "blog", section: null, category: null, post: null });
        return sectionListBlock();
      }
      const sec = resolveSection(secTok);
      if (!sec) {
        return [line(span("blog: unknown section: ", "error"), span(secTok, "error"))];
      }
      if (!catTok) {
        ctx.go({ view: "blog", section: sec, category: null, post: null });
        return categoryListBlock(sec);
      }
      const cat = resolveCategory(sec, catTok);
      if (!cat) {
        return [line(span("blog: unknown category: ", "error"), span(catTok, "error"))];
      }
      ctx.go({ view: "blog", section: sec, category: cat, post: null });
      return postListBlock(sec, cat);
    },
  },
  {
    name: "cd",
    description: "navigate (cd technical, cd ai, cd .., cd ~)",
    run: (args, _raw, ctx) => {
      const tok = (args[0] ?? "").toLowerCase();
      const { view, section, category, post } = ctx.nav;

      if (tok === "" || tok === "~" || tok === "home") {
        ctx.go(HOME);
        return [dimLine("→ home")];
      }
      if (tok === "..") {
        if (view === "home") return [dimLine("already home")];
        if (post) {
          ctx.go({ post: null });
          return listForBlog({ ...ctx.nav, post: null });
        }
        if (category) {
          ctx.go({ category: null });
          return categoryListBlock(section as BlogSectionId);
        }
        if (section) {
          ctx.go({ section: null });
          return sectionListBlock();
        }
        ctx.go(HOME);
        return [dimLine("→ home")];
      }

      // navigate into a section or category
      if (section) {
        const cat = resolveCategory(section, tok);
        if (cat) {
          ctx.go({ category: cat, post: null });
          return postListBlock(section, cat);
        }
      }
      const sec = resolveSection(tok);
      if (sec) {
        ctx.go({ view: "blog", section: sec, category: null, post: null });
        return categoryListBlock(sec);
      }
      return [line(span("cd: no such location: ", "error"), span(tok, "error"))];
    },
  },
  {
    name: "open",
    description: "read a blog post (open <slug>)",
    run: (args, _raw, ctx) => {
      const slug = args[0];
      if (!slug) return [text("usage: open <slug>")];
      const p = getPost(slug);
      if (!p) return [line(span("no such post: ", "error"), span(slug, "error"))];
      ctx.go({ view: "blog", section: p.section, category: p.category, post: p.slug });
      return postBlock(p.slug);
    },
  },
  {
    name: "home",
    description: "return to the main page",
    run: (_args, _raw, ctx) => {
      ctx.go(HOME);
      return [dimLine("→ home")];
    },
  },
  {
    name: "ls",
    description: "list the current location",
    run: (_args, _raw, ctx) => {
      if (ctx.nav.view === "blog") return listForBlog(ctx.nav);
      return [
        line(
          ...["about", "projects", "experience", "education", "skills", "contact", "resume", "blog"]
            .map((s) => g(s + "  "))
        ),
      ];
    },
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
