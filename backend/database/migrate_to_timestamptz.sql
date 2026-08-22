-- Migration: convert TIMESTAMP columns to TIMESTAMPTZ
-- RUN THIS ONLY AFTER REVIEWING AND BACKING UP YOUR DATABASE
-- This attempts to convert existing timestamp columns to timestamptz preserving the same wall-clock time as UTC.
-- If your stored timestamps represent a different timezone, adjust the AT TIME ZONE clause accordingly.

BEGIN;

ALTER TABLE users
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

ALTER TABLE food_listings
  ALTER COLUMN available_until TYPE timestamptz USING available_until AT TIME ZONE 'UTC',
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

ALTER TABLE claims
  ALTER COLUMN claimed_at TYPE timestamptz USING claimed_at AT TIME ZONE 'UTC',
  ALTER COLUMN collected_at TYPE timestamptz USING collected_at AT TIME ZONE 'UTC';

COMMIT;

-- NOTE: Test this on a staging clone first. If your stored timestamps were already UTC instants, you may need a different conversion.
