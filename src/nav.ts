// App-level navigation state, shared by the terminal commands and the
// blog/project views so typing and clicking drive the same view.

export type BlogSectionId = "technical" | "personal";

export interface NavState {
  view: "home" | "blog" | "projects";
  section: BlogSectionId | null;
  category: string | null;
  post: string | null;       // blog post slug
  project: string | null;    // project slug
}

export const HOME: NavState = {
  view: "home",
  section: null,
  category: null,
  post: null,
  project: null,
};
