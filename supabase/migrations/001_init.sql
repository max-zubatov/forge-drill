-- The Forge Drill — initial schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query → Run

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

-- Public access (no auth in this app)
alter table code_snapshots   enable row level security;
alter table problem_attempts enable row level security;

create policy if not exists "public insert" on code_snapshots   for insert with check (true);
create policy if not exists "public update" on code_snapshots   for update using (true);
create policy if not exists "public select" on code_snapshots   for select using (true);
create policy if not exists "public insert" on problem_attempts for insert with check (true);
create policy if not exists "public select" on problem_attempts for select using (true);
