// Blog content. Add posts to the `posts` array — each one is filed under a
// section ("technical" or "personal") and, for technical, a category. The
// sidebar and terminal both read from here.

import type { BlogSectionId } from "../nav";

export interface BlogCategory {
  id: string;
  label: string;
}

export interface BlogSection {
  id: BlogSectionId;
  label: string;
  categories: BlogCategory[];
}

export interface BlogPost {
  slug: string;
  title: string;
  section: BlogSectionId;
  category: string; // category id; use "general" for personal posts
  date?: string;
  summary?: string;
  body?: string[]; // one string per paragraph
}

export const sections: BlogSection[] = [
  {
    id: "technical",
    label: "Technical blog",
    categories: [
      { id: "ai", label: "AI" },
      { id: "compute", label: "Compute" },
      { id: "future", label: "Future" },
      { id: "others", label: "Others" },
    ],
  },
  {
    id: "personal",
    label: "Personal blog",
    categories: [],
  },
];

export const posts: BlogPost[] = [
  {
    slug: "hello-world",
    title: "Hello, world",
    section: "technical",
    category: "ai",
    date: "",
    summary: "A placeholder post — edit or delete it in src/data/blog.ts.",
    body: [
      "// TODO: write your first post here. Each string in `body` is a paragraph.",
      "Click a category on the left, or type `open <slug>` in the terminal to read a post.",
    ],
  },
];

export const getSection = (id: string): BlogSection | undefined =>
  sections.find((s) => s.id === id);

export const getPost = (slug: string): BlogPost | undefined =>
  posts.find((p) => p.slug === slug);

export const postsIn = (sectionId: string, categoryId?: string | null): BlogPost[] =>
  posts.filter(
    (p) => p.section === sectionId && (!categoryId || p.category === categoryId)
  );
