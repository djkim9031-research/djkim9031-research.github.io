export interface GeoInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface DeviceInfo {
  type: "desktop" | "mobile" | "tablet";
  os: string;
  browser: string;
  userAgent: string;
}

export interface AnalyticsEvent {
  type: "pageview" | "command" | "prompt" | "navigate";
  timestamp: number;
  data: Record<string, string>;
  durationMs?: number;
}

export interface Session {
  id: string;
  geo: GeoInfo;
  device: DeviceInfo;
  startedAt: number;
  lastActiveAt: number;
  events: AnalyticsEvent[];
}
