import {
  categories,
  getCategory,
  getProject,
  projectsIn,
  type ContentBlock,
} from "../data/projects";
import { HOME, type NavState } from "../nav";

type Go = (next: Partial<NavState>) => void;

function RenderBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "text":
      return <p>{block.value}</p>;

    case "code":
      return (
        <div className="proj-code-wrap">
          {block.language && (
            <span className="proj-code-lang">{block.language}</span>
          )}
          <pre className="proj-code">
            <code>{block.value}</code>
          </pre>
        </div>
      );

    case "image":
      return (
        <figure className="proj-figure">
          <img src={block.src} alt={block.alt ?? ""} loading="lazy" />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );

    case "video":
      // Support both video files and gifs. Gifs are rendered as <img>.
      if (block.src?.endsWith(".gif")) {
        return (
          <figure className="proj-figure">
            <img src={block.src} alt={block.alt ?? ""} loading="lazy" />
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>
        );
      }
      return (
        <figure className="proj-figure">
          <video
            src={block.src}
            controls
            playsInline
            muted
            loop
            preload="metadata"
          />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );

    default:
      return null;
  }
}

function ProjectDetail({ slug, go }: { slug: string; go: Go }) {
  const p = getProject(slug);
  if (!p) return <p className="muted">Project not found.</p>;

  return (
    <article className="proj-detail">
      <h1>{p.title}</h1>
      {p.date && <div className="post-date">{p.date}</div>}
      {p.tech && p.tech.length > 0 && (
        <div className="proj-tags">
          {p.tech.map((t) => (
            <span key={t} className="proj-tag">
              {t}
            </span>
          ))}
        </div>
      )}
      {p.links && p.links.length > 0 && (
        <div className="proj-links">
          {p.links.map((l) => (
            <a
              key={l.href}
              className="proj-link"
              href={l.href}
              target="_blank"
              rel="noreferrer"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
      <div className="proj-body">
        {(p.content ?? []).map((block, i) => (
          <RenderBlock key={i} block={block} />
        ))}
      </div>
      <button className="link-btn" onClick={() => go({ project: null })}>
        ← back to list
      </button>
    </article>
  );
}

function ProjectList({ categoryId, go }: { categoryId: string | null; go: Go }) {
  const label = categoryId
    ? getCategory(categoryId)?.label ?? "Projects"
    : "All Projects";
  const list = projectsIn(categoryId);

  return (
    <div>
      <h1>{label}</h1>
      {list.length === 0 ? (
        <p className="muted">No projects here yet — check back soon.</p>
      ) : (
        <ul className="post-list">
          {list.map((p) => (
            <li key={p.slug}>
              <button
                className="post-item"
                onClick={() => go({ project: p.slug })}
              >
                <span className="post-title">{p.title}</span>
                {p.summary && <span className="muted">{p.summary}</span>}
                {p.tech && p.tech.length > 0 && (
                  <span className="proj-tags-inline muted">
                    {p.tech.join(" · ")}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryGrid({ go }: { go: Go }) {
  return (
    <div>
      <h1>Projects</h1>
      <p className="muted">Choose a category, or browse all:</p>
      <div className="cat-grid">
        {categories.map((c) => (
          <button
            key={c.id}
            className="cat-card"
            onClick={() => go({ category: c.id, project: null })}
          >
            <span className="cat-card-title">{c.label}</span>
            <span className="muted">{projectsIn(c.id).length} project(s)</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProjectView({ nav, go }: { nav: NavState; go: Go }) {
  return (
    <div className="blog">
      <aside className="blog-sidebar">
        <div className="blog-group">
          <button
            className={"sec-label" + (!nav.category && !nav.project ? " active" : "")}
            onClick={() =>
              go({ view: "projects", category: null, project: null })
            }
          >
            All Projects
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={
                "cat" + (nav.category === c.id && !nav.project ? " active" : "")
              }
              onClick={() =>
                go({ view: "projects", category: c.id, project: null })
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <button className="blog-home" onClick={() => go(HOME)}>
          ← back to home
        </button>
      </aside>

      <main className="blog-content">
        {nav.project ? (
          <ProjectDetail slug={nav.project} go={go} />
        ) : nav.category ? (
          <ProjectList categoryId={nav.category} go={go} />
        ) : (
          <CategoryGrid go={go} />
        )}
      </main>
    </div>
  );
}
