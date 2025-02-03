-- Migration number: 0005 	 2025-01-31T16:53:35.431Z
create table Device (
	id text primary key,
	createdAt datetime default (strftime('%FT%R:%fZ')) not null,
	updatedAt datetime default (strftime('%FT%R:%fZ')) not null,
	name text not null,
	displayMode text not null
);

create table DeviceAccess (
	createdAt datetime default (strftime('%FT%R:%fZ')) not null,
	updatedAt datetime default (strftime('%FT%R:%fZ')) not null,
	userId text not null references User(id) on delete cascade,
	deviceId text not null references Device(id) on delete cascade,
	primary key (userId, deviceId)
);
