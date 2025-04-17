-- Migration number: 0011 	 2025-04-17T16:39:35.863Z
create table if not exists Organization (
	id text primary key,
	createdAt datetime default (strftime('%FT%R:%fZ')) not null,
	updatedAt datetime default (strftime('%FT%R:%fZ')) not null,
	name text not null,
	stripeSubscriptionId text unique,
	stripeCustomerId text unique,
	hasExtendedAIAccess boolean default false
);

create table if not exists Membership (
	id text primary key,
	createdAt datetime default (strftime('%FT%R:%fZ')) not null,
	updatedAt datetime default (strftime('%FT%R:%fZ')) not null,
	organizationId text not null references Organization(id) on delete cascade,
	userId text not null references User(id) on delete cascade,
	role text not null
);

create index Membership_organizationId_index on Membership(organizationId);
create index Membership_userId_index on Membership(userId);
