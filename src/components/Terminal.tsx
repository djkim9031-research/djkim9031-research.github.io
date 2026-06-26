import { useEffect, useRef, useState } from "react";
import { runCommand, type CommandContext } from "../commands/registry";
import { blank, dim, g, line, type OutputBlock } from "../output";
import { profile } from "../data/profile";
import type { NavState } from "../nav";
import { Line } from "./Line";

interface Entry {
  id: number;
  input: string;
  output: OutputBlock;
  pending: boolean;
}

const banner: OutputBlock = [
  line(dim("# interactive shell — type "), g("help"), dim(" for the list of commands")),
  blank(),
];

const PROMPT = (
  <span className="prompt">
    <span className="tone-default">guest</span>
    <span className="tone-green">@{profile.handle}</span>
    <span className="tone-dim">:~$ </span>
  </span>
);

export function Terminal({
  nav,
  go,
}: {
  nav: NavState;
  go: (next: Partial<NavState>) => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const ctx: CommandContext = { clear: () => setEntries([]), nav, go };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(raw: string) {
    setInput("");
    setHistIndex(-1);
    if (raw.trim()) setCmdHistory((h) => [...h, raw]);

    const first = raw.trim().split(/\s+/)[0];
    if (first === "clear") {
      setEntries([]);
      return;
    }

    const id = ++idRef.current;
    setEntries((e) => [...e, { id, input: raw, output: [], pending: true }]);

    const finalize = (out: OutputBlock) =>
      setEntries((e) =>
        e.map((x) => (x.id === id ? { ...x, output: out, pending: false } : x))
      );

    const result = runCommand(raw, ctx);
    if (result instanceof Promise) finalize(await result);
    else finalize(result);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      submit(input);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const next = histIndex < 0 ? cmdHistory.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(next);
      setInput(cmdHistory[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex < 0) return;
      const next = histIndex + 1;
      if (next >= cmdHistory.length) {
        setHistIndex(-1);
        setInput("");
      } else {
        setHistIndex(next);
        setInput(cmdHistory[next]);
      }
    }
  }

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="scrollback">
        {banner.map((l, i) => (
          <Line key={"b" + i} line={l} />
        ))}

        {entries.map((entry) => (
          <div key={entry.id} className="entry">
            <div className="out-line">
              {PROMPT}
              <span className="tone-default">{entry.input}</span>
            </div>
            {entry.pending ? (
              <Line line={line(dim("· thinking…"))} />
            ) : (
              entry.output.map((l, i) => <Line key={i} line={l} />)
            )}
          </div>
        ))}

        <div className="input-line out-line">
          {PROMPT}
          <input
            ref={inputRef}
            className="cmd-input"
            value={input}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="terminal input"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <span className="caret" aria-hidden="true" />
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
