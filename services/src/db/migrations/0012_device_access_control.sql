-- Migration number: 0012 	 2025-04-04T20:47:03.052Z
alter table DeviceAccess
  add column access text not null default 'write:all';

-- TODO: change default to 'read:all' when we've updated all existing rows.
