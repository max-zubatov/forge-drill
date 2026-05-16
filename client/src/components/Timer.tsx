import { useState, useEffect, useRef } from "react";

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm text-forge-subtext tabular-nums">
        {mm}:{ss}
      </span>
      <button
        onClick={() => setRunning((r) => !r)}
        className="text-[11px] font-sans text-forge-muted hover:text-forge-subtext transition-colors"
      >
        {running ? "Pause" : "Start"}
      </button>
      <button
        onClick={() => {
          setRunning(false);
          setSeconds(0);
        }}
        className="text-[11px] font-sans text-forge-muted hover:text-forge-subtext transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
