import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";
import cors from "cors";
import { Langfuse } from "langfuse";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env"), override: true });

const app = express();
const PORT = 3001;

// Langfuse is optional — only initialised when keys are present
let langfuse = null;

if (process.env.LANGFUSE_SECRET_KEY && process.env.LANGFUSE_PUBLIC_KEY) {
  const baseUrl = process.env.LANGFUSE_BASE_URL ?? "https://cloud.langfuse.com";
  langfuse = new Langfuse({
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    baseUrl,
    flushAt: 1,
  });

  // Verify connectivity on startup with a test trace
  console.log(`Langfuse: connecting to ${baseUrl} …`);
  const t = langfuse.trace({ name: "startup-check" });
  langfuse.flushAsync()
    .then(() => console.log("Langfuse: connected ✓"))
    .catch((e) => console.error("Langfuse: flush error —", e.message));
}

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

// ── Supabase auto-migration ───────────────────────────────────────────────────
const MIGRATION_SQL = `
create table if not exists code_snapshots (
  session_id text not null,
  problem_id text not null,
  code       text not null,
  updated_at timestamptz default now(),
  primary key (session_id, problem_id)
);

create table if not exists problem_attempts (
  id                    uuid default gen_random_uuid() primary key,
  session_id            text not null,
  problem_id            text not null,
  code                  text not null,
  overall_score         integer not null,
  verdict               text not null,
  summary               text,
  strengths             jsonb,
  weaknesses            jsonb,
  rubric                jsonb,
  key_improvement       text,
  interviewer_follow_up text,
  created_at            timestamptz default now()
);

alter table code_snapshots   enable row level security;
alter table problem_attempts enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'code_snapshots'   and policyname = 'public insert') then
    create policy "public insert" on code_snapshots   for insert with check (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'code_snapshots'   and policyname = 'public update') then
    create policy "public update" on code_snapshots   for update using (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'code_snapshots'   and policyname = 'public select') then
    create policy "public select" on code_snapshots   for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'problem_attempts' and policyname = 'public insert') then
    create policy "public insert" on problem_attempts for insert with check (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'problem_attempts' and policyname = 'public select') then
    create policy "public select" on problem_attempts for select using (true); end if;
end $$;
`;

async function runMigration() {
  const url  = process.env.SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return; // Supabase not configured — skip

  // Extract project ref from URL: https://<ref>.supabase.co
  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) { console.error("Supabase: could not parse project ref from URL"); return; }

  console.log("Supabase: running migration…");
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: MIGRATION_SQL }),
    });

    if (res.ok) {
      console.log("Supabase: tables ready ✓");
    } else {
      const body = await res.json().catch(() => ({}));
      console.error("Supabase: migration failed —", body.message ?? res.statusText);
    }
  } catch (e) {
    console.error("Supabase: migration error —", e.message);
  }
}

runMigration();

app.post("/api/claude", async (req, res) => {
  const { system, user, returnJson, traceName, metadata } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });
  }

  // Start a Langfuse trace for this request
  const trace = langfuse?.trace({
    name: traceName ?? "claude-call",
    metadata: metadata ?? {},
  });

  const generation = trace?.generation({
    name: "anthropic-messages",
    model: "claude-sonnet-4-5",
    input: { system, messages: [{ role: "user", content: user }] },
    startTime: new Date(),
  });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      generation?.end({ output: err, level: "ERROR" });
      await langfuse?.flushAsync().catch((e) => console.error("Langfuse flush error:", e.message));
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const usage = data.usage ?? {};

    generation?.end({
      output: text,
      usage: {
        input: usage.input_tokens,
        output: usage.output_tokens,
        total: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
      },
    });

    if (!returnJson) {
      await langfuse?.flushAsync().catch((e) => console.error("Langfuse flush error:", e.message));
      return res.json({ text });
    }

    const stripped = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const json = JSON.parse(stripped);

      // For evaluation calls, push the rubric score back to Langfuse
      if (trace && json.overall_score != null) {
        trace.score({
          name: "overall_score",
          value: json.overall_score / 10, // normalise to 0–1
          comment: json.verdict ?? undefined,
        });
        for (const row of json.rubric ?? []) {
          trace.score({
            name: row.category.toLowerCase().replace(/\s+/g, "_"),
            value: row.score / 5, // normalise to 0–1
            comment: row.note ?? undefined,
          });
        }
      }

      await langfuse?.flushAsync().catch((e) => console.error("Langfuse flush error:", e.message));
      return res.json({ text, json });
    } catch {
      await langfuse?.flushAsync().catch((e) => console.error("Langfuse flush error:", e.message));
      return res.status(502).json({ error: "Failed to parse JSON from model", raw: text });
    }
  } catch (err) {
    generation?.end({ output: String(err), level: "ERROR" });
    await langfuse?.flushAsync();
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Forge Drill proxy running on http://localhost:${PORT}`);
});
