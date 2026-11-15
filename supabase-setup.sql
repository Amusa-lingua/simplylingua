-- Run this in your Supabase SQL Editor
-- Go to: supabase.com → your project → SQL Editor → New query → paste and run

-- Submissions table (writing + speaking)
create table if not exists submissions (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('writing', 'speaking')),
  unit_number integer not null,
  unit_title text,
  content text not null,
  feedback text,
  learner_name text default 'Anonymous',
  learner_email text,
  created_at timestamptz default now()
);

-- Certificates table
create table if not exists certificates (
  id uuid default gen_random_uuid() primary key,
  cert_id text unique not null,
  learner_name text not null,
  learner_email text,
  course text not null,
  level text not null,
  issued_at timestamptz default now()
);

-- Allow public read/write (for anonymous learners)
alter table submissions enable row level security;
alter table certificates enable row level security;

create policy "Anyone can insert submissions" on submissions for insert with check (true);
create policy "Anyone can read certificates" on certificates for select using (true);
create policy "Service can insert certificates" on certificates for insert with check (true);
