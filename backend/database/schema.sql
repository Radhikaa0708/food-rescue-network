-- Food Rescue Network — PostgreSQL schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    password_hash TEXT,
    role VARCHAR(30) NOT NULL CHECK (role IN ('provider', 'volunteer', 'ngo', 'admin')),
    organization VARCHAR(150),
    location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE TABLE IF NOT EXISTS food_listings (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(150) NOT NULL,
    food_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    description TEXT,
    location VARCHAR(255),
    latitude DECIMAL(10, 7) CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
    longitude DECIMAL(10, 7) CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
    available_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) DEFAULT 'available' CHECK (
        status IN ('available', 'claimed', 'collected', 'delivered', 'expired', 'cancelled')
    ),
    claimed_by INTEGER NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES food_listings(id),
    volunteer_id INTEGER NOT NULL REFERENCES users(id),
    claimed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    collected_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'claimed' CHECK (status IN ('claimed', 'collected', 'cancelled'))
);

ALTER TABLE IF EXISTS users
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

ALTER TABLE IF EXISTS food_listings
    ALTER COLUMN available_until TYPE TIMESTAMPTZ USING available_until AT TIME ZONE 'UTC',
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

ALTER TABLE IF EXISTS claims
    ALTER COLUMN claimed_at TYPE TIMESTAMPTZ USING claimed_at AT TIME ZONE 'UTC',
    ALTER COLUMN collected_at TYPE TIMESTAMPTZ USING collected_at AT TIME ZONE 'UTC';

CREATE INDEX IF NOT EXISTS idx_food_listings_status ON food_listings (status);
CREATE INDEX IF NOT EXISTS idx_food_listings_available_until ON food_listings (available_until);
CREATE INDEX IF NOT EXISTS idx_food_listings_latitude ON food_listings (latitude);
CREATE INDEX IF NOT EXISTS idx_food_listings_longitude ON food_listings (longitude);
CREATE INDEX IF NOT EXISTS idx_claims_listing_id ON claims (listing_id);
CREATE INDEX IF NOT EXISTS idx_claims_volunteer_id ON claims (volunteer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email)) WHERE email IS NOT NULL;

-- At most one active claim per listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_claims_one_active_per_listing
    ON claims (listing_id)
    WHERE status = 'claimed';
