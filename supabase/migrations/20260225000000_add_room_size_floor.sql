-- =============================================================================
-- Migration: Add room_size and floor columns to properties
-- =============================================================================
-- For unit-type properties (condo, apartment, office) to store room size and floor number.
-- =============================================================================

ALTER TABLE properties ADD COLUMN IF NOT EXISTS room_size DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor INTEGER;
