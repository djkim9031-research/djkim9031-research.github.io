import type { AnalyticsEvent, DeviceInfo, GeoInfo, Session } from "./types";
import { saveSession } from "./firebase";

let session: Session | null = null;
let currentView: { name: string; enteredAt: number } | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function parseDevice(): DeviceInfo {
  const ua = navigator.userAgent;
  let type: DeviceInfo["type"] = "desktop";
  if (/Mobile|iPhone|iPod|Android.*Mobile|webOS/i.test(ua)) type = "mobile";
  else if (/iPad|Android|Tablet/i.test(ua)) type = "tablet";

  let os = "Unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";

  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";

  return { type, os, browser, userAgent: ua };
}

async function fetchGeo(): Promise<GeoInfo> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("geo fetch failed");
    const data = await res.json();
    return {
      ip: data.ip ?? "unknown",
      city: data.city ?? "unknown",
      region: data.region ?? "unknown",
      country: data.country_name ?? "unknown",
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
    };
  } catch {
    return {
      ip: "unknown",
      city: "unknown",
      region: "unknown",
      country: "unknown",
      latitude: 0,
      longitude: 0,
    };
  }
}

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 3000);
}

function flush() {
  if (session) {
    session.lastActiveAt = Date.now();
    saveSession(session);
  }
}

export async function initTracker() {
  // Don't track admin
  if (window.location.hash === "#analytics") return;

  const geo = await fetchGeo();
  const device = parseDevice();

  session = {
    id: generateId(),
    geo,
    device,
    startedAt: Date.now(),
    lastActiveAt: Date.now(),
    events: [],
  };

  trackEvent("pageview", { view: "home" });

  window.addEventListener("beforeunload", () => {
    finalizeCurrentView();
    flush();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      finalizeCurrentView();
      flush();
    }
  });
}

function finalizeCurrentView() {
  if (!currentView || !session) return;
  const duration = Date.now() - currentView.enteredAt;
  // Update the last pageview/navigate event with duration
  for (let i = session.events.length - 1; i >= 0; i--) {
    const ev = session.events[i];
    if (
      (ev.type === "pageview" || ev.type === "navigate") &&
      ev.durationMs === undefined
    ) {
      ev.durationMs = duration;
      break;
    }
  }
}

export function trackEvent(
  type: AnalyticsEvent["type"],
  data: Record<string, string>
) {
  if (!session) return;

  if (type === "navigate" || type === "pageview") {
    finalizeCurrentView();
    currentView = { name: data.view ?? data.to ?? "unknown", enteredAt: Date.now() };
  }

  session.events.push({ type, timestamp: Date.now(), data });
  session.lastActiveAt = Date.now();
  scheduleFlush();
}

export function trackCommand(command: string, args: string) {
  trackEvent("command", { command, args });
}

export function trackPrompt(question: string) {
  trackEvent("prompt", { question });
}

export function trackNavigation(to: string) {
  trackEvent("navigate", { view: to });
}
