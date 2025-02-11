-- Migration number: 0006 	 2025-02-10T16:45:45.743Z
create table Property (
	id text primary key,
	createdAt datetime default (strftime('%FT%R:%fZ')) not null,
	updatedAt datetime default (strftime('%FT%R:%fZ')) not null,
	name text not null,
	ownerId text not null references User(id) on delete cascade
);
