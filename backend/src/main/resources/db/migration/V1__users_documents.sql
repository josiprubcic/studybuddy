create table users (
    id               bigint generated always as identity primary key,
    auth0_id         text not null unique,
    language         text not null default 'hr' check (language in ('hr', 'en')),
    date_of_birth    date,
    parental_consent boolean not null default false,
    created_at       timestamptz not null default now()
);

create table documents (
    id          bigint generated always as identity primary key,
    user_id     bigint not null references users (id) on delete cascade,
    name        text not null,
    type        text not null check (type in ('pdf', 'docx')),
    language    text check (language in ('hr', 'en')),
    markdown    text not null,
    created_at  timestamptz not null default now()
);
create index documents_user_id_idx on documents (user_id);

create table chunks (
    id           bigint generated always as identity primary key,
    document_id  bigint not null references documents (id) on delete cascade,
    position     int not null,
    heading      text,
    text         text not null,
    unique (document_id, position) -- also indexes document_id for joins and cascades
);
