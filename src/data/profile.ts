// Edit this file to fill in your real content. The terminal UI reads everything
// from here, so you never have to touch the components to update the page.

export interface ExperienceEntry {
  role: string;
  org: string;
  period: string;
  summary: string;
}

export interface ProjectEntry {
  title: string;
  desc: string;
  tech: string[];
  link?: string;
}

export interface SkillGroup {
  group: string;
  items: string[];
}

export interface Contact {
  email?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

export interface Profile {
  name: string;
  handle: string;
  tagline: string;
  profession: string;
  about: string[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: SkillGroup[];
  contact: Contact;
  resumeUrl?: string;
}

export const profile: Profile = {
  name: "Dongjin Kim",
  handle: "Dongjin Kim",
  tagline: "// TODO: a one-line tagline",
  profession: "// TODO: your profession / current focus",

  about: [
    "// TODO: write a short bio here.",
    "// Each string in this array becomes its own line.",
  ],

  experience: [
    {
      role: "// TODO: role",
      org: "// TODO: organization",
      period: "// TODO: 20XX – present",
      summary: "// TODO: what you did / impact.",
    },
  ],

  projects: [
    {
      title: "// TODO: project name",
      desc: "// TODO: one or two lines on what it is.",
      tech: ["// TODO", "stack"],
      link: "",
    },
  ],

  skills: [
    { group: "// TODO: category", items: ["// TODO", "skills"] },
  ],

  contact: {
    email: "djkim9031.research@gmail.com",
    github: "https://github.com/djkim9031-research",
    linkedin: "",
    website: "https://djkim9031-research.github.io",
  },

  resumeUrl: "",
};
