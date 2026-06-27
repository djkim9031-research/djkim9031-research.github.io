import { profile } from "../data/profile";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="hdr-row">
      <span className="hdr-label">{label}</span>
      <span className="hdr-value">{value}</span>
    </div>
  );
}

function Contacts() {
  const c = profile.contact;
  const items: { text: string; href: string }[] = [];
  if (c.email) items.push({ text: "email", href: "mailto:" + c.email });
  if (c.github) items.push({ text: "github", href: c.github });
  if (c.linkedin) items.push({ text: "linkedin", href: c.linkedin });
  if (c.website) items.push({ text: "web", href: c.website });

  return (
    <div className="hdr-row">
      <span className="hdr-label">contact</span>
      <span className="hdr-value">
        {items.map((it, i) => (
          <span key={it.text}>
            {i > 0 && <span className="tone-dim"> · </span>}
            <a
              className="tone-green"
              href={it.href}
              target={it.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
            >
              {it.text}
            </a>
          </span>
        ))}
      </span>
    </div>
  );
}

export function Header() {
  return (
    <header className="profile-card">
      <div className="profile-info">
        <div className="profile-name">{profile.name}</div>
        <div className="profile-rule" />
        <Row label="role" value={profile.profession} />
        {profile.skills.map((s) => (
          <Row key={s.group} label={s.group} value={s.items.join(" · ")} />
        ))}
        <Contacts />
        <div className="profile-hint">
          type <span className="tone-green">help</span> to explore, or{" "}
          <span className="tone-green">ask "…"</span> the agent below
          <span className="tone-dim">
            {" "}· best on desktop for full LLM-powered responses
          </span>
        </div>
      </div>

      <div className="profile-avatar">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.name} />
        ) : (
          <div className="avatar-placeholder">
            <span>[ photo ]</span>
            <span className="tone-dim">set avatarUrl</span>
          </div>
        )}
      </div>
    </header>
  );
}
