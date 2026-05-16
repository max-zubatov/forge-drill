import { useState, useEffect, useCallback } from "react";
import { PROBLEMS, Problem } from "./data/problems";
import { SYSTEM_INTERVIEWER, SYSTEM_HELPER } from "./data/prompts";
import { callClaude } from "./lib/api";
import {
  getCode,
  setCode,
  getProgress,
  recordEvaluation,
  recordAttempt,
  getAllProgress,
  ProblemProgress,
} from "./lib/storage";
import ProblemSidebar from "./components/ProblemSidebar";
import CodeEditor from "./components/CodeEditor";
import Timer from "./components/Timer";
import TipsModal from "./components/TipsModal";
import EvaluationCard, { EvalResult } from "./components/EvaluationCard";

type AIState =
  | { kind: "idle" }
  | { kind: "loading"; action: "evaluate" | "hint" | "solution" }
  | { kind: "evaluation"; result: EvalResult }
  | { kind: "hint"; text: string }
  | { kind: "solution"; code: string }
  | { kind: "error"; message: string };

function buildEvalPrompt(problem: Problem, code: string): string {
  const reqs = problem.requirements
    .map((r, i) => `${i + 1}. ${r}`)
    .join("\n");
  return `PROBLEM: ${problem.title} (${problem.difficulty})

STATEMENT:
${problem.statement}

REQUIREMENTS:
${reqs}

CANDIDATE'S PYTHON SOLUTION:
\`\`\`python
${code}
\`\`\`

Evaluate this solution. Return ONLY a valid JSON object — no markdown fences, no preamble, no text outside the JSON. Use this exact structure:

{
  "overall_score": <integer 1-10>,
  "verdict": "<one of: 'Strong hire', 'Hire', 'Borderline', 'No hire'>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<short bullet>", ...],
  "weaknesses": ["<short bullet>", ...],
  "rubric": [
    {"category": "Correctness", "score": <1-5>, "note": "<one line>"},
    {"category": "Class Design", "score": <1-5>, "note": "<one line>"},
    {"category": "Encapsulation", "score": <1-5>, "note": "<one line>"},
    {"category": "Extensibility", "score": <1-5>, "note": "<one line>"},
    {"category": "Code Clarity", "score": <1-5>, "note": "<one line>"},
    {"category": "Edge Cases", "score": <1-5>, "note": "<one line>"}
  ],
  "interviewer_follow_up": "<what an interviewer would push on next>",
  "key_improvement": "<the single most important fix>"
}`;
}

function buildHintPrompt(problem: Problem, code: string): string {
  return `Give a brief, non-spoiler hint for this Python OOP problem. Don't give the solution. 2-3 sentences max. Focus on the design choice or insight they're likely missing given their current code.

PROBLEM: ${problem.title}
STATEMENT: ${problem.statement}

THEIR CURRENT CODE:
\`\`\`python
${code}
\`\`\`

Return just the hint as plain text.`;
}

function buildSolutionPrompt(problem: Problem): string {
  const reqs = problem.requirements
    .map((r, i) => `${i + 1}. ${r}`)
    .join("\n");
  return `Write a clean Python solution for this OOP interview problem. The solution should be what a strong candidate would write in 30 minutes — solid and idiomatic, not textbook-perfect. Use dataclasses, properties, or special methods where they help. Brief comments only where intent isn't obvious.

PROBLEM: ${problem.title}

STATEMENT:
${problem.statement}

REQUIREMENTS:
${reqs}

Return ONLY the Python code. No markdown fences, no preamble, no explanation.`;
}

const DIFF_COLORS: Record<string, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
};

export default function App() {
  const [selected, setSelected] = useState<Problem>(PROBLEMS[0]);
  const [code, setCodeState] = useState<string>(() =>
    getCode(PROBLEMS[0].id, PROBLEMS[0].starter)
  );
  const [aiState, setAiState] = useState<AIState>({ kind: "idle" });
  const [showTips, setShowTips] = useState(false);
  const [progress, setProgress] = useState<Record<string, ProblemProgress>>(
    getAllProgress
  );

  const refreshProgress = useCallback(() => {
    setProgress(getAllProgress());
  }, []);

  const handleSelectProblem = (p: Problem) => {
    setSelected(p);
    setCodeState(getCode(p.id, p.starter));
    setAiState({ kind: "idle" });
  };

  const handleCodeChange = (val: string) => {
    setCodeState(val);
    setCode(selected.id, val);
  };

  const handleReset = () => {
    setCodeState(selected.starter);
    setCode(selected.id, selected.starter);
  };

  const handleEvaluate = async () => {
    setAiState({ kind: "loading", action: "evaluate" });
    recordAttempt(selected.id);
    try {
      const res = await callClaude({
        system: SYSTEM_INTERVIEWER,
        user: buildEvalPrompt(selected, code),
        returnJson: true,
      });
      if (!res.json) throw new Error("No JSON in response");
      const result = res.json as EvalResult;
      recordEvaluation(selected.id, result.overall_score);
      refreshProgress();
      setAiState({ kind: "evaluation", result });
    } catch (e) {
      setAiState({ kind: "error", message: String(e) });
    }
  };

  const handleHint = async () => {
    setAiState({ kind: "loading", action: "hint" });
    try {
      const res = await callClaude({
        system: SYSTEM_HELPER,
        user: buildHintPrompt(selected, code),
      });
      setAiState({ kind: "hint", text: res.text });
    } catch (e) {
      setAiState({ kind: "error", message: String(e) });
    }
  };

  const handleSolution = async () => {
    if (
      !confirm(
        "Show the sample solution?\n\nYou'll learn more by submitting your own attempt first. Consider hitting Evaluate before peeking."
      )
    )
      return;
    setAiState({ kind: "loading", action: "solution" });
    try {
      const res = await callClaude({
        system: SYSTEM_HELPER,
        user: buildSolutionPrompt(selected),
      });
      setAiState({ kind: "solution", code: res.text });
    } catch (e) {
      setAiState({ kind: "error", message: String(e) });
    }
  };

  const isLoading = aiState.kind === "loading";

  return (
    <div className="flex flex-col h-screen bg-forge-bg overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-forge-border shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-lg tracking-tight text-forge-text">
            The Forge Drill
          </h1>
          <div className="w-px h-4 bg-forge-border" />
          <span className={`text-sm font-sans ${DIFF_COLORS[selected.difficulty]}`}>
            {selected.difficulty}
          </span>
          <span className="text-sm text-forge-muted font-mono">
            {selected.minutes}m
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Timer />
          <div className="w-px h-4 bg-forge-border" />
          <button
            onClick={() => setShowTips(true)}
            className="text-sm font-sans text-forge-muted hover:text-forge-subtext transition-colors"
          >
            Tips
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        <ProblemSidebar
          problems={PROBLEMS}
          selected={selected}
          progress={progress}
          onSelect={handleSelectProblem}
        />

        {/* Main panel */}
        <div className="flex flex-1 min-w-0 min-h-0">
          {/* Left: problem + AI output */}
          <div className="flex flex-col w-80 shrink-0 border-r border-forge-border overflow-y-auto">
            {/* Problem */}
            <div className="p-5 border-b border-forge-border">
              <h2 className="font-serif text-2xl tracking-tight text-forge-text mb-3">
                {selected.title}
              </h2>
              <p className="text-sm leading-relaxed text-forge-subtext whitespace-pre-line">
                {selected.statement}
              </p>
            </div>

            {/* Requirements */}
            <div className="p-5 border-b border-forge-border">
              <div className="label mb-3">Requirements</div>
              <ol className="flex flex-col gap-2.5">
                {selected.requirements.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-forge-subtext">
                    <span className="text-forge-muted shrink-0 font-mono mt-0.5">
                      {i + 1}.
                    </span>
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* AI Output */}
            <div className="flex-1 p-5">
              {aiState.kind === "idle" && (
                <p className="text-sm text-forge-muted italic">
                  Write your solution, then hit Evaluate.
                </p>
              )}
              {aiState.kind === "loading" && (
                <p className="text-sm text-forge-muted animate-pulse">
                  {aiState.action === "evaluate"
                    ? "Evaluating your solution…"
                    : aiState.action === "hint"
                    ? "Generating hint…"
                    : "Generating sample solution…"}
                </p>
              )}
              {aiState.kind === "evaluation" && (
                <EvaluationCard result={aiState.result} />
              )}
              {aiState.kind === "hint" && (
                <div>
                  <div className="label mb-2">Hint</div>
                  <p className="text-sm text-forge-subtext leading-relaxed">
                    {aiState.text}
                  </p>
                </div>
              )}
              {aiState.kind === "solution" && (
                <div>
                  <div className="label mb-2">Sample Solution</div>
                  <pre className="text-sm font-mono text-forge-subtext bg-forge-bg border border-forge-border p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {aiState.code}
                  </pre>
                </div>
              )}
              {aiState.kind === "error" && (
                <div className="border border-rose-900 p-3">
                  <div className="label text-rose-500 mb-1">Error</div>
                  <p className="text-sm text-rose-400 leading-relaxed">
                    {aiState.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: editor + action buttons */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                onReset={handleReset}
              />
            </div>

            {/* AI Actions — pinned below editor */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-t border-forge-border">
              <button
                onClick={handleEvaluate}
                disabled={isLoading}
                className="py-2 px-5 text-sm font-sans font-medium bg-forge-orange text-white disabled:opacity-40 hover:bg-orange-400 transition-colors"
              >
                {aiState.kind === "loading" && aiState.action === "evaluate"
                  ? "Evaluating…"
                  : "Evaluate"}
              </button>
              <button
                onClick={handleHint}
                disabled={isLoading}
                className="py-2 px-5 text-sm font-sans border border-forge-border text-forge-subtext disabled:opacity-40 hover:border-forge-muted transition-colors"
              >
                {aiState.kind === "loading" && aiState.action === "hint"
                  ? "Thinking…"
                  : "Hint"}
              </button>
              <button
                onClick={handleSolution}
                disabled={isLoading}
                className="py-2 px-5 text-sm font-sans border border-forge-border text-forge-muted disabled:opacity-40 hover:border-forge-muted transition-colors"
              >
                {aiState.kind === "loading" && aiState.action === "solution"
                  ? "Generating…"
                  : "Sample Solution"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTips && <TipsModal onClose={() => setShowTips(false)} />}
    </div>
  );
}
