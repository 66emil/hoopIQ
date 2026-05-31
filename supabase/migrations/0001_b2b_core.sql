-- ============================================================================
-- HoopIQ B2B — Phase 1: core data model + RLS + RPCs
-- Safe to run as a whole in the Supabase SQL Editor. Idempotent.
-- Touches existing tables ONLY additively (profiles: 2 new nullable columns).
-- Existing content tables (quiz_questions, tactics, playlists, admins) untouched.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles: add role + display_name (additive, nullable — nothing breaks)
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text check (role in ('coach', 'player')),
  add column if not exists display_name text;

-- Auto-create a profiles row on signup, seeding name + role from auth metadata.
-- Coach registration passes { name, role: 'coach' }; player join sets role later.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'role'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. New tables
-- ----------------------------------------------------------------------------
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  invite_code text not null unique default upper(substr(md5(random()::text), 1, 6)),
  created_at  timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id   uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (team_id, player_id)
);
-- MVP rule: one player belongs to exactly one team. Drop this index later to
-- allow multi-team players (the junction table already supports it).
create unique index if not exists one_team_per_player on public.team_members(player_id);

create table if not exists public.assignments (
  id         uuid primary key default gen_random_uuid(),
  coach_id   uuid not null references auth.users(id) on delete cascade,
  team_id    uuid not null references public.teams(id) on delete cascade,
  title      text,
  deadline   timestamptz,
  created_at timestamptz not null default now()
);

-- Polymorphic reference into the content library: a quiz OR a tactic.
-- material_id is text (existing tables' ids are stringified app-side), so no FK.
create table if not exists public.assignment_materials (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  material_type text not null check (material_type in ('quiz', 'tactic')),
  material_id   text not null,
  primary key (assignment_id, material_type, material_id)
);

-- Empty target set for an assignment == whole team.
create table if not exists public.assignment_targets (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  player_id     uuid not null references auth.users(id) on delete cascade,
  primary key (assignment_id, player_id)
);

create table if not exists public.results (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  material_type text not null check (material_type in ('quiz', 'tactic')),
  material_id   text not null,
  score         int not null default 0,
  completed_at  timestamptz not null default now(),
  unique (player_id, assignment_id, material_type, material_id)
);

-- Helpful indexes
create index if not exists idx_teams_coach        on public.teams(coach_id);
create index if not exists idx_assignments_team   on public.assignments(team_id);
create index if not exists idx_assignments_coach  on public.assignments(coach_id);
create index if not exists idx_results_player     on public.results(player_id);
create index if not exists idx_results_assignment on public.results(assignment_id);

-- ----------------------------------------------------------------------------
-- 3. Security-definer helpers (bypass RLS internally -> no policy recursion)
-- ----------------------------------------------------------------------------
create or replace function public.is_team_coach(p_team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.teams t where t.id = p_team and t.coach_id = auth.uid());
$$;

create or replace function public.is_team_member(p_team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members m where m.team_id = p_team and m.player_id = auth.uid());
$$;

create or replace function public.is_assignment_coach(p_assignment uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.assignments a where a.id = p_assignment and a.coach_id = auth.uid());
$$;

-- Player may see an assignment if they're on the team AND it targets them
-- (explicit target row, or no targets at all == whole team).
create or replace function public.can_player_see_assignment(p_assignment uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.assignments a
    join public.team_members m on m.team_id = a.team_id and m.player_id = auth.uid()
    where a.id = p_assignment
      and (
        not exists (select 1 from public.assignment_targets t where t.assignment_id = a.id)
        or exists (select 1 from public.assignment_targets t where t.assignment_id = a.id and t.player_id = auth.uid())
      )
  );
$$;

-- ----------------------------------------------------------------------------
-- 4. Enable RLS + policies (NEW tables only)
-- ----------------------------------------------------------------------------
alter table public.teams              enable row level security;
alter table public.team_members       enable row level security;
alter table public.assignments        enable row level security;
alter table public.assignment_materials enable row level security;
alter table public.assignment_targets enable row level security;
alter table public.results            enable row level security;

-- teams
drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams for select to authenticated
  using (coach_id = auth.uid() or public.is_team_member(id));
drop policy if exists teams_insert on public.teams;
create policy teams_insert on public.teams for insert to authenticated
  with check (coach_id = auth.uid());
drop policy if exists teams_update on public.teams;
create policy teams_update on public.teams for update to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());
drop policy if exists teams_delete on public.teams;
create policy teams_delete on public.teams for delete to authenticated
  using (coach_id = auth.uid());

-- team_members (player self-join happens via join_team RPC, which is definer)
drop policy if exists team_members_select on public.team_members;
create policy team_members_select on public.team_members for select to authenticated
  using (player_id = auth.uid() or public.is_team_coach(team_id));
drop policy if exists team_members_insert on public.team_members;
create policy team_members_insert on public.team_members for insert to authenticated
  with check (public.is_team_coach(team_id));
drop policy if exists team_members_delete on public.team_members;
create policy team_members_delete on public.team_members for delete to authenticated
  using (public.is_team_coach(team_id));

-- assignments
drop policy if exists assignments_select on public.assignments;
create policy assignments_select on public.assignments for select to authenticated
  using (coach_id = auth.uid() or public.can_player_see_assignment(id));
drop policy if exists assignments_insert on public.assignments;
create policy assignments_insert on public.assignments for insert to authenticated
  with check (coach_id = auth.uid() and public.is_team_coach(team_id));
drop policy if exists assignments_update on public.assignments;
create policy assignments_update on public.assignments for update to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());
drop policy if exists assignments_delete on public.assignments;
create policy assignments_delete on public.assignments for delete to authenticated
  using (coach_id = auth.uid());

-- assignment_materials
drop policy if exists am_select on public.assignment_materials;
create policy am_select on public.assignment_materials for select to authenticated
  using (public.is_assignment_coach(assignment_id) or public.can_player_see_assignment(assignment_id));
drop policy if exists am_write on public.assignment_materials;
create policy am_write on public.assignment_materials for all to authenticated
  using (public.is_assignment_coach(assignment_id))
  with check (public.is_assignment_coach(assignment_id));

-- assignment_targets
drop policy if exists at_select on public.assignment_targets;
create policy at_select on public.assignment_targets for select to authenticated
  using (public.is_assignment_coach(assignment_id) or player_id = auth.uid());
drop policy if exists at_write on public.assignment_targets;
create policy at_write on public.assignment_targets for all to authenticated
  using (public.is_assignment_coach(assignment_id))
  with check (public.is_assignment_coach(assignment_id));

-- results
drop policy if exists results_select on public.results;
create policy results_select on public.results for select to authenticated
  using (player_id = auth.uid() or public.is_assignment_coach(assignment_id));
drop policy if exists results_insert on public.results;
create policy results_insert on public.results for insert to authenticated
  with check (player_id = auth.uid() and public.can_player_see_assignment(assignment_id));
drop policy if exists results_update on public.results;
create policy results_update on public.results for update to authenticated
  using (player_id = auth.uid()) with check (player_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5. RPCs used by the app
-- ----------------------------------------------------------------------------

-- Player joins a team by invite code. Idempotent. Enforces one-team rule.
create or replace function public.join_team(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team uuid;
begin
  select id into v_team from public.teams where invite_code = upper(p_invite_code);
  if v_team is null then
    raise exception 'INVALID_INVITE_CODE' using errcode = 'P0001';
  end if;

  begin
    insert into public.team_members (team_id, player_id)
    values (v_team, auth.uid())
    on conflict (team_id, player_id) do nothing;
  exception when unique_violation then
    -- player already belongs to a different team (one_team_per_player)
    raise exception 'ALREADY_IN_A_TEAM' using errcode = 'P0001';
  end;

  update public.profiles set role = 'player' where id = auth.uid() and role is null;
  return v_team;
end;
$$;

-- Coach-only roster of a team (display names of players).
create or replace function public.get_team_roster(p_team uuid)
returns table (player_id uuid, display_name text, joined_at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.player_id, p.display_name, m.joined_at
  from public.team_members m
  left join public.profiles p on p.id = m.player_id
  where m.team_id = p_team and public.is_team_coach(p_team)
  order by m.joined_at;
$$;

-- Team leaderboard: players ranked by total score from results. Visible to the
-- owning coach and to members of the team.
create or replace function public.get_team_leaderboard(p_team uuid)
returns table (player_id uuid, display_name text, total_score bigint)
language sql stable security definer set search_path = public as $$
  select m.player_id, p.display_name, coalesce(sum(r.score), 0)::bigint as total_score
  from public.team_members m
  left join public.profiles p on p.id = m.player_id
  left join public.results r
    on r.player_id = m.player_id
   and r.assignment_id in (select a.id from public.assignments a where a.team_id = p_team)
  where m.team_id = p_team
    and (public.is_team_coach(p_team) or public.is_team_member(p_team))
  group by m.player_id, p.display_name
  order by total_score desc;
$$;

grant execute on function public.join_team(text)          to authenticated;
grant execute on function public.get_team_roster(uuid)    to authenticated;
grant execute on function public.get_team_leaderboard(uuid) to authenticated;
