export type EvalResult = {
  overall_score: number;
  verdict: "Strong hire" | "Hire" | "Borderline" | "No hire";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  rubric: Array<{ category: string; score: number; note: string }>;
  interviewer_follow_up: string;
  key_improvement: string;
};

type Props = { result: EvalResult };

const VERDICT_STYLES: Record<string, string> = {
  "Strong hire": "bg-emerald-900/40 text-emerald-400 border-emerald-800",
  Hire: "bg-emerald-900/20 text-emerald-500 border-emerald-900",
  Borderline: "bg-amber-900/30 text-amber-400 border-amber-800",
  "No hire": "bg-rose-900/30 text-rose-400 border-rose-800",
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="score-bar">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`score-bar-cell ${i <= score ? "filled" : ""}`} />
      ))}
    </div>
  );
}

export default function EvaluationCard({ result }: Props) {
  return (
    <div className="flex flex-col gap-5 p-5 border border-forge-border bg-forge-surface">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-serif text-4xl tracking-tight text-forge-text">
            {result.overall_score}
            <span className="text-forge-muted text-2xl">/10</span>
          </span>
        </div>
        <span
          className={`text-xs font-sans font-medium border px-2.5 py-1 ${
            VERDICT_STYLES[result.verdict] ?? ""
          }`}
        >
          {result.verdict}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-forge-subtext leading-relaxed">{result.summary}</p>

      {/* Strengths / Weaknesses */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="label mb-2">Strengths</div>
          <ul className="flex flex-col gap-1.5">
            {result.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-xs text-forge-subtext">
                <span className="text-emerald-500 shrink-0">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="label mb-2">Weaknesses</div>
          <ul className="flex flex-col gap-1.5">
            {result.weaknesses.map((w) => (
              <li key={w} className="flex gap-2 text-xs text-forge-subtext">
                <span className="text-rose-500 shrink-0">−</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rubric */}
      <div>
        <div className="label mb-3">Rubric</div>
        <div className="flex flex-col gap-3">
          {result.rubric.map((row) => (
            <div key={row.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-sans text-forge-subtext">
                  {row.category}
                </span>
                <ScoreBar score={row.score} />
              </div>
              <p className="text-[11px] text-forge-muted leading-relaxed">
                {row.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key improvement */}
      <div className="border border-forge-border p-3">
        <div className="label mb-1.5">Key improvement</div>
        <p className="text-xs text-forge-subtext leading-relaxed">
          {result.key_improvement}
        </p>
      </div>

      {/* Follow-up */}
      <div className="border border-forge-border p-3">
        <div className="label mb-1.5">Interviewer would ask</div>
        <p className="text-xs text-forge-subtext leading-relaxed">
          {result.interviewer_follow_up}
        </p>
      </div>
    </div>
  );
}
