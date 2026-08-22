-- SafarSutra Database Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    language VARCHAR(50) DEFAULT 'English',
    travel_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_photo_url TEXT,
    is_public BOOLEAN DEFAULT false,
    share_token VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stops (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    start_date DATE,
    end_date DATE,
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    stop_id INTEGER REFERENCES stops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    cost NUMERIC(12, 2) DEFAULT 0,
    duration VARCHAR(50),
    time_slot VARCHAR(50),
    address TEXT,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7)
);

CREATE TABLE IF NOT EXISTS budget (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE UNIQUE,
    total_budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    spent_so_far NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT '₹'
);

CREATE TABLE IF NOT EXISTS cost_breakdown (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    estimated_cost NUMERIC(12, 2) DEFAULT 0,
    actual_cost NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS odoo_sync (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    odoo_record_id VARCHAR(255),
    odoo_record_type VARCHAR(255),
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(50) NOT NULL,
    error_message TEXT
);
