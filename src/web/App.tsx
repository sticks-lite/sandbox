import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { FileCode2, Play, Trash2 } from "lucide-react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { runSource } from "sticks-lite";
import { sticksLiteExtensions } from "./sticksLanguage";

const STARTER_SOURCE = `say "Hello, world!"
`;

export function App() {
  const editorHost = useRef<HTMLDivElement | null>(null);
  const editorView = useRef<EditorView | null>(null);
  const splitRef = useRef<HTMLDivElement | null>(null);
  const [source, setSource] = useState(STARTER_SOURCE);
  const [output, setOutput] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [splitPercent, setSplitPercent] = useState(64);

  useEffect(() => {
    if (!editorHost.current) return;
    const view = new EditorView({
      parent: editorHost.current,
      state: EditorState.create({
        doc: source,
        extensions: [
          basicSetup,
          sticksLiteExtensions,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) setSource(update.state.doc.toString());
          })
        ]
      })
    });
    editorView.current = view;
    return () => view.destroy();
  }, []);

  async function runProgram() {
    setIsRunning(true);
    setHasRun(true);
    const outputLines: string[] = [];
    const result = await runSource(source, {
      readInput(promptText: string) {
        return window.prompt(promptText) ?? "";
      },
      writeOutput(text: string) {
        outputLines.push(text);
      }
    });
    setOutput([...outputLines, ...(result.ok ? [] : [result.error ?? "RuntimeError: Program failed."])].join("\n"));
    setIsRunning(false);
  }

  function startResize(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const split = splitRef.current;
    if (!split) return;
    const bounds = split.getBoundingClientRect();
    const update = (pointerEvent: PointerEvent) => {
      const next = ((pointerEvent.clientX - bounds.left) / bounds.width) * 100;
      setSplitPercent(Math.min(82, Math.max(38, next)));
    };
    const stop = () => {
      window.removeEventListener("pointermove", update);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", update);
    window.addEventListener("pointerup", stop);
  }

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="brand">
          <img src="/sticks-lite-logo.png" alt="" />
          <span>
            <strong>Sticks Lite</strong>
            <small>Browser IDE</small>
          </span>
        </div>
        <button className="runButton" disabled={isRunning} onClick={runProgram} type="button">
          <Play size={17} aria-hidden="true" />
          {isRunning ? "Running" : "Run"}
        </button>
      </header>
      <main className="ideWindow">
        <div className="fileTab">
          <FileCode2 size={16} aria-hidden="true" />
          main.slite
        </div>
        <div className="ideSplit" ref={splitRef} style={{ gridTemplateColumns: `${splitPercent}% 8px minmax(240px, 1fr)` }}>
          <section className="editorColumn" aria-label="Sticks Lite editor">
            <div className="panelTitle">Editor</div>
            <div className="editorHost" ref={editorHost} />
          </section>
          <div className="splitHandle" onPointerDown={startResize} role="separator" aria-label="Resize editor and output panels" />
          <section className="outputColumn" aria-label="Program output">
            <div className="panelTitle">
              Output
              <button
                className="clearButton"
                onClick={() => {
                  setOutput("");
                  setHasRun(true);
                }}
                type="button"
              >
                <Trash2 size={15} aria-hidden="true" />
                Clear
              </button>
            </div>
            <pre className="console">{output || (hasRun ? "" : "Run main.slite to see output.")}</pre>
          </section>
        </div>
      </main>
    </div>
  );
}
