import { useRef, useState } from "react";

type LoadState = "idle" | "loading" | "ready" | "error";

declare global {
  interface Window {
    loadPyodide: (cfg: { indexURL: string }) => Promise<PyodideInstance>;
  }
}

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (cfg: { batched: (s: string) => void }) => void;
  setStderr: (cfg: { batched: (s: string) => void }) => void;
}

export type RunOutput = { lines: string[]; error: boolean };

export function usePyodide() {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [running, setRunning] = useState(false);
  const pyRef = useRef<PyodideInstance | null>(null);

  async function ensureLoaded(): Promise<PyodideInstance> {
    if (pyRef.current) return pyRef.current;
    setLoadState("loading");
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Pyodide script"));
        document.head.appendChild(s);
      });
    }
    const py = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
    });
    pyRef.current = py;
    setLoadState("ready");
    return py;
  }

  async function runCode(code: string): Promise<RunOutput> {
    setRunning(true);
    const lines: string[] = [];
    let error = false;
    try {
      const py = await ensureLoaded();
      py.setStdout({ batched: (s) => lines.push(s) });
      py.setStderr({ batched: (s) => lines.push(s) });
      await py.runPythonAsync(code);
      if (lines.length === 0) lines.push("(no output)");
    } catch (e: unknown) {
      error = true;
      lines.push(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
    return { lines, error };
  }

  return { loadState, running, runCode };
}
