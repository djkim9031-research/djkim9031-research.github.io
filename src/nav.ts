// App-level navigation state, shared by the terminal commands and the blog UI
// so typing and clicking drive the same view.

export type BlogSectionId = "technical" | "personal";

export interface NavState {
  view: "home" | "blog";
  section: BlogSectionId | null;
  category: string | null;
  post: string | null;
}

export const HOME: NavState = {
  view: "home",
  section: null,
  category: null,
  post: null,
};
