-- =============================================================================
-- Migration: Add amenities column to properties table
-- =============================================================================
-- Run this in Supabase SQL Editor to add the amenities field.
-- Also adds room_size and floor columns if they don't already exist.
-- =============================================================================

-- Add amenities column (TEXT array, defaults to empty)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';

-- Add room_size column (if not already present)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS room_size DECIMAL(10,2);

-- Add floor column (if not already present)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor INTEGER;
