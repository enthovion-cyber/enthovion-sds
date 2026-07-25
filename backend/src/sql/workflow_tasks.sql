create table if not exists workflow_tasks (
  id uuid primary key,
  type text not null,
  user_id uuid not null,
  sds_id uuid null,
  status text not null,
  progress integer not null default 0,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  next_retry_at timestamptz null,
  dead_lettered_at timestamptz null,
  input jsonb null,
  output jsonb null,
  error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workflow_tasks_user_id_created_at_idx
  on workflow_tasks (user_id, created_at desc);

alter table workflow_tasks add column if not exists attempts integer not null default 0;
alter table workflow_tasks add column if not exists max_attempts integer not null default 3;
alter table workflow_tasks add column if not exists next_retry_at timestamptz null;
alter table workflow_tasks add column if not exists dead_lettered_at timestamptz null;
