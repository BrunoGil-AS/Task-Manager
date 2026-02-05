create table public.users (
  id uuid not null,
  name text not null,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.tasks (
  id serial not null,
  title text not null,
  description text null,
  completed boolean not null default false,
  owner_id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint tasks_pkey primary key (id),
  constraint tasks_owner_id_fkey foreign KEY (owner_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger update_tasks_updated_at BEFORE
update on tasks for EACH row
execute FUNCTION update_updated_at_column ();