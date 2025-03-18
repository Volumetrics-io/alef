-- Migration number: 0008 	 2025-03-17T20:41:22.006Z

alter table Furniture
add column originalFileName text null default null;

alter table Furniture
add column measuredDimensionsX real null default null;

alter table Furniture
add column measuredDimensionsY real null default null;

alter table Furniture
add column measuredDimensionsZ real null default null;

alter table Furniture
add column screenshotUpdatedAt datetime null default null;
