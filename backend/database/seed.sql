-- Demo data for local development. Fictional names only.

INSERT INTO users (name, role, organization, location) VALUES
    ('Meena Catering Desk', 'provider', 'Hotel Tamil Nadu', 'Tirunelveli'),
    ('Karthik Kitchen', 'provider', 'Anandha Bhavan Restaurant', 'Tirunelveli'),
    ('Priya Events', 'provider', 'Nellai Wedding Hall', 'Palayamkottai'),
    ('Hostel Warden Office', 'provider', 'St. Xavier Student Hostel', 'Palayamkottai'),
    ('Ravi', 'volunteer', 'Helping Hands', 'Tirunelveli'),
    ('Lakshmi', 'volunteer', 'Street Care Collective', 'Palayamkottai'),
    ('Arun', 'volunteer', 'Campus Food Share', 'Tirunelveli'),
    ('Hope Kitchen NGO', 'ngo', 'Hope Kitchen', 'Tirunelveli'),
    ('Community Plate', 'ngo', 'Community Plate Trust', 'Tuticorin'),
    ('Platform Admin', 'admin', 'Food Rescue Network', 'Tirunelveli');

-- Mix of available, claimed, collected, expired, and cancelled listings
INSERT INTO food_listings (
    provider_name, food_type, quantity, description, location,
    latitude, longitude, available_until, status, claimed_by
) VALUES
    (
        'Anandha Bhavan Restaurant', 'Cooked Rice', 25.00,
        'Fresh cooked rice from lunch service', 'Tirunelveli Junction',
        8.7139000, 77.7567000, NOW() + INTERVAL '6 hours', 'available', NULL
    ),
    (
        'Hotel Tamil Nadu', 'Vegetable Curry', 18.50,
        'Mild mixed vegetable curry, packed in trays', 'Tirunelveli Town',
        8.7289000, 77.7081000, NOW() + INTERVAL '4 hours', 'available', NULL
    ),
    (
        'St. Xavier Student Hostel', 'Chapati', 40.00,
        'Extra dinner chapatis, still warm', 'Palayamkottai',
        8.7245000, 77.7410000, NOW() + INTERVAL '8 hours', 'available', NULL
    ),
    (
        'Nellai Wedding Hall', 'Biryani', 55.00,
        'Leftover event biryani, sealed containers', 'Palayamkottai',
        8.7212000, 77.7384000, NOW() + INTERVAL '3 hours', 'available', NULL
    ),
    (
        'Beachside Hotel', 'Idli', 30.00,
        'Breakfast surplus idli with chutney packs', 'Tuticorin',
        8.7642000, 78.1348000, NOW() + INTERVAL '5 hours', 'available', NULL
    ),
    (
        'Campus Canteen', 'Sambar', 12.00,
        'Canteen sambar in insulated pots', 'Tirunelveli',
        8.7132000, 77.7601000, NOW() + INTERVAL '2 hours', 'claimed', 5
    ),
    (
        'City Bakery', 'Bread Packs', 20.00,
        'Day-old bread still good for same-day use', 'Tirunelveli',
        8.7158000, 77.7522000, NOW() + INTERVAL '10 hours', 'collected', 6
    ),
    (
        'Hotel Tamil Nadu', 'Fruit Salad', 8.00,
        'Morning fruit bowls past buffet end', 'Tirunelveli Town',
        8.7289000, 77.7081000, NOW() - INTERVAL '2 hours', 'expired', NULL
    ),
    (
        'Anandha Bhavan Restaurant', 'Rasam', 10.00,
        'Cancelled pickup — listing closed by provider', 'Tirunelveli Junction',
        8.7139000, 77.7567000, NOW() + INTERVAL '1 hour', 'cancelled', NULL
    );

INSERT INTO claims (listing_id, volunteer_id, claimed_at, collected_at, status)
SELECT id, 5, NOW() - INTERVAL '40 minutes', NULL, 'claimed'
FROM food_listings
WHERE food_type = 'Sambar'
LIMIT 1;

INSERT INTO claims (listing_id, volunteer_id, claimed_at, collected_at, status)
SELECT id, 6, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '90 minutes', 'collected'
FROM food_listings
WHERE food_type = 'Bread Packs'
LIMIT 1;
