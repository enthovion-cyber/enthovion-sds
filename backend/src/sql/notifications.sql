create table if not exists notifications (
  id uuid primary key,
  user_id uuid not null,
  type text not null default 'info',
  title text not null,
  message text not null,
  metadata jsonb null,
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_created_at_idx
  on notifications (user_id, created_at desc);
