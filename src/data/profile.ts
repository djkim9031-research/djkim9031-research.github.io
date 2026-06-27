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

export interface EducationEntry {
  school: string;
  degree: string;
  period?: string;
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
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: SkillGroup[];
  contact: Contact;
  resumeUrl?: string;
  avatarUrl?: string;
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
      role: "Senior Systems Research Engineer — AI & Robotics",
      org: "Intuitive Surgical",
      period: "May 2026 – Present",
      summary:
        "Future Forward Research group — GPU model training and inference " +
        "optimization, developing Vision Foundation Models (VFM), Vision-Language-Action " +
        "(VLA), and World Action Models (WAM) for surgical robots.",
    },
    {
      role: "Senior Software Engineer — Compute Acceleration",
      org: "Dexterity, Inc.",
      period: "Nov 2024 – May 2026",
      summary:
        "Computer vision, AI, and GPU compute acceleration. Built a fully " +
        "GPU-resident vision pipeline (32× data ingestion, 10–100× speedup) that " +
        "shipped to customer-site deployment — using Nsight profiling, custom CUDA " +
        "kernel development, TensorRT, and OptiX integration.",
    },
    {
      role: "R&D Engineer / Scientist II",
      org: "Honeywell",
      period: "Feb 2024 – Nov 2024",
      summary:
        "Robotics perception and AI — computer vision and performance optimization " +
        "for robotic systems.",
    },
    {
      role: "R&D Software Engineer",
      org: "ABB Robotics",
      period: "2019 – 2023",
      summary:
        "Computer vision and AI for robotics. Led CUDA parallelization of 3D " +
        "point-cloud processing for robot path optimization (multi-fold speedup, " +
        "adopted over competitor solutions) and developed first-of-its-kind " +
        "AI-powered 3D perception for general robot item picking, alongside 2D/3D " +
        "perception and bin-packing R&D.",
    },
    {
      role: "Consultant — Blockchain (Intern)",
      org: "Deloitte Consulting",
      period: "2018",
      summary:
        "Blockchain team intern. Built and configured Hyperledger private-blockchain " +
        "and cloud-computing solutions for clients, developed chaincode / smart " +
        "contracts in C and Go, and supported technical consulting, data analytics, " +
        "and project management.",
    },
  ],

  education: [
    {
      school: "University of Glasgow",
      degree: "MSc, Electrical & Electronics Engineering",
      period: "2016 – 2017",
    },
    {
      school: "Yonsei University",
      degree: "BSc, Electrical & Electronics Engineering",
      period: "2008 – 2015",
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
    linkedin: "https://www.linkedin.com/in/dongjin-kim-98b867184/",
    website: "https://djkim9031-research.github.io",
  },

  resumeUrl: "",

  // Drop a photo in public/ (e.g. public/me.jpg) and set the path here, like
  // "/me.jpg". While empty, a placeholder box is shown in the top-right.
  avatarUrl: "/profile.jpg",
};
