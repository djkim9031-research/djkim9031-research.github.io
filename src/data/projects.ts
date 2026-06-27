// Project showcase data. Each project can have rich content blocks:
// text paragraphs, code snippets, images, and videos/gifs.
// Add projects to the `projects` array — the ProjectView and terminal
// both read from here.

export interface ContentBlock {
  type: "text" | "code" | "image" | "video";
  // text: the paragraph string
  // code: the source code string
  value?: string;
  // code: language for syntax highlighting hint
  language?: string;
  // image/video: path relative to public/ (e.g. "/projects/demo.gif")
  src?: string;
  alt?: string;
  caption?: string;
}

export interface ProjectCategory {
  id: string;
  label: string;
}

export interface Project {
  slug: string;
  title: string;
  category: string; // category id
  date?: string;
  summary?: string;
  tech?: string[];
  links?: { label: string; href: string }[];
  content?: ContentBlock[];
}

export const categories: ProjectCategory[] = [
  { id: "ai", label: "AI / ML" },
  { id: "gpu", label: "GPU & HPC" },
  { id: "robotics", label: "Robotics" },
  { id: "other", label: "Other" },
];

export const projects: Project[] = [
  // Example project — replace or delete this.
  {
    slug: "example-project",
    title: "Example Project",
    category: "ai",
    date: "",
    summary: "A placeholder — edit or delete it in src/data/projects.ts.",
    tech: ["Python", "CUDA", "PyTorch"],
    links: [],
    content: [
      {
        type: "text",
        value:
          "Describe what this project does, why you built it, and what you learned. " +
          "Each content block renders in order — mix text, code, images, and videos freely.",
      },
      {
        type: "code",
        language: "python",
        value: '# Example code snippet\nimport torch\n\nx = torch.randn(3, 3, device="cuda")\nprint(x @ x.T)',
      },
      {
        type: "text",
        value:
          "Drop images/gifs/videos into public/projects/ and reference them by path. " +
          'For example: { type: "image", src: "/projects/screenshot.png", alt: "demo" }',
      },
    ],
  },
];

export const getCategory = (id: string): ProjectCategory | undefined =>
  categories.find((c) => c.id === id);

export const getProject = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug);

export const projectsIn = (categoryId?: string | null): Project[] =>
  projects.filter((p) => !categoryId || p.category === categoryId);
