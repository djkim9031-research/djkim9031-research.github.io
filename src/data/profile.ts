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
  tagline: "AI systems engineer — making vision and embodied-AI run fast on the GPU.",
  profession:
    "AI Systems Engineer specializing in computer vision and GPU compute optimization.",

  about: [
    "I'm an AI systems engineer specializing in computer vision and GPU compute",
    "optimization, working where high-performance computing meets modern machine",
    "learning. My work spans the full stack of real-time vision and embodied-AI",
    "systems — from low-level CUDA kernel development and ML runtime optimization",
    "to training and deploying large-scale models in production.",
    "",
    "Across both industry and academia, I've designed and accelerated pipelines for",
    "computer vision, Vision-Language-Action (VLA) and Vision-Action (VA) models, and",
    "World Action Models, tuning them to meet demanding latency, throughput, and",
    "efficiency targets. I focus on extracting maximum performance from modern GPU",
    "hardware — writing custom kernels, profiling and eliminating bottlenecks, and",
    "engineering inference and training runtimes that are both fast and reliable.",
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
    {
      group: "GPU & HPC",
      items: [
        "CUDA",
        "kernel development",
        "GPU compute optimization",
        "ML runtime optimization",
        "profiling & performance tuning",
      ],
    },
    {
      group: "Machine Learning",
      items: ["deep learning", "computer vision", "model training & deployment"],
    },
    {
      group: "Embodied AI",
      items: [
        "Vision-Language-Action (VLA) models",
        "Vision-Action (VA) models",
        "World Action Models",
      ],
    },
  ],

  contact: {
    email: "djkim9031.research@gmail.com",
    github: "https://github.com/djkim9031-research",
    linkedin: "",
    website: "https://djkim9031-research.github.io",
  },

  resumeUrl: "",
};
