import { Header } from "./components/Header";
import { Terminal } from "./components/Terminal";

export default function App() {
  return (
    <div className="screen">
      <div className="layout">
        <Header />
        <div className="accelerator" aria-hidden="true">
          <div className="accel-beam" />
        </div>
        <Terminal />
      </div>
    </div>
  );
}
