import { supabase } from "./supabase";
import type { EvalResult } from "../components/EvaluationCard";

// One stable session ID per browser — namespaces all rows for this user
function getSessionId(): string {
  const key = "forge:session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// Supabase is optional. If the tables don't exist (migration not run) or the
// keys aren't set, these functions silently no-op and the app continues with
// localStorage only. The one-time setup is in supabase/migrations/001_init.sql.
function isTableMissing(code: string | null | undefined): boolean {
  // Supabase returns code "42P01" when a table doesn't exist
  return code === "42P01";
}

export async function saveCodeSnapshot(problemId: string, code: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("code_snapshots").upsert(
    { session_id: getSessionId(), problem_id: problemId, code, updated_at: new Date().toISOString() },
    { onConflict: "session_id,problem_id" }
  );
  if (error && !isTableMissing(error.code)) {
    console.error("Supabase saveCodeSnapshot:", error.message);
  }
}

export async function saveEvaluation(
  problemId: string,
  code: string,
  result: EvalResult
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("problem_attempts").insert({
    session_id: getSessionId(),
    problem_id: problemId,
    code,
    overall_score: result.overall_score,
    verdict: result.verdict,
    summary: result.summary,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    rubric: result.rubric,
    key_improvement: result.key_improvement,
    interviewer_follow_up: result.interviewer_follow_up,
  });
  if (error && !isTableMissing(error.code)) {
    console.error("Supabase saveEvaluation:", error.message);
  }
}

export async function loadLatestCode(problemId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("code_snapshots")
    .select("code")
    .eq("session_id", getSessionId())
    .eq("problem_id", problemId)
    .maybeSingle();
  if (error && !isTableMissing(error.code)) {
    console.error("Supabase loadLatestCode:", error.message);
  }
  return data?.code ?? null;
}
