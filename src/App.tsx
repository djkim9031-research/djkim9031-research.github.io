import { useState } from "react";
import { Header } from "./components/Header";
import { Terminal } from "./components/Terminal";
import { BlogView } from "./components/BlogView";
import { HOME, type NavState } from "./nav";

export default function App() {
  const [nav, setNav] = useState<NavState>(HOME);
  const go = (next: Partial<NavState>) => setNav((prev) => ({ ...prev, ...next }));

  const isBlog = nav.view === "blog";

  return (
    <div className="screen">
      <div className={isBlog ? "layout layout-blog" : "layout"}>
        <div className="top-area">
          {isBlog ? <BlogView nav={nav} go={go} /> : <Header />}
        </div>
        <div className="accelerator" aria-hidden="true">
          <div className="accel-beam" />
        </div>
        <Terminal nav={nav} go={go} />
      </div>
    </div>
  );
}
