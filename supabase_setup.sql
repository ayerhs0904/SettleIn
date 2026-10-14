-- =========================================================================
-- SettleIn Production PostgreSQL / Supabase Schema & Data Setup
-- Includes pgvector extension, table schemas, indexes, and initial seed data
-- =========================================================================

-- 1. Enable pgvector extension for AI embeddings & semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop tables in reverse dependency order if recreating
-- DROP TABLE IF EXISTS tiffin_reviews CASCADE;
-- DROP TABLE IF EXISTS tiffin_dietary_options CASCADE;
-- DROP TABLE IF EXISTS tiffin_providers CASCADE;
-- DROP TABLE IF EXISTS flatmate_interactions CASCADE;
-- DROP TABLE IF EXISTS flatmate_preferences CASCADE;
-- DROP TABLE IF EXISTS listing_trust_flags CASCADE;
-- DROP TABLE IF EXISTS listing_images CASCADE;
-- DROP TABLE IF EXISTS listing_amenities CASCADE;
-- DROP TABLE IF EXISTS listings CASCADE;
-- DROP TABLE IF EXISTS city_knowledge_chunks CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- 4. Listings Table & Collection Tables
CREATE TABLE IF NOT EXISTS listings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rent DOUBLE PRECISION NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    listing_type VARCHAR(50) NOT NULL,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trust_score INTEGER DEFAULT 100,
    trust_badge VARCHAR(50) DEFAULT 'VERIFIED',
    view_count BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS listing_amenities (
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    amenity VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS listing_images (
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS listing_trust_flags (
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    trust_flag VARCHAR(255) NOT NULL
);

-- 5. Flatmate Preferences (Roommate embeddings)
CREATE TABLE IF NOT EXISTS flatmate_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sleep_schedule VARCHAR(100),
    cooking_habit VARCHAR(100),
    cleanliness VARCHAR(100),
    work_schedule VARCHAR(100),
    dietary_preference VARCHAR(100),
    smoking_drinking VARCHAR(100),
    guests_frequency VARCHAR(100),
    budget DOUBLE PRECISION,
    preferred_area VARCHAR(255),
    about_me TEXT,
    embedding TEXT -- Serialized dense 16D vector [v1, v2, ...]
);

-- 6. Flatmate Interactions (Likes / Passes / Connections)
CREATE TABLE IF NOT EXISTS flatmate_interactions (
    id BIGSERIAL PRIMARY KEY,
    from_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_interaction UNIQUE (from_user_id, to_user_id)
);

-- 7. Tiffin Meal Providers & Dietary Options
CREATE TABLE IF NOT EXISTS tiffin_providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cuisine_type VARCHAR(100) NOT NULL,
    price_per_month DOUBLE PRECISION NOT NULL,
    area VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    description TEXT,
    contact_phone VARCHAR(50),
    image_url TEXT,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tiffin_dietary_options (
    provider_id BIGINT NOT NULL REFERENCES tiffin_providers(id) ON DELETE CASCADE,
    dietary_option VARCHAR(100) NOT NULL
);

-- 8. Tiffin Reviews & Sentiment
CREATE TABLE IF NOT EXISTS tiffin_reviews (
    id BIGSERIAL PRIMARY KEY,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    sentiment VARCHAR(50),
    sentiment_score DOUBLE PRECISION,
    provider_id BIGINT NOT NULL REFERENCES tiffin_providers(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 9. City Knowledge Chunks (RAG Hyperlocal Document Chunks)
CREATE TABLE IF NOT EXISTS city_knowledge_chunks (
    id BIGSERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding TEXT, -- Serialized dense 16D vector [v1, v2, ...]
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- Performance & Search Indexes
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_listings_city_rent ON listings(city, rent);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_tiffin_city_area ON tiffin_providers(city, area);
CREATE INDEX IF NOT EXISTS idx_chunks_city ON city_knowledge_chunks(city);
CREATE INDEX IF NOT EXISTS idx_chunks_category ON city_knowledge_chunks(category);

-- =========================================================================
-- Initial Seed Data (Demo Seeker, Owner, Listings, Providers & RAG Chunks)
-- Passwords are encrypted with BCrypt for 'password123'
-- =========================================================================

-- Seed Users:
-- password123 hash: $2a$10$7Rmsu46pI6k3d6c1fQW.te4365tQJbQ6c9nFzMtz.o1y0B1YfD5rW
INSERT INTO users (id, name, email, password, role)
VALUES 
    (1, 'Demo Seeker', 'seeker@settlein.com', '$2a$10$7Rmsu46pI6k3d6c1fQW.te4365tQJbQ6c9nFzMtz.o1y0B1YfD5rW', 'SEEKER'),
    (2, 'Demo Owner', 'owner@settlein.com', '$2a$10$7Rmsu46pI6k3d6c1fQW.te4365tQJbQ6c9nFzMtz.o1y0B1YfD5rW', 'OWNER')
ON CONFLICT (email) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Seed Listings:
INSERT INTO listings (id, title, description, rent, location, city, listing_type, owner_id, trust_score, trust_badge, view_count)
VALUES
    (1, 'Spacious 2BHK Near Tech Park', 'Fully furnished 2 BHK apartment with balcony, power backup, and high-speed fiber internet.', 24000, 'HSR Layout, Sector 2', 'Bengaluru', 'FLAT', 2, 98, 'VERIFIED', 412),
    (2, 'Executive Single Room PG with Food', 'Premium AC room with 3 daily homestyle meals, daily housekeeping, and laundry.', 13500, 'Koramangala 4th Block', 'Bengaluru', 'PG', 2, 94, 'VERIFIED', 580),
    (3, 'Modern 1BHK Near Cyber City', 'Sunlit 1BHK apartment walking distance to metro station, 24/7 security and covered parking.', 18000, 'Sector 62', 'Noida', 'FLAT', 2, 91, 'VERIFIED', 290),
    (4, 'Comfort Co-Living Studio', 'All-inclusive co-living studio with attached bath, gym access, and cafeteria.', 14000, 'Saket, South Delhi', 'Delhi', 'PG', 2, 89, 'VERIFIED', 340)
ON CONFLICT (id) DO NOTHING;

SELECT setval('listings_id_seq', (SELECT MAX(id) FROM listings));

-- Seed Amenities:
INSERT INTO listing_amenities (listing_id, amenity)
VALUES
    (1, 'WiFi'), (1, 'Power Backup'), (1, 'Modular Kitchen'), (1, 'Parking'),
    (2, '3 Meals Daily'), (2, 'AC'), (2, 'WiFi'), (2, 'Housekeeping'),
    (3, 'AC'), (3, 'Metro Nearby'), (3, 'Security'),
    (4, 'Gym'), (4, 'WiFi'), (4, 'Furnished')
ON CONFLICT DO NOTHING;

-- Seed Images:
INSERT INTO listing_images (listing_id, image_url)
VALUES
    (1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'),
    (2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'),
    (3, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'),
    (4, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80')
ON CONFLICT DO NOTHING;

-- Seed Tiffin Providers:
INSERT INTO tiffin_providers (id, name, cuisine_type, price_per_month, area, city, description, contact_phone, image_url, owner_id)
VALUES
    (1, 'Annapurna Ghar Rasoi', 'North Indian Homestyle', 3800, 'HSR Layout', 'Bengaluru', 'Authentic homely North Indian meals made in cold-pressed oil with seasonal vegetables, rotis, and dal.', '+91 98765 43210', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', 2),
    (2, 'Shree Swad Kathiyawadi & Gujarati', 'Gujarati / Jain Special', 3500, 'Koramangala', 'Bengaluru', 'Mild spiced, nutritious Gujarati and Jain thalis. No onion or garlic options available on request.', '+91 98765 43211', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', 2),
    (3, 'Maa Ki Rasoi Tiffin Service', 'North Indian & Punjabi', 3600, 'Sector 62', 'Noida', 'Freshly rolled tawa rotis, basmati rice, paneer and dal varieties delivered hot at your doorstep.', '+91 98765 43212', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', 2)
ON CONFLICT (id) DO NOTHING;

SELECT setval('tiffin_providers_id_seq', (SELECT MAX(id) FROM tiffin_providers));

INSERT INTO tiffin_dietary_options (provider_id, dietary_option)
VALUES
    (1, 'Pure Veg'), (1, 'Non-Veg Option'),
    (2, 'Pure Veg'), (2, 'Jain Available'),
    (3, 'Pure Veg'), (3, 'Home Cooked')
ON CONFLICT DO NOTHING;

-- Seed Flatmate Preference for Demo Seeker
INSERT INTO flatmate_preferences (id, user_id, sleep_schedule, cooking_habit, cleanliness, work_schedule, dietary_preference, smoking_drinking, guests_frequency, budget, preferred_area, about_me, embedding)
VALUES (
    1,
    1,
    'Night Owl',
    'Cooks on Weekends',
    'Very Clean',
    'Hybrid',
    'Eggetarian',
    'Non-Smoker',
    'Occasional Guests',
    18000,
    'HSR / Koramangala',
    'Software engineer who loves quiet work hours, weekend football, and keeping the kitchen clean.',
    '[0.15,-0.22,0.41,-0.08,0.33,0.19,-0.11,0.27,-0.35,0.04,0.18,-0.29,0.31,-0.14,0.22,0.09]'
)
ON CONFLICT (user_id) DO NOTHING;

SELECT setval('flatmate_preferences_id_seq', (SELECT MAX(id) FROM flatmate_preferences));

-- Seed RAG City Knowledge Base Chunks
INSERT INTO city_knowledge_chunks (id, city, category, title, content, embedding)
VALUES
    (1, 'Noida', 'Transport', 'Noida Metro & Connectivity Guide', 'Noida is served by two main metro lines: the DMRC Blue Line (Sector 62, City Centre) and the NMRC Aqua Line (Sector 51 to Greater Noida). Eco-friendly e-rickshaws (₹10-20) connect Sector 51 and 52 stations. Rapido and Uber Auto are readily available across Sector 62 and Sector 18.', '[0.12,-0.18,0.35,-0.05,0.28,0.15,-0.09,0.22,-0.30,0.03,0.16,-0.25,0.27,-0.12,0.19,0.08]'),
    (2, 'Noida', 'Safety', 'Noida Safety Tips & Emergency Helplines', 'Dial 112 for Single Emergency Helpline and 1090 for Women Power Line. Major residential hubs like Sector 62, Sector 137, and Sector 50 have 24/7 security and gated societies. Avoid poorly lit underpasses late at night.', '[0.08,-0.14,0.31,-0.03,0.25,0.12,-0.07,0.19,-0.27,0.02,0.14,-0.21,0.24,-0.10,0.17,0.06]'),
    (3, 'Delhi', 'Transport', 'Delhi Metro Network & Transit Systems', 'Delhi Metro connects Yellow Line (Gurugram to DU North Campus) and Blue Line (Dwarka to Noida). Metro Smart Cards provide a 10% discount. The first coach is reserved for women. DTC AC electric buses are trackable on the One Delhi app.', '[0.14,-0.20,0.38,-0.07,0.30,0.17,-0.10,0.24,-0.32,0.04,0.17,-0.27,0.29,-0.13,0.20,0.09]'),
    (4, 'Bengaluru', 'Transport', 'Namma Metro & Outer Ring Road Transit', 'Bengaluru Namma Metro features the Purple Line (Whitefield to Challaghatta) and Green Line. BMTC Vajra AC buses connect HSR, Koramangala, and Bellandur via the Outer Ring Road.', '[0.16,-0.23,0.42,-0.09,0.34,0.20,-0.12,0.28,-0.36,0.05,0.19,-0.30,0.32,-0.15,0.23,0.10]')
ON CONFLICT (id) DO NOTHING;

SELECT setval('city_knowledge_chunks_id_seq', (SELECT MAX(id) FROM city_knowledge_chunks));
