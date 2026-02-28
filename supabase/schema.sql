-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Sessions
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  code varchar(6) unique not null,
  created_at timestamptz default now(),
  master_player_id uuid,
  bet_amount_points integer not null,
  num_decks integer not null,
  tracks integer not null,
  state text default 'LOBBY',
  current_round_id uuid,
  total_points_played integer default 0,
  settlement_data jsonb
);

-- Players
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  name varchar(16) not null,
  pin_hash text,
  is_master boolean default false,
  selected_suit char(1),
  ready boolean default false,
  ready_timestamp bigint,
  net_points integer default 0,
  connected boolean default true,
  joined_at timestamptz default now()
);

-- Rounds
create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  started_at timestamptz default now(),
  total_pool integer default 0,
  winning_suit char(1),
  deck_order jsonb not null default '[]',
  draw_index integer default 5,
  gate_cards jsonb not null default '[]',
  gate_thresholds integer[] not null default '{}',
  gate_revealed boolean[] default '{false,false,false,false,false}',
  horse_positions jsonb default '{"S":0,"H":0,"D":0,"C":0}',
  ready_players jsonb default '{}',
  payouts jsonb default '{}',
  remainder_info jsonb,
  race_events jsonb default '[]',
  race_start_at bigint,
  winning_suit_final char(1),
  state text default 'RACING'
);

-- Session events (for realtime)
create table if not exists session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  session_code varchar(6) not null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz default now()
);

-- Chat messages
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  session_code varchar(6) not null,
  player_id uuid,
  player_name text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_sessions_code on sessions(code);
create index if not exists idx_players_session on players(session_id);
create index if not exists idx_rounds_session on rounds(session_id);
create index if not exists idx_session_events_code on session_events(session_code);
create index if not exists idx_chat_session on chat_messages(session_id);

-- Enable realtime
alter publication supabase_realtime add table session_events;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table rounds;
