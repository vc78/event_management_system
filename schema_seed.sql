-- ============================================================================
-- Event Management System — full schema + seed data
-- Verified column-for-column against the JPA entities:
-- User, Role, Category, Venue, Event, Booking (+ BaseEntity audit columns)
-- Safe to run top-to-bottom on a fresh MySQL instance.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS event_management_db;
USE event_management_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS categories;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- roles  <->  entity.Role
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- users  <->  entity.User
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- user_roles  <->  User.roles @ManyToMany join table
-- ----------------------------------------------------------------------------
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- categories  <->  entity.Category
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- venues  <->  entity.Venue
-- ----------------------------------------------------------------------------
CREATE TABLE venues (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    venue_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_name VARCHAR(100),
    country VARCHAR(100),
    capacity INT,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- events  <->  entity.Event
-- ----------------------------------------------------------------------------
CREATE TABLE events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_title VARCHAR(150) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    ticket_price DECIMAL(10,2) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    banner_url VARCHAR(255),
    event_status VARCHAR(50) NOT NULL,   -- UPCOMING | ONGOING | COMPLETED | CANCELLED
    category_id BIGINT NOT NULL,
    venue_id BIGINT NOT NULL,
    organizer_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_event_venue
        FOREIGN KEY (venue_id) REFERENCES venues(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_event_organizer
        FOREIGN KEY (organizer_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT chk_event_seats CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

-- ----------------------------------------------------------------------------
-- bookings  <->  entity.Booking
-- ----------------------------------------------------------------------------
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    number_of_tickets INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_time DATETIME NOT NULL,
    booking_status VARCHAR(50) NOT NULL,   -- CONFIRMED | CANCELLED | PENDING
    payment_status VARCHAR(50),
    roll_number VARCHAR(50),
    department VARCHAR(100),
    year_of_study VARCHAR(20),
    checked_in BOOLEAN NOT NULL DEFAULT FALSE,
    check_in_time DATETIME,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_booking_event
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_booking_tickets CHECK (number_of_tickets > 0)
);

-- ----------------------------------------------------------------------------
-- Seed data
-- ----------------------------------------------------------------------------

-- Roles
INSERT INTO roles (name) VALUES
('ADMIN'),
('USER'),
('ORGANIZER');

-- Categories
INSERT INTO categories (category_name, description) VALUES
('Music', 'Concerts, live music, DJ nights and stage performances'),
('Technology', 'Tech conferences, coding events, hackathons and developer meetups'),
('Sports', 'Sports tournaments, leagues and fitness competitions'),
('Workshop', 'Skill development workshops and training programs'),
('College Fest', 'University and college technical/cultural fests'),
('Business', 'Business summits, startup meetups and networking events');

-- Venues
INSERT INTO venues (venue_name, address, city, state_name, country, capacity, contact_person, contact_phone) VALUES
('Hyderabad International Convention Center', 'Izzathnagar, Kondapur', 'Hyderabad', 'Telangana', 'India', 5000, 'Ramesh Kumar', '9876500001'),
('JNTU Auditorium', 'Kukatpally', 'Hyderabad', 'Telangana', 'India', 1200, 'Suresh Reddy', '9876500002'),
('MRU Open Grounds', 'Maisammaguda', 'Hyderabad', 'Telangana', 'India', 3000, 'College Admin', '9876500003'),
('Shilpakala Vedika', 'Madhapur', 'Hyderabad', 'Telangana', 'India', 2500, 'Venue Manager', '9876500004');

-- Users
INSERT INTO users (full_name, email, phone_number, password, profile_image, enabled) VALUES
('Admin User',    'admin@ems.com',     '9000000001', '$2b$10$I8C9PYKCbjEqllEZeJj/EuEFOR52DuWafxr4lxIKmRDmq2sFh7HLi', NULL, TRUE),
('Organizer One', 'organizer@ems.com', '9000000002', '$2b$10$bVjeGupDtmQIbJi6Umul3.vIygeE28qSR8iWxR7nHePL18wk7AiOu', NULL, TRUE),
('Venkat User',   'venkat@gmail.com',  '9000000003', '$2b$10$qI6rs4CSNq72u2z77EYKreBKHddHOdw53xEC/.8VK64OEQKGqGrbe', NULL, TRUE),
('Rahul Kumar',   'rahul@gmail.com',   '9000000004', '$2b$10$39F7TiTD21QaTw6GX4UoSuJq1d7Um4HdrldgY33FodZkcTK0KAv0m', NULL, TRUE);

-- Role assignments
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'admin@ems.com'     AND r.name = 'ADMIN';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'organizer@ems.com' AND r.name = 'ORGANIZER';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'venkat@gmail.com'  AND r.name = 'USER';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'rahul@gmail.com'   AND r.name = 'USER';

-- Events
INSERT INTO events
    (event_title, description, event_date, start_time, end_time, ticket_price,
     total_seats, available_seats, banner_url, event_status, category_id, venue_id, organizer_id)
SELECT
    'Spring Boot Tech Conference 2026',
    'A large-scale technology conference focused on Spring Boot, Java, Microservices, Cloud and Backend Engineering.',
    '2026-08-15', '10:00:00', '17:00:00', 499.00, 500, 500,
    'https://example.com/banner1.jpg', 'UPCOMING',
    (SELECT id FROM categories WHERE category_name = 'Technology'),
    (SELECT id FROM venues WHERE venue_name = 'Hyderabad International Convention Center'),
    (SELECT id FROM users WHERE email = 'organizer@ems.com');

INSERT INTO events
    (event_title, description, event_date, start_time, end_time, ticket_price,
     total_seats, available_seats, banner_url, event_status, category_id, venue_id, organizer_id)
SELECT
    'MRU Cultural Fest 2026',
    'College cultural fest with music, dance, gaming, competitions and celebrity performances.',
    '2026-09-05', '09:00:00', '20:00:00', 199.00, 1000, 1000,
    'https://example.com/banner2.jpg', 'UPCOMING',
    (SELECT id FROM categories WHERE category_name = 'College Fest'),
    (SELECT id FROM venues WHERE venue_name = 'MRU Open Grounds'),
    (SELECT id FROM users WHERE email = 'organizer@ems.com');

INSERT INTO events
    (event_title, description, event_date, start_time, end_time, ticket_price,
     total_seats, available_seats, banner_url, event_status, category_id, venue_id, organizer_id)
SELECT
    'Hyderabad Music Night',
    'Live concert with multiple artists, bands and DJ performances.',
    '2026-08-28', '18:00:00', '23:00:00', 799.00, 1500, 1500,
    'https://example.com/banner3.jpg', 'UPCOMING',
    (SELECT id FROM categories WHERE category_name = 'Music'),
    (SELECT id FROM venues WHERE venue_name = 'Shilpakala Vedika'),
    (SELECT id FROM users WHERE email = 'organizer@ems.com');

INSERT INTO events
    (event_title, description, event_date, start_time, end_time, ticket_price,
     total_seats, available_seats, banner_url, event_status, category_id, venue_id, organizer_id)
SELECT
    'Startup Growth Summit',
    'Business networking event for startup founders, investors and product builders.',
    '2026-10-10', '11:00:00', '18:00:00', 999.00, 400, 400,
    'https://example.com/banner4.jpg', 'UPCOMING',
    (SELECT id FROM categories WHERE category_name = 'Business'),
    (SELECT id FROM venues WHERE venue_name = 'Hyderabad International Convention Center'),
    (SELECT id FROM users WHERE email = 'organizer@ems.com');

INSERT INTO events
    (event_title, description, event_date, start_time, end_time, ticket_price,
     total_seats, available_seats, banner_url, event_status, category_id, venue_id, organizer_id)
SELECT
    'AI & ML Workshop',
    'Hands-on workshop on Machine Learning, Deep Learning, LLM basics and real-world AI use cases.',
    '2026-08-20', '09:30:00', '16:30:00', 299.00, 250, 250,
    'https://example.com/banner5.jpg', 'UPCOMING',
    (SELECT id FROM categories WHERE category_name = 'Workshop'),
    (SELECT id FROM venues WHERE venue_name = 'JNTU Auditorium'),
    (SELECT id FROM users WHERE email = 'organizer@ems.com');

-- Bookings (token_id included for QR scanning)
INSERT INTO bookings (token_id, number_of_tickets, total_amount, booking_time, booking_status, payment_status, user_id, event_id)
SELECT 'TKT-A001', 2, 998.00, NOW(), 'CONFIRMED', 'PAID',
    (SELECT id FROM users WHERE email = 'venkat@gmail.com'),
    (SELECT id FROM events WHERE event_title = 'Spring Boot Tech Conference 2026');
UPDATE events SET available_seats = available_seats - 2 WHERE event_title = 'Spring Boot Tech Conference 2026';

INSERT INTO bookings (token_id, number_of_tickets, total_amount, booking_time, booking_status, payment_status, user_id, event_id)
SELECT 'TKT-A002', 1, 199.00, NOW(), 'CONFIRMED', 'PAID',
    (SELECT id FROM users WHERE email = 'venkat@gmail.com'),
    (SELECT id FROM events WHERE event_title = 'MRU Cultural Fest 2026');
UPDATE events SET available_seats = available_seats - 1 WHERE event_title = 'MRU Cultural Fest 2026';

UPDATE events SET available_seats = available_seats - 3 WHERE event_title = 'Hyderabad Music Night';

-- ── PHASE 3 FEATURES DDL AND SEEDING ──

ALTER TABLE events ADD COLUMN IF NOT EXISTS stream_url VARCHAR(255) DEFAULT NULL;
ALTER TABLE session_qnas ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- Set active live stream for tech conference
UPDATE events 
SET event_status = 'LIVE', 
    stream_url = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8' 
WHERE event_title = 'Spring Boot Tech Conference 2026';

-- Table zones
CREATE TABLE IF NOT EXISTS zones (
    zone_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity_threshold INT NOT NULL,
    current_visitor_count INT NOT NULL DEFAULT 0,
    total_dwell_seconds INT NOT NULL DEFAULT 0
);

-- Table zone_traffic_events
CREATE TABLE IF NOT EXISTS zone_traffic_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_id VARCHAR(50) NOT NULL,
    visitor_count INT NOT NULL,
    dwell_seconds INT NOT NULL,
    timestamp DATETIME NOT NULL
);

-- Table leads
CREATE TABLE IF NOT EXISTS leads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sponsor_id BIGINT NOT NULL,
    attendee_id BIGINT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    captured_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME
);

-- Table sentiment_words
CREATE TABLE IF NOT EXISTS sentiment_words (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    word VARCHAR(50) NOT NULL,
    submitted_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME
);

-- Seed zones
INSERT INTO zones (zone_id, name, capacity_threshold, current_visitor_count, total_dwell_seconds)
VALUES 
('stage1', 'Main Stage (Stage 1)', 100, 45, 12000),
('stage2', 'Developer Workshop (Stage 2)', 50, 12, 4500),
('lounge', 'VIP Lounge & Networking', 30, 28, 9800),
('booth1', 'Premium Sponsor - Booth 1', 15, 8, 3200),
('booth2', 'Tech Sponsor - Booth 2', 15, 4, 1800),
('booth3', 'Cloud Sponsor - Booth 3', 15, 14, 4100)
ON DUPLICATE KEY UPDATE name=VALUES(name), capacity_threshold=VALUES(capacity_threshold);

