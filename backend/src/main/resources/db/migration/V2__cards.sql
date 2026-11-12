create table cards (
    id          bigint generated always as identity primary key,
    chunk_id    bigint not null references chunks (id) on delete cascade,
    user_id     bigint not null references users (id) on delete cascade,
    type        text not null check (type in ('flashcard', 'fill_in')),
    question    text not null,
    answer      text not null,
    quote       text not null,
    created_at  timestamptz not null default now()
);
create index cards_chunk_id_idx on cards (chunk_id);
create index cards_user_id_idx on cards (user_id);
