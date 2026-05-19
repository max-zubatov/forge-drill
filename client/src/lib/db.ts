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

export async function saveCodeSnapshot(problemId: string, code: string): Promise<void> {
  const { error } = await supabase.from("code_snapshots").upsert(
    { session_id: getSessionId(), problem_id: problemId, code, updated_at: new Date().toISOString() },
    { onConflict: "session_id,problem_id" }
  );
  if (error) console.error("Supabase saveCodeSnapshot:", error.message);
}

export async function saveEvaluation(
  problemId: string,
  code: string,
  result: EvalResult
): Promise<void> {
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
  if (error) console.error("Supabase saveEvaluation:", error.message);
}

export async function loadLatestCode(problemId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("code_snapshots")
    .select("code")
    .eq("session_id", getSessionId())
    .eq("problem_id", problemId)
    .maybeSingle();
  if (error) console.error("Supabase loadLatestCode:", error.message);
  return data?.code ?? null;
}
