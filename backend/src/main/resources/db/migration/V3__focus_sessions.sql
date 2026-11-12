create table focus_sessions (
    id               bigint generated always as identity primary key,
    user_id          bigint not null references users (id) on delete cascade,
    type             text not null check (type in ('focus', 'break')),
    started_at       timestamptz not null,
    duration_seconds integer not null check (duration_seconds between 1 and 7200),
    completed        boolean not null,
    created_at       timestamptz not null default now()
);
create index focus_sessions_user_id_started_at_idx on focus_sessions (user_id, started_at);
