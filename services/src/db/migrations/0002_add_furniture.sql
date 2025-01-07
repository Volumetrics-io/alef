-- Migration number: 0002 	 2025-01-06T20:14:24.551Z
create table Furniture (
	id text not null primary key,
	createdAt datetime default CURRENT_TIMESTAMP not null,
	updatedAt datetime default CURRENT_TIMESTAMP not null,
	name text not null,
);

create table Attribute (
	id text not null primary key,
	createdAt datetime default CURRENT_TIMESTAMP not null,
	updatedAt datetime default CURRENT_TIMESTAMP not null,
	key text not null,
	value text not null,

	constraint Attribute_unique_key_value unique (key, value),
);

create table FurnitureAttribute (
	createdAt datetime default CURRENT_TIMESTAMP not null,
	updatedAt datetime default CURRENT_TIMESTAMP not null,

	furnitureId text not null references Furniture(id) on delete cascade,
	attributeId text not null references Attribute(id) on delete cascade,
);
