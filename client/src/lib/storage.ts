export type ProblemProgress = {
  lastAttempted: number | null;
  bestScore: number | null;
  attempts: number;
};

const CODE_PREFIX = "forge:code:";
const PROGRESS_PREFIX = "forge:progress:";

export function getCode(problemId: string, fallback: string): string {
  return localStorage.getItem(CODE_PREFIX + problemId) ?? fallback;
}

export function setCode(problemId: string, code: string): void {
  localStorage.setItem(CODE_PREFIX + problemId, code);
}

export function getProgress(problemId: string): ProblemProgress {
  const raw = localStorage.getItem(PROGRESS_PREFIX + problemId);
  if (!raw) return { lastAttempted: null, bestScore: null, attempts: 0 };
  try {
    return JSON.parse(raw) as ProblemProgress;
  } catch {
    return { lastAttempted: null, bestScore: null, attempts: 0 };
  }
}

export function recordEvaluation(problemId: string, score: number): void {
  const prev = getProgress(problemId);
  const updated: ProblemProgress = {
    lastAttempted: Date.now(),
    bestScore:
      prev.bestScore === null ? score : Math.max(prev.bestScore, score),
    attempts: prev.attempts + 1,
  };
  localStorage.setItem(PROGRESS_PREFIX + problemId, JSON.stringify(updated));
}

export function recordAttempt(problemId: string): void {
  const prev = getProgress(problemId);
  const updated: ProblemProgress = {
    ...prev,
    lastAttempted: Date.now(),
  };
  localStorage.setItem(PROGRESS_PREFIX + problemId, JSON.stringify(updated));
}

export function getAllProgress(): Record<string, ProblemProgress> {
  const result: Record<string, ProblemProgress> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PROGRESS_PREFIX)) {
      const id = key.slice(PROGRESS_PREFIX.length);
      result[id] = getProgress(id);
    }
  }
  return result;
}
