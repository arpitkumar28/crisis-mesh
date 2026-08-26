-- Add unique constraint to prevent duplicate sensor readings
-- This ensures that the same sensor cannot have multiple readings with the same timestamp
-- This is a critical constraint for data integrity in the telemetry pipeline

-- First, remove any existing duplicates that might violate the constraint
DELETE FROM sensor_readings a
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY sensor_id, timestamp ORDER BY id) as rn
        FROM sensor_readings
    ) b
    WHERE b.rn > 1
);

-- Drop the existing composite index if it exists
DROP INDEX IF EXISTS idx_sensor_readings_sensor_id_timestamp;

-- Create a unique index on (sensor_id, timestamp)
-- This serves as both a unique constraint and a performance index
CREATE UNIQUE INDEX idx_sensor_readings_sensor_id_timestamp 
ON sensor_readings (sensor_id, "timestamp");

-- Note: We keep the individual indexes on sensor_id and timestamp
-- as they may still be useful for certain query patterns
