-- MPA-Index FINAL v23 schema
-- Three study routes. Core responses plus optional supplemental route-image annotations are stored in the answers table.
-- Writes occur through the server-side Next.js API route using the Supabase service role.

create table if not exists submissions (
  id uuid primary key,
  questionnaire_version text not null,
  language_selected text,
  current_stage text,
  completion_status text,
  started_at timestamptz,
  consent_accepted_at timestamptz,
  core_started_at timestamptz,
  core_completed_at timestamptz,
  completed_at timestamptz,
  selected_trail_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  question_id text not null,
  answer_value text,
  answered_at timestamptz default now(),
  response_ms integer,
  answer_meta jsonb default '{}'::jsonb,
  unique (submission_id, question_id)
);

create index if not exists answers_submission_idx on answers(submission_id);
create index if not exists answers_question_idx on answers(question_id);
create index if not exists submissions_trail_idx on submissions(selected_trail_id);
create index if not exists submissions_completed_idx on submissions(completed_at);

alter table submissions enable row level security;
alter table answers enable row level security;

drop policy if exists "Allow public insert submissions" on submissions;
drop policy if exists "Allow public update submissions" on submissions;
drop policy if exists "Allow public insert answers" on answers;
drop policy if exists "Allow public update answers" on answers;

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists submissions_set_updated_at on submissions;
create trigger submissions_set_updated_at before update on submissions for each row execute function set_updated_at();
