import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Terminal } from "./components/Terminal";
import { BlogView } from "./components/BlogView";
import { ProjectView } from "./components/ProjectView";
import { AnalyticsView } from "./components/AnalyticsView";
import { HOME, type NavState } from "./nav";
import { trackNavigation } from "./analytics/tracker";

export default function App() {
  const [nav, setNav] = useState<NavState>(HOME);
  const [showAnalytics, setShowAnalytics] = useState(
    window.location.hash === "#analytics"
  );

  useEffect(() => {
    const onHash = () => setShowAnalytics(window.location.hash === "#analytics");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (next: Partial<NavState>) => {
    setNav((prev) => {
      const merged = { ...prev, ...next };
      trackNavigation(merged.view);
      return merged;
    });
  };

  if (showAnalytics) {
    return (
      <div className="screen">
        <AnalyticsView />
      </div>
    );
  }

  const isFullPage = nav.view === "blog" || nav.view === "projects";

  return (
    <div className="screen">
      <div className={isFullPage ? "layout layout-blog" : "layout"}>
        <div className="top-area">
          {nav.view === "blog" ? (
            <BlogView nav={nav} go={go} />
          ) : nav.view === "projects" ? (
            <ProjectView nav={nav} go={go} />
          ) : (
            <Header />
          )}
        </div>
        <div className="accelerator" aria-hidden="true">
          <div className="accel-beam" />
        </div>
        <Terminal nav={nav} go={go} />
      </div>
    </div>
  );
}
