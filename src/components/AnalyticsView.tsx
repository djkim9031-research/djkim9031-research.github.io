import { useState, useEffect, useRef, useCallback } from "react";
import { ANALYTICS_PASSWORD } from "../analytics/config";
import { loadSessions } from "../analytics/firebase";
import type { Session, AnalyticsEvent } from "../analytics/types";

declare global {
  interface Window {
    L: any;
  }
}

function loadLeaflet(): Promise<any> {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString();
}

function fmtDuration(ms: number | undefined): string {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

function EventRow({ ev }: { ev: AnalyticsEvent }) {
  const label =
    ev.type === "command"
      ? `$ ${ev.data.command} ${ev.data.args || ""}`.trim()
      : ev.type === "prompt"
        ? `ask "${ev.data.question}"`
        : ev.type === "navigate"
          ? `→ ${ev.data.view}`
          : ev.type === "pageview"
            ? `pageview: ${ev.data.view}`
            : ev.type;
  return (
    <tr>
      <td className="av-td av-td-time">{new Date(ev.timestamp).toLocaleTimeString()}</td>
      <td className="av-td">{ev.type}</td>
      <td className="av-td">{label}</td>
      <td className="av-td">{fmtDuration(ev.durationMs)}</td>
    </tr>
  );
}

function SessionDetail({ session, onClose }: { session: Session; onClose: () => void }) {
  const cmds = session.events.filter((e) => e.type === "command");
  const prompts = session.events.filter((e) => e.type === "prompt");
  const navs = session.events.filter((e) => e.type === "navigate" || e.type === "pageview");

  return (
    <div className="av-detail">
      <button className="av-close" onClick={onClose}>
        &larr; back
      </button>
      <h2>Session {session.id}</h2>
      <div className="av-detail-meta">
        <span>{session.geo.ip}</span>
        <span>{session.geo.city}, {session.geo.country}</span>
        <span>{session.device.type} · {session.device.os} · {session.device.browser}</span>
        <span>{fmtDate(session.startedAt)}</span>
        <span>Duration: {fmtDuration(session.lastActiveAt - session.startedAt)}</span>
      </div>
      <h3>All Events ({session.events.length})</h3>
      <div className="av-table-wrap">
        <table className="av-table">
          <thead>
            <tr>
              <th className="av-th">Time</th>
              <th className="av-th">Type</th>
              <th className="av-th">Detail</th>
              <th className="av-th">Duration</th>
            </tr>
          </thead>
          <tbody>
            {session.events.map((ev, i) => (
              <EventRow key={i} ev={ev} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="av-detail-stats">
        <span>Commands: {cmds.length}</span>
        <span>Prompts: {prompts.length}</span>
        <span>Navigations: {navs.length}</span>
      </div>
    </div>
  );
}

export function AnalyticsView() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Session | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  const handleLogin = useCallback(() => {
    if (pw === ANALYTICS_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  }, [pw]);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    loadSessions(500).then((s) => {
      setSessions(s);
      setLoading(false);
    });
  }, [authed]);

  useEffect(() => {
    if (!sessions.length || !mapRef.current || mapInstance.current) return;
    loadLeaflet()
      .then((L) => {
        const map = L.map(mapRef.current).setView([30, 0], 2);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 18,
        }).addTo(map);

        const seen = new Map<string, { count: number; lat: number; lng: number; city: string; country: string }>();
        for (const s of sessions) {
          if (!s.geo.latitude && !s.geo.longitude) continue;
          const key = `${s.geo.latitude},${s.geo.longitude}`;
          const existing = seen.get(key);
          if (existing) {
            existing.count++;
          } else {
            seen.set(key, {
              count: 1,
              lat: s.geo.latitude,
              lng: s.geo.longitude,
              city: s.geo.city,
              country: s.geo.country,
            });
          }
        }
        for (const [, loc] of seen) {
          const radius = Math.min(6 + loc.count * 2, 20);
          L.circleMarker([loc.lat, loc.lng], {
            radius,
            color: "#33ff66",
            fillColor: "#33ff66",
            fillOpacity: 0.5,
            weight: 1,
          })
            .bindPopup(`<b>${loc.city}, ${loc.country}</b><br>${loc.count} visit${loc.count > 1 ? "s" : ""}`)
            .addTo(map);
        }
        mapInstance.current = map;
        setTimeout(() => map.invalidateSize(), 100);
      })
      .catch(() => {});
  }, [sessions]);

  if (!authed) {
    return (
      <div className="av-login">
        <div className="av-login-box">
          <h2>Admin Access</h2>
          <input
            type="password"
            className="av-pw-input"
            placeholder="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setPwError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            autoFocus
          />
          <button className="av-login-btn" onClick={handleLogin}>
            enter
          </button>
          {pwError && <p className="av-error">incorrect password</p>}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="av-loading">
        <p>loading analytics data...</p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="analytics-dashboard">
        <SessionDetail session={selected} onClose={() => setSelected(null)} />
      </div>
    );
  }

  // Aggregate stats
  const uniqueIPs = new Set(sessions.map((s) => s.geo.ip)).size;
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
  const osCounts: Record<string, number> = {};
  const browserCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  const cmdCounts: Record<string, number> = {};
  const promptList: { q: string; ts: number }[] = [];

  for (const s of sessions) {
    deviceCounts[s.device.type]++;
    osCounts[s.device.os] = (osCounts[s.device.os] || 0) + 1;
    browserCounts[s.device.browser] = (browserCounts[s.device.browser] || 0) + 1;
    countryCounts[s.geo.country] = (countryCounts[s.geo.country] || 0) + 1;
    for (const ev of s.events) {
      if (ev.type === "command") {
        const cmd = ev.data.command;
        cmdCounts[cmd] = (cmdCounts[cmd] || 0) + 1;
      }
      if (ev.type === "prompt") {
        promptList.push({ q: ev.data.question, ts: ev.timestamp });
      }
    }
  }

  const topCmds = Object.entries(cmdCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const topOS = Object.entries(osCounts)
    .sort((a, b) => b[1] - a[1]);
  const topBrowsers = Object.entries(browserCounts)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="analytics-dashboard">
      <h1 className="av-title">Analytics Dashboard</h1>

      {/* Stats row */}
      <div className="av-stats">
        <div className="av-stat-card">
          <div className="av-stat-num">{sessions.length}</div>
          <div className="av-stat-label">Total Sessions</div>
        </div>
        <div className="av-stat-card">
          <div className="av-stat-num">{uniqueIPs}</div>
          <div className="av-stat-label">Unique IPs</div>
        </div>
        <div className="av-stat-card">
          <div className="av-stat-num">{deviceCounts.desktop}</div>
          <div className="av-stat-label">Desktop</div>
        </div>
        <div className="av-stat-card">
          <div className="av-stat-num">{deviceCounts.mobile + deviceCounts.tablet}</div>
          <div className="av-stat-label">Mobile/Tablet</div>
        </div>
        <div className="av-stat-card">
          <div className="av-stat-num">{promptList.length}</div>
          <div className="av-stat-label">AI Prompts</div>
        </div>
      </div>

      {/* Map */}
      <div className="av-section">
        <h2>Visitor Map</h2>
        <div className="av-map" ref={mapRef} />
      </div>

      {/* Side-by-side: top countries + device breakdown */}
      <div className="av-grid-2">
        <div className="av-section">
          <h2>Top Countries</h2>
          <ul className="av-list">
            {topCountries.map(([c, n]) => (
              <li key={c}>
                <span className="av-list-label">{c}</span>
                <span className="av-list-val">{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="av-section">
          <h2>Devices</h2>
          <ul className="av-list">
            {topOS.map(([o, n]) => (
              <li key={o}>
                <span className="av-list-label">{o}</span>
                <span className="av-list-val">{n}</span>
              </li>
            ))}
          </ul>
          <h3 style={{ marginTop: 12 }}>Browsers</h3>
          <ul className="av-list">
            {topBrowsers.map(([b, n]) => (
              <li key={b}>
                <span className="av-list-label">{b}</span>
                <span className="av-list-val">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Top commands */}
      <div className="av-grid-2">
        <div className="av-section">
          <h2>Top Commands</h2>
          <ul className="av-list">
            {topCmds.map(([c, n]) => (
              <li key={c}>
                <span className="av-list-label">{c}</span>
                <span className="av-list-val">{n}</span>
              </li>
            ))}
            {topCmds.length === 0 && <li className="av-empty">no data yet</li>}
          </ul>
        </div>
        <div className="av-section">
          <h2>Recent AI Prompts</h2>
          <ul className="av-list av-prompt-list">
            {promptList
              .sort((a, b) => b.ts - a.ts)
              .slice(0, 15)
              .map((p, i) => (
                <li key={i}>
                  <span className="av-list-label">"{p.q}"</span>
                  <span className="av-list-val">{new Date(p.ts).toLocaleDateString()}</span>
                </li>
              ))}
            {promptList.length === 0 && <li className="av-empty">no data yet</li>}
          </ul>
        </div>
      </div>

      {/* Sessions table */}
      <div className="av-section">
        <h2>Sessions ({sessions.length})</h2>
        <div className="av-table-wrap">
          <table className="av-table">
            <thead>
              <tr>
                <th className="av-th">Time</th>
                <th className="av-th">IP</th>
                <th className="av-th">Location</th>
                <th className="av-th">Device</th>
                <th className="av-th">OS</th>
                <th className="av-th">Browser</th>
                <th className="av-th">Duration</th>
                <th className="av-th">Events</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="av-row" onClick={() => setSelected(s)}>
                  <td className="av-td av-td-time">{fmtDate(s.startedAt)}</td>
                  <td className="av-td">{s.geo.ip}</td>
                  <td className="av-td">{s.geo.city}, {s.geo.country}</td>
                  <td className="av-td">{s.device.type}</td>
                  <td className="av-td">{s.device.os}</td>
                  <td className="av-td">{s.device.browser}</td>
                  <td className="av-td">{fmtDuration(s.lastActiveAt - s.startedAt)}</td>
                  <td className="av-td">{s.events.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
