-- Migration number: 0007 	 2025-02-17T20:43:33.889Z
-- When originally creating the FurnitureAttribute table, a unique
-- primary key was not created from (furnitureId, attributeId). This
-- is corrected here by creating a new table, copying the data, and
-- dropping the old table.
create table FurnitureAttributeFixed (
	createdAt datetime default (strftime('%FT%R:%fZ')) not null,
	updatedAt datetime default (strftime('%FT%R:%fZ')) not null,

	furnitureId text not null references Furniture(id) on delete cascade,
	attributeId text not null references Attribute(id) on delete cascade,

	primary key (furnitureId, attributeId)
);

-- handle any duplicate primary key violations by ignoring them
insert or ignore into FurnitureAttributeFixed
select * from FurnitureAttribute;

drop table FurnitureAttribute;

alter table FurnitureAttributeFixed rename to FurnitureAttribute;
