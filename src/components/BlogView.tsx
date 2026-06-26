import { sections, getSection, getPost, postsIn } from "../data/blog";
import { HOME, type NavState } from "../nav";

type Go = (next: Partial<NavState>) => void;

export function BlogView({ nav, go }: { nav: NavState; go: Go }) {
  return (
    <div className="blog">
      <aside className="blog-sidebar">
        {sections.map((s) => (
          <div key={s.id} className="blog-group">
            <button
              className={
                "sec-label" +
                (nav.section === s.id && !nav.category ? " active" : "")
              }
              onClick={() =>
                go({ view: "blog", section: s.id, category: null, post: null })
              }
            >
              {s.label}
            </button>
            {s.categories.map((c) => (
              <button
                key={c.id}
                className={
                  "cat" +
                  (nav.section === s.id && nav.category === c.id ? " active" : "")
                }
                onClick={() =>
                  go({ view: "blog", section: s.id, category: c.id, post: null })
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        ))}
        <button className="blog-home" onClick={() => go(HOME)}>
          ← back to home
        </button>
      </aside>

      <main className="blog-content">
        <Content nav={nav} go={go} />
      </main>
    </div>
  );
}

function Content({ nav, go }: { nav: NavState; go: Go }) {
  if (nav.post) {
    const p = getPost(nav.post);
    if (!p) return <p className="muted">Post not found.</p>;
    return (
      <article className="post">
        <h1>{p.title}</h1>
        {p.date && <div className="post-date">{p.date}</div>}
        {(p.body ?? []).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        <button className="link-btn" onClick={() => go({ post: null })}>
          ← back to list
        </button>
      </article>
    );
  }

  if (nav.section) {
    const s = getSection(nav.section);
    if (!s) return <p className="muted">Unknown section.</p>;

    if (nav.category || s.categories.length === 0) {
      const label = nav.category
        ? s.categories.find((c) => c.id === nav.category)?.label ?? s.label
        : s.label;
      const list = postsIn(s.id, nav.category);
      return (
        <div>
          <h1>{label}</h1>
          {list.length === 0 ? (
            <p className="muted">No posts here yet — check back soon.</p>
          ) : (
            <ul className="post-list">
              {list.map((p) => (
                <li key={p.slug}>
                  <button className="post-item" onClick={() => go({ post: p.slug })}>
                    <span className="post-title">{p.title}</span>
                    {p.summary && <span className="muted">{p.summary}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    return (
      <div>
        <h1>{s.label}</h1>
        <p className="muted">Choose a category:</p>
        <div className="cat-grid">
          {s.categories.map((c) => (
            <button
              key={c.id}
              className="cat-card"
              onClick={() => go({ category: c.id, post: null })}
            >
              <span className="cat-card-title">{c.label}</span>
              <span className="muted">{postsIn(s.id, c.id).length} post(s)</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Blog</h1>
      <p className="muted">
        Pick a section on the left, or type e.g. <code>blog technical ai</code> in
        the terminal below.
      </p>
    </div>
  );
}
