import type { RunOutput } from "../lib/usePyodide";

type Props = {
  output: RunOutput | null;
  loading: boolean;
  loadingPyodide: boolean;
  onClear: () => void;
};

export default function OutputPanel({ output, loading, loadingPyodide, onClear }: Props) {
  return (
    <div className="shrink-0 border-t border-forge-border flex flex-col" style={{ height: 160 }}>
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-forge-border">
        <span className="label">Output</span>
        {output && (
          <button
            onClick={onClear}
            className="text-xs text-forge-muted hover:text-forge-subtext transition-colors font-sans"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-sm leading-relaxed">
        {loadingPyodide && (
          <span className="text-forge-muted animate-pulse">
            Loading Python runtime… (first run only, ~5s)
          </span>
        )}
        {!loadingPyodide && loading && (
          <span className="text-forge-muted animate-pulse">Running…</span>
        )}
        {!loading && !loadingPyodide && !output && (
          <span className="text-forge-muted">Hit Run to execute your code.</span>
        )}
        {!loading && !loadingPyodide && output && (
          <pre className={`whitespace-pre-wrap ${output.error ? "text-rose-400" : "text-forge-subtext"}`}>
            {output.lines.join("\n")}
          </pre>
        )}
      </div>
    </div>
  );
}
