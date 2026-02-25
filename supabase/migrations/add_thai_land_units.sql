-- Add Thai land measurement units to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS land_rai DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS land_ngan DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS land_square_wa DECIMAL(10,2);
