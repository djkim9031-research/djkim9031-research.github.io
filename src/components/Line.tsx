import type { OutputLine, Span } from "../output";

const toneClass: Record<NonNullable<Span["tone"]>, string> = {
  default: "tone-default",
  green: "tone-green",
  dim: "tone-dim",
  error: "tone-error",
  agent: "tone-agent",
  head: "tone-head",
};

function renderSpan(s: Span, i: number) {
  const cls = toneClass[s.tone ?? "default"];
  if (s.href) {
    const external = !s.href.startsWith("mailto:");
    return (
      <a
        key={i}
        className={cls}
        href={s.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
      >
        {s.text}
      </a>
    );
  }
  return (
    <span key={i} className={cls}>
      {s.text}
    </span>
  );
}

export function Line({ line }: { line: OutputLine }) {
  // An empty line still needs height; render a non-breaking space.
  if (line.length === 0 || (line.length === 1 && line[0].text === "")) {
    return <div className="out-line">&nbsp;</div>;
  }
  return <div className="out-line">{line.map(renderSpan)}</div>;
}
