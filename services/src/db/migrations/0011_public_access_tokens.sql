-- Migration number: 0011 	 2025-04-04T19:18:10.890Z
create table if not exists PublicAccessToken (
	id: text not null primary key,
	createdAt datetime default (strftime('%FT%R:%fZ')) not null,
	updatedAt datetime default (strftime('%FT%R:%fZ')) not null,
	token text not null,
	name text not null unique,
	expiresAt datetime null default null,
	userId text null default null references User(id) on delete set null
);

-- index on token for lookups
create index if not exists PublicAccessToken_token_idx
	on PublicAccessToken(token);
