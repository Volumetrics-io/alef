-- Migration number: 0009 	 2025-03-21T18:12:33.575Z
ALTER TABLE Furniture
	ADD COLUMN madePublicAt DATETIME NULL DEFAULT NULL;

-- mark all existing items as public
UPDATE Furniture
	SET madePublicAt = (strftime('%FT%R:%fZ'));
