-- Migration number: 0004 	 2025-01-09T16:29:44.565Z
-- adds the modelUpdatedAt timestamp column to the Furniture table
alter table Furniture
	add column modelUpdatedAt datetime null default null;
