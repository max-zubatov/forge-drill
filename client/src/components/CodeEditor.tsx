import Editor from "@monaco-editor/react";

type Props = {
  value: string;
  onChange?: (val: string) => void;
  onReset?: () => void;
  readOnly?: boolean;
};

export default function CodeEditor({ value, onChange, onReset, readOnly = false }: Props) {
  return (
    <div className="flex flex-col h-full">
      {!readOnly && (
        <div className="flex items-center justify-end px-4 py-2 border-b border-forge-border">
          <button
            onClick={() => {
              if (confirm("Reset your code to the starter template?")) {
                onReset?.();
              }
            }}
            className="text-[11px] font-sans text-forge-muted hover:text-forge-subtext transition-colors"
          >
            Reset code
          </button>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={value}
          onChange={(v) => onChange?.(v ?? "")}
          options={{
            readOnly,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 14,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  );
}
