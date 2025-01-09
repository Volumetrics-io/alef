-- Migration number: 0003 	 2025-01-09T16:13:55.347Z
-- adds the isProductAdmin flag to the User table
alter table User
	add column isProductAdmin boolean not null default false;
