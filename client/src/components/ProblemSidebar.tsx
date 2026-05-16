import { Problem } from "../data/problems";
import { ProblemProgress } from "../lib/storage";

type Props = {
  problems: Problem[];
  selected: Problem;
  progress: Record<string, ProblemProgress>;
  onSelect: (p: Problem) => void;
};

const DIFF_COLORS: Record<string, string> = {
  Easy: "text-emerald-400 border-emerald-800",
  Medium: "text-amber-400 border-amber-800",
  Hard: "text-rose-400 border-rose-800",
};

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ProblemSidebar({ problems, selected, progress, onSelect }: Props) {
  return (
    <aside className="w-64 shrink-0 border-r border-forge-border flex flex-col h-full overflow-hidden">
      <div className="px-4 py-4 border-b border-forge-border">
        <span className="label">Problems</span>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {problems.map((p) => {
          const prog = progress[p.id];
          const isActive = selected.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`w-full text-left px-4 py-3 border-b border-forge-border transition-colors ${
                isActive
                  ? "bg-forge-orange/10 border-l-2 border-l-forge-orange"
                  : "hover:bg-white/5 border-l-2 border-l-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`font-sans text-sm font-medium ${
                    isActive ? "text-forge-text" : "text-forge-subtext"
                  }`}
                >
                  {p.title}
                </span>
                <span
                  className={`shrink-0 text-xs font-mono border px-1.5 py-0.5 ${
                    DIFF_COLORS[p.difficulty]
                  }`}
                >
                  {p.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-forge-muted font-mono">
                  {p.minutes}m
                </span>
                {p.tags.slice(0, 2).map((t) => (
                  <span key={t} className="text-xs text-forge-muted">
                    {t}
                  </span>
                ))}
              </div>

              {prog && (
                <div className="flex items-center gap-2 mt-1.5">
                  {prog.bestScore !== null && (
                    <span
                      className={`text-xs font-mono font-medium ${
                        prog.bestScore >= 8
                          ? "text-emerald-400"
                          : prog.bestScore >= 6
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {prog.bestScore}/10
                    </span>
                  )}
                  {prog.attempts > 0 && (
                    <span className="text-xs text-forge-muted">
                      {prog.attempts}x
                    </span>
                  )}
                  {prog.lastAttempted && (
                    <span className="text-xs text-forge-muted">
                      {formatTimeAgo(prog.lastAttempted)}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
